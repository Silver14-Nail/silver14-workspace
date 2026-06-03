import { registerAs } from '@nestjs/config';

export interface OnepayConfig {
  merchantId: string;
  accessCode: string;
  hashKey: string;
  user: string;
  password: string;
  env: 'sandbox' | 'production';
  /** Redirect endpoint — user's browser is GET-redirected here */
  payGateUrl: string;
  /** QueryDR endpoint — server-to-server POST */
  queryDrUrl: string;
  /** Return URL OnePAY redirects the user's browser back to */
  returnUrl: string;
  /** IPN URL OnePAY calls server-to-server */
  ipnUrl: string;
  /** Page title shown on OnePAY checkout */
  title: string;
}

const fromEnv = (key: string): string => (process.env[key] ?? '').replace(/\s*#.*$/, '').trim();

export default registerAs('onepay', (): OnepayConfig => {
  const env = (fromEnv('ONEPAY_ENV') || 'sandbox').toLowerCase();
  const isProd = env === 'production' || env === 'prod';

  const apiUrl = fromEnv('ONEPAY_API_URL') || 'http://localhost:5000/api';

  return {
    merchantId: fromEnv('ONEPAY_MERCHANT_ID') || 'TESTONEPAY',
    accessCode: fromEnv('ONEPAY_ACCESS_CODE') || '6BEB2546',
    hashKey: fromEnv('ONEPAY_HASH_KEY') || '6D0870CDE5F24F34F3915FB0045120DB',
    user: fromEnv('ONEPAY_USER') || 'op01',
    password: fromEnv('ONEPAY_PASSWORD') || 'op123456',
    env: isProd ? 'production' : 'sandbox',
    payGateUrl: isProd
      ? 'https://onepay.vn/paygate/vpcpay.op'
      : 'https://mtf.onepay.vn/paygate/vpcpay.op',
    queryDrUrl: isProd
      ? 'https://onepay.vn/msp/api/v1/vpc/invoices/queries'
      : 'https://mtf.onepay.vn/msp/api/v1/vpc/invoices/queries',
    returnUrl: `${apiUrl}/client-api/webhooks/onepay/return`,
    ipnUrl: `${apiUrl}/client-api/webhooks/onepay/ipn`,
    title: fromEnv('ONEPAY_TITLE') || 'Silver14 Nail — OnePAY',
  };
});
