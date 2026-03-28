'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { fetchFeatured, fetchFlashDeals, fetchSellerProducts } from '@/store/slices/productSlice';
import ProductCard from '@/components/ProductCard';
import ProductCarousel from '@/components/ProductCarousel';
import CategoryBrandGrid from '@/components/CategoryBrandGrid';
import SectionBanner from '@/components/SectionBanner';
import FlashCountdown from '@/components/FlashCountdown';
import { ProductSkeleton, BannerSkeleton } from '@/components/Skeleton';
import { MdFlashOn } from 'react-icons/md';
import { api } from '@/lib/axios';

export default function HomePage() {
  const dispatch = useAppDispatch();
  const { featured, flashDeals, sellerProducts, featuredLoading, flashDealsLoading, sellerProductsLoading } = useAppSelector((s) => s.products);
  const [banners, setBanners] = useState<{ id: string; imageUrl: string; linkUrl?: string; title?: string }[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string; slug: string; image?: string; promoLabel?: string }[]>([]);
  const [brands, setBrands] = useState<{ id: string; name: string; image?: string }[]>([]);
  const [bannerIndex, setBannerIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  const [loadError, setLoadError] = useState(false);

  const loadHomepageData = useCallback(async () => {
    setLoadError(false);
    dispatch(fetchFeatured());
    dispatch(fetchFlashDeals());
    dispatch(fetchSellerProducts());
    try {
      const [bRes, cRes, bRes2] = await Promise.all([
        api.get<{ success: boolean; data?: unknown }>('/banners'),
        api.get<{ success: boolean; data?: unknown }>('/categories'),
        api.get<{ success: boolean; data?: unknown }>('/brands'),
      ]);
      setBanners(Array.isArray(bRes.data?.data) ? bRes.data.data : []);
      setCategories(Array.isArray(cRes.data?.data) ? cRes.data.data : []);
      setBrands(Array.isArray(bRes2.data?.data) ? bRes2.data.data : []);
    } catch {
      setLoadError(true);
      const toast = (await import('react-hot-toast')).default;
      toast.error('Could not load homepage data. Make sure the backend is running.');
      setBanners([]);
      setCategories([]);
      setBrands([]);
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  useEffect(() => {
    loadHomepageData();
    const onFocus = () => loadHomepageData();
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [loadHomepageData]);

  useEffect(() => {
    if (banners.length <= 1) return;
    const id = setInterval(() => {
      setBannerIndex((i) => (i + 1) % banners.length);
    }, 5000);
    return () => clearInterval(id);
  }, [banners.length]);

  return (
    <div className="mx-auto w-full max-w-7xl px-3 py-4 sm:px-4 sm:py-6 md:px-6">
      {loadError && (
        <div className="mb-4 flex flex-col gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-amber-800">Could not load homepage data. Is the backend running?</p>
          <button
            type="button"
            onClick={() => {
              setLoading(true);
              loadHomepageData();
            }}
            className="shrink-0 rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-amber-600"
          >
            Retry
          </button>
        </div>
      )}
      {/* Hero banner slider - online images */}
      <section className="mb-6 animate-fade-in sm:mb-8">
        {loading ? (
          <BannerSkeleton />
        ) : banners.length > 0 ? (
          <div className="relative w-full overflow-hidden rounded-lg bg-gray-200 aspect-[16/11] min-[480px]:aspect-[2.35/1] md:aspect-[3/1] md:max-h-[22rem]">
            {banners.map((b, i) => (
              <Link
                key={b.id}
                href={b.linkUrl || '#'}
                className={`absolute inset-0 transition-opacity duration-500 ${
                  i === bannerIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
                }`}
              >
                {/* img supports GIFs from any URL */}
                <img
                  src={b.imageUrl}
                  alt={b.title || 'Banner'}
                  className="object-cover w-full h-full"
                />
              </Link>
            ))}
            {banners.length > 1 && (
              <div className="absolute bottom-2 left-1/2 z-20 flex -translate-x-1/2 gap-1.5 sm:bottom-4 sm:gap-2">
                {banners.map((_, i) => (
                  <button
                    type="button"
                    key={i}
                    onClick={() => setBannerIndex(i)}
                    className={`h-2 w-2 rounded-full touch-manipulation sm:h-2.5 sm:w-2.5 ${
                      i === bannerIndex ? 'bg-white' : 'bg-white/50'
                    }`}
                    aria-label={`Go to banner ${i + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="relative flex aspect-[16/11] w-full items-center justify-center overflow-hidden rounded-lg bg-gray-200 min-[480px]:aspect-[2.35/1] md:aspect-[3/1] md:max-h-[22rem]">
            <img
              src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200"
              alt="Banner"
              className="object-cover w-full h-full"
            />
          </div>
        )}
      </section>

      {/* Flash sales */}
      <section className="mb-10 opacity-0 animate-fade-in-up" style={{ animationDelay: '0.1s', animationFillMode: 'forwards' }}>
        <SectionBanner
          title="Flash Deals"
          seeAllHref="/products?flash=true"
          icon={<MdFlashOn className="w-6 h-6" />}
          middleContent={<FlashCountdown />}
        />
        <div className="grid grid-cols-1 min-[380px]:grid-cols-2 gap-2 sm:gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-4 xl:grid-cols-5 items-stretch">
          {flashDealsLoading ? (
            Array(15)
              .fill(0)
              .map((_, i) => <ProductSkeleton key={i} />)
          ) : flashDeals.length > 0 ? (
            flashDeals.map((p, i) => (
              <div key={p.id} className="opacity-0 animate-fade-in-up h-full min-h-0" style={{ animationDelay: `${0.15 + i * 0.05}s`, animationFillMode: 'forwards' }}>
                <ProductCard product={p} />
              </div>
            ))
          ) : (
            <div className="col-span-full py-12 text-center text-gray-500 bg-gray-50 rounded-lg">
              No deals at the moment. Check back soon!
            </div>
          )}
        </div>
      </section>

      {/* Categories & Brands grid */}
      <div className="opacity-0 animate-fade-in-up" style={{ animationDelay: '0.15s', animationFillMode: 'forwards' }}>
        <CategoryBrandGrid categories={categories} brands={brands} />
      </div>

      {/* Featured products */}
      <section className="opacity-0 animate-fade-in-up mb-10" style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }}>
        <SectionBanner
          title="Featured Products"
          seeAllHref="/products"
        />
        <div className="grid grid-cols-1 min-[380px]:grid-cols-2 gap-2 sm:gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-4 xl:grid-cols-5 items-stretch">
          {featuredLoading ? (
            Array(15)
              .fill(0)
              .map((_, i) => <ProductSkeleton key={i} />)
          ) : featured.length > 0 ? (
            featured.map((p, i) => (
              <div key={p.id} className="opacity-0 animate-fade-in-up h-full min-w-0 min-h-0" style={{ animationDelay: `${0.25 + (i % 5) * 0.04}s`, animationFillMode: 'forwards' }}>
                <ProductCard product={p} />
              </div>
            ))
          ) : (
            <div className="col-span-full py-12 text-center text-gray-500 bg-gray-50 rounded-lg">
              No featured products yet.
            </div>
          )}
        </div>
      </section>

      {/* Seller Products - horizontal carousel */}
      <div className="opacity-0 animate-fade-in-up" style={{ animationDelay: '0.3s', animationFillMode: 'forwards' }}>
      <ProductCarousel
        title="Seller Products"
        seeAllHref="/sellers"
        products={sellerProducts}
        loading={sellerProductsLoading}
        useRedBanner
      />
      </div>
    </div>
  );
}
