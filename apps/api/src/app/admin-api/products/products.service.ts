import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ProductEntity } from '@/db/entities/products/product.entity';
import { NailShapeEntity } from '@/db/entities/products/nail-shape.entity';
import { NailSizeEntity } from '@/db/entities/products/nail-size.entity';

import { PaginationDTO } from '@/common/dtos/pagination';

import { ProductListQueryDto } from './dto/product-list-query.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { CreateNailShapeDto } from './dto/create-nail-shape.dto';
import { UpdateNailShapeDto } from './dto/update-nail-shape.dto';
import { CreateNailSizeDto } from './dto/create-nail-size.dto';
import { UpdateNailSizeDto } from './dto/update-nail-size.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(ProductEntity)
    private readonly productRepo: Repository<ProductEntity>,
    @InjectRepository(NailShapeEntity)
    private readonly nailShapeRepo: Repository<NailShapeEntity>,
    @InjectRepository(NailSizeEntity)
    private readonly nailSizeRepo: Repository<NailSizeEntity>,
  ) {}

  // ─── Products ───────────────────────────────────────────────────────────────

  async listProducts(query: ProductListQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const qb = this.productRepo
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.images', 'images')
      .orderBy('product.createdAt', 'DESC')
      .skip(skip)
      .take(limit);

    if (query.search) {
      qb.andWhere('LOWER(product.name) LIKE LOWER(:search)', {
        search: `%${query.search}%`,
      });
    }

    if (query.isActive !== undefined) {
      qb.andWhere('product.isActive = :isActive', { isActive: query.isActive });
    }

    const [items, totalItems] = await qb.getManyAndCount();

    const pagination: PaginationDTO = {
      totalItems,
      itemCount: items.length,
      itemsPerPage: limit,
      totalPages: Math.ceil(totalItems / limit),
      currentPage: page,
    };

    return { items, pagination };
  }

  async getProduct(id: string) {
    const product = await this.productRepo.findOne({
      where: { id },
      relations: [
        'images',
        'shapePricings',
        'shapePricings.shape',
        'variants',
        'variants.shape',
        'variants.size',
      ],
    });

    if (!product) {
      throw new NotFoundException(`Product #${id} not found`);
    }

    return product;
  }

  async createProduct(dto: CreateProductDto) {
    const product = this.productRepo.create({
      name: dto.name,
      description: dto.description ?? null,
      basePrice: dto.basePrice,
      currency: dto.currency ?? 'USD',
      isActive: dto.isActive ?? true,
    });

    return this.productRepo.save(product);
  }

  async updateProduct(id: string, dto: UpdateProductDto) {
    const product = await this.productRepo.findOneBy({ id });

    if (!product) {
      throw new NotFoundException(`Product #${id} not found`);
    }

    if (dto.name !== undefined) product.name = dto.name;
    if (dto.description !== undefined) product.description = dto.description;
    if (dto.basePrice !== undefined) product.basePrice = dto.basePrice;
    if (dto.currency !== undefined) product.currency = dto.currency;
    if (dto.isActive !== undefined) product.isActive = dto.isActive;

    return this.productRepo.save(product);
  }

  async removeProduct(id: string) {
    const product = await this.productRepo.findOneBy({ id });

    if (!product) {
      throw new NotFoundException(`Product #${id} not found`);
    }

    await this.productRepo.softDelete(id);

    return { success: true };
  }

  // ─── Nail Shapes ────────────────────────────────────────────────────────────

  async listNailShapes() {
    return this.nailShapeRepo.find({ order: { name: 'ASC' } });
  }

  async getNailShape(id: string) {
    const shape = await this.nailShapeRepo.findOneBy({ id });

    if (!shape) {
      throw new NotFoundException(`Nail shape #${id} not found`);
    }

    return shape;
  }

  async createNailShape(dto: CreateNailShapeDto) {
    const shape = this.nailShapeRepo.create({
      name: dto.name,
      lengthMm: dto.lengthMm,
      sizeTier: dto.sizeTier,
      priceAdjustment: dto.priceAdjustment ?? 0,
      adjustmentType: dto.adjustmentType,
      isActive: dto.isActive ?? true,
    });

    return this.nailShapeRepo.save(shape);
  }

  async updateNailShape(id: string, dto: UpdateNailShapeDto) {
    const shape = await this.nailShapeRepo.findOneBy({ id });

    if (!shape) {
      throw new NotFoundException(`Nail shape #${id} not found`);
    }

    if (dto.name !== undefined) shape.name = dto.name;
    if (dto.lengthMm !== undefined) shape.lengthMm = dto.lengthMm;
    if (dto.sizeTier !== undefined) shape.sizeTier = dto.sizeTier;
    if (dto.priceAdjustment !== undefined) shape.priceAdjustment = dto.priceAdjustment;
    if (dto.adjustmentType !== undefined) shape.adjustmentType = dto.adjustmentType;
    if (dto.isActive !== undefined) shape.isActive = dto.isActive;

    return this.nailShapeRepo.save(shape);
  }

  async removeNailShape(id: string) {
    const shape = await this.nailShapeRepo.findOneBy({ id });

    if (!shape) {
      throw new NotFoundException(`Nail shape #${id} not found`);
    }

    await this.nailShapeRepo.softDelete(id);

    return { success: true };
  }

  // ─── Nail Sizes ─────────────────────────────────────────────────────────────

  async listNailSizes() {
    return this.nailSizeRepo.find({ order: { label: 'ASC' } });
  }

  async createNailSize(dto: CreateNailSizeDto) {
    const size = this.nailSizeRepo.create({
      label: dto.label,
      sizeCode: dto.sizeCode,
      measurements: dto.measurements ?? null,
    });

    return this.nailSizeRepo.save(size);
  }

  async updateNailSize(id: string, dto: UpdateNailSizeDto) {
    const size = await this.nailSizeRepo.findOneBy({ id });

    if (!size) {
      throw new NotFoundException(`Nail size #${id} not found`);
    }

    if (dto.label !== undefined) size.label = dto.label;
    if (dto.sizeCode !== undefined) size.sizeCode = dto.sizeCode;
    if (dto.measurements !== undefined) size.measurements = dto.measurements ?? null;

    return this.nailSizeRepo.save(size);
  }

  async removeNailSize(id: string) {
    const size = await this.nailSizeRepo.findOneBy({ id });

    if (!size) {
      throw new NotFoundException(`Nail size #${id} not found`);
    }

    await this.nailSizeRepo.remove(size);

    return { success: true };
  }
}
