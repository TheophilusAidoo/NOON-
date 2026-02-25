/**
 * Cart slice - cart items, count
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '@/lib/axios';

export interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  product: {
    id: string;
    title: string;
    price: number;
    discountPrice?: number;
    images: { imageUrl: string }[];
  };
  subtotal: number;
  effectivePrice: number;
}

interface CartState {
  items: CartItem[];
  total: number;
  itemCount: number;
  loading: boolean;
}

const initialState: CartState = {
  items: [],
  total: 0,
  itemCount: 0,
  loading: false,
};

export const fetchCart = createAsyncThunk('cart/fetch', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/cart');
    return data.data;
  } catch (err: unknown) {
    const msg = (err as { response?: { data?: { message?: unknown } } })?.response?.data?.message;
    return rejectWithValue(typeof msg === 'string' ? msg : 'Failed to load cart');
  }
});

export const addToCart = createAsyncThunk(
  'cart/add',
  async ({ productId, quantity = 1 }: { productId: string; quantity?: number }, { rejectWithValue }) => {
    try {
      await api.post('/cart', { productId, quantity });
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: unknown } } })?.response?.data?.message;
      return rejectWithValue(typeof msg === 'string' ? msg : 'Failed to add to cart');
    }
  }
);

export const updateCartItem = createAsyncThunk(
  'cart/update',
  async ({ itemId, quantity }: { itemId: string; quantity: number }, { rejectWithValue }) => {
    try {
      await api.put(`/cart/items/${itemId}`, { quantity });
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: unknown } } })?.response?.data?.message;
      return rejectWithValue(typeof msg === 'string' ? msg : 'Failed to update');
    }
  }
);

export const removeFromCart = createAsyncThunk(
  'cart/remove',
  async (itemId: string, { rejectWithValue }) => {
    try {
      await api.delete(`/cart/items/${itemId}`);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: unknown } } })?.response?.data?.message;
      return rejectWithValue(typeof msg === 'string' ? msg : 'Failed to remove');
    }
  }
);

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.items = action.payload.items;
        state.total = action.payload.total;
        state.itemCount = action.payload.itemCount;
        state.loading = false;
      })
      .addCase(fetchCart.rejected, (state) => {
        state.loading = false;
      })
      .addCase(addToCart.fulfilled, () => {
        // Refetch cart - could optimize with local update
      })
      .addCase(updateCartItem.fulfilled, () => {})
      .addCase(removeFromCart.fulfilled, () => {});
  },
});

export default cartSlice.reducer;
