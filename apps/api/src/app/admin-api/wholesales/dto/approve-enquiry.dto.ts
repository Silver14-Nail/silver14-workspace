import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class ApproveEnquiryDto {
  @ApiProperty({ description: 'Tier ID to assign to the new wholesale account' })
  @IsUUID()
  tierId: string;
}
