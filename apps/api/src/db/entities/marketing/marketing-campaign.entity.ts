import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  OneToMany,
} from 'typeorm';
import { AbstractEntity } from '../../../common/entities';
import { CampaignType, CampaignPlacement, CampaignStatus } from '../../../common/enums/entity.enum';
import { MarketingCampaignTranslationEntity } from './marketing-campaign-translation.entity';

@Entity('marketing_campaigns')
@Index(['placement', 'status'])
@Index(['placement', 'status', 'priority'])
export class MarketingCampaignEntity extends AbstractEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({
    type: 'enum',
    enum: CampaignType,
  })
  type: CampaignType;

  @Column({
    type: 'enum',
    enum: CampaignPlacement,
    name: 'placement',
  })
  placement: CampaignPlacement;

  @Column({
    type: 'enum',
    enum: CampaignStatus,
    default: CampaignStatus.DRAFT,
  })
  status: CampaignStatus;

  @Column({ name: 'desktop_image_url', type: 'varchar', length: 2048, nullable: true })
  desktopImageUrl: string | null;

  @Column({ name: 'mobile_image_url', type: 'varchar', length: 2048, nullable: true })
  mobileImageUrl: string | null;

  @Column({ name: 'cta_url', type: 'varchar', length: 2048, nullable: true })
  ctaUrl: string | null;

  @Column({ type: 'int', default: 0 })
  priority: number;

  @Column({ name: 'starts_at', type: 'timestamp', nullable: true })
  startsAt: Date | null;

  @Column({ name: 'ends_at', type: 'timestamp', nullable: true })
  endsAt: Date | null;

  @Column({ name: 'overlay_opacity', type: 'float', default: 0.35 })
  overlayOpacity: number;

  @OneToMany(() => MarketingCampaignTranslationEntity, (t) => t.campaign)
  translations: MarketingCampaignTranslationEntity[];
}
