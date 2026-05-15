import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { SoftDeleteAbstractEntity } from '../../../common/entities';

import { ProductImage } from './product-image.entity';
import { ProductShapePricing } from './product-shape-pricing.entity';
import { ProductVariant } from './product-variants.entity';

@Entity('products')
export class Product extends SoftDeleteAbstractEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'varchar',
    length: 200,
  })
  name: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  description: string | null;

  @Column({
    name: 'base_price',
    type: 'numeric',
    precision: 10,
    scale: 2,
  })
  basePrice: number;

  @Column({
    type: 'varchar',
    length: 3,
    default: 'USD',
  })
  currency: string;

  @Column({
    name: 'is_active',
    type: 'boolean',
    default: true,
  })
  isActive: boolean;

  @OneToMany(() => ProductImage, (img) => img.product)
  images: ProductImage[];

  @OneToMany(() => ProductShapePricing, (p) => p.product)
  shapePricings: ProductShapePricing[];

  @OneToMany(() => ProductVariant, (v) => v.product)
  variants: ProductVariant[];
}
