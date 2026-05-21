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
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';

import { CollectionsService } from './collections.service';
import { CollectionListQueryDto } from './dto/collection-list-query.dto';
import { CreateCollectionDto } from './dto/create-collection.dto';
import { UpdateCollectionDto } from './dto/update-collection.dto';
import { AssignProductsDto } from './dto/assign-products.dto';

@ApiTags('Admin - Collections')
@ApiBearerAuth()
@Controller('collections')
export class CollectionsController {
  constructor(private readonly collectionsService: CollectionsService) {}

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
}
