import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NailShapeEntity } from '@/db/entities/products/nail-shape.entity';
import { NailSizeEntity } from '@/db/entities/products/nail-size.entity';
import type { ProductVariantEntity } from '@/db/entities/products/product-variants.entity';
import type { CreateVariantDto } from '../dto/create-variant.dto';
import type { UpdateVariantDto } from '../dto/update-variant.dto';
import type { ProductVariantStrategy } from './product-variant.strategy';

@Injectable()
export class NailVariantStrategy implements ProductVariantStrategy {
  constructor(
    @InjectRepository(NailShapeEntity)
    private readonly shapeRepo: Repository<NailShapeEntity>,
    @InjectRepository(NailSizeEntity)
    private readonly sizeRepo: Repository<NailSizeEntity>,
  ) {}

  async buildCreateFields(dto: CreateVariantDto): Promise<Partial<ProductVariantEntity>> {
    if (!dto.shapeId) throw new BadRequestException('shapeId is required for NAIL variants');
    if (!dto.sizeId) throw new BadRequestException('sizeId is required for NAIL variants');

    const shape = await this.shapeRepo.findOneBy({ id: dto.shapeId });
    if (!shape) throw new NotFoundException(`Nail shape #${dto.shapeId} not found`);

    const size = await this.sizeRepo.findOneBy({ id: dto.sizeId });
    if (!size) throw new NotFoundException(`Nail size #${dto.sizeId} not found`);

    return { shape, size, colorName: null, colorHex: null, variantImageUrl: null };
  }

  async applyUpdateFields(variant: ProductVariantEntity, dto: UpdateVariantDto): Promise<void> {
    variant.colorName = null;
    variant.colorHex = null;
    variant.variantImageUrl = null;

    if (dto.shapeId !== undefined) {
      const shape = await this.shapeRepo.findOneBy({ id: dto.shapeId });
      if (!shape) throw new NotFoundException(`Nail shape #${dto.shapeId} not found`);
      variant.shape = shape;
    }

    if (dto.sizeId !== undefined) {
      const size = await this.sizeRepo.findOneBy({ id: dto.sizeId });
      if (!size) throw new NotFoundException(`Nail size #${dto.sizeId} not found`);
      variant.size = size;
    }
  }
}
