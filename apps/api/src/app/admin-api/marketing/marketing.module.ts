import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { R2SharedModule } from '@/shared/r2/r2.module';
import { MarketingCampaignEntity } from '@/db/entities/marketing/marketing-campaign.entity';
import { MarketingCampaignTranslationEntity } from '@/db/entities/marketing/marketing-campaign-translation.entity';
import { MarketingCampaignsService } from './marketing-campaigns.service';
import { MarketingCampaignsController } from './marketing-campaigns.controller';

@Module({
  imports: [
    R2SharedModule,
    TypeOrmModule.forFeature([MarketingCampaignEntity, MarketingCampaignTranslationEntity]),
  ],
  controllers: [MarketingCampaignsController],
  providers: [MarketingCampaignsService],
  exports: [MarketingCampaignsService],
})
export class AdminMarketingModule {}
