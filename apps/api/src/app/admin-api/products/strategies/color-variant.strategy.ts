import { Injectable, BadRequestException } from '@nestjs/common';
import type { ProductVariantEntity } from '@/db/entities/products/product-variants.entity';
import type { CreateVariantDto } from '../dto/create-variant.dto';
import type { UpdateVariantDto } from '../dto/update-variant.dto';
import type { ProductVariantStrategy } from './product-variant.strategy';

@Injectable()
export class ColorVariantStrategy implements ProductVariantStrategy {
  async buildCreateFields(dto: CreateVariantDto): Promise<Partial<ProductVariantEntity>> {
    if (dto.shapeId || dto.sizeId) {
      throw new BadRequestException('Shape/size cannot be set on non-NAIL product variants');
    }

    return {
      shape: null,
      size: null,
      colorName: dto.colorName ?? null,
      colorHex: dto.colorHex ?? null,
      variantImageUrl: dto.variantImageUrl ?? null,
    };
  }

  async applyUpdateFields(variant: ProductVariantEntity, dto: UpdateVariantDto): Promise<void> {
    if (dto.shapeId !== undefined || dto.sizeId !== undefined) {
      throw new BadRequestException('Shape/size cannot be set on non-NAIL product variants');
    }

    if (dto.colorName !== undefined) variant.colorName = dto.colorName ?? null;
    if (dto.colorHex !== undefined) variant.colorHex = dto.colorHex ?? null;
    if (dto.variantImageUrl !== undefined) variant.variantImageUrl = dto.variantImageUrl ?? null;
  }
}
