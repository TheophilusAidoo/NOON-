/**
 * Auth slice - user state, login, logout
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '@/lib/axios';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'CUSTOMER' | 'SELLER' | 'ADMIN';
  isVerified: boolean;
  isApproved: boolean | null;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  initialized: boolean;
}

const initialState: AuthState = {
  user: null,
  loading: false,
  initialized: false,
};

export const fetchMe = createAsyncThunk('auth/me', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/auth/me');
    return data.user;
  } catch (err: unknown) {
    const msg = (err as { response?: { data?: { message?: unknown } } })?.response?.data?.message;
    return rejectWithValue(typeof msg === 'string' ? msg : 'Request failed');
  }
});

export const login = createAsyncThunk(
  'auth/login',
  async (
    { email, password }: { email: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      const { data } = await api.post('/auth/login', { email, password });
      if (typeof window !== 'undefined') {
        localStorage.setItem('accessToken', data.accessToken);
      }
      return data.user;
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: unknown }; status?: number }; message?: string; code?: string };
      const msg = e?.response?.data?.message;
      if (typeof msg === 'string') return rejectWithValue(msg);
      if (e?.code === 'ERR_NETWORK') return rejectWithValue('Cannot reach server. Is the backend running?');
      if (e?.response?.status === 401) return rejectWithValue('Invalid email or password');
      if (e?.response?.status === 403) return rejectWithValue('Access denied. Make sure backend is running and try: cd backend && npm run fix-admin');
      return rejectWithValue(typeof e?.message === 'string' ? e.message : 'Login failed');
    }
  }
);

export const register = createAsyncThunk<User | null, {
  name: string;
  email: string;
  password: string;
  role?: 'CUSTOMER' | 'SELLER';
  storeName?: string;
  storeDescription?: string;
  logo?: string | File;
  banner?: string | File;
}>(
  'auth/register',
  async (payload, { rejectWithValue }) => {
    try {
      let data: { accessToken?: string; user?: unknown };
      if (payload.role === 'SELLER' && payload.logo instanceof File && payload.banner instanceof File) {
        const formData = new FormData();
        formData.append('name', payload.name);
        formData.append('email', payload.email);
        formData.append('password', payload.password);
        formData.append('role', 'SELLER');
        formData.append('storeName', payload.storeName || '');
        formData.append('storeDescription', payload.storeDescription || '');
        formData.append('logo', payload.logo);
        formData.append('banner', payload.banner);
        const base = typeof window !== 'undefined' ? '/api' : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001').replace(/\/api\/?$/, '') + '/api';
        const res = await fetch(`${base}/auth/register`, {
          method: 'POST',
          body: formData,
          credentials: 'include',
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.message || 'Registration failed');
        data = json;
      } else {
        const { data: res } = await api.post('/auth/register', {
          name: payload.name,
          email: payload.email,
          password: payload.password,
          role: payload.role,
          storeName: payload.storeName,
          storeDescription: payload.storeDescription,
        });
        data = res;
      }
      if (typeof window !== 'undefined' && data.accessToken) {
        localStorage.setItem('accessToken', data.accessToken);
      }
      return (data.user ?? null) as User | null;
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: unknown } } })?.response?.data?.message ?? (err as Error)?.message;
      return rejectWithValue(typeof msg === 'string' ? msg : 'Registration failed');
    }
  }
);

export const logout = createAsyncThunk('auth/logout', async () => {
  try {
    await api.post('/auth/logout');
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
    }
  } catch {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
    }
  }
  return null;
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
    },
    setInitialized: (state) => {
      state.initialized = true;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMe.fulfilled, (state, action) => {
        state.user = action.payload;
        state.initialized = true;
      })
      .addCase(fetchMe.rejected, (state) => {
        state.user = null;
        state.initialized = true;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.user = action.payload;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.user = action.payload;
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
      });
  },
});

export const { setUser, setInitialized } = authSlice.actions;
export default authSlice.reducer;
