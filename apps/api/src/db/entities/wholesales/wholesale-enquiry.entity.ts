import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToOne, JoinColumn } from 'typeorm';
import { WholesaleEnquiryStatus } from '../../../common/enums/entity.enum';

import { AbstractEntity } from '../../../common/entities';
import { WholesaleAccount } from './wholesale-account.entity';
import { User } from '../auths/user.entity';

@Entity('wholesale_enquiries')
export class WholesaleEnquiry extends AbstractEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    name: 'first_name',
    type: 'varchar',
    length: 100,
  })
  firstName: string;

  @Column({
    name: 'last_name',
    type: 'varchar',
    length: 100,
  })
  lastName: string;

  @Column({
    type: 'varchar',
    length: 255,
  })
  email: string;

  @Column({
    type: 'varchar',
    length: 20,
  })
  phone: string;

  @Column({
    type: 'varchar',
    length: 100,
  })
  country: string;

  @Column({
    name: 'business_name',
    type: 'varchar',
    length: 200,
    nullable: true,
  })
  businessName: string | null;

  @Column({
    name: 'business_type',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  businessType: string | null;

  @Column({
    name: 'monthly_order_qty_range',
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  monthlyOrderQtyRange: string | null;

  @Column({
    name: 'collections_of_interest',
    type: 'jsonb',
    nullable: true,
  })
  collectionsOfInterest: string[] | null;

  @Column({
    name: 'additional_message',
    type: 'text',
    nullable: true,
  })
  additionalMessage: string | null;

  @Column({
    type: 'enum',
    enum: WholesaleEnquiryStatus,
    default: WholesaleEnquiryStatus.PENDING,
  })
  status: WholesaleEnquiryStatus;

  @ManyToOne(() => User, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'handled_by' })
  handledBy: User | null;

  @Column({
    name: 'admin_notes',
    type: 'text',
    nullable: true,
  })
  adminNotes: string | null;

  @Column({
    name: 'responded_at',
    type: 'timestamptz',
    nullable: true,
  })
  respondedAt: Date | null;

  @OneToOne(() => WholesaleAccount, (a) => a.enquiry)
  account: WholesaleAccount;
}
