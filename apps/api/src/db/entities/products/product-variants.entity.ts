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
  })
  @JoinColumn({ name: 'shape_id' })
  shape: NailShapeEntity;

  @ManyToOne(() => NailSizeEntity, (s) => s.variants, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'size_id' })
  size: NailSizeEntity;

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
}
