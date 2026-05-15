import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { PriceAdjustmentType } from '../../../common/enums/entity.enum';
import { AbstractEntity } from '../../../common/entities';

import { Product } from './product.entity';
import { NailShape } from './nail-shape.entity';

@Entity('product_shape_pricings')
export class ProductShapePricing extends AbstractEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Product, (p) => p.shapePricings, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @ManyToOne(() => NailShape, (s) => s.productPricings, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'shape_id' })
  shape: NailShape;

  @Column({
    name: 'price_override',
    type: 'numeric',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  priceOverride: number | null;

  @Column({
    name: 'price_adjustment',
    type: 'numeric',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  priceAdjustment: number | null;

  @Column({
    name: 'adjustment_type',
    type: 'enum',
    enum: PriceAdjustmentType,
    nullable: true,
  })
  adjustmentType: PriceAdjustmentType | null;

  @Column({
    name: 'is_enabled',
    type: 'boolean',
    default: true,
  })
  isEnabled: boolean;
}
