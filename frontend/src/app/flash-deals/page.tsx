'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { fetchProducts } from '@/store/slices/productSlice';
import ProductCard from '@/components/ProductCard';
import { ProductSkeleton } from '@/components/Skeleton';
import { MdFlashOn } from 'react-icons/md';

export default function FlashDealsPage() {
  const dispatch = useAppDispatch();
  const { products, pagination, loading } = useAppSelector((s) => s.products);

  useEffect(() => {
    dispatch(fetchProducts({ page: 1, flash: true }));
  }, [dispatch]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-amber-500 via-[#e61502] to-amber-500 text-white">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <Link href="/" className="text-sm text-white/80 hover:text-white mb-4 inline-block">
            ← Back to Home
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <MdFlashOn className="w-10 h-10" />
            <h1 className="text-3xl md:text-4xl font-bold">Flash Deals</h1>
          </div>
          <p className="text-white/90 max-w-xl">
            Limited-time offers on top products. Save big on electronics, fashion, and more — while supplies last.
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
            <MdFlashOn className="w-16 h-16 text-amber-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No flash deals right now</h2>
            <p className="text-gray-500 mb-6">Check back soon for new limited-time offers.</p>
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
                <Link href="/products?flash=true" className="text-[#e61502] font-medium hover:underline">
                  View all flash deals ({pagination.total}) →
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
