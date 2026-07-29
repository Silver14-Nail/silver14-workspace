import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

function computePricing(basePrice: number, salePrice: number | null) {
  const base =
    typeof basePrice === 'string' ? parseFloat(basePrice as unknown as string) : basePrice;
  const sale =
    salePrice !== null
      ? typeof salePrice === 'string'
        ? parseFloat(salePrice as unknown as string)
        : salePrice
      : null;
  const isOnSale = sale !== null && !isNaN(sale) && sale < base;
  return {
    isOnSale,
    discountPercent: isOnSale ? Math.round((1 - sale! / base) * 100) : null,
  };
}

import { ProductEntity } from '@/db/entities/products/product.entity';
import { I18nTranslationEntity } from '@/db/entities/shared/i18n-translation.entity';
import { NailShapeEntity } from '@/db/entities/products/nail-shape.entity';
import { NailSizeEntity } from '@/db/entities/products/nail-size.entity';
import { ProductShapePricingEntity } from '@/db/entities/products/product-shape-pricing.entity';
import { PaginationDTO } from '@/common/dtos/pagination';
import { FALLBACK_LOCALE } from '@/shared/translation/translation.constants';
import type { SupportedLocale } from '@/shared/translation/translation.constants';

import { ProductFilterBy, ProductQueryDto, ProductSortBy } from './dto/product-query.dto';
import { ProductType } from '@/common/enums/entity.enum';
import { ProductVariantEntity } from '@/db/entities/products/product-variants.entity';

function sortVariants(variants: ProductVariantEntity[]): ProductVariantEntity[] {
  return [...variants].sort((a, b) => {
    const shapeDiff = (a.shape?.sortOrder ?? 0) - (b.shape?.sortOrder ?? 0);
    if (shapeDiff !== 0) return shapeDiff;
    return (a.size?.sortOrder ?? 0) - (b.size?.sortOrder ?? 0);
  });
}

function applyTranslation<T extends { name: string; description?: string | null }>(
  entity: T,
  translation: I18nTranslationEntity | null,
): T & {
  name: string;
  description?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
} {
  if (!translation) return entity as any;
  return {
    ...entity,
    name: translation.name || entity.name,
    description: translation.description ?? (entity as any).description ?? null,
    seoTitle: translation.seoTitle ?? null,
    seoDescription: translation.seoDescription ?? null,
  };
}

@Injectable()
export class ClientProductsService {
  constructor(
    @InjectRepository(ProductEntity)
    private readonly productRepo: Repository<ProductEntity>,
    @InjectRepository(I18nTranslationEntity)
    private readonly translationRepo: Repository<I18nTranslationEntity>,
    @InjectRepository(NailShapeEntity)
    private readonly shapeRepo: Repository<NailShapeEntity>,
    @InjectRepository(NailSizeEntity)
    private readonly sizeRepo: Repository<NailSizeEntity>,
  ) {}

  async listProducts(query: ProductQueryDto, locale: SupportedLocale = FALLBACK_LOCALE) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    // Join exactly one (the main, or first-by-sortOrder) image per product
    // via a correlated subquery, instead of a plain join on the full
    // `images` relation. A plain join fans out one row per image, which
    // breaks LIMIT/OFFSET pagination (a product with 3 images can consume
    // 3 "slots" of the page) and pulls back every image's data when only
    // one thumbnail URL is ever used. This keeps it to a single query.
    const qb = this.productRepo
      .createQueryBuilder('product')
      .leftJoin(
        'product_images',
        'thumb',
        `thumb.id = (
          SELECT pi.id FROM product_images pi
          WHERE pi.product_id = product.id
          ORDER BY pi.is_main DESC, pi.sort_order ASC
          LIMIT 1
        )`,
      )
      .addSelect('thumb.url', 'thumb_url')
      .where('product.isActive = true')
      .skip(skip)
      .take(limit);

    if (query.search) {
      qb.andWhere(
        `(LOWER(product.name) LIKE LOWER(:search) OR EXISTS (
          SELECT 1 FROM i18n_translations it
          WHERE it.entity_type = 'product'
            AND it.entity_id = product.id
            AND it.locale = :locale
            AND LOWER(it.name) LIKE LOWER(:search)
        ))`,
        { search: `%${query.search}%`, locale },
      );
    }

    if (query.minPrice !== undefined) {
      qb.andWhere('product.basePrice >= :minPrice', { minPrice: query.minPrice });
    }

    if (query.maxPrice !== undefined) {
      qb.andWhere('product.basePrice <= :maxPrice', { maxPrice: query.maxPrice });
    }

    if (query.shapeId) {
      qb.andWhere(
        `EXISTS (
          SELECT 1 FROM product_shape_pricings psp
          WHERE psp.product_id = product.id
            AND psp.shape_id = :shapeId
            AND psp.is_enabled = true
        )`,
        { shapeId: query.shapeId },
      );
    }

    if (query.collection) {
      qb.andWhere(
        `EXISTS (
          SELECT 1 FROM product_collections pc
          INNER JOIN collections c ON c.id = pc.collection_id
          WHERE pc.product_id = product.id
            AND c.slug = :collectionSlug
            AND c.deleted_at IS NULL
        )`,
        { collectionSlug: query.collection },
      );
    }

    if (query.filterBy === ProductFilterBy.NEW) {
      qb.andWhere('product.isNew = true');
    } else if (query.filterBy === ProductFilterBy.BEST_SELLER) {
      qb.andWhere('product.isBestSeller = true');
    }

    qb.andWhere('product.type = :productType', { productType: query.type ?? ProductType.NAIL });

    switch (query.sortBy) {
      case ProductSortBy.PRICE_ASC:
        qb.orderBy('product.basePrice', 'ASC');
        break;
      case ProductSortBy.PRICE_DESC:
        qb.orderBy('product.basePrice', 'DESC');
        break;
      case ProductSortBy.NAME_ASC:
        qb.orderBy('product.name', 'ASC');
        break;
      case ProductSortBy.NAME_DESC:
        qb.orderBy('product.name', 'DESC');
        break;
      case ProductSortBy.OLDEST:
        qb.orderBy('product.createdAt', 'ASC');
        break;
      default:
        qb.orderBy('product.createdAt', 'DESC');
    }

    // getRawAndEntities() gives us both the hydrated Product entities and
    // the raw `thumb_url` column from the subquery join above in one query.
    // COUNT(*) is a separate round-trip either way (getManyAndCount() also
    // runs it as two queries under the hood) — the client only ever reads
    // `totalItems` from page 1's response (see useProductFilters.ts), so for
    // "load more" pages beyond the first, skip it and infer the same
    // has-next-page result from whether this page came back full.
    const { entities, raw } = await qb.getRawAndEntities();
    const items = entities;
    const thumbnailUrlById = new Map(
      items.map((p, i) => [p.id, raw[i]?.thumb_url as string | null]),
    );
    const totalItems =
      page === 1 ? await qb.getCount() : skip + items.length + (items.length === limit ? 1 : 0);

    const productIds = items.map((p) => p.id);
    const translations = await this.loadTranslations(productIds, locale);

    const pagination: PaginationDTO = {
      totalItems,
      itemCount: items.length,
      itemsPerPage: limit,
      totalPages: Math.ceil(totalItems / limit),
      currentPage: page,
    };

    return {
      items: items.map((p) => ({
        ...applyTranslation(p, translations.get(p.id) ?? null),
        thumbnail: thumbnailUrlById.get(p.id) ? { url: thumbnailUrlById.get(p.id) } : null,
        images: undefined,
        ...computePricing(p.basePrice, p.salePrice),
      })),
      pagination,
    };
  }

  async getProduct(id: string, locale: SupportedLocale = FALLBACK_LOCALE) {
    const product = await this.productRepo
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.images', 'images')
      .where('product.id = :id', { id })
      .andWhere('product.isActive = true')
      .orderBy('images.sortOrder', 'ASC')
      .getOne();

    if (!product) throw new NotFoundException('Product not found');

    return this.hydrateProduct(product, locale);
  }

  async getProductBySlug(slug: string, locale: SupportedLocale = FALLBACK_LOCALE) {
    const product = await this.productRepo
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.images', 'images')
      .where('(product.slug = :slug OR product.id = :slug)', { slug })
      .andWhere('product.isActive = true')
      .orderBy('images.sortOrder', 'ASC')
      .getOne();

    if (!product) throw new NotFoundException('Product not found');

    return this.hydrateProduct(product, locale);
  }

  // Load variants, shapePricings, translation in parallel — avoids the Cartesian-product
  // JOIN that resulted in images × shapePricings × variants rows per product.
  private async hydrateProduct(product: ProductEntity, locale: SupportedLocale) {
    const em = this.productRepo.manager;

    const [variants, shapePricings, translation] = await Promise.all([
      em
        .createQueryBuilder(ProductVariantEntity, 'v')
        .leftJoinAndSelect('v.shape', 'shape')
        .leftJoinAndSelect('v.size', 'size')
        .where('v.product = :id', { id: product.id })
        .orderBy('shape.sortOrder', 'ASC')
        .addOrderBy('size.sortOrder', 'ASC')
        .getMany(),
      em
        .createQueryBuilder(ProductShapePricingEntity, 'sp')
        .leftJoinAndSelect('sp.shape', 'shape')
        .where('sp.product = :id', { id: product.id })
        .getMany(),
      this.loadTranslation(product.id, locale),
    ]);

    const activeVariants = variants.filter((v) => !v.deletedAt);
    const variantNameMap = await this.loadVariantTranslations(
      activeVariants.map((v) => v.id),
      locale,
    );

    product.variants = sortVariants(activeVariants).map((v) => {
      const translatedName = variantNameMap.get(v.id);
      return translatedName ? { ...v, colorName: translatedName } : v;
    }) as ProductVariantEntity[];
    product.shapePricings = shapePricings.filter((sp) => sp.isEnabled && sp.shape?.isActive);

    return {
      ...applyTranslation(product, translation),
      ...computePricing(product.basePrice, product.salePrice),
    };
  }

  getShapes() {
    return this.shapeRepo.find({
      where: { isActive: true },
      order: { sortOrder: 'ASC' },
    });
  }

  getSizes() {
    return this.sizeRepo.find({
      order: { sortOrder: 'ASC' },
    });
  }

  // ─── Private helpers ──────────────────────────────────────────────────────────

  private async loadTranslation(
    productId: string,
    locale: SupportedLocale,
  ): Promise<I18nTranslationEntity | null> {
    if (locale === FALLBACK_LOCALE) {
      return this.translationRepo.findOne({
        where: { entityType: 'product', entityId: productId, locale },
      });
    }
    const rows = await this.translationRepo.find({
      where: [
        { entityType: 'product', entityId: productId, locale },
        { entityType: 'product', entityId: productId, locale: FALLBACK_LOCALE },
      ],
    });
    return (
      rows.find((r) => r.locale === locale) ??
      rows.find((r) => r.locale === FALLBACK_LOCALE) ??
      null
    );
  }

  private async loadTranslations(
    productIds: string[],
    locale: SupportedLocale,
  ): Promise<Map<string, I18nTranslationEntity>> {
    if (productIds.length === 0) return new Map();

    const rows = await this.translationRepo
      .createQueryBuilder('t')
      .where('t.entity_type = :entityType', { entityType: 'product' })
      .andWhere('t.entity_id IN (:...ids)', { ids: productIds })
      .andWhere('t.locale IN (:...locales)', {
        locales: locale === FALLBACK_LOCALE ? [locale] : [locale, FALLBACK_LOCALE],
      })
      .getMany();

    const map = new Map<string, I18nTranslationEntity>();
    for (const row of rows) {
      if (row.locale === FALLBACK_LOCALE) map.set(row.entityId, row);
    }
    if (locale !== FALLBACK_LOCALE) {
      for (const row of rows) {
        if (row.locale === locale) map.set(row.entityId, row);
      }
    }

    return map;
  }

  private async loadVariantTranslations(
    variantIds: string[],
    locale: SupportedLocale,
  ): Promise<Map<string, string>> {
    if (variantIds.length === 0) return new Map();

    const rows = await this.translationRepo
      .createQueryBuilder('t')
      .where('t.entity_type = :entityType', { entityType: 'product_variant' })
      .andWhere('t.entity_id IN (:...ids)', { ids: variantIds })
      .andWhere('t.locale IN (:...locales)', {
        locales: locale === FALLBACK_LOCALE ? [locale] : [locale, FALLBACK_LOCALE],
      })
      .getMany();

    const map = new Map<string, string>();
    for (const row of rows) {
      if (row.locale === FALLBACK_LOCALE && row.name) map.set(row.entityId, row.name);
    }
    if (locale !== FALLBACK_LOCALE) {
      for (const row of rows) {
        if (row.locale === locale && row.name) map.set(row.entityId, row.name);
      }
    }
    return map;
  }
}
