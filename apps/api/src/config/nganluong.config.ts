import { registerAs } from '@nestjs/config';
import * as crypto from 'crypto';

export interface NgLuongConfig {
  merchantId: string;
  merchantPassword: string;
  /** MD5 hash of merchantPassword for API calls */
  merchantPasswordMd5: string;
  receiverEmail: string;
  env: 'sandbox' | 'production';
  apiBaseUrl: string;
  orderCheckUrl: string;
  returnUrl: string;
  notifyUrl: string;
  cancelUrl: string;
}

const fromEnv = (key: string): string => (process.env[key] ?? '').replace(/\s*#.*$/, '').trim();

function md5(str: string): string {
  return crypto.createHash('md5').update(str).digest('hex');
}

export default registerAs('nganLuong', (): NgLuongConfig => {
  const env = (fromEnv('NGAN_LUONG_ENV') || 'sandbox').toLowerCase();
  const isProd = env === 'production' || env === 'prod';

  const merchantPassword = fromEnv('NGAN_LUONG_MERCHANT_PASSWORD');
  const merchantId = fromEnv('NGAN_LUONG_MERCHANT_ID');
  const receiverEmail = fromEnv('NGAN_LUONG_RECEIVER_EMAIL');
  const appUrl = fromEnv('NGAN_LUONG_APP_URL') || 'http://localhost:3000';

  return {
    merchantId,
    merchantPassword,
    merchantPasswordMd5: md5(merchantPassword),
    receiverEmail,
    env: isProd ? 'production' : 'sandbox',
    apiBaseUrl: isProd
      ? 'https://www.nganluong.vn/checkout.api.nganluong.post.php'
      : 'https://sandbox.nganluong.vn/nl35/checkout.api.nganluong.post.php',
    orderCheckUrl: isProd
      ? 'https://www.nganluong.vn/service/order/check'
      : 'https://sandbox.nganluong.vn/nl35/service/order/check',
    returnUrl: `${appUrl}/en/checkout?payment=success`,
    notifyUrl: `${appUrl}/api/client-api/webhooks/nganluong`,
    cancelUrl: `${appUrl}/en/checkout`,
  };
});
