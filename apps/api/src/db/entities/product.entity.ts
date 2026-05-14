import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { NailSizeLabel, PriceAdjustmentType, ShapeSizeTier } from '@/common/enums/entity.enum';
import { AbstractEntity, SoftDeleteAbstractEntity } from '@/common/entities';

@Entity('products')
export class Product extends SoftDeleteAbstractEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 200 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ name: 'base_price', type: 'numeric', precision: 10, scale: 2 })
  basePrice: number;

  @Column({ length: 3, default: 'USD' })
  currency: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @OneToMany(() => ProductImage, (img) => img.product)
  images: ProductImage[];

  @OneToMany(() => ProductShapePricing, (p) => p.product)
  shapePricings: ProductShapePricing[];

  @OneToMany(() => ProductVariant, (v) => v.product)
  variants: ProductVariant[];
}

@Entity('product_images')
export class ProductImage extends AbstractEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Product, (p) => p.images, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column({ length: 500 })
  url: string;

  @Column({ name: 'sort_order', default: 0 })
  sortOrder: number;
}

@Entity('nail_shapes')
export class NailShape extends SoftDeleteAbstractEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column({ name: 'length_mm' })
  lengthMm: number;

  @Column({ name: 'size_tier', type: 'enum', enum: ShapeSizeTier, default: ShapeSizeTier.STANDARD })
  sizeTier: ShapeSizeTier;

  @Column({ name: 'price_adjustment', type: 'numeric', precision: 10, scale: 2, default: 0 })
  priceAdjustment: number;

  @Column({
    name: 'adjustment_type',
    type: 'enum',
    enum: PriceAdjustmentType,
    default: PriceAdjustmentType.FIXED,
  })
  adjustmentType: PriceAdjustmentType;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @OneToMany(() => ProductShapePricing, (p) => p.shape)
  productPricings: ProductShapePricing[];

  @OneToMany(() => ProductVariant, (v) => v.shape)
  variants: ProductVariant[];
}

@Entity('nail_sizes')
export class NailSize extends AbstractEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: NailSizeLabel })
  label: NailSizeLabel;

  @Column({ name: 'size_code', length: 20 })
  sizeCode: string;

  @Column({ length: 100, nullable: true })
  measurements: string | null;

  @OneToMany(() => ProductVariant, (v) => v.size)
  variants: ProductVariant[];
}

@Entity('product_shape_pricings')
@Index(['product', 'shape'], { unique: true })
export class ProductShapePricing extends AbstractEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Product, (p) => p.shapePricings, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @ManyToOne(() => NailShape, (s) => s.productPricings)
  @JoinColumn({ name: 'shape_id' })
  shape: NailShape;

  @Column({ name: 'price_override', type: 'numeric', precision: 10, scale: 2, nullable: true })
  priceOverride: number | null;

  @Column({ name: 'price_adjustment', type: 'numeric', precision: 10, scale: 2, nullable: true })
  priceAdjustment: number | null;

  @Column({ name: 'adjustment_type', type: 'enum', enum: PriceAdjustmentType, nullable: true })
  adjustmentType: PriceAdjustmentType | null;

  @Column({ name: 'is_enabled', default: true })
  isEnabled: boolean;
}

@Entity('product_variants')
@Index(['product', 'shape', 'size'], { unique: true })
export class ProductVariant extends SoftDeleteAbstractEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Product, (p) => p.variants, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @ManyToOne(() => NailShape, (s) => s.variants)
  @JoinColumn({ name: 'shape_id' })
  shape: NailShape;

  @ManyToOne(() => NailSize, (s) => s.variants)
  @JoinColumn({ name: 'size_id' })
  size: NailSize;

  @Column({ name: 'stock_qty', default: 0 })
  stockQty: number;

  @Column({ name: 'computed_price', type: 'numeric', precision: 10, scale: 2 })
  computedPrice: number;
}
