// ISO 3166-1 alpha-2 country codes routed through Cloudflare PoPs far from
// the origin (us-east-1) — East/Southeast/South Asia, where the origin
// round-trip for cache-miss /_next/image requests is slowest.
const ASIA_COUNTRY_CODES = new Set([
  'CN', 'JP', 'KR', 'VN', 'TH', 'SG', 'MY', 'ID', 'PH', 'IN',
  'TW', 'HK', 'MO', 'KH', 'LA', 'MM', 'BN', 'MN', 'BD', 'PK',
  'LK', 'NP',
]);

export function isAsiaCountryCode(countryCode: string | null | undefined): boolean {
  if (!countryCode) return false;
  return ASIA_COUNTRY_CODES.has(countryCode.toUpperCase());
}
