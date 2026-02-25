'use client';

import { useAppSelector } from '@/store/hooks';

/**
 * Hook that returns a function to format prices with the current site currency.
 * Re-renders when currency changes.
 */
export function useFormatPrice() {
  const { symbol } = useAppSelector((s) => s.settings.currency);
  return (amount: number) => `${symbol}${amount.toFixed(2)}`;
}
