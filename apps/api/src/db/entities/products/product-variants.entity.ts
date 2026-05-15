import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { SoftDeleteAbstractEntity } from '../../../common/entities';

import { NailShape } from './nail-shape.entity';
import { NailSize } from './nail-size.entity';
import { Product } from './product.entity';

@Entity('product_variants')
export class ProductVariant extends SoftDeleteAbstractEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Product, (p) => p.variants, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @ManyToOne(() => NailShape, (s) => s.variants, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'shape_id' })
  shape: NailShape;

  @ManyToOne(() => NailSize, (s) => s.variants, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'size_id' })
  size: NailSize;

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
}
