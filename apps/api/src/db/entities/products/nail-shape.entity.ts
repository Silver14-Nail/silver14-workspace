import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { PriceAdjustmentType, ShapeSizeTier } from '../../../common/enums/entity.enum';
import { SoftDeleteAbstractEntity } from '../../../common/entities';

import { ProductShapePricingEntity } from './product-shape-pricing.entity';
import { ProductVariantEntity } from './product-variants.entity';

@Entity('nail_shapes')
export class NailShapeEntity extends SoftDeleteAbstractEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'varchar',
    length: 100,
  })
  name: string;

  @Column({
    name: 'length_mm',
    type: 'int',
  })
  lengthMm: number;

  @Column({
    name: 'size_tier',
    type: 'enum',
    enum: ShapeSizeTier,
    default: ShapeSizeTier.STANDARD,
  })
  sizeTier: ShapeSizeTier;

  @Column({
    name: 'price_adjustment',
    type: 'numeric',
    precision: 10,
    scale: 2,
    default: 0,
  })
  priceAdjustment: number;

  @Column({
    name: 'adjustment_type',
    type: 'enum',
    enum: PriceAdjustmentType,
    default: PriceAdjustmentType.FIXED,
  })
  adjustmentType: PriceAdjustmentType;

  @Column({
    name: 'is_active',
    type: 'boolean',
    default: true,
  })
  isActive: boolean;

  @Column({
    name: 'sort_order',
    type: 'int',
    default: 0,
  })
  sortOrder: number;

  @OneToMany(() => ProductShapePricingEntity, (p) => p.shape)
  productPricings: ProductShapePricingEntity[];

  @OneToMany(() => ProductVariantEntity, (v) => v.shape)
  variants: ProductVariantEntity[];
}
