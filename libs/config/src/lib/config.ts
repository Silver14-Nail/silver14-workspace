export const appConfig = {
  defaultCurrency: 'USD',
  storefrontName: 'Nail Atelier',
  adminName: 'Nail Commerce Admin',
} as const;

export function getRequiredEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}
