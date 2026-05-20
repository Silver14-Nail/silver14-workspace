import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOkResponse, ApiNotFoundResponse } from '@nestjs/swagger';

import { ClientProductsService } from './products.service';
import { ProductQueryDto } from './dto/product-query.dto';

@ApiTags('Client - Products')
@Controller('products')
export class ClientProductsController {
  constructor(private readonly productsService: ClientProductsService) {}

  @Get('shapes')
  @ApiOkResponse({ description: 'All active nail shapes for storefront filter' })
  getShapes() {
    return this.productsService.getShapes();
  }

  @Get('sizes')
  @ApiOkResponse({ description: 'All nail sizes for storefront filter' })
  getSizes() {
    return this.productsService.getSizes();
  }

  @Get()
  @ApiOkResponse({
    description:
      'Paginated active products with thumbnail. Supports search, shape filter, price range, sortBy, filterBy.',
  })
  list(@Query() query: ProductQueryDto) {
    return this.productsService.listProducts(query);
  }

  @Get('slug/:slug')
  @ApiOkResponse({ description: 'Full product detail by slug' })
  @ApiNotFoundResponse({ description: 'Product not found or inactive' })
  getBySlug(@Param('slug') slug: string) {
    return this.productsService.getProductBySlug(slug);
  }

  @Get(':id')
  @ApiOkResponse({
    description: 'Full product detail: images, active shape pricings, variants (in-stock first)',
  })
  @ApiNotFoundResponse({ description: 'Product not found or inactive' })
  getOne(@Param('id') id: string) {
    return this.productsService.getProduct(id);
  }
}
