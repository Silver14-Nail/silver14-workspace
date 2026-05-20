import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class MergeCartDto {
  @ApiProperty({ description: 'Guest cart ID to merge into the authenticated user cart' })
  @IsUUID()
  guestCartId: string;
}
