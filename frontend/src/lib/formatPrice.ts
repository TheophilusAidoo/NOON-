/**
 * Format price with current site currency
 * Use useFormatPrice() in components for reactive updates
 */

import { store } from '@/store';

export function formatPrice(amount: number): string {
  const { currency } = store.getState().settings;
  return `${currency.symbol}${amount.toFixed(2)}`;
}

export function formatPriceWithCurrency(amount: number, symbol: string): string {
  return `${symbol}${amount.toFixed(2)}`;
}
