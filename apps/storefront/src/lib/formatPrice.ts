export function formatPrice(amountUSD: number, symbol: string, rate: number): string {
  return `${symbol}${(amountUSD * rate).toFixed(2)}`;
}
