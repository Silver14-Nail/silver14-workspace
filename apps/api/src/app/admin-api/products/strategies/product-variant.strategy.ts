import type { ProductVariantEntity } from '@/db/entities/products/product-variants.entity';
import type { CreateVariantDto } from '../dto/create-variant.dto';
import type { UpdateVariantDto } from '../dto/update-variant.dto';

export interface ProductVariantStrategy {
  /**
   * Returns type-specific fields to merge into a new variant.
   * Throws BadRequestException / NotFoundException on invalid input.
   */
  buildCreateFields(dto: CreateVariantDto): Promise<Partial<ProductVariantEntity>>;

  /**
   * Mutates the variant in-place with type-specific update fields.
   * Throws BadRequestException / NotFoundException on invalid input.
   */
  applyUpdateFields(variant: ProductVariantEntity, dto: UpdateVariantDto): Promise<void>;
}
