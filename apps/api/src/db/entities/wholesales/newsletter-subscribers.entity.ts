import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { NewsletterSource, NewsletterStatus } from '../../../common/enums/entity.enum';

import { AbstractEntity } from '../../../common/entities';

import { User } from '../auths/user.entity';

@Entity('newsletter_subscribers')
export class NewsletterSubscriber extends AbstractEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'varchar',
    length: 255,
    unique: true,
  })
  email: string;

  @ManyToOne(() => User, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'user_id' })
  user: User | null;

  @Column({
    type: 'enum',
    enum: NewsletterStatus,
    default: NewsletterStatus.ACTIVE,
  })
  status: NewsletterStatus;

  @Column({
    type: 'jsonb',
    nullable: true,
  })
  preferences: Record<string, boolean> | null;

  @Column({
    type: 'enum',
    enum: NewsletterSource,
  })
  source: NewsletterSource;

  @Column({
    name: 'unsubscribed_at',
    type: 'timestamptz',
    nullable: true,
  })
  unsubscribedAt: Date | null;
}
