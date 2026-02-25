'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/store/hooks';
import { api } from '@/lib/axios';
import toast from 'react-hot-toast';

type Product = {
  id: string;
  title: string;
  price: number;
  discountPrice?: number;
  images?: { imageUrl: string }[];
  category?: { name: string };
};

export default function AccountWishlistPage() {
  const router = useRouter();
  const { user } = useAppSelector((s) => s.auth);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    api.get('/wishlist').then((res) => setProducts(res.data.data || [])).catch(() => []);
  }, [user, router]);

  const remove = async (productId: string) => {
    try {
      await api.delete(`/wishlist/${productId}`);
      setProducts((p) => p.filter((x) => x.id !== productId));
      toast.success('Removed from wishlist');
    } catch {
      toast.error('Failed to remove');
    }
  };

  if (!user) return null;

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Wishlist</h2>
      {products.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-600 mb-4">Your wishlist is empty.</p>
          <Link href="/products" className="text-amber-600 hover:underline">
            Browse products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((p) => (
            <div key={p.id} className="bg-white rounded-lg shadow overflow-hidden group">
              <Link href={`/products/${p.id}`} className="block">
                <div className="aspect-square relative">
                  {p.images?.[0]?.imageUrl ? (
                    <Image
                      src={p.images[0].imageUrl}
                      alt={p.title}
                      fill
                      className="object-cover"
                      unoptimized={p.images[0].imageUrl.startsWith('/api/')}
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">
                      No image
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <p className="font-medium text-sm line-clamp-2">{p.title}</p>
                  <p className="text-amber-600 font-bold">
                    ${(p.discountPrice ?? p.price).toFixed(2)}
                  </p>
                </div>
              </Link>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  remove(p.id);
                }}
                className="w-full py-2 text-sm text-red-500 hover:bg-red-50 transition"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
