import { registerAs } from '@nestjs/config';

export interface LemonSqueezyConfig {
  apiKey: string;
  storeId: string;
  variantId: string;
  webhookSecret: string;
}

const fromEnv = (key: string): string => (process.env[key] ?? '').replace(/\s*#.*$/, '').trim();

export default registerAs(
  'lemonSqueezy',
  (): LemonSqueezyConfig => ({
    apiKey: fromEnv('LEMON_SQUEEZY_API_KEY'),
    storeId: fromEnv('LEMON_SQUEEZY_STORE_ID'),
    variantId: fromEnv('LEMON_SQUEEZY_VARIANT_ID'),
    webhookSecret: fromEnv('LEMON_SQUEEZY_WEBHOOK_SECRET'),
  }),
);
