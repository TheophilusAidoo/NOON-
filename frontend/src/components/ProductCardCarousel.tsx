'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/store/slices/productSlice';
import { useFormatPrice } from '@/hooks/useFormatPrice';

interface ProductCardCarouselProps {
  product: Product;
}

export default function ProductCardCarousel({ product }: ProductCardCarouselProps) {
  const formatPrice = useFormatPrice();
  const img = product.images?.[0]?.imageUrl;
  const price = product.discountPrice ?? product.price;
  const hasDiscount = product.discountPrice != null;
  const discountPct = hasDiscount
    ? Math.round((1 - (product.discountPrice! / product.price)) * 100)
    : 0;
  const storeName = product.seller?.sellerProfile?.storeName;
  const storeLogo = product.seller?.sellerProfile?.logo;
  const sellerId = product.seller?.id;

  return (
    <div className="flex-shrink-0 w-44 sm:w-52 flex flex-col h-full">
      <div className="flex flex-col flex-1 bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-xl hover:border-amber-200 transition-all duration-200">
        <Link href={`/products/${product.id}`} className="group flex flex-col flex-1">
          <div className="aspect-square relative bg-gray-50 shrink-0">
            {img ? (
              <Image
                src={img}
                alt={product.title}
                fill
                className="object-cover hover:scale-[1.03] transition duration-300"
                sizes="(max-width: 640px) 176px, 208px"
                unoptimized={img.startsWith('/api/')}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">No image</div>
            )}
            {hasDiscount && (
              <span className="absolute top-2 right-2 bg-amber-500 text-white text-xs font-semibold px-2 py-0.5 rounded-md shadow-sm">
                -{discountPct}%
              </span>
            )}
          </div>
          <div className="p-3 flex flex-col flex-1">
            <h3 className="text-sm font-medium text-gray-900 line-clamp-2 min-h-[2.5rem] group-hover:text-amber-600 transition-colors">
              {product.title}
            </h3>
            <div className="mt-auto pt-2 min-h-[2rem] flex flex-col justify-end">
              <span className="font-bold text-gray-900">{formatPrice(price)}</span>
              <span className={`text-xs text-gray-400 line-through ${hasDiscount ? '' : 'invisible'}`}>
                {formatPrice(product.price)}
              </span>
            </div>
          </div>
        </Link>
        {sellerId && storeName && (
          <Link
            href={`/sellers/${sellerId}`}
            className="mx-3 mb-3 mt-auto flex items-center gap-2 py-1.5 px-2 rounded-lg bg-gray-50 hover:bg-amber-50 transition-colors shrink-0"
          >
            {storeLogo ? (
              <img src={storeLogo} alt={storeName} className="w-5 h-5 rounded-full object-cover shrink-0 ring-1 ring-gray-200" />
            ) : (
              <div className="w-5 h-5 rounded-full bg-amber-100 flex items-center justify-center shrink-0 text-amber-600 text-[10px] font-bold">
                {storeName.charAt(0)}
              </div>
            )}
            <span className="text-xs text-gray-600 truncate">{storeName}</span>
          </Link>
        )}
      </div>
    </div>
  );
}
