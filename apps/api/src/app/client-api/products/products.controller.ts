import { Controller, Get, Headers, Param, Query } from '@nestjs/common';
import { ApiHeader, ApiTags, ApiOkResponse, ApiNotFoundResponse } from '@nestjs/swagger';

import { ClientProductsService } from './products.service';
import { ProductQueryDto } from './dto/product-query.dto';
import { resolveLocale } from '@/shared/translation/locale.resolver';

@ApiTags('Client - Products')
@ApiHeader({ name: 'X-Locale', description: 'Preferred locale (en, vi, de, fr)', required: false })
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
  list(
    @Query() query: ProductQueryDto,
    @Headers('x-locale') xLocale?: string,
    @Headers('accept-language') acceptLanguage?: string,
  ) {
    return this.productsService.listProducts(query, resolveLocale(xLocale, acceptLanguage));
  }

  @Get('slug/:slug')
  @ApiOkResponse({ description: 'Full product detail by slug' })
  @ApiNotFoundResponse({ description: 'Product not found or inactive' })
  getBySlug(
    @Param('slug') slug: string,
    @Headers('x-locale') xLocale?: string,
    @Headers('accept-language') acceptLanguage?: string,
  ) {
    return this.productsService.getProductBySlug(slug, resolveLocale(xLocale, acceptLanguage));
  }

  @Get(':id')
  @ApiOkResponse({
    description: 'Full product detail: images, active shape pricings, variants (in-stock first)',
  })
  @ApiNotFoundResponse({ description: 'Product not found or inactive' })
  getOne(
    @Param('id') id: string,
    @Headers('x-locale') xLocale?: string,
    @Headers('accept-language') acceptLanguage?: string,
  ) {
    return this.productsService.getProduct(id, resolveLocale(xLocale, acceptLanguage));
  }
}
