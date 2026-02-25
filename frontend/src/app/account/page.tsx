'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/store/hooks';
import { api } from '@/lib/axios';

export default function AccountPage() {
  const router = useRouter();
  const { user } = useAppSelector((s) => s.auth);
  const [ordersCount, setOrdersCount] = useState<number | null>(null);
  const [wishlistCount, setWishlistCount] = useState<number | null>(null);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    if (user.role === 'CUSTOMER') {
      api.get('/orders').then((res) => setOrdersCount(res.data.data?.length ?? 0)).catch(() => setOrdersCount(0));
    }
    api.get('/wishlist').then((res) => setWishlistCount(res.data.data?.length ?? 0)).catch(() => setWishlistCount(0));
  }, [user, router]);

  if (!user) return null;

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Profile</h2>
      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <p className="text-gray-600">Name</p>
          <p className="font-medium">{user.name}</p>
          <p className="text-gray-600">Email</p>
          <p className="font-medium">{user.email}</p>
          <p className="text-gray-600">Role</p>
          <p className="font-medium">{user.role}</p>
          {user.role === 'SELLER' && (
            <>
              <p className="text-gray-600">Seller Status</p>
              <p className="font-medium">{user.isApproved ? 'Approved' : 'Pending approval'}</p>
            </>
          )}
        </div>
        <div className="flex flex-wrap gap-4 pt-4">
          {user.role === 'ADMIN' && (
            <Link href="/admin" className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600">
              Admin Dashboard
            </Link>
          )}
          {user.role === 'SELLER' && user.isApproved && (
            <Link href="/seller" className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600">
              Seller Dashboard
            </Link>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        <Link href="/account/orders" className="bg-white rounded-lg shadow p-6 hover:shadow-md transition">
          <h3 className="font-semibold text-lg mb-1">Orders</h3>
          <p className="text-3xl font-bold text-amber-600">
            {ordersCount !== null ? ordersCount : '–'}
          </p>
          <p className="text-sm text-gray-500 mt-1">View order history</p>
        </Link>
        <Link href="/account/wishlist" className="bg-white rounded-lg shadow p-6 hover:shadow-md transition">
          <h3 className="font-semibold text-lg mb-1">Wishlist</h3>
          <p className="text-3xl font-bold text-amber-600">
            {wishlistCount !== null ? wishlistCount : '–'}
          </p>
          <p className="text-sm text-gray-500 mt-1">View saved items</p>
        </Link>
      </div>
    </div>
  );
}
