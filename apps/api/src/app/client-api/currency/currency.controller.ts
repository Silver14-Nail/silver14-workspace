import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrencyService } from '@/shared/currency/currency.service';

@ApiTags('Currency')
@Controller('currency')
export class ClientCurrencyController {
  constructor(private readonly currencyService: CurrencyService) {}

  @Get('exchange-rate')
  @ApiOperation({ summary: 'Get current USD/EUR exchange rates' })
  async getExchangeRate() {
    const rates = await this.currencyService.getRates();
    return {
      USD_EUR: rates.USD_EUR,
      EUR_USD: rates.EUR_USD,
      fetchedAt: new Date(rates.fetchedAt).toISOString(),
    };
  }
}
