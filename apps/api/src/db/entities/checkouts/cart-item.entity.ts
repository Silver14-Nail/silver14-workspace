import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ProductVariant } from '../products/product-variants.entity';

import { AbstractEntity } from '../../../common/entities';
import { Cart } from './cart.entity';

@Entity('cart_items')
export class CartItem extends AbstractEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Cart, (c) => c.items, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'cart_id' })
  cart: Cart;

  @ManyToOne(() => ProductVariant, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'variant_id' })
  variant: ProductVariant;

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
    type: 'jsonb',
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
