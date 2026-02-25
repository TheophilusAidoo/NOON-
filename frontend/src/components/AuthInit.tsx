'use client';

import { useEffect } from 'react';
import { useAppDispatch } from '@/store/hooks';
import { fetchMe, setInitialized } from '@/store/slices/authSlice';

export default function AuthInit() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    if (token) {
      dispatch(fetchMe());
    } else {
      dispatch(setInitialized());
    }
  }, [dispatch]);

  return null;
}
