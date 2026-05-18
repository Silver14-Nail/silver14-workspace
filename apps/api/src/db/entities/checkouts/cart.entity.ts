import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { CartStatus } from '../../../common/enums/entity.enum';
import { SoftDeleteAbstractEntity } from '../../../common/entities';

import { UserEntity } from '../auths/user.entity';
import { GuestCheckoutEntity } from './guest-checkout.entity';
import { CartItemEntity } from './cart-item.entity';
import { CheckoutSessionEntity } from '@/db/entities/checkouts/checkout-session.entity';

@Entity('carts')
export class CartEntity extends SoftDeleteAbstractEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => UserEntity, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity | null;

  @ManyToOne(() => GuestCheckoutEntity, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'guest_id' })
  guest: GuestCheckoutEntity | null;

  @Column({
    type: 'enum',
    enum: CartStatus,
    default: CartStatus.ACTIVE,
  })
  status: CartStatus;

  @Column({
    name: 'expires_at',
    type: 'timestamp',
    nullable: true,
  })
  expiresAt: Date | null;

  @OneToMany(() => CartItemEntity, (item) => item.cart)
  items: CartItemEntity[];

  @OneToOne(() => CheckoutSessionEntity, (cs) => cs.cart)
  checkoutSession: CheckoutSessionEntity;
}
