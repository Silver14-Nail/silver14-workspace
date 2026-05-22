import { Injectable, Logger } from '@nestjs/common';
import { SupportedCurrency } from '@/common/enums/entity.enum';

export interface ExchangeRates {
  USD_EUR: number;
  EUR_USD: number;
  fetchedAt: number;
}

const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour
const EXCHANGE_RATE_API = 'https://open.er-api.com/v6/latest/USD';
const SUPPORTED = new Set<string>([SupportedCurrency.USD, SupportedCurrency.EUR]);

@Injectable()
export class CurrencyService {
  private readonly logger = new Logger(CurrencyService.name);
  private cache: ExchangeRates | null = null;

  async getRates(): Promise<ExchangeRates> {
    const now = Date.now();
    if (this.cache && now - this.cache.fetchedAt < CACHE_TTL_MS) {
      return this.cache;
    }

    try {
      const res = await fetch(EXCHANGE_RATE_API);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as { rates: Record<string, number> };

      const USD_EUR = data.rates['EUR'];
      if (!USD_EUR) throw new Error('EUR rate missing from response');

      this.cache = { USD_EUR, EUR_USD: 1 / USD_EUR, fetchedAt: now };
      this.logger.log(`Exchange rates refreshed: 1 USD = ${USD_EUR.toFixed(6)} EUR`);
      return this.cache;
    } catch (err) {
      this.logger.error('Failed to fetch exchange rates', err);
      if (this.cache) {
        this.logger.warn('Returning stale cached rates');
        return this.cache;
      }
      throw err;
    }
  }

  async convert(amountUSD: number, to: string): Promise<number> {
    const target = to.toUpperCase();
    if (target === SupportedCurrency.USD) return amountUSD;
    const rates = await this.getRates();
    if (target === SupportedCurrency.EUR) {
      return parseFloat((amountUSD * rates.USD_EUR).toFixed(2));
    }
    throw new Error(`Unsupported currency: ${to}`);
  }

  isSupported(currency: string): boolean {
    return SUPPORTED.has(currency?.toUpperCase());
  }

  normalize(currency: string): SupportedCurrency {
    const upper = currency?.toUpperCase();
    if (upper === SupportedCurrency.EUR) return SupportedCurrency.EUR;
    return SupportedCurrency.USD;
  }
}
