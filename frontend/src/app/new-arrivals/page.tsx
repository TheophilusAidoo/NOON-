'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { fetchProducts } from '@/store/slices/productSlice';
import ProductCard from '@/components/ProductCard';
import { ProductSkeleton } from '@/components/Skeleton';

export default function NewArrivalsPage() {
  const dispatch = useAppDispatch();
  const { products, pagination, loading } = useAppSelector((s) => s.products);

  useEffect(() => {
    dispatch(fetchProducts({ page: 1, sort: 'createdAt', order: 'desc' }));
  }, [dispatch]);

  return (
    <div className="min-h-screen bg-white">
      {/* Compact header - light, minimal */}
      <div className="border-b border-gray-100 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <Link href="/" className="text-xs uppercase tracking-wider text-gray-400 hover:text-[#e61502] transition mb-3 inline-block">
                ← Home
              </Link>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
                New Arrivals
              </h1>
              <p className="mt-1.5 text-sm text-gray-500 max-w-md">
                Fresh picks across electronics, fashion, home & more.
              </p>
            </div>
            <div className="hidden sm:block text-right">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#e61502]/10 text-[#e61502]">
                Just landed
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 md:py-10">
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array(8).fill(0).map((_, i) => (
              <ProductSkeleton key={i} />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 rounded-2xl border border-gray-100">
            <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center mx-auto mb-4 text-gray-400 text-xl font-bold">NEW</div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">No new arrivals yet</h2>
            <p className="text-gray-500 text-sm mb-6 max-w-sm mx-auto">New products are added regularly. Check back soon.</p>
            <Link href="/products" className="inline-flex items-center gap-2 text-sm font-medium text-[#e61502] hover:underline">
              Browse all products
              <span>→</span>
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
            {pagination.totalPages > 1 && (
              <div className="mt-10 pt-8 border-t border-gray-100 text-center">
                <Link href="/products?sort=createdAt" className="inline-flex items-center gap-2 text-sm font-medium text-[#e61502] hover:underline">
                  View more new arrivals ({pagination.total})
                  <span>→</span>
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
