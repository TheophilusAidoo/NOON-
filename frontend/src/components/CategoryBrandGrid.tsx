'use client';

import Link from 'next/link';
import SectionBanner from './SectionBanner';

type Category = {
  id: string;
  name: string;
  slug: string;
  image?: string | null;
  promoLabel?: string | null;
};

type Brand = {
  id: string;
  name: string;
  image?: string | null;
};

type Props = {
  categories: Category[];
  brands: Brand[];
};

const DEFAULT_PROMO = 'UP TO -30%';

export default function CategoryBrandGrid({ categories, brands }: Props) {
  const categoryCards = categories.map((c) => ({
    type: 'category' as const,
    id: c.id,
    name: c.name,
    slug: c.slug,
    image: c.image,
    promoLabel: c.promoLabel || DEFAULT_PROMO,
    href: `/products?category=${c.id}`,
  }));

  const brandCards = brands.map((b) => ({
    type: 'brand' as const,
    id: b.id,
    name: b.name,
    image: b.image,
    promoLabel: 'Shop Now',
    href: `/products?brand=${b.id}`,
  }));

  const allCards = [...categoryCards, ...brandCards].slice(0, 12);

  return (
    <section className="mb-10 overflow-hidden">
      <SectionBanner
        title="Shop by Category & Brand"
        seeAllHref="/products"
      />
      {allCards.length === 0 ? (
        <div className="py-12 text-center text-gray-500 bg-gray-50 rounded-lg">
          No categories or brands yet. Add them in the admin panel.
        </div>
      ) : (
      <div className="grid grid-cols-2 gap-2 min-[400px]:gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-6">
        {allCards.map((card, i) => (
          <Link
            key={`${card.type}-${card.id}`}
            href={card.href}
            className="group block bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100
              hover:shadow-xl hover:-translate-y-1 hover:scale-[1.02]
              transition-all duration-300 ease-out
              opacity-0 animate-fade-in-up"
            style={{ animationDelay: `${i * 50}ms`, animationFillMode: 'forwards' }}
          >
            <div className="flex flex-col items-center px-2 pb-3 pt-4 sm:px-4 sm:pb-4 sm:pt-6">
              <div className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#fce4ec] transition-all duration-300 group-hover:ring-4 group-hover:ring-amber-200/50 min-[400px]:h-24 min-[400px]:w-24 sm:h-32 sm:w-32">
                {card.image ? (
                  <img
                    src={card.image}
                    alt={card.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    onError={(e) => {
                      const img = e.target as HTMLImageElement;
                      img.style.display = 'none';
                      const fallback = img.parentElement?.querySelector('.brand-fallback');
                      if (fallback) fallback.classList.remove('hidden');
                    }}
                  />
                ) : null}
                <span
                  className={`brand-fallback text-lg font-bold min-[400px]:text-2xl ${card.image ? 'hidden' : ''}`}
                  style={{ color: '#c2185b' }}
                >
                  {card.name.charAt(0)}
                </span>
              </div>
              <div className="relative z-10 -mt-3 flex w-full justify-center sm:-mt-4">
                <span
                  className="inline-block max-w-full truncate rounded-full px-2 py-1 text-[10px] font-bold text-white transition-transform duration-300 group-hover:scale-110 hover:opacity-90 min-[400px]:px-3 min-[400px]:text-xs sm:px-4 sm:py-1.5"
                  style={{ backgroundColor: '#e61502' }}
                >
                  {card.promoLabel}
                </span>
              </div>
              <p className="mt-2 line-clamp-2 text-center text-xs font-medium text-gray-900 transition-colors group-hover:text-amber-600 min-[400px]:mt-3 sm:text-sm">
                {card.name}
              </p>
            </div>
          </Link>
        ))}
      </div>
      )}
    </section>
  );
}
