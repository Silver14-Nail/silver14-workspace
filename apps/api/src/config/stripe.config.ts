import { registerAs } from '@nestjs/config';

export interface StripeConfig {
  secretKey: string;
  webhookSecret: string;
}

const fromEnv = (key: string): string => (process.env[key] ?? '').replace(/\s*#.*$/, '').trim();

export default registerAs(
  'stripe',
  (): StripeConfig => ({
    secretKey: fromEnv('STRIPE_SECRET_KEY'),
    webhookSecret: fromEnv('STRIPE_WEBHOOK_SECRET'),
  }),
);
