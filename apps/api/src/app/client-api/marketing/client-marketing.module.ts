import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { R2SharedModule } from '@/shared/r2/r2.module';
import { MarketingCampaignEntity } from '@/db/entities/marketing/marketing-campaign.entity';
import { MarketingCampaignTranslationEntity } from '@/db/entities/marketing/marketing-campaign-translation.entity';
import { MarketingCampaignsService } from '../../admin-api/marketing/marketing-campaigns.service';
import { ClientMarketingCampaignsController } from './client-marketing-campaigns.controller';

@Module({
  imports: [
    R2SharedModule,
    TypeOrmModule.forFeature([MarketingCampaignEntity, MarketingCampaignTranslationEntity]),
  ],
  controllers: [ClientMarketingCampaignsController],
  providers: [MarketingCampaignsService],
})
export class ClientMarketingModule {}
