import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class AddWhitelistUserDto {
  @ApiProperty({ description: 'User UUID to add to the coupon whitelist' })
  @IsUUID()
  userId: string;
}
