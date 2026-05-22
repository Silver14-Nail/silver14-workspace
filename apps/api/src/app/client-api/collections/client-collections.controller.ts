import { Controller, Get, Headers, Param, Query } from '@nestjs/common';
import { ApiHeader, ApiNotFoundResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';

import { ClientCollectionsService } from './client-collections.service';
import { CollectionQueryDto, CollectionProductQueryDto } from './dto/collection-query.dto';
import { resolveLocale } from '@/shared/translation/locale.resolver';

@ApiTags('Client - Collections')
@ApiHeader({ name: 'X-Locale', description: 'Preferred locale (en, vi, de, fr)', required: false })
@Controller('collections')
export class ClientCollectionsController {
  constructor(private readonly service: ClientCollectionsService) {}

  @Get('featured')
  @ApiOkResponse({ description: 'Featured active collections' })
  getFeatured(
    @Headers('x-locale') xLocale?: string,
    @Headers('accept-language') acceptLanguage?: string,
  ) {
    return this.service.getFeaturedCollections(resolveLocale(xLocale, acceptLanguage));
  }

  @Get()
  @ApiOkResponse({ description: 'Paginated active collections with productCount' })
  list(
    @Query() query: CollectionQueryDto,
    @Headers('x-locale') xLocale?: string,
    @Headers('accept-language') acceptLanguage?: string,
  ) {
    return this.service.listCollections(query, resolveLocale(xLocale, acceptLanguage));
  }

  @Get(':slug')
  @ApiOkResponse({ description: 'Collection detail by slug' })
  @ApiNotFoundResponse({ description: 'Collection not found or inactive' })
  getBySlug(
    @Param('slug') slug: string,
    @Headers('x-locale') xLocale?: string,
    @Headers('accept-language') acceptLanguage?: string,
  ) {
    return this.service.getCollectionBySlug(slug, resolveLocale(xLocale, acceptLanguage));
  }

  @Get(':slug/products')
  @ApiOkResponse({ description: 'Paginated products in this collection' })
  @ApiNotFoundResponse({ description: 'Collection not found or inactive' })
  getProducts(
    @Param('slug') slug: string,
    @Query() query: CollectionProductQueryDto,
    @Headers('x-locale') xLocale?: string,
    @Headers('accept-language') acceptLanguage?: string,
  ) {
    return this.service.getCollectionProducts(slug, query, resolveLocale(xLocale, acceptLanguage));
  }
}
