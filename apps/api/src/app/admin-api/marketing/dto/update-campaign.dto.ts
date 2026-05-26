import { PartialType } from '@nestjs/swagger';
import { IsArray, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateCampaignDto } from './create-campaign.dto';
import { CampaignTranslationDto } from './campaign-translation.dto';

export class UpdateCampaignDto extends PartialType(CreateCampaignDto) {
  // Explicitly re-declare so @Type() is preserved through PartialType (swagger PartialType
  // does not reliably copy class-transformer metadata to nested array items).
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CampaignTranslationDto)
  translations?: CampaignTranslationDto[];
}
