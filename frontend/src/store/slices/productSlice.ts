/**
 * Product slice - products list, filters
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '@/lib/axios';

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  discountPrice?: number;
  stock: number;
  isFeatured: boolean;
  images: { imageUrl: string }[];
  category?: { name: string; slug: string };
  brand?: { name: string };
  seller?: { id: string; sellerProfile?: { storeName: string; logo?: string | null } };
  averageRating?: number;
  reviewCount?: number;
}

interface ProductState {
  products: Product[];
  featured: Product[];
  flashDeals: Product[];
  sellerProducts: Product[];
  pagination: { page: number; totalPages: number; total: number };
  loading: boolean;
  featuredLoading: boolean;
  flashDealsLoading: boolean;
  sellerProductsLoading: boolean;
}

const initialState: ProductState = {
  products: [],
  featured: [],
  flashDeals: [],
  sellerProducts: [],
  pagination: { page: 1, totalPages: 1, total: 0 },
  loading: false,
  featuredLoading: false,
  flashDealsLoading: false,
  sellerProductsLoading: false,
};

export const fetchProducts = createAsyncThunk(
  'products/fetch',
  async (
    params: {
      page?: number;
      category?: string;
      brand?: string;
      search?: string;
      flash?: boolean;
      minPrice?: number;
      maxPrice?: number;
    } = {},
    { rejectWithValue }
  ) => {
    try {
      const { data } = await api.get('/products', { params });
      return data.data;
    } catch (err: unknown) {
      return rejectWithValue((err as { response?: { data?: { message?: string } } })?.response?.data?.message);
    }
  }
);

export const fetchFeatured = createAsyncThunk('products/featured', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/products/featured');
    return data.data;
  } catch (err: unknown) {
    return rejectWithValue((err as { response?: { data?: { message?: string } } })?.response?.data?.message);
  }
});

export const fetchFlashDeals = createAsyncThunk('products/flashDeals', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/products/flash-deals');
    return data.data;
  } catch (err: unknown) {
    return rejectWithValue((err as { response?: { data?: { message?: string } } })?.response?.data?.message);
  }
});

export const fetchSellerProducts = createAsyncThunk('products/sellerProducts', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/products/seller-products');
    return data.data;
  } catch (err: unknown) {
    return rejectWithValue((err as { response?: { data?: { message?: string } } })?.response?.data?.message);
  }
});

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.products = action.payload.products;
        state.pagination = action.payload.pagination;
        state.loading = false;
      })
      .addCase(fetchProducts.rejected, (state) => {
        state.loading = false;
      })
      .addCase(fetchFeatured.pending, (state) => {
        state.featuredLoading = true;
      })
      .addCase(fetchFeatured.fulfilled, (state, action) => {
        state.featured = action.payload || [];
        state.featuredLoading = false;
      })
      .addCase(fetchFeatured.rejected, (state) => {
        state.featuredLoading = false;
      })
      .addCase(fetchFlashDeals.pending, (state) => {
        state.flashDealsLoading = true;
      })
      .addCase(fetchFlashDeals.fulfilled, (state, action) => {
        state.flashDeals = action.payload || [];
        state.flashDealsLoading = false;
      })
      .addCase(fetchFlashDeals.rejected, (state) => {
        state.flashDealsLoading = false;
      })
      .addCase(fetchSellerProducts.pending, (state) => {
        state.sellerProductsLoading = true;
      })
      .addCase(fetchSellerProducts.fulfilled, (state, action) => {
        state.sellerProducts = action.payload || [];
        state.sellerProductsLoading = false;
      })
      .addCase(fetchSellerProducts.rejected, (state) => {
        state.sellerProductsLoading = false;
      });
  },
});

export default productSlice.reducer;
