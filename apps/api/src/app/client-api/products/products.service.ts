import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ProductEntity } from '@/db/entities/products/product.entity';
import { NailShapeEntity } from '@/db/entities/products/nail-shape.entity';
import { NailSizeEntity } from '@/db/entities/products/nail-size.entity';
import { PaginationDTO } from '@/common/dtos/pagination';

import { ProductQueryDto } from './dto/product-query.dto';

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
      .orderBy('product.createdAt', 'DESC')
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
      // Only return products that have an enabled pricing for the requested shape
      qb.andWhere(
        `EXISTS (
          SELECT 1 FROM product_shape_pricings psp
          WHERE psp.product_id = product.id
            AND psp.shape_id = :shapeId
            AND psp.is_enabled = true
            AND psp.deleted_at IS NULL
        )`,
        { shapeId: query.shapeId },
      );
    }

    const [items, totalItems] = await qb.getManyAndCount();

    const pagination: PaginationDTO = {
      totalItems,
      itemCount: items.length,
      itemsPerPage: limit,
      totalPages: Math.ceil(totalItems / limit),
      currentPage: page,
    };

    // Expose only the first image per product in the list view
    return {
      items: items.map((p) => ({
        ...p,
        thumbnail: p.images?.[0] ?? null,
        images: undefined,
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

    // Filter: only enabled shape pricings where the shape is also active
    product.shapePricings = product.shapePricings.filter(
      (sp) => sp.isEnabled && sp.shape?.isActive,
    );

    // Filter: only non-deleted variants (soft delete already handled by TypeORM)
    // Group in-stock variants first (already ordered by stockQty DESC)
    product.variants = product.variants.filter((v) => !v.deletedAt);

    return product;
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
