import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiConsumes,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

import { CollectionsService } from './collections.service';
import { CollectionListQueryDto } from './dto/collection-list-query.dto';
import { CreateCollectionDto } from './dto/create-collection.dto';
import { UpdateCollectionDto } from './dto/update-collection.dto';
import { AssignProductsDto } from './dto/assign-products.dto';
import { TranslationService } from '@/shared/translation/translation.service';
import { R2Service } from '@/shared/r2/r2.service';
import { SUPPORTED_LOCALES } from '@/shared/translation/translation.constants';
import type { SupportedLocale } from '@/shared/translation/translation.constants';

export class UpsertCollectionTranslationDto {
  @IsString()
  name: string;

  @IsOptional() @IsString()
  shortDescription?: string | null;

  @IsOptional() @IsString()
  description?: string | null;

  @IsOptional() @IsString()
  seoTitle?: string | null;

  @IsOptional() @IsString()
  seoDescription?: string | null;
}

@ApiTags('Admin - Collections')
@ApiBearerAuth()
@Controller('collections')
export class CollectionsController {
  constructor(
    private readonly collectionsService: CollectionsService,
    private readonly translationService: TranslationService,
    private readonly r2Service: R2Service,
  ) {}

  @Post('upload-image')
  @HttpCode(HttpStatus.OK)
  @ApiConsumes('multipart/form-data')
  @ApiOkResponse({ description: 'Uploaded image URL' })
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 5 * 1024 * 1024 } }))
  async uploadImage(
    @UploadedFile() file: { buffer: Buffer; mimetype: string; originalname: string; size: number },
  ) {
    if (!file) throw new BadRequestException('No file uploaded');
    const url = await this.r2Service.upload(file.buffer, file.mimetype, 'collections');
    return { url };
  }

  @Get('stats')
  @ApiOkResponse({ description: 'Collection statistics' })
  getStats() {
    return this.collectionsService.getStats();
  }

  @Get()
  @ApiOkResponse({ description: 'Paginated list of collections with productCount' })
  list(@Query() query: CollectionListQueryDto) {
    return this.collectionsService.listCollections(query);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse({ description: 'Collection created' })
  @ApiConflictResponse({ description: 'Slug already taken' })
  create(@Body() dto: CreateCollectionDto) {
    return this.collectionsService.createCollection(dto);
  }

  @Get(':id')
  @ApiOkResponse({ description: 'Collection detail with assigned products' })
  @ApiNotFoundResponse({ description: 'Collection not found' })
  getOne(@Param('id') id: string) {
    return this.collectionsService.getCollection(id);
  }

  @Patch(':id')
  @ApiOkResponse({ description: 'Updated collection' })
  @ApiNotFoundResponse({ description: 'Collection not found' })
  @ApiConflictResponse({ description: 'Slug already taken' })
  update(@Param('id') id: string, @Body() dto: UpdateCollectionDto) {
    return this.collectionsService.updateCollection(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse({ description: 'Collection soft-deleted' })
  @ApiNotFoundResponse({ description: 'Collection not found' })
  remove(@Param('id') id: string): Promise<void> {
    return this.collectionsService.removeCollection(id);
  }

  @Patch(':id/activate')
  @ApiOkResponse({ description: 'Collection activated' })
  activate(@Param('id') id: string) {
    return this.collectionsService.activateCollection(id);
  }

  @Patch(':id/deactivate')
  @ApiOkResponse({ description: 'Collection deactivated' })
  deactivate(@Param('id') id: string) {
    return this.collectionsService.deactivateCollection(id);
  }

  @Patch(':id/feature')
  @ApiOkResponse({ description: 'Collection featured' })
  feature(@Param('id') id: string) {
    return this.collectionsService.featureCollection(id);
  }

  @Patch(':id/unfeature')
  @ApiOkResponse({ description: 'Collection unfeatured' })
  unfeature(@Param('id') id: string) {
    return this.collectionsService.unfeatureCollection(id);
  }

  @Patch(':id/products')
  @ApiOkResponse({ description: 'Products assigned to collection (replaces existing)' })
  @ApiNotFoundResponse({ description: 'Collection not found' })
  assignProducts(@Param('id') id: string, @Body() dto: AssignProductsDto) {
    return this.collectionsService.assignProducts(id, dto);
  }

  @Get(':id/translations')
  @ApiOkResponse({ description: 'All locale translations for this collection' })
  getTranslations(@Param('id') id: string) {
    return this.translationService.getCollectionTranslations(id);
  }

  @Put(':id/translations/:locale')
  @ApiOkResponse({ description: 'Upsert a specific locale translation (manual override)' })
  async upsertTranslation(
    @Param('id') id: string,
    @Param('locale') locale: string,
    @Body() dto: UpsertCollectionTranslationDto,
  ) {
    if (!(SUPPORTED_LOCALES as readonly string[]).includes(locale)) {
      return { error: `Unsupported locale: ${locale}` };
    }
    const collection = await this.collectionsService.getCollection(id);
    return this.translationService.upsertCollectionTranslation(
      collection,
      locale as SupportedLocale,
      {
        name: dto.name,
        shortDescription: dto.shortDescription ?? null,
        description: dto.description ?? null,
        seoTitle: dto.seoTitle ?? null,
        seoDescription: dto.seoDescription ?? null,
        isAutoGenerated: false,
      },
    );
  }

  @Post(':id/translations/regenerate')
  @ApiOkResponse({ description: 'Trigger AI re-generation of all translations' })
  async regenerate(@Param('id') id: string) {
    const collection = await this.collectionsService.getCollection(id);
    await this.translationService.generateForCollection(collection);
    return { success: true };
  }
}
