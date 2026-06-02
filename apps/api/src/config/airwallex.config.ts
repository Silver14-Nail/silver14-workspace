import { registerAs } from '@nestjs/config';

export interface AirwallexConfig {
  clientId: string;
  apiKey: string;
  webhookSecret: string;
  env: 'demo' | 'production' | 'staging';
  /** Base URL for the Airwallex API */
  baseUrl: string;
  /** URL where the Airwallex client-side element is hosted */
  clientUrl: string;
}

const fromEnv = (key: string): string => (process.env[key] ?? '').replace(/\s*#.*$/, '').trim();

/** Normalises friendly env names ("sandbox") to Airwallex's official env keys. */
function normalizeEnv(raw: string): AirwallexConfig['env'] {
  const lower = raw.trim().toLowerCase();
  if (lower === 'sandbox') return 'demo';
  if (lower === 'production' || lower === 'prod') return 'production';
  if (lower === 'staging') return 'staging';
  return 'demo';
}

export default registerAs('airwallex', (): AirwallexConfig => {
  const env = normalizeEnv(fromEnv('AIRWALLEX_ENV'));

  const baseUrls: Record<AirwallexConfig['env'], string> = {
    demo: 'https://api-demo.airwallex.com',
    staging: 'https://api-staging.airwallex.com',
    production: 'https://api.airwallex.com',
  };

  const clientUrls: Record<AirwallexConfig['env'], string> = {
    demo: 'https://checkout-demo.airwallex.com',
    staging: 'https://checkout-staging.airwallex.com',
    production: 'https://checkout.airwallex.com',
  };

  return {
    clientId: fromEnv('AIRWALLEX_CLIENT_ID'),
    apiKey: fromEnv('AIRWALLEX_API_KEY'),
    webhookSecret: fromEnv('AIRWALLEX_WEBHOOK_SECRET'),
    env,
    baseUrl: baseUrls[env],
    clientUrl: clientUrls[env],
  };
});
