'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/store/slices/productSlice';
import { useFormatPrice } from '@/hooks/useFormatPrice';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const formatPrice = useFormatPrice();
  const img = product.images?.[0]?.imageUrl;
  const price = product.discountPrice ?? product.price;
  const hasDiscount = product.discountPrice != null;

  return (
    <Link
      href={`/products/${product.id}`}
      className="group flex h-full min-w-0 flex-col overflow-hidden rounded-lg bg-white shadow transition-transform duration-300 hover:shadow-lg md:hover:scale-[1.02]"
    >
      <div className="relative aspect-square shrink-0 bg-gray-100">
        {img ? (
          <Image
            src={img}
            alt={product.title}
            fill
            className="object-cover transition duration-300 group-hover:scale-105"
            sizes="(max-width: 379px) 100vw, (max-width: 767px) 50vw, (max-width: 1023px) 33vw, 20vw"
            unoptimized={img.startsWith('/api/')}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">No image</div>
        )}
        {hasDiscount && (
          <span className="absolute left-1.5 top-1.5 rounded bg-red-500 px-1.5 py-0.5 text-[10px] font-semibold text-white sm:left-2 sm:top-2 sm:text-xs">
            -{Math.round((1 - (product.discountPrice! / product.price)) * 100)}%
          </span>
        )}
      </div>
      <div className="flex min-h-0 flex-1 flex-col p-2 sm:p-3">
        <h3 className="line-clamp-2 min-h-[2.25rem] text-xs font-medium text-gray-900 group-hover:text-amber-600 sm:min-h-[2.5rem] sm:text-sm">
          {product.title}
        </h3>
        <div className="mt-1 flex shrink-0 flex-wrap items-baseline gap-1 sm:gap-2">
          <span className="text-sm font-bold text-amber-600 sm:text-base">{formatPrice(price)}</span>
          {hasDiscount && (
            <span className="text-xs text-gray-400 line-through sm:text-sm">{formatPrice(product.price)}</span>
          )}
        </div>
        <div className="mt-auto min-h-[1.1rem] pt-1">
          {product.averageRating != null && (
            <p className="text-[11px] text-gray-500 sm:text-sm">
              ★ {product.averageRating} ({product.reviewCount || 0})
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
