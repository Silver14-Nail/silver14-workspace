import { Injectable, NotFoundException } from '@nestjs/common';

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
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ProductEntity } from '@/db/entities/products/product.entity';
import { NailShapeEntity } from '@/db/entities/products/nail-shape.entity';
import { NailSizeEntity } from '@/db/entities/products/nail-size.entity';
import { PaginationDTO } from '@/common/dtos/pagination';

import { ProductFilterBy, ProductQueryDto, ProductSortBy } from './dto/product-query.dto';

@Injectable()
export class ClientProductsService {
  constructor(
    @InjectRepository(ProductEntity)
    private readonly productRepo: Repository<ProductEntity>,
    @InjectRepository(NailShapeEntity)
    private readonly shapeRepo: Repository<NailShapeEntity>,
    @InjectRepository(NailSizeEntity)
    private readonly sizeRepo: Repository<NailSizeEntity>,
  ) {}

  async listProducts(query: ProductQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const qb = this.productRepo
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.images', 'images')
      .where('product.isActive = true')
      .addOrderBy('images.sortOrder', 'ASC')
      .skip(skip)
      .take(limit);

    if (query.search) {
      qb.andWhere('LOWER(product.name) LIKE LOWER(:search)', {
        search: `%${query.search}%`,
      });
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

    const [items, totalItems] = await qb.getManyAndCount();

    const pagination: PaginationDTO = {
      totalItems,
      itemCount: items.length,
      itemsPerPage: limit,
      totalPages: Math.ceil(totalItems / limit),
      currentPage: page,
    };

    return {
      items: items.map((p) => ({
        ...p,
        thumbnail: p.images?.find((img) => img.isMain) ?? p.images?.[0] ?? null,
        images: undefined,
        ...computePricing(p.basePrice, p.salePrice),
      })),
      pagination,
    };
  }

  async getProduct(id: string) {
    const product = await this.productRepo
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.images', 'images')
      .leftJoinAndSelect('product.shapePricings', 'shapePricings')
      .leftJoinAndSelect('shapePricings.shape', 'shape')
      .leftJoinAndSelect('product.variants', 'variants')
      .leftJoinAndSelect('variants.shape', 'variantShape')
      .leftJoinAndSelect('variants.size', 'variantSize')
      .where('product.id = :id', { id })
      .andWhere('product.isActive = true')
      .orderBy('images.sortOrder', 'ASC')
      .addOrderBy('variants.stockQty', 'DESC')
      .getOne();

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    product.shapePricings = product.shapePricings.filter(
      (sp) => sp.isEnabled && sp.shape?.isActive,
    );
    product.variants = product.variants.filter((v) => !v.deletedAt);

    return { ...product, ...computePricing(product.basePrice, product.salePrice) };
  }

  async getProductBySlug(slug: string) {
    const qb = () =>
      this.productRepo
        .createQueryBuilder('product')
        .leftJoinAndSelect('product.images', 'images')
        .leftJoinAndSelect('product.shapePricings', 'shapePricings')
        .leftJoinAndSelect('shapePricings.shape', 'shape')
        .leftJoinAndSelect('product.variants', 'variants')
        .leftJoinAndSelect('variants.shape', 'variantShape')
        .leftJoinAndSelect('variants.size', 'variantSize')
        .andWhere('product.isActive = true')
        .orderBy('images.sortOrder', 'ASC')
        .addOrderBy('variants.stockQty', 'DESC');

    let product =
      (await qb().where('product.slug = :slug', { slug }).getOne()) ??
      (await qb().where('product.id = :slug', { slug }).getOne());

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    product.shapePricings = product.shapePricings.filter(
      (sp) => sp.isEnabled && sp.shape?.isActive,
    );
    product.variants = product.variants.filter((v) => !v.deletedAt);

    return { ...product, ...computePricing(product.basePrice, product.salePrice) };
  }

  getShapes() {
    return this.shapeRepo.find({
      where: { isActive: true },
      order: { name: 'ASC' },
    });
  }

  getSizes() {
    return this.sizeRepo.find({
      order: { label: 'ASC' },
    });
  }
}
