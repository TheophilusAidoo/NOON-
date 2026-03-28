'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { HiChevronRight } from 'react-icons/hi';
import SectionBanner from './SectionBanner';
import ProductCardCarousel from './ProductCardCarousel';
import { Product } from '@/store/slices/productSlice';
import { ProductSkeleton } from './Skeleton';

type Props = {
  title: string;
  seeAllHref: string;
  products: Product[];
  loading?: boolean;
  useRedBanner?: boolean;
};

export default function ProductCarousel({ title, seeAllHref, products, loading, useRedBanner }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 220, behavior: 'smooth' });
    }
  };

  const header = useRedBanner ? (
    <SectionBanner title={title} seeAllHref={seeAllHref} />
  ) : (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-xl font-bold text-gray-900">{title}</h2>
      <Link
        href={seeAllHref}
        className="flex items-center gap-1 text-amber-600 hover:text-amber-700 font-medium text-sm"
      >
        See All
        <HiChevronRight className="w-5 h-5" />
      </Link>
    </div>
  );

  return (
    <section className="mb-10">
      {header}
      <div className="relative -mx-3 sm:mx-0">
        <div
          ref={scrollRef}
          className="flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth px-3 pb-2 [-ms-overflow-style:none] [scrollbar-width:none] items-stretch sm:gap-4 sm:px-0 [&::-webkit-scrollbar]:hidden"
        >
          {loading ? (
            Array(6)
              .fill(0)
              .map((_, i) => (
                <div key={i} className="w-[min(42vw,11rem)] shrink-0 snap-start sm:w-44 md:w-52">
                  <ProductSkeleton />
                </div>
              ))
          ) : products.length > 0 ? (
            products.map((p) => <ProductCardCarousel key={p.id} product={p} />)
          ) : (
            <div className="w-full py-12 text-center text-gray-500 bg-gray-50 rounded-lg">No products yet.</div>
          )}
        </div>
        {products.length > 4 && (
          <button
            type="button"
            onClick={scrollRight}
            className="absolute right-0 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 -translate-x-2 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 shadow-lg transition hover:bg-gray-50 hover:text-amber-600 sm:flex"
            aria-label="Scroll right"
          >
            <HiChevronRight className="h-6 w-6" />
          </button>
        )}
      </div>
    </section>
  );
}
