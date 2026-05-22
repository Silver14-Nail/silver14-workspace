import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CollectionEntity } from '@/db/entities/products/collection.entity';
import { ProductEntity } from '@/db/entities/products/product.entity';
import { CollectionTranslationEntity } from '@/db/entities/products/collection-translation.entity';
import { ProductTranslationEntity } from '@/db/entities/products/product-translation.entity';
import { FALLBACK_LOCALE } from '@/shared/translation/translation.constants';
import type { SupportedLocale } from '@/shared/translation/translation.constants';

import { CollectionQueryDto, CollectionProductQueryDto } from './dto/collection-query.dto';

function computePricing(basePrice: number, salePrice: number | null) {
  const base = typeof basePrice === 'string' ? parseFloat(basePrice as any) : basePrice;
  const sale =
    salePrice !== null
      ? typeof salePrice === 'string'
        ? parseFloat(salePrice as any)
        : salePrice
      : null;
  const isOnSale = sale !== null && !isNaN(sale) && sale < base;
  return {
    isOnSale,
    discountPercent: isOnSale ? Math.round((1 - sale! / base) * 100) : null,
  };
}

@Injectable()
export class ClientCollectionsService {
  constructor(
    @InjectRepository(CollectionEntity)
    private readonly collectionRepo: Repository<CollectionEntity>,
    @InjectRepository(ProductEntity)
    private readonly productRepo: Repository<ProductEntity>,
    @InjectRepository(CollectionTranslationEntity)
    private readonly collectionTranslationRepo: Repository<CollectionTranslationEntity>,
    @InjectRepository(ProductTranslationEntity)
    private readonly productTranslationRepo: Repository<ProductTranslationEntity>,
  ) {}

  async listCollections(query: CollectionQueryDto, locale: SupportedLocale = FALLBACK_LOCALE) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const qb = this.collectionRepo
      .createQueryBuilder('c')
      .where('c.isActive = true')
      .loadRelationCountAndMap('c.productCount', 'c.products', 'p', (pb) =>
        pb.where('p.deleted_at IS NULL AND p.is_active = true'),
      )
      .orderBy('c.sortOrder', 'ASC')
      .addOrderBy('c.name', 'ASC')
      .skip(skip)
      .take(limit);

    const [data, total] = await qb.getManyAndCount();

    const translations = await this.loadCollectionTranslations(
      data.map((c) => c.id),
      locale,
    );

    return {
      data: data.map((c) => this.mapCollectionSummary(c, translations.get(c.id) ?? null)),
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async getFeaturedCollections(locale: SupportedLocale = FALLBACK_LOCALE) {
    const collections = await this.collectionRepo
      .createQueryBuilder('c')
      .where('c.isActive = true AND c.isFeatured = true')
      .loadRelationCountAndMap('c.productCount', 'c.products', 'p', (pb) =>
        pb.where('p.deleted_at IS NULL AND p.is_active = true'),
      )
      .orderBy('c.sortOrder', 'ASC')
      .getMany();

    const translations = await this.loadCollectionTranslations(
      collections.map((c) => c.id),
      locale,
    );

    return collections.map((c) => this.mapCollectionSummary(c, translations.get(c.id) ?? null));
  }

  async getCollectionBySlug(slug: string, locale: SupportedLocale = FALLBACK_LOCALE) {
    const collection = await this.collectionRepo
      .createQueryBuilder('c')
      .where('c.slug = :slug AND c.isActive = true', { slug })
      .loadRelationCountAndMap('c.productCount', 'c.products', 'p', (pb) =>
        pb.where('p.deleted_at IS NULL AND p.is_active = true'),
      )
      .getOne();

    if (!collection) throw new NotFoundException('Collection not found');

    const translation = await this.loadCollectionTranslation(collection.id, locale);
    return this.mapCollectionDetail(collection, translation);
  }

  async getCollectionProducts(
    slug: string,
    query: CollectionProductQueryDto,
    locale: SupportedLocale = FALLBACK_LOCALE,
  ) {
    const collection = await this.collectionRepo.findOne({
      where: { slug, isActive: true },
    });
    if (!collection) throw new NotFoundException('Collection not found');

    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const qb = this.productRepo
      .createQueryBuilder('p')
      .innerJoin('p.collections', 'col', 'col.id = :collectionId', {
        collectionId: collection.id,
      })
      .leftJoinAndSelect('p.images', 'images')
      .where('p.isActive = true')
      .skip(skip)
      .take(limit);

    if (query.sortBy === 'price_asc') {
      qb.orderBy('p.basePrice', 'ASC');
    } else if (query.sortBy === 'price_desc') {
      qb.orderBy('p.basePrice', 'DESC');
    } else if (query.sortBy === 'bestseller') {
      qb.andWhere('p.isBestSeller = true').orderBy('p.createdAt', 'DESC');
    } else {
      qb.orderBy('p.createdAt', 'DESC');
    }
    qb.addOrderBy('images.sortOrder', 'ASC');

    const [products, total] = await qb.getManyAndCount();

    const productTranslations = await this.loadProductTranslations(
      products.map((p) => p.id),
      locale,
    );

    const collectionTranslation = await this.loadCollectionTranslation(collection.id, locale);

    return {
      collection: {
        id: collection.id,
        name: collectionTranslation?.name ?? collection.name,
        slug: collection.slug,
      },
      data: products.map((p) => {
        const tr = productTranslations.get(p.id) ?? null;
        const { isOnSale, discountPercent } = computePricing(p.basePrice, p.salePrice);
        const thumbnail = p.images?.find((img) => img.isMain) ?? p.images?.[0] ?? null;
        return {
          id: p.id,
          name: tr?.name ?? p.name,
          slug: p.slug ?? p.id,
          basePrice: p.basePrice,
          salePrice: p.salePrice,
          currency: p.currency,
          isActive: p.isActive,
          isNew: p.isNew,
          isBestSeller: p.isBestSeller,
          isOnSale,
          discountPercent,
          thumbnail: thumbnail ? { id: thumbnail.id, url: thumbnail.url } : null,
        };
      }),
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  // ─── Private helpers ──────────────────────────────────────────────────────────

  private async loadCollectionTranslation(
    collectionId: string,
    locale: SupportedLocale,
  ): Promise<CollectionTranslationEntity | null> {
    const tr = await this.collectionTranslationRepo.findOne({ where: { collectionId, locale } });
    if (tr) return tr;
    if (locale !== FALLBACK_LOCALE) {
      return this.collectionTranslationRepo.findOne({
        where: { collectionId, locale: FALLBACK_LOCALE },
      });
    }
    return null;
  }

  private async loadCollectionTranslations(
    collectionIds: string[],
    locale: SupportedLocale,
  ): Promise<Map<string, CollectionTranslationEntity>> {
    if (collectionIds.length === 0) return new Map();

    const rows = await this.collectionTranslationRepo
      .createQueryBuilder('t')
      .where('t.collection_id IN (:...ids)', { ids: collectionIds })
      .andWhere('t.locale IN (:...locales)', {
        locales: locale === FALLBACK_LOCALE ? [locale] : [locale, FALLBACK_LOCALE],
      })
      .getMany();

    const map = new Map<string, CollectionTranslationEntity>();
    for (const row of rows) {
      if (row.locale === FALLBACK_LOCALE) map.set(row.collectionId, row);
    }
    if (locale !== FALLBACK_LOCALE) {
      for (const row of rows) {
        if (row.locale === locale) map.set(row.collectionId, row);
      }
    }
    return map;
  }

  private async loadProductTranslations(
    productIds: string[],
    locale: SupportedLocale,
  ): Promise<Map<string, ProductTranslationEntity>> {
    if (productIds.length === 0) return new Map();

    const rows = await this.productTranslationRepo
      .createQueryBuilder('t')
      .where('t.product_id IN (:...ids)', { ids: productIds })
      .andWhere('t.locale IN (:...locales)', {
        locales: locale === FALLBACK_LOCALE ? [locale] : [locale, FALLBACK_LOCALE],
      })
      .getMany();

    const map = new Map<string, ProductTranslationEntity>();
    for (const row of rows) {
      if (row.locale === FALLBACK_LOCALE) map.set(row.productId, row);
    }
    if (locale !== FALLBACK_LOCALE) {
      for (const row of rows) {
        if (row.locale === locale) map.set(row.productId, row);
      }
    }
    return map;
  }

  // ─── Private mappers ─────────────────────────────────────────────────────────

  private mapCollectionSummary(
    c: CollectionEntity & { productCount?: number },
    tr: CollectionTranslationEntity | null,
  ) {
    return {
      id: c.id,
      name: tr?.name ?? c.name,
      slug: c.slug,
      shortDescription: tr?.shortDescription ?? c.shortDescription,
      image: c.image,
      isFeatured: c.isFeatured,
      sortOrder: c.sortOrder,
      productCount: (c as any).productCount ?? 0,
    };
  }

  private mapCollectionDetail(
    c: CollectionEntity & { productCount?: number },
    tr: CollectionTranslationEntity | null,
  ) {
    return {
      id: c.id,
      name: tr?.name ?? c.name,
      slug: c.slug,
      description: tr?.description ?? c.description,
      shortDescription: tr?.shortDescription ?? c.shortDescription,
      image: c.image,
      bannerImage: c.bannerImage,
      seoTitle: tr?.seoTitle ?? c.seoTitle,
      seoDescription: tr?.seoDescription ?? c.seoDescription,
      isFeatured: c.isFeatured,
      sortOrder: c.sortOrder,
      productCount: (c as any).productCount ?? 0,
    };
  }
}
