import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { SoftDeleteAbstractEntity } from '../../../common/entities';

import { NailShapeEntity } from './nail-shape.entity';
import { NailSizeEntity } from './nail-size.entity';
import { ProductEntity } from './product.entity';

@Entity('product_variants')
export class ProductVariantEntity extends SoftDeleteAbstractEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => ProductEntity, (p) => p.variants, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'product_id' })
  product: ProductEntity;

  @ManyToOne(() => NailShapeEntity, (s) => s.variants, {
    onDelete: 'RESTRICT',
    nullable: true,
  })
  @JoinColumn({ name: 'shape_id' })
  shape: NailShapeEntity | null;

  @ManyToOne(() => NailSizeEntity, (s) => s.variants, {
    onDelete: 'RESTRICT',
    nullable: true,
  })
  @JoinColumn({ name: 'size_id' })
  size: NailSizeEntity | null;

  @Column({
    name: 'stock_qty',
    type: 'int',
    default: 0,
  })
  stockQty: number;

  @Column({
    name: 'computed_price',
    type: 'numeric',
    precision: 10,
    scale: 2,
  })
  computedPrice: number;

  @Column({
    name: 'sku',
    type: 'varchar',
    length: 100,
    nullable: true,
    unique: true,
  })
  sku: string | null;

  @Column({
    name: 'is_available',
    type: 'tinyint',
    default: 1,
  })
  isAvailable: boolean;

  @Column({
    name: 'color_name',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  colorName: string | null;

  @Column({
    name: 'color_hex',
    type: 'varchar',
    length: 7,
    nullable: true,
  })
  colorHex: string | null;

  @Column({
    name: 'variant_image_url',
    type: 'varchar',
    length: 2048,
    nullable: true,
  })
  variantImageUrl: string | null;
}
