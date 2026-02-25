'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { fetchProducts } from '@/store/slices/productSlice';
import ProductCard from '@/components/ProductCard';
import { ProductSkeleton } from '@/components/Skeleton';
import { HiSparkles } from 'react-icons/hi';

export default function NewArrivalsPage() {
  const dispatch = useAppDispatch();
  const { products, pagination, loading } = useAppSelector((s) => s.products);

  useEffect(() => {
    dispatch(fetchProducts({ page: 1, sort: 'createdAt', order: 'desc' }));
  }, [dispatch]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <Link href="/" className="text-sm text-gray-300 hover:text-white mb-4 inline-block">
            ← Back to Home
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <HiSparkles className="w-10 h-10 text-amber-400" />
            <h1 className="text-3xl md:text-4xl font-bold">New Arrivals</h1>
          </div>
          <p className="text-gray-300 max-w-xl">
            Discover the latest products added to Rakuten. Fresh picks across electronics, fashion, home, and more.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array(8).fill(0).map((_, i) => (
              <ProductSkeleton key={i} />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
            <HiSparkles className="w-16 h-16 text-amber-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No new arrivals yet</h2>
            <p className="text-gray-500 mb-6">New products are added regularly. Check back soon.</p>
            <Link href="/products" className="text-[#e61502] font-medium hover:underline">
              Browse all products →
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
              <div className="mt-8 text-center">
                <Link href="/products?sort=createdAt" className="text-[#e61502] font-medium hover:underline">
                  View more new arrivals ({pagination.total}) →
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
