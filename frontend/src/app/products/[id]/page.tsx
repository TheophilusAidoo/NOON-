'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { api } from '@/lib/axios';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { useFormatPrice } from '@/hooks/useFormatPrice';
import { addToCart, fetchCart } from '@/store/slices/cartSlice';
import toast from 'react-hot-toast';

interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  discountPrice?: number;
  stock: number;
  images: { imageUrl: string }[];
  category: { name: string; slug: string };
  brand: { name: string };
  seller: { name: string; sellerProfile?: { storeName: string } };
  averageRating?: number;
  reviewCount?: number;
}

export default function ProductDetailPage() {
  const params = useParams();
  const dispatch = useAppDispatch();
  const formatPrice = useFormatPrice();
  const { user } = useAppSelector((s) => s.auth);
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get(`/products/${params.id}`)
      .then((res) => {
        setProduct(res.data.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [params.id]);

  const handleAddToCart = async () => {
    if (!user) {
      toast.error('Please login to add to cart');
      return;
    }
    try {
      await dispatch(addToCart({ productId: product!.id, quantity })).unwrap();
      dispatch(fetchCart());
      toast.success('Added to cart');
    } catch (err: unknown) {
      toast.error((err as string) || 'Failed to add');
    }
  };

  if (loading || !product) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="h-96 bg-gray-200 rounded animate-pulse" />
        <div className="mt-4 h-8 bg-gray-200 rounded w-1/2 animate-pulse" />
      </div>
    );
  }

  const price = product.discountPrice ?? product.price;
  const img = product.images?.[0]?.imageUrl;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-1/2 aspect-square relative bg-gray-100 rounded-lg overflow-hidden">
          {img ? (
            <Image
              src={img}
              alt={product.title}
              fill
              className="object-cover"
              unoptimized={img.startsWith('/api/')}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              No image
            </div>
          )}
        </div>
        <div className="w-full md:w-1/2">
          <h1 className="text-2xl font-bold">{product.title}</h1>
          <p className="text-gray-600 mt-1">{product.brand?.name} • {product.category?.name}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-2xl font-bold text-amber-600">{formatPrice(price)}</span>
            {product.discountPrice && (
              <span className="text-gray-400 line-through">{formatPrice(product.price)}</span>
            )}
          </div>
          {product.averageRating != null && (
            <p className="text-sm text-gray-500 mt-1">
              ★ {product.averageRating} ({product.reviewCount} reviews)
            </p>
          )}
          <p className="mt-4 text-gray-700">{product.description}</p>
          <p className="mt-2 text-sm">Stock: {product.stock}</p>

          <div className="mt-6 flex items-center gap-4">
            <input
              type="number"
              min={1}
              max={product.stock}
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
              className="w-20 px-2 py-2 border rounded"
            />
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="px-6 py-2 bg-amber-500 text-white rounded hover:bg-amber-600 disabled:opacity-50"
            >
              Add to Cart
            </button>
          </div>

          <p className="mt-4 text-sm text-gray-500">
            Sold by {product.seller?.sellerProfile?.storeName || product.seller?.name}
          </p>
        </div>
      </div>
    </div>
  );
}
