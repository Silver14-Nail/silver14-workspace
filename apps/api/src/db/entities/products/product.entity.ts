import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToMany, Index } from 'typeorm';
import { SoftDeleteAbstractEntity } from '../../../common/entities';

import { ProductImageEntity } from './product-image.entity';
import { ProductShapePricingEntity } from './product-shape-pricing.entity';
import { ProductVariantEntity } from './product-variants.entity';
import { CollectionEntity } from './collection.entity';
import { ProductTranslationEntity } from './product-translation.entity';

@Entity('products')
export class ProductEntity extends SoftDeleteAbstractEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'varchar',
    length: 200,
  })
  name: string;

  @Index({ unique: true })
  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  slug: string | null;

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
    name: 'sale_price',
    type: 'numeric',
    precision: 10,
    scale: 2,
    nullable: true,
    default: null,
  })
  salePrice: number | null;

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

  @Column({
    name: 'is_new',
    type: 'boolean',
    default: false,
  })
  isNew: boolean;

  @Column({
    name: 'is_best_seller',
    type: 'boolean',
    default: false,
  })
  isBestSeller: boolean;

  @OneToMany(() => ProductImageEntity, (img) => img.product)
  images: ProductImageEntity[];

  @OneToMany(() => ProductShapePricingEntity, (p) => p.product)
  shapePricings: ProductShapePricingEntity[];

  @OneToMany(() => ProductVariantEntity, (v) => v.product)
  variants: ProductVariantEntity[];

  @ManyToMany(() => CollectionEntity, (collection) => collection.products)
  collections: CollectionEntity[];

  @OneToMany(() => ProductTranslationEntity, (t) => t.product)
  translations: ProductTranslationEntity[];
}
