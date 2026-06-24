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
  /** Storefront base URL — used to redirect user after payment */
  storefrontUrl: string;
}

const fromEnv = (key: string): string => (process.env[key] ?? '').replace(/\s*#.*$/, '').trim();

export default registerAs('onepay', (): OnepayConfig => {
  const env = (fromEnv('ONEPAY_ENV') || 'sandbox').toLowerCase();
  const isProd = env === 'production' || env === 'prod';

  // ONEPAY_API_URL must be the publicly accessible API base URL so OnePay can
  // redirect the user's browser back (vpc_ReturnURL) and call our IPN endpoint.
  // On Vercel, VERCEL_PROJECT_PRODUCTION_URL (production) or VERCEL_URL (preview)
  // are injected automatically — use them as fallbacks when the explicit var is absent.
  const vercelProdUrl = fromEnv('VERCEL_PROJECT_PRODUCTION_URL');
  const vercelUrl = fromEnv('VERCEL_URL');
  // NestJS global prefix is 'api', so all routes are under /api/...
  // ONEPAY_API_URL must include /api, e.g. https://api.silver14nail.com/api
  // VERCEL_PROJECT_PRODUCTION_URL / VERCEL_URL are bare hostnames (no protocol, no path),
  // so we append /api to match the global prefix.
  const apiUrl =
    fromEnv('ONEPAY_API_URL') ||
    (vercelProdUrl ? `https://${vercelProdUrl}/api` : '') ||
    (vercelUrl ? `https://${vercelUrl}/api` : '') ||
    'http://localhost:5000/api';

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
    storefrontUrl: fromEnv('STOREFRONT_URL') || 'https://silver14nail.com',
  };
});
