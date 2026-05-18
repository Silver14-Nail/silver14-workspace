import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';

import { WholesaleEnquiryStatus } from '@/common/enums/entity.enum';

export class UpdateWholesaleEnquiryDto {
  @ApiPropertyOptional({ enum: WholesaleEnquiryStatus })
  @IsOptional()
  @IsEnum(WholesaleEnquiryStatus)
  status?: WholesaleEnquiryStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  adminNotes?: string | null;

  @ApiPropertyOptional({ description: 'Admin user ID handling this enquiry' })
  @IsOptional()
  @IsUUID()
  handledById?: string | null;
}
