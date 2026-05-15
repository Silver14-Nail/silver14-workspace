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

import { User } from '../auths/user.entity';
import { GuestCheckout } from './guest-checkout.entity';
import { CartItem } from './cart-item.entity';
import { CheckoutSession } from '@/db/entities/checkouts/checkout-session.entity';

@Entity('carts')
export class Cart extends SoftDeleteAbstractEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'user_id' })
  user: User | null;

  @ManyToOne(() => GuestCheckout, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'guest_id' })
  guest: GuestCheckout | null;

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

  @OneToMany(() => CartItem, (item) => item.cart)
  items: CartItem[];

  @OneToOne(() => CheckoutSession, (cs) => cs.cart)
  checkoutSession: CheckoutSession;
}
