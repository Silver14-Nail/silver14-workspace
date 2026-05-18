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

import { ProductsService } from './products.service';
import { ProductListQueryDto } from './dto/product-list-query.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { CreateNailShapeDto } from './dto/create-nail-shape.dto';
import { UpdateNailShapeDto } from './dto/update-nail-shape.dto';
import { CreateNailSizeDto } from './dto/create-nail-size.dto';
import { UpdateNailSizeDto } from './dto/update-nail-size.dto';

@ApiTags('Admin - Products')
@ApiBearerAuth()
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  listProducts(@Query() query: ProductListQueryDto) {
    return this.productsService.listProducts(query);
  }

  @Get(':id')
  getProduct(@Param('id') id: string) {
    return this.productsService.getProduct(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  createProduct(@Body() dto: CreateProductDto) {
    return this.productsService.createProduct(dto);
  }

  @Patch(':id')
  updateProduct(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.productsService.updateProduct(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeProduct(@Param('id') id: string) {
    return this.productsService.removeProduct(id);
  }
}

@ApiTags('Admin - Nail Shapes')
@ApiBearerAuth()
@Controller('nail-shapes')
export class NailShapesController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  listNailShapes() {
    return this.productsService.listNailShapes();
  }

  @Get(':id')
  getNailShape(@Param('id') id: string) {
    return this.productsService.getNailShape(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  createNailShape(@Body() dto: CreateNailShapeDto) {
    return this.productsService.createNailShape(dto);
  }

  @Patch(':id')
  updateNailShape(@Param('id') id: string, @Body() dto: UpdateNailShapeDto) {
    return this.productsService.updateNailShape(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeNailShape(@Param('id') id: string) {
    return this.productsService.removeNailShape(id);
  }
}

@ApiTags('Admin - Nail Sizes')
@ApiBearerAuth()
@Controller('nail-sizes')
export class NailSizesController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  listNailSizes() {
    return this.productsService.listNailSizes();
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  createNailSize(@Body() dto: CreateNailSizeDto) {
    return this.productsService.createNailSize(dto);
  }

  @Patch(':id')
  updateNailSize(@Param('id') id: string, @Body() dto: UpdateNailSizeDto) {
    return this.productsService.updateNailSize(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeNailSize(@Param('id') id: string) {
    return this.productsService.removeNailSize(id);
  }
}
