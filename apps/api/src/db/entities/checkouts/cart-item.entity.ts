import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ProductVariantEntity } from '../products/product-variants.entity';

import { AbstractEntity } from '../../../common/entities';
import { CartEntity } from './cart.entity';

@Entity('cart_items')
export class CartItemEntity extends AbstractEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => CartEntity, (c) => c.items, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'cart_id' })
  cart: CartEntity;

  @ManyToOne(() => ProductVariantEntity, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'variant_id' })
  variant: ProductVariantEntity;

  @Column({
    type: 'int',
    default: 1,
  })
  quantity: number;

  @Column({
    name: 'is_custom_size',
    type: 'boolean',
    default: false,
  })
  isCustomSize: boolean;

  @Column({
    name: 'custom_measurements',
    type: 'json',
    nullable: true,
  })
  customMeasurements: {
    thumb?: string;
    index?: string;
    middle?: string;
    ring?: string;
    pinky?: string;
    notes?: string;
  } | null;
}
