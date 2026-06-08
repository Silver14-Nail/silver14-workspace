import { Controller, Get, HttpCode, Param, Query, Res } from '@nestjs/common';
import { ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { MarketingCampaignsService } from '../../admin-api/marketing/marketing-campaigns.service';
import { CampaignPlacement } from '@/common/enums/entity.enum';

@ApiTags('Client - Marketing Campaigns')
@Controller('campaigns')
export class ClientMarketingCampaignsController {
  constructor(private readonly service: MarketingCampaignsService) {}

  @Get(':placement')
  @HttpCode(200)
  @ApiParam({ name: 'placement', enum: CampaignPlacement })
  @ApiQuery({ name: 'locale', required: false, type: String, example: 'en' })
  async getByPlacement(
    @Param('placement') placement: CampaignPlacement,
    @Query('locale') locale: string = 'en',
    @Res() res: Response,
  ) {
    const campaign = await this.service.getActiveCampaignByPlacement(placement, locale);
    // Explicitly send JSON so null is serialised as "null" not empty body
    return res.json(campaign);
  }
}
