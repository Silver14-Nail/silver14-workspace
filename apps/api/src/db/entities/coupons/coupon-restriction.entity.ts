import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { CouponRestrictionType } from '../../../common/enums/entity.enum';

import { AbstractEntity } from '../../../common/entities';

import { CouponEntity } from './coupon.entity';

@Entity('coupon_restrictions')
export class CouponRestrictionEntity extends AbstractEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => CouponEntity, (c) => c.restrictions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'coupon_id' })
  coupon: CouponEntity;

  @Column({
    name: 'restriction_type',
    type: 'enum',
    enum: CouponRestrictionType,
  })
  restrictionType: CouponRestrictionType;

  @Column({
    name: 'ref_id',
    type: 'uuid',
    nullable: true,
  })
  refId: string | null;

  @Column({
    name: 'ref_label',
    type: 'varchar',
    length: 200,
    nullable: true,
  })
  refLabel: string | null;
}
