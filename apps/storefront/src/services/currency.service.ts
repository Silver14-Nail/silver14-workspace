export interface ExchangeRates {
  USD_EUR: number;
  EUR_USD: number;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api';
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

let cache: { rates: ExchangeRates; fetchedAt: number } | null = null;
let inflight: Promise<ExchangeRates> | null = null;

export async function fetchExchangeRates(): Promise<ExchangeRates> {
  const now = Date.now();
  if (cache && now - cache.fetchedAt < CACHE_TTL_MS) {
    return cache.rates;
  }

  // Deduplicate concurrent calls — only one request in flight at a time
  if (inflight) return inflight;

  inflight = (async () => {
    try {
      const res = await fetch(`${API_BASE}/client-api/currency/exchange-rate`, {
        next: { revalidate: 3600 },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as ExchangeRates;
      cache = { rates: data, fetchedAt: Date.now() };
      return data;
    } finally {
      inflight = null;
    }
  })();

  return inflight;
}
