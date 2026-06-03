import { registerAs } from '@nestjs/config';

export interface TwocheckoutConfig {
  merchantCode: string;
  secretKey: string;
  buyLinkSecretWord: string;
  /** 'sandbox' uses test credentials against the live endpoint */
  env: 'sandbox' | 'production';
  baseUrl: string;
}

const fromEnv = (key: string): string => (process.env[key] ?? '').replace(/\s*#.*$/, '').trim();

export default registerAs('twocheckout', (): TwocheckoutConfig => {
  const env = fromEnv('TWOCHECKOUT_ENV').toLowerCase() === 'production' ? 'production' : 'sandbox';

  return {
    merchantCode: fromEnv('TWOCHECKOUT_MERCHANT_CODE'),
    secretKey: fromEnv('TWOCHECKOUT_SECRET_KEY'),
    buyLinkSecretWord: fromEnv('TWOCHECKOUT_BUY_LINK_SECRET_WORD'),
    env,
    baseUrl: 'https://api.2checkout.com',
  };
});
