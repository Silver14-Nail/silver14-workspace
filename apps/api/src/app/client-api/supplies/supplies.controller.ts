import { Controller, Get, Headers, Param, Query } from '@nestjs/common';
import { ApiHeader, ApiNotFoundResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';

import { ClientProductsService } from '../products/products.service';
import { ProductQueryDto } from '../products/dto/product-query.dto';
import { ProductType } from '@/common/enums/entity.enum';
import { resolveLocale } from '@/shared/translation/locale.resolver';

@ApiTags('Client - Supplies')
@ApiHeader({ name: 'X-Locale', description: 'Preferred locale (en, vi, de, fr)', required: false })
@Controller('supplies')
export class ClientSuppliesController {
  constructor(private readonly productsService: ClientProductsService) {}

  @Get()
  @ApiOkResponse({ description: 'Paginated active supplies with thumbnail, price, stock.' })
  list(
    @Query() query: ProductQueryDto,
    @Headers('x-locale') xLocale?: string,
    @Headers('accept-language') acceptLanguage?: string,
  ) {
    return this.productsService.listProducts(
      { ...query, type: ProductType.SUPPLY },
      resolveLocale(xLocale, acceptLanguage),
    );
  }

  @Get(':slug')
  @ApiOkResponse({
    description: 'Full supply detail by slug (includes default variant for add-to-cart).',
  })
  @ApiNotFoundResponse({ description: 'Supply not found or inactive' })
  getBySlug(
    @Param('slug') slug: string,
    @Headers('x-locale') xLocale?: string,
    @Headers('accept-language') acceptLanguage?: string,
  ) {
    return this.productsService.getProductBySlug(slug, resolveLocale(xLocale, acceptLanguage));
  }
}
