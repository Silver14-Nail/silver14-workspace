import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';

import { AbstractEntity } from '../../../common/entities';

import { WholesaleAccount } from './wholesale-account.entity';
import { Product } from '../products/product.entity';

@Entity('wholesale_product_pricings')
export class WholesaleProductPricing extends AbstractEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => WholesaleAccount, (a) => a.productPricings, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'wholesale_account_id' })
  account: WholesaleAccount;

  @ManyToOne(() => Product, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column({
    name: 'override_price',
    type: 'numeric',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  overridePrice: number | null;

  @Column({
    name: 'discount_percent',
    type: 'numeric',
    precision: 5,
    scale: 2,
    nullable: true,
  })
  discountPercent: number | null;

  @Column({
    name: 'is_enabled',
    type: 'boolean',
    default: true,
  })
  isEnabled: boolean;
}
