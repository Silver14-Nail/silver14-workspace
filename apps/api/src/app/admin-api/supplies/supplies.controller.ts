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
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { ProductsService } from '../products/products.service';
import { ProductListQueryDto } from '../products/dto/product-list-query.dto';
import { CreateProductDto } from '../products/dto/create-product.dto';
import { UpdateProductDto } from '../products/dto/update-product.dto';
import { ProductType } from '@/common/enums/entity.enum';

@ApiTags('Admin - Supplies')
@ApiBearerAuth()
@Controller('supplies')
export class AdminSuppliesController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  listSupplies(@Query() query: ProductListQueryDto) {
    return this.productsService.listProducts({ ...query, type: ProductType.SUPPLY });
  }

  @Get(':id')
  getSupply(@Param('id') id: string) {
    return this.productsService.getProduct(id);
  }

  @Post()
  createSupply(@Body() dto: CreateProductDto) {
    return this.productsService.createProduct({ ...dto, type: ProductType.SUPPLY });
  }

  @Patch(':id')
  updateSupply(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.productsService.updateProduct(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeSupply(@Param('id') id: string) {
    return this.productsService.removeProduct(id);
  }
}
