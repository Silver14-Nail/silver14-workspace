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
  Put,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

import { ProductsService } from './products.service';
import { TranslationService } from '@/shared/translation/translation.service';
import { SUPPORTED_LOCALES } from '@/shared/translation/translation.constants';
import type { SupportedLocale } from '@/shared/translation/translation.constants';

export class UpsertProductTranslationDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string | null;

  @IsOptional()
  @IsString()
  seoTitle?: string | null;

  @IsOptional()
  @IsString()
  seoDescription?: string | null;
}
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

  @Delete(':id/permanent')
  @HttpCode(HttpStatus.NO_CONTENT)
  permanentRemoveProduct(@Param('id') id: string): Promise<void> {
    return this.productsService.permanentRemoveProduct(id);
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
    if (!file) throw new BadRequestException('No file uploaded');
    return this.productsService.uploadProductImage(productId, file);
  }

  @Get('presign')
  presignUpload(@Param('productId') productId: string, @Query('mime') mime: string) {
    return this.productsService.presignProductImageUpload(productId, mime);
  }

  @Post('confirm')
  @HttpCode(HttpStatus.CREATED)
  confirmUpload(@Param('productId') productId: string, @Body() dto: AddImageDto) {
    return this.productsService.confirmProductImageUpload(productId, dto.url);
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

@ApiTags('Admin - Product Translations')
@ApiBearerAuth()
@Controller('products/:id/translations')
export class ProductTranslationsController {
  constructor(
    private readonly productsService: ProductsService,
    private readonly translationService: TranslationService,
  ) {}

  @Get()
  getTranslations(@Param('id') id: string) {
    return this.translationService.getProductTranslations(id);
  }

  @Get('variants')
  getVariantTranslations(@Param('id') productId: string) {
    return this.productsService.getProductVariantTranslations(productId);
  }

  @Put(':locale')
  async upsertTranslation(
    @Param('id') id: string,
    @Param('locale') locale: string,
    @Body() dto: UpsertProductTranslationDto,
  ) {
    if (!(SUPPORTED_LOCALES as readonly string[]).includes(locale)) {
      return { error: `Unsupported locale: ${locale}` };
    }
    const product = await this.productsService.getProduct(id);
    return this.translationService.upsertProductTranslation(product, locale as SupportedLocale, {
      name: dto.name,
      description: dto.description ?? null,
      seoTitle: dto.seoTitle ?? null,
      seoDescription: dto.seoDescription ?? null,
      isAutoGenerated: false,
    });
  }

  @Post('regenerate')
  async regenerate(@Param('id') id: string) {
    const product = await this.productsService.getProduct(id);
    await this.translationService.generateForProduct(product);
    return { success: true };
  }
}

@ApiTags('Admin - Product Variants')
@ApiBearerAuth()
@Controller('products/:productId/variants')
export class ProductVariantsController {
  constructor(
    private readonly productsService: ProductsService,
    private readonly translationService: TranslationService,
  ) {}

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

  @Get(':variantId/translations')
  getVariantTranslations(@Param('variantId') variantId: string) {
    return this.translationService.getTranslations('product_variant', variantId);
  }

  @Post(':variantId/translations/regenerate')
  @HttpCode(HttpStatus.OK)
  async regenerateVariantTranslation(
    @Param('productId') productId: string,
    @Param('variantId') variantId: string,
  ) {
    const variant = await this.productsService.getProductVariant(productId, variantId);
    await this.translationService.generateForVariant(variant);
    return { success: true };
  }
}

@ApiTags('Admin - Product Collections')
@ApiBearerAuth()
@Controller('products/:productId/collections')
export class ProductCollectionsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  listCollections(@Param('productId') productId: string) {
    return this.productsService.getProductCollections(productId);
  }

  @Post(':collectionId')
  @HttpCode(HttpStatus.CREATED)
  addToCollection(
    @Param('productId') productId: string,
    @Param('collectionId') collectionId: string,
  ) {
    return this.productsService.addProductToCollection(productId, collectionId);
  }

  @Delete(':collectionId')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeFromCollection(
    @Param('productId') productId: string,
    @Param('collectionId') collectionId: string,
  ) {
    return this.productsService.removeProductFromCollection(productId, collectionId);
  }
}
