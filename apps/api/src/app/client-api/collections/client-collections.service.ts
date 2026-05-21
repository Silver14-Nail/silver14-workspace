import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CollectionEntity } from '@/db/entities/products/collection.entity';
import { ProductEntity } from '@/db/entities/products/product.entity';

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
  ) {}

  async listCollections(query: CollectionQueryDto) {
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

    return {
      data: data.map((c) => this.mapCollectionSummary(c)),
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async getFeaturedCollections() {
    const collections = await this.collectionRepo
      .createQueryBuilder('c')
      .where('c.isActive = true AND c.isFeatured = true')
      .loadRelationCountAndMap('c.productCount', 'c.products', 'p', (pb) =>
        pb.where('p.deleted_at IS NULL AND p.is_active = true'),
      )
      .orderBy('c.sortOrder', 'ASC')
      .getMany();

    return collections.map((c) => this.mapCollectionSummary(c));
  }

  async getCollectionBySlug(slug: string) {
    const collection = await this.collectionRepo
      .createQueryBuilder('c')
      .where('c.slug = :slug AND c.isActive = true', { slug })
      .loadRelationCountAndMap('c.productCount', 'c.products', 'p', (pb) =>
        pb.where('p.deleted_at IS NULL AND p.is_active = true'),
      )
      .getOne();

    if (!collection) throw new NotFoundException('Collection not found');
    return this.mapCollectionDetail(collection);
  }

  async getCollectionProducts(slug: string, query: CollectionProductQueryDto) {
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
      .addOrderBy('images.sortOrder', 'ASC')
      .skip(skip)
      .take(limit);

    if (query.sortBy === 'newest') {
      qb.orderBy('p.createdAt', 'DESC');
    } else if (query.sortBy === 'price_asc') {
      qb.orderBy('p.basePrice', 'ASC');
    } else if (query.sortBy === 'price_desc') {
      qb.orderBy('p.basePrice', 'DESC');
    } else if (query.sortBy === 'bestseller') {
      qb.andWhere('p.isBestSeller = true');
    }

    const [products, total] = await qb.getManyAndCount();

    return {
      collection: { id: collection.id, name: collection.name, slug: collection.slug },
      data: products.map((p) => {
        const { isOnSale, discountPercent } = computePricing(p.basePrice, p.salePrice);
        const thumbnail = p.images?.find((img) => img.isMain) ?? p.images?.[0] ?? null;
        return {
          id: p.id,
          name: p.name,
          slug: p.slug,
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

  // ─── Private mappers ─────────────────────────────────────────────────────────

  private mapCollectionSummary(c: CollectionEntity & { productCount?: number }) {
    return {
      id: c.id,
      name: c.name,
      slug: c.slug,
      shortDescription: c.shortDescription,
      image: c.image,
      isFeatured: c.isFeatured,
      sortOrder: c.sortOrder,
      productCount: (c as any).productCount ?? 0,
    };
  }

  private mapCollectionDetail(c: CollectionEntity & { productCount?: number }) {
    return {
      id: c.id,
      name: c.name,
      slug: c.slug,
      description: c.description,
      shortDescription: c.shortDescription,
      image: c.image,
      bannerImage: c.bannerImage,
      seoTitle: c.seoTitle,
      seoDescription: c.seoDescription,
      isFeatured: c.isFeatured,
      sortOrder: c.sortOrder,
      productCount: (c as any).productCount ?? 0,
    };
  }
}
