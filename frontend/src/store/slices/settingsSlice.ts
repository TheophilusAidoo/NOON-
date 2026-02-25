/**
 * Settings slice - currency and other site settings
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '@/lib/axios';

interface Currency {
  code: string;
  symbol: string;
}

interface SettingsState {
  currency: Currency;
  loading: boolean;
  fetched: boolean;
}

const defaultCurrency = { code: 'USD', symbol: '$' };

const initialState: SettingsState = {
  currency: defaultCurrency,
  loading: false,
  fetched: false,
};

export const fetchSettings = createAsyncThunk('settings/fetch', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get<{ success: boolean; data?: { currency?: Currency } }>('/settings');
    const currency = data.data?.currency ?? defaultCurrency;
    return { currency };
  } catch {
    return rejectWithValue(defaultCurrency);
  }
});

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setCurrency: (state, action: { payload: Currency }) => {
      state.currency = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSettings.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchSettings.fulfilled, (state, action) => {
        state.currency = action.payload.currency;
        state.loading = false;
        state.fetched = true;
      })
      .addCase(fetchSettings.rejected, (state) => {
        state.loading = false;
        state.fetched = true;
      });
  },
});

export const { setCurrency } = settingsSlice.actions;
export default settingsSlice.reducer;
