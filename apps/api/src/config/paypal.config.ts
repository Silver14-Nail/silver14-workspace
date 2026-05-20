import { registerAs } from '@nestjs/config';

export interface PaypalConfig {
  mode: 'sandbox' | 'production';
  clientId: string;
  clientSecret: string;
  webhookId: string;
}

const fromEnv = (key: string): string => (process.env[key] ?? '').replace(/\s*#.*$/, '').trim();

export default registerAs(
  'paypal',
  (): PaypalConfig => ({
    mode: fromEnv('PAYPAL_MODE') === 'production' ? 'production' : 'sandbox',
    clientId: fromEnv('PAYPAL_CLIENT_ID'),
    clientSecret: fromEnv('PAYPAL_CLIENT_SECRET'),
    webhookId: fromEnv('PAYPAL_WEBHOOK_ID'),
  }),
);
