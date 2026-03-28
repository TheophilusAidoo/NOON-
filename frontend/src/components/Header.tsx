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
      <div className="bg-amber-500 py-1.5 text-center text-xs font-medium text-black sm:text-sm">
        Free shipping on orders over {formatPrice(50)}
      </div>

      <div className="mx-auto max-w-7xl px-3 py-3 sm:px-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-4 lg:gap-6">
          <div className="flex items-center justify-between gap-3">
            <Link href="/" className="shrink-0 text-xl font-bold text-amber-600 sm:text-2xl">
              Rakuten
            </Link>
            <div className="flex flex-wrap items-center justify-end gap-x-2 gap-y-1 sm:gap-x-3 md:gap-4">
              {user ? (
                <>
                  <Link href="/account" className="text-sm text-gray-700 hover:text-amber-600">
                    Account
                  </Link>
                  {user.role === 'ADMIN' && (
                    <Link href="/admin" className="text-sm text-gray-700 hover:text-amber-600">
                      Admin
                    </Link>
                  )}
                  {user.role === 'SELLER' && user.isApproved && (
                    <Link href="/seller" className="text-sm text-gray-700 hover:text-amber-600">
                      Seller
                    </Link>
                  )}
                  <Link href="/cart" className="relative text-xl leading-none" aria-label="Shopping cart">
                    <span>🛒</span>
                    {itemCount > 0 && (
                      <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-xs text-white">
                        {itemCount}
                      </span>
                    )}
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="text-sm text-gray-700 hover:text-amber-600"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" className="text-sm text-gray-700 hover:text-amber-600">
                    Login
                  </Link>
                  <Link href="/register" className="text-sm text-gray-700 hover:text-amber-600">
                    Register
                  </Link>
                  <Link href="/cart" className="text-xl leading-none" aria-label="Shopping cart">
                    🛒
                  </Link>
                </>
              )}
            </div>
          </div>

          <form onSubmit={handleSearch} className="w-full flex-1 md:mx-auto md:max-w-2xl">
            <div className="relative">
              <input
                type="search"
                placeholder="Search products, brands…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg border border-gray-300 py-2.5 pl-3 pr-24 text-sm focus:border-transparent focus:ring-2 focus:ring-amber-400 sm:text-base"
              />
              <button
                type="submit"
                className="absolute right-1 top-1/2 -translate-y-1/2 rounded bg-amber-500 px-3 py-1.5 text-sm text-white hover:bg-amber-600 sm:px-4"
              >
                Search
              </button>
            </div>
          </form>
        </div>

        <nav
          className="relative mt-3 border-t border-gray-200 pt-3"
          onMouseEnter={() => setShowMega(true)}
          onMouseLeave={() => setShowMega(false)}
        >
          <div className="-mx-1 flex items-center gap-4 overflow-x-auto pb-1 sm:gap-8">
            <Link
              href="/products"
              className={`flex shrink-0 items-center gap-2 font-semibold transition ${
                showMega ? 'text-amber-600' : 'text-gray-800 hover:text-amber-600'
              }`}
            >
              <span className="text-xl leading-none">☰</span>
              <span className="whitespace-nowrap">All Categories</span>
              <span className={`inline-block transform transition-transform ${showMega ? 'rotate-180' : ''}`}>▾</span>
            </Link>
            <Link href="/products" className="shrink-0 whitespace-nowrap text-sm font-medium text-gray-600 hover:text-amber-600">
              Shop All
            </Link>
            <Link href="/sellers" className="shrink-0 whitespace-nowrap text-sm font-medium text-gray-600 hover:text-amber-600">
              Sellers
            </Link>
          </div>
          {showMega && (
            <div className="absolute left-0 top-full z-[100] mt-1.5 min-w-[min(100vw-2rem,280px)] max-w-[calc(100vw-2rem)] rounded-lg border border-gray-100 bg-white/95 py-2 shadow-lg backdrop-blur-sm">
              {categories.length > 0 ? (
                <div className="max-h-[min(70vh,24rem)] overflow-y-auto">
                  {categories.slice(0, 20).map((cat) => (
                    <Link
                      key={cat.id}
                      href={`/products?category=${cat.id}`}
                      className="block px-4 py-2.5 text-sm text-gray-700 transition hover:bg-gray-50 hover:text-gray-900"
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="px-5 py-6 text-center text-sm text-gray-500">No categories yet</div>
              )}
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
