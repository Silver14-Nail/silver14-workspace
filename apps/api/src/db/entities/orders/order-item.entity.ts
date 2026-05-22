import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToOne, JoinColumn } from 'typeorm';

import { AbstractEntity } from '../../../common/entities';
import { OrderEntity } from './order.entity';
import { ProductVariantEntity } from '../products/product-variants.entity';
import { CustomSizeRequestEntity } from './custom-size-request.entity';

@Entity('order_items')
export class OrderItemEntity extends AbstractEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => OrderEntity, (o) => o.items, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'order_id' })
  order: OrderEntity;

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
    name: 'unit_price',
    type: 'numeric',
    precision: 10,
    scale: 2,
  })
  unitPrice: number;

  @Column({
    name: 'shape_surcharge',
    type: 'numeric',
    precision: 10,
    scale: 2,
    default: 0,
  })
  shapeSurcharge: number;

  @Column({
    name: 'item_discount',
    type: 'numeric',
    precision: 10,
    scale: 2,
    default: 0,
  })
  itemDiscount: number;

  @Column({
    name: 'shape_name',
    type: 'varchar',
    length: 100,
  })
  shapeName: string;

  @Column({
    name: 'size_label',
    type: 'varchar',
    length: 20,
  })
  sizeLabel: string;

  @Column({
    name: 'is_custom_size',
    type: 'boolean',
    default: false,
  })
  isCustomSize: boolean;

  @Column({
    name: 'product_id',
    type: 'uuid',
    nullable: true,
  })
  productId: string | null;

  @Column({
    name: 'product_name',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  productName: string | null;

  @Column({
    name: 'product_slug',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  productSlug: string | null;

  @Column({
    name: 'sku',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  sku: string | null;

  @Column({
    name: 'thumbnail',
    type: 'text',
    nullable: true,
  })
  thumbnail: string | null;

  @OneToOne(() => CustomSizeRequestEntity, (r) => r.orderItem)
  customSizeRequest: CustomSizeRequestEntity;
}
