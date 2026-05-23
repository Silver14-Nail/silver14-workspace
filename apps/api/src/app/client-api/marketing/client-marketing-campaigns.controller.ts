import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { MarketingCampaignsService } from '../../admin-api/marketing/marketing-campaigns.service';
import { CampaignPlacement } from '@/common/enums/entity.enum';

@ApiTags('Client - Marketing Campaigns')
@Controller('campaigns')
export class ClientMarketingCampaignsController {
  constructor(private readonly service: MarketingCampaignsService) {}

  @Get(':placement')
  @ApiParam({ name: 'placement', enum: CampaignPlacement })
  @ApiQuery({ name: 'locale', required: false, type: String, example: 'en' })
  getByPlacement(
    @Param('placement') placement: CampaignPlacement,
    @Query('locale') locale: string = 'en',
  ) {
    return this.service.getActiveCampaignByPlacement(placement, locale);
  }
}
