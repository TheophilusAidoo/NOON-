'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { HiOfficeBuilding, HiShoppingBag, HiStar, HiTrendingUp } from 'react-icons/hi';
import { api } from '@/lib/axios';

type Seller = {
  id: string;
  name: string;
  sellerProfile: { storeName: string; storeDescription?: string | null; logo?: string | null; banner?: string | null; rating: number; totalSales: number } | null;
  _count: { products: number };
};

export default function SellersPage() {
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [loading, setLoading] = useState(true);
  const [sellersBanner, setSellersBanner] = useState<string | null>(null);

  useEffect(() => {
    api.get('/sellers').then((res) => setSellers(res.data.data || [])).catch(() => setSellers([])).finally(() => setLoading(false));
    api.get('/banners/sellers-page').then((res) => setSellersBanner(res.data.data?.imageUrl || null)).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero header */}
      <div className={`relative overflow-hidden text-white min-h-[320px] md:min-h-[380px] ${sellersBanner ? '' : 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900'}`}>
        {sellersBanner && (
          <div className="absolute inset-0">
            <img src={sellersBanner} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-black/40" />
          </div>
        )}
        {!sellersBanner && (
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.04\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-80" />
        )}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-14 md:py-20">
          <div className="max-w-2xl">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight drop-shadow-lg">
              Our Sellers
            </h1>
            <p className="mt-3 md:mt-4 text-base md:text-lg text-gray-200 leading-relaxed max-w-xl">
              Browse products from trusted sellers on Rakuten. Each store brings unique offerings and a commitment to quality.
            </p>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-gray-50 to-transparent pointer-events-none" />
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 -mt-12 relative z-10 pb-20">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array(6)
              .fill(0)
              .map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 animate-pulse"
                >
                  <div className="w-20 h-20 rounded-2xl bg-gray-200 mb-5" />
                  <div className="h-6 bg-gray-200 rounded-lg w-2/3 mb-3" />
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-4" />
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-full" />
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                  </div>
                </div>
              ))}
          </div>
        ) : sellers.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-16 text-center">
            <div className="w-20 h-20 rounded-2xl bg-amber-50 flex items-center justify-center mx-auto mb-6">
              <HiOfficeBuilding className="w-10 h-10 text-amber-500" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No sellers yet</h2>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">
              Be the first to join our marketplace and start selling to thousands of shoppers.
            </p>
            <Link
              href="/register?role=seller"
              className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 text-white font-medium rounded-xl hover:bg-amber-600 transition-colors shadow-md"
            >
              Become a Seller
              <HiShoppingBag className="w-5 h-5" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {sellers.map((seller) => (
              <Link
                key={seller.id}
                href={`/sellers/${seller.id}`}
                className="group block bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg hover:border-amber-300/50 hover:-translate-y-0.5 transition-all duration-200"
              >
                {seller.sellerProfile?.banner ? (
                  <div className="h-28 sm:h-32 overflow-hidden bg-gray-100">
                    <img src={seller.sellerProfile.banner} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  </div>
                ) : (
                  <div className="h-20 bg-gradient-to-br from-amber-50 to-orange-50" />
                )}
                <div className="p-5">
                  <div className="flex items-start gap-4">
                    {seller.sellerProfile?.logo ? (
                      <img src={seller.sellerProfile.logo} alt="" className="w-16 h-16 rounded-xl object-cover shrink-0 ring-2 ring-gray-100" />
                    ) : (
                      <div className="w-16 h-16 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
                        <HiOfficeBuilding className="w-8 h-8 text-amber-600" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0 overflow-hidden">
                      <h2 className="font-bold text-gray-900 group-hover:text-amber-600 transition-colors truncate">
                        {seller.sellerProfile?.storeName || seller.name}
                      </h2>
                      <p className="text-sm text-gray-500 mt-0.5 truncate">by {seller.name}</p>
                      {seller.sellerProfile?.storeDescription && (
                        <p className="text-sm text-gray-600 mt-2 line-clamp-2 leading-relaxed break-words">
                          {seller.sellerProfile.storeDescription}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gray-50 text-gray-600 text-xs font-medium">
                      <HiShoppingBag className="w-3 h-3 text-amber-500" />
                      {seller._count.products} products
                    </span>
                    {seller.sellerProfile && (
                      <>
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 text-xs font-medium">
                          <HiStar className="w-3 h-3" />
                          {seller.sellerProfile.rating.toFixed(1)}
                        </span>
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-green-50 text-green-700 text-xs font-medium">
                          <HiTrendingUp className="w-3 h-3" />
                          {seller.sellerProfile.totalSales} sales
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <div className="px-5 py-2.5 bg-gray-50 group-hover:bg-amber-50 border-t border-gray-100 flex items-center justify-between transition-colors">
                  <span className="text-sm font-medium text-gray-600 group-hover:text-amber-600 transition-colors">
                    View store
                  </span>
                  <span className="text-amber-500 opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
