import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiParam, ApiTags } from '@nestjs/swagger';
import { MarketingCampaignsService } from './marketing-campaigns.service';
import { CampaignListQueryDto } from './dto/campaign-list-query.dto';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { UpdateCampaignDto } from './dto/update-campaign.dto';

@ApiTags('Admin - Marketing Campaigns')
@ApiBearerAuth()
@Controller('marketing/campaigns')
export class MarketingCampaignsController {
  constructor(private readonly service: MarketingCampaignsService) {}

  @Get()
  list(@Query() query: CampaignListQueryDto) {
    return this.service.listCampaigns(query);
  }

  @Get(':id')
  @ApiParam({ name: 'id', type: 'string' })
  getOne(@Param('id') id: string) {
    return this.service.getCampaign(id);
  }

  @Post()
  create(@Body() dto: CreateCampaignDto) {
    return this.service.createCampaign(dto);
  }

  @Patch(':id')
  @ApiParam({ name: 'id', type: 'string' })
  update(@Param('id') id: string, @Body() dto: UpdateCampaignDto) {
    return this.service.updateCampaign(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiParam({ name: 'id', type: 'string' })
  async remove(@Param('id') id: string) {
    await this.service.deleteCampaign(id);
  }

  @Post(':id/images/desktop')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  uploadDesktop(@Param('id') id: string, @UploadedFile() file: Express.Multer.File) {
    return this.service.uploadImage(id, 'desktop', file);
  }

  @Post(':id/images/mobile')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  uploadMobile(@Param('id') id: string, @UploadedFile() file: Express.Multer.File) {
    return this.service.uploadImage(id, 'mobile', file);
  }
}
