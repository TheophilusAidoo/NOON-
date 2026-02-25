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
    <Link href={`/products/${product.id}`} className="group flex h-full flex-col bg-white rounded-lg shadow hover:shadow-lg overflow-hidden transition-transform duration-300 hover:scale-[1.02]">
      <div className="aspect-square relative bg-gray-100 shrink-0">
        {img ? (
          <Image
            src={img}
            alt={product.title}
            fill
            className="object-cover group-hover:scale-105 transition duration-300"
            sizes="(max-width: 640px) 50vw, 25vw"
            unoptimized={img.startsWith('/api/')}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">No image</div>
        )}
        {hasDiscount && (
          <span className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded">
            -{Math.round((1 - (product.discountPrice! / product.price)) * 100)}%
          </span>
        )}
      </div>
      <div className="p-3 flex flex-1 flex-col min-h-0">
        <h3 className="font-medium text-gray-900 line-clamp-2 group-hover:text-amber-600 min-h-[2.5rem]">
          {product.title}
        </h3>
        <div className="flex items-center gap-2 mt-1 shrink-0">
          <span className="text-amber-600 font-bold">{formatPrice(price)}</span>
          {hasDiscount && (
            <span className="text-gray-400 text-sm line-through">{formatPrice(product.price)}</span>
          )}
        </div>
        <div className="mt-auto pt-1 min-h-[1.25rem]">
          {product.averageRating != null && (
            <p className="text-sm text-gray-500">★ {product.averageRating} ({product.reviewCount || 0})</p>
          )}
        </div>
      </div>
    </Link>
  );
}
