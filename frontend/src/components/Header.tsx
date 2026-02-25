'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { fetchCart } from '@/store/slices/cartSlice';
import { logout } from '@/store/slices/authSlice';
import { useFormatPrice } from '@/hooks/useFormatPrice';
import { api } from '@/lib/axios';

export default function Header() {
  const formatPrice = useFormatPrice();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((s) => s.auth);
  const { itemCount } = useAppSelector((s) => s.cart);
  const [categories, setCategories] = useState<{ id: string; name: string; slug: string }[]>([]);
  const [search, setSearch] = useState('');
  const [showMega, setShowMega] = useState(false);

  useEffect(() => {
    api.get('/categories').then((res) => setCategories(res.data.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (user) dispatch(fetchCart());
  }, [user, dispatch]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) router.push(`/products?search=${encodeURIComponent(search)}`);
  };

  const handleLogout = () => {
    dispatch(logout());
    router.push('/');
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-md">
      {/* Top bar */}
      <div className="bg-amber-500 text-black text-center py-1 text-sm font-medium">
        Free shipping on orders over {formatPrice(50)}
      </div>

      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center gap-6">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold text-amber-600 shrink-0">
            Rakuten
          </Link>

          {/* Search - center, large */}
          <form onSubmit={handleSearch} className="flex-1 max-w-2xl mx-4">
            <div className="relative">
              <input
                type="search"
                placeholder="Search for products, brands..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-4 py-2.5 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-transparent"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-amber-500 text-white px-4 py-1 rounded hover:bg-amber-600"
              >
                Search
              </button>
            </div>
          </form>

          {/* Right actions */}
          <div className="flex items-center gap-4 shrink-0">
            {user ? (
              <>
                <Link href="/account" className="text-gray-700 hover:text-amber-600">
                  Account
                </Link>
                {user.role === 'ADMIN' && (
                  <Link href="/admin" className="text-gray-700 hover:text-amber-600">
                    Admin
                  </Link>
                )}
                {user.role === 'SELLER' && user.isApproved && (
                  <Link href="/seller" className="text-gray-700 hover:text-amber-600">
                    Seller
                  </Link>
                )}
                <Link href="/cart" className="relative">
                  <span className="text-xl">🛒</span>
                  {itemCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-amber-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {itemCount}
                    </span>
                  )}
                </Link>
                <button onClick={handleLogout} className="text-gray-700 hover:text-amber-600">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-gray-700 hover:text-amber-600">
                  Login
                </Link>
                <Link href="/register" className="text-gray-700 hover:text-amber-600">
                  Register
                </Link>
                <Link href="/cart" className="text-xl">🛒</Link>
              </>
            )}
          </div>
        </div>

        {/* All Categories bar */}
        <nav
          className="relative mt-3 pt-3 border-t border-gray-200"
          onMouseEnter={() => setShowMega(true)}
          onMouseLeave={() => setShowMega(false)}
        >
          <div className="flex items-center gap-8">
            <Link
              href="/products"
              className={`flex items-center gap-2 font-semibold transition ${
                showMega ? 'text-amber-600' : 'text-gray-800 hover:text-amber-600'
              }`}
            >
              <span className="text-xl leading-none">☰</span>
              <span>All Categories</span>
              <span className={`inline-block transform transition-transform ${showMega ? 'rotate-180' : ''}`}>▾</span>
            </Link>
            <Link href="/products" className="text-sm font-medium text-gray-600 hover:text-amber-600 transition">
              Shop All
            </Link>
            <Link href="/sellers" className="text-sm font-medium text-gray-600 hover:text-amber-600 transition">
              Sellers
            </Link>
          </div>
          {showMega && (
            <div className="absolute left-0 top-full mt-1.5 min-w-[200px] bg-white/95 backdrop-blur-sm shadow-lg border border-gray-100 rounded-lg py-2 z-[100]">
              {categories.length > 0 ? (
                <div className="max-h-[70vh] overflow-y-auto">
                  {categories.slice(0, 20).map((cat) => (
                    <Link
                      key={cat.id}
                      href={`/products?category=${cat.id}`}
                      className="block px-5 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition"
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="px-5 py-6 text-center text-sm text-gray-500">
                  No categories yet
                </div>
              )}
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
