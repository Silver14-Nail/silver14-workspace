import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  ManyToMany,
  OneToMany,
  JoinTable,
} from 'typeorm';
import { SoftDeleteAbstractEntity } from '../../../common/entities';
import { ProductEntity } from './product.entity';
import { CollectionTranslationEntity } from './collection-translation.entity';

@Entity('collections')
export class CollectionEntity extends SoftDeleteAbstractEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 200 })
  name: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 255 })
  slug: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ name: 'short_description', type: 'varchar', length: 500, nullable: true })
  shortDescription: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  image: string | null;

  @Column({ name: 'banner_image', type: 'varchar', length: 500, nullable: true })
  bannerImage: string | null;

  @Column({ name: 'seo_title', type: 'varchar', length: 200, nullable: true })
  seoTitle: string | null;

  @Column({ name: 'seo_description', type: 'varchar', length: 500, nullable: true })
  seoDescription: string | null;

  @Column({ name: 'is_featured', type: 'boolean', default: false })
  isFeatured: boolean;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder: number;

  @ManyToMany(() => ProductEntity, (product) => product.collections)
  @JoinTable({
    name: 'product_collections',
    joinColumn: { name: 'collection_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'product_id', referencedColumnName: 'id' },
  })
  products: ProductEntity[];

  @OneToMany(() => CollectionTranslationEntity, (t) => t.collection)
  translations: CollectionTranslationEntity[];
}
