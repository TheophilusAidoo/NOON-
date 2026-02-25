'use client';

import { useEffect } from 'react';
import { useAppDispatch } from '@/store/hooks';
import { fetchSettings } from '@/store/slices/settingsSlice';

/**
 * Fetches site settings (currency) on mount. Place in root layout.
 */
export default function SettingsInit() {
  const dispatch = useAppDispatch();
  useEffect(() => {
    dispatch(fetchSettings());
  }, [dispatch]);
  return null;
}
