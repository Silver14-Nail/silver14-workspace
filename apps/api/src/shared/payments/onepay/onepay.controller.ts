import * as https from 'https';
import { Body, Controller, Get, Ip, Logger, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { OnepayFulfillmentService } from './onepay-fulfillment.service';

// ─── In-memory exchange rate cache (USD → VND) ───────────────────────────────
let cachedRate: number | null = null;
let rateExpiry = 0;
const RATE_TTL_MS = 60 * 60 * 1000; // 1 hour
const FALLBACK_RATE = 27_000;

function fetchUsdToVnd(): Promise<number> {
  return new Promise((resolve) => {
    const req = https.get('https://open.er-api.com/v6/latest/USD', (res) => {
      let data = '';
      res.on('data', (chunk: string) => (data += chunk));
      res.on('end', () => {
        try {
          const json = JSON.parse(data) as { rates?: Record<string, number> };
          const rate = json.rates?.['VND'];
          resolve(rate && rate > 0 ? rate : FALLBACK_RATE);
        } catch {
          resolve(FALLBACK_RATE);
        }
      });
    });
    req.on('error', () => resolve(FALLBACK_RATE));
    req.setTimeout(4000, () => {
      req.destroy();
      resolve(FALLBACK_RATE);
    });
  });
}

async function getUsdToVndRate(): Promise<number> {
  if (cachedRate && Date.now() < rateExpiry) return cachedRate;
  const rate = await fetchUsdToVnd();
  cachedRate = rate;
  rateExpiry = Date.now() + RATE_TTL_MS;
  return rate;
}

/**
 * OnePAY client-facing endpoints (all require JWT auth).
 *
 * POST /client-api/payments/onepay/initiate
 *   Creates OnePAY payment session → returns redirect URL
 *
 * GET  /client-api/payments/onepay/inquiry/:ref
 *   Queries OnePAY transaction status via QueryDR
 */
@ApiTags('Client - OnePAY')
@ApiBearerAuth()
@Controller('payments/onepay')
export class OnepayController {
  private readonly logger = new Logger(OnepayController.name);

  constructor(private readonly fulfillmentService: OnepayFulfillmentService) {}

  /**
   * POST /client-api/payments/onepay/initiate
   *
   * Creates the signed OnePAY redirect URL.
   * Frontend must redirect the browser (window.location.href) to `redirectUrl`.
   */
  @Post('initiate')
  @ApiOperation({ summary: 'Create OnePAY payment redirect URL' })
  async initiate(
    @Body()
    body: {
      checkoutSessionId: string;
      /** Optional card list filter: INTERNATIONAL | DOMESTIC | QR | BNPL | BIN code */
      cardList?: string;
      /** Site locale — maps to OnePAY vpc_Locale ('en' or 'vn') */
      locale?: string;
    },
    @Ip() clientIp: string,
  ) {
    // Fetch live USD→VND rate (cached 1 hour) — OnePAY always charges in VND
    const vndRate = await getUsdToVndRate();
    const onepayLocale: 'en' | 'vn' = body.locale === 'en' ? 'en' : 'vn';

    return this.fulfillmentService.createPayment(
      body.checkoutSessionId,
      clientIp || '127.0.0.1',
      body.cardList,
      vndRate,
      onepayLocale,
    );
  }

  /**
   * GET /client-api/payments/onepay/inquiry/:ref
   *
   * Calls OnePAY QueryDR to check the current status of a transaction.
   * ref = vpc_MerchTxnRef sent at initiate time.
   */
  @Get('inquiry/:ref')
  @ApiOperation({ summary: 'Query OnePAY transaction status (QueryDR)' })
  async inquiry(@Param('ref') ref: string) {
    return this.fulfillmentService.inquireAndUpdate(ref);
  }
}
