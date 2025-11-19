/**
 * Convert USD to PHP
 * Using approximate exchange rate (update this value as needed)
 */
const USD_TO_PHP_RATE = 56.5; // As of 2025, update this regularly

export function usdToPhp(usd: number): number {
  return usd * USD_TO_PHP_RATE;
}

export function phpToUsd(php: number): number {
  return php / USD_TO_PHP_RATE;
}

export function formatCurrency(amount: number, currency: 'USD' | 'PHP'): string {
  if (currency === 'USD') {
    return `$${amount.toFixed(6)}`;
  } else {
    return `₱${amount.toFixed(4)}`;
  }
}
