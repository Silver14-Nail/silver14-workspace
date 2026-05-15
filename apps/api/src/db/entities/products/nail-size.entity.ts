import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { NailSizeLabel } from '../../../common/enums/entity.enum';
import { AbstractEntity } from '../../../common/entities';

import { ProductVariant } from './product-variants.entity';

@Entity('nail_sizes')
export class NailSize extends AbstractEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: NailSizeLabel,
  })
  label: NailSizeLabel;

  @Column({
    name: 'size_code',
    type: 'varchar',
    length: 20,
    unique: true,
  })
  sizeCode: string;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  measurements: string | null;

  @OneToMany(() => ProductVariant, (v) => v.size)
  variants: ProductVariant[];
}
