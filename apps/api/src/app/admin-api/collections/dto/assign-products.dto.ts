import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString } from 'class-validator';

export class AssignProductsDto {
  @ApiProperty({ type: [String], description: 'Array of product IDs to assign to this collection' })
  @IsArray()
  @IsString({ each: true })
  productIds: string[];
}
