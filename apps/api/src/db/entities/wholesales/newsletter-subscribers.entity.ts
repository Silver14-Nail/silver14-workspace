import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { NewsletterSource, NewsletterStatus } from '../../../common/enums/entity.enum';

import { AbstractEntity } from '../../../common/entities';

import { UserEntity } from '../auths/user.entity';

@Entity('newsletter_subscribers')
export class NewsletterSubscriberEntity extends AbstractEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'varchar',
    length: 255,
    unique: true,
  })
  email: string;

  @ManyToOne(() => UserEntity, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity | null;

  @Column({
    type: 'enum',
    enum: NewsletterStatus,
    default: NewsletterStatus.ACTIVE,
  })
  status: NewsletterStatus;

  @Column({
    type: 'json',
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
    type: 'timestamp',
    nullable: true,
  })
  unsubscribedAt: Date | null;
}
