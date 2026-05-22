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
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';

import { ProductsService } from './products.service';
import { ProductListQueryDto } from './dto/product-list-query.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { CreateNailShapeDto } from './dto/create-nail-shape.dto';
import { UpdateNailShapeDto } from './dto/update-nail-shape.dto';
import { CreateNailSizeDto } from './dto/create-nail-size.dto';
import { UpdateNailSizeDto } from './dto/update-nail-size.dto';
import { CreateVariantDto } from './dto/create-variant.dto';
import { UpdateVariantDto } from './dto/update-variant.dto';
import { AddImageDto } from './dto/add-image.dto';
import { ReorderImagesDto } from './dto/reorder-images.dto';

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
  listNailShapes(@Query('isActive') isActive?: string) {
    const filter = isActive !== undefined ? isActive === 'true' : undefined;
    return this.productsService.listNailShapes(filter);
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

  @Get(':id')
  getNailSize(@Param('id') id: string) {
    return this.productsService.getNailSize(id);
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

@ApiTags('Admin - Product Images')
@ApiBearerAuth()
@Controller('products/:productId/images')
export class ProductImagesController {
  constructor(private readonly productsService: ProductsService) {}

  @Post('upload')
  @HttpCode(HttpStatus.CREATED)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 5 * 1024 * 1024 } }))
  uploadImage(
    @Param('productId') productId: string,
    @UploadedFile() file: { buffer: Buffer; mimetype: string; originalname: string; size: number },
  ) {
    return this.productsService.uploadProductImage(productId, file);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  addImage(@Param('productId') productId: string, @Body() dto: AddImageDto) {
    return this.productsService.addProductImage(productId, dto);
  }

  @Delete(':imageId')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeImage(@Param('productId') productId: string, @Param('imageId') imageId: string) {
    return this.productsService.removeProductImage(productId, imageId);
  }

  @Patch('reorder')
  reorderImages(@Param('productId') productId: string, @Body() dto: ReorderImagesDto) {
    return this.productsService.reorderProductImages(productId, dto);
  }

  @Patch(':imageId/main')
  setMain(@Param('productId') productId: string, @Param('imageId') imageId: string) {
    return this.productsService.setMainProductImage(productId, imageId);
  }
}

@ApiTags('Admin - Product Variants')
@ApiBearerAuth()
@Controller('products/:productId/variants')
export class ProductVariantsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  listVariants(@Param('productId') productId: string) {
    return this.productsService.listProductVariants(productId);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  createVariant(@Param('productId') productId: string, @Body() dto: CreateVariantDto) {
    return this.productsService.createProductVariant(productId, dto);
  }

  @Patch(':variantId')
  updateVariant(
    @Param('productId') productId: string,
    @Param('variantId') variantId: string,
    @Body() dto: UpdateVariantDto,
  ) {
    return this.productsService.updateProductVariant(productId, variantId, dto);
  }

  @Delete(':variantId')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeVariant(@Param('productId') productId: string, @Param('variantId') variantId: string) {
    return this.productsService.removeProductVariant(productId, variantId);
  }
}
