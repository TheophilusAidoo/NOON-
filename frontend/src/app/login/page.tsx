'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAppDispatch } from '@/store/hooks';
import { login } from '@/store/slices/authSlice';
import toast from 'react-hot-toast';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '';
  const dispatch = useAppDispatch();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await dispatch(login({ email, password })).unwrap();
      toast.success('Logged in successfully');
      router.push(redirect && redirect.startsWith('/') ? redirect : (user?.role === 'ADMIN' ? '/admin' : '/'));
    } catch (err: unknown) {
      const msg = typeof err === 'string' ? err : (err && typeof err === 'object' && 'message' in err) ? String((err as { message: unknown }).message) : 'Login failed';
      toast.error(msg);
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex">
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gray-100">
        <img
          src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200"
          alt="Shopping"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 flex flex-col justify-center p-12">
          <Link href="/" className="text-2xl font-bold text-white mb-12 drop-shadow-lg">Rakuten</Link>
          <h2 className="text-3xl font-bold text-white leading-tight drop-shadow-lg">Welcome back</h2>
          <p className="mt-4 text-white text-lg max-w-sm drop-shadow-md">Sign in to access your account and continue shopping.</p>
        </div>
      </div>
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-gray-50">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8">
            <Link href="/" className="text-xl font-bold text-amber-600">Rakuten</Link>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-8">Log in</h1>
          <form onSubmit={handleSubmit} className="space-y-5 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="block w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-amber-500 outline-none transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="block w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-amber-500 outline-none transition"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-amber-500 text-white font-semibold rounded-xl hover:bg-amber-600 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Signing in...' : 'Log in'}
            </button>
          </form>
          <p className="mt-6 text-center text-sm text-gray-500">
            Don&apos;t have an account? <Link href="/register" className="font-medium text-amber-600 hover:text-amber-700">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-[calc(100vh-80px)] flex items-center justify-center">Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}
