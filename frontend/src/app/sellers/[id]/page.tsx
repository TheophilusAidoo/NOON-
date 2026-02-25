'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import { ProductSkeleton } from '@/components/Skeleton';
import { HiOfficeBuilding, HiArrowLeft } from 'react-icons/hi';
import { api } from '@/lib/axios';
import { Product } from '@/store/slices/productSlice';

type Seller = {
  id: string;
  name: string;
  sellerProfile: { storeName: string; storeDescription?: string | null; logo?: string | null; banner?: string | null; rating: number; totalSales: number } | null;
  _count: { products: number };
};

export default function SellerStorefrontPage() {
  const params = useParams();
  const id = params.id as string;
  const [seller, setSeller] = useState<Seller | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    api
      .get(`/sellers/${id}`)
      .then((res) => setSeller(res.data.data))
      .catch(() => setSeller(null))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!id) return;
    setProductsLoading(true);
    const page = 1;
    api
      .get(`/sellers/${id}/products`, { params: { page, limit: 12 } })
      .then((res) => {
        setProducts(res.data.data?.products || []);
        setPagination(res.data.data?.pagination || { page: 1, totalPages: 1 });
      })
      .catch(() => setProducts([]))
      .finally(() => setProductsLoading(false));
  }, [id]);

  const loadMore = () => {
    const nextPage = pagination.page + 1;
    if (nextPage > pagination.totalPages) return;
    setProductsLoading(true);
    api
      .get(`/sellers/${id}/products`, { params: { page: nextPage, limit: 12 } })
      .then((res) => {
        setProducts((prev) => [...prev, ...(res.data.data?.products || [])]);
        setPagination(res.data.data?.pagination || pagination);
      })
      .finally(() => setProductsLoading(false));
  };

  if (loading || !seller) {
    if (!loading && !seller) {
      return (
        <div className="max-w-7xl mx-auto px-4 py-12 text-center">
          <h1 className="text-xl font-bold text-gray-900">Seller not found</h1>
          <Link href="/sellers" className="text-amber-600 mt-2 inline-block hover:underline">
            ← Back to Sellers
          </Link>
        </div>
      );
    }
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="h-8 bg-gray-200 rounded w-64 mb-6 animate-pulse" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array(8)
            .fill(0)
            .map((_, i) => (
              <ProductSkeleton key={i} />
            ))}
        </div>
      </div>
    );
  }

  const storeName = seller.sellerProfile?.storeName || seller.name;
  const storeLogo = seller.sellerProfile?.logo;
  const storeBanner = seller.sellerProfile?.banner;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <Link href="/sellers" className="inline-flex items-center gap-2 text-gray-500 hover:text-amber-600 mb-6">
        <HiArrowLeft className="w-4 h-4" />
        All Sellers
      </Link>

      {/* Seller header card with banner */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8">
        {/* Banner - always show (placeholder when no banner) */}
        <div className="h-32 sm:h-40 w-full overflow-hidden bg-gradient-to-r from-amber-100 via-amber-50 to-orange-50">
          {storeBanner ? (
            <img src={storeBanner} alt={`${storeName} banner`} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <HiOfficeBuilding className="w-16 h-16 text-amber-200" />
            </div>
          )}
        </div>
        {/* Store info - fully below banner, no overlap */}
        <div className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-start gap-4">
            {storeLogo ? (
              <img src={storeLogo} alt={storeName} className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover shrink-0 ring-2 ring-gray-100 shadow-md" />
            ) : (
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-amber-50 ring-2 ring-gray-100 shadow-md flex items-center justify-center shrink-0">
                <HiOfficeBuilding className="w-10 h-10 sm:w-12 sm:h-12 text-amber-600" />
              </div>
            )}
            <div className="min-w-0 flex-1 pt-1">
              <h1 className="text-2xl font-bold text-gray-900 truncate">{storeName}</h1>
              <p className="text-gray-500 truncate">by {seller.name}</p>
              {seller.sellerProfile?.storeDescription && (
                <p className="text-gray-600 mt-2 line-clamp-2">{seller.sellerProfile.storeDescription}</p>
              )}
              <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-500">
                <span>{seller._count.products} products</span>
                <span>★ {seller.sellerProfile?.rating?.toFixed(1) || 0} rating</span>
                <span>{seller.sellerProfile?.totalSales || 0} sales</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Products */}
      <h2 className="text-lg font-semibold mb-4">Products</h2>
      {productsLoading && products.length === 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 items-stretch">
          {Array(8)
            .fill(0)
            .map((_, i) => (
              <ProductSkeleton key={i} />
            ))}
        </div>
      ) : products.length === 0 ? (
        <div className="py-16 text-center bg-gray-50 rounded-lg">
          <p className="text-gray-500">No products yet from this seller.</p>
          <Link href="/products" className="text-amber-600 mt-2 inline-block hover:underline">
            Browse all products
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 items-stretch">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
          {pagination.page < pagination.totalPages && (
            <div className="mt-8 text-center">
              <button
                onClick={loadMore}
                disabled={productsLoading}
                className="px-6 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 disabled:opacity-50"
              >
                {productsLoading ? 'Loading...' : 'Load More'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
