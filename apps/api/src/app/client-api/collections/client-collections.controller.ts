import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiNotFoundResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';

import { ClientCollectionsService } from './client-collections.service';
import { CollectionQueryDto, CollectionProductQueryDto } from './dto/collection-query.dto';

@ApiTags('Client - Collections')
@Controller('collections')
export class ClientCollectionsController {
  constructor(private readonly service: ClientCollectionsService) {}

  @Get('featured')
  @ApiOkResponse({ description: 'Featured active collections' })
  getFeatured() {
    return this.service.getFeaturedCollections();
  }

  @Get()
  @ApiOkResponse({ description: 'Paginated active collections with productCount' })
  list(@Query() query: CollectionQueryDto) {
    return this.service.listCollections(query);
  }

  @Get(':slug')
  @ApiOkResponse({ description: 'Collection detail by slug' })
  @ApiNotFoundResponse({ description: 'Collection not found or inactive' })
  getBySlug(@Param('slug') slug: string) {
    return this.service.getCollectionBySlug(slug);
  }

  @Get(':slug/products')
  @ApiOkResponse({ description: 'Paginated products in this collection' })
  @ApiNotFoundResponse({ description: 'Collection not found or inactive' })
  getProducts(@Param('slug') slug: string, @Query() query: CollectionProductQueryDto) {
    return this.service.getCollectionProducts(slug, query);
  }
}
