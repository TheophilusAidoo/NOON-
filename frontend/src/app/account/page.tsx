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
      <div className="space-y-4 rounded-lg bg-white p-4 shadow sm:p-6">
        <dl className="grid gap-4 sm:grid-cols-2 sm:gap-x-8">
          <div className="min-w-0 sm:col-span-1">
            <dt className="text-sm text-gray-600">Name</dt>
            <dd className="mt-0.5 font-medium text-gray-900">{user.name}</dd>
          </div>
          <div className="min-w-0 sm:col-span-1">
            <dt className="text-sm text-gray-600">Email</dt>
            <dd className="mt-0.5 break-words font-medium text-gray-900">{user.email}</dd>
          </div>
          <div>
            <dt className="text-sm text-gray-600">Role</dt>
            <dd className="mt-0.5 font-medium text-gray-900">{user.role}</dd>
          </div>
          {user.role === 'SELLER' && (
            <div>
              <dt className="text-sm text-gray-600">Seller Status</dt>
              <dd className="mt-0.5 font-medium text-gray-900">
                {user.isApproved ? 'Approved' : 'Pending approval'}
              </dd>
            </div>
          )}
        </dl>
        <div className="flex flex-wrap gap-3 pt-4">
          {user.role === 'ADMIN' && (
            <Link
              href="/admin"
              className="rounded-lg bg-amber-500 px-4 py-2.5 text-center text-sm font-medium text-white hover:bg-amber-600 sm:text-base"
            >
              Admin Dashboard
            </Link>
          )}
          {user.role === 'SELLER' && user.isApproved && (
            <Link
              href="/seller"
              className="rounded-lg bg-amber-500 px-4 py-2.5 text-center text-sm font-medium text-white hover:bg-amber-600 sm:text-base"
            >
              Seller Dashboard
            </Link>
          )}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        <Link
          href="/account/orders"
          className="rounded-lg bg-white p-5 shadow transition hover:shadow-md sm:p-6"
        >
          <h3 className="mb-1 text-base font-semibold sm:text-lg">Orders</h3>
          <p className="text-3xl font-bold text-amber-600">
            {ordersCount !== null ? ordersCount : '–'}
          </p>
          <p className="mt-1 text-sm text-gray-500">View order history</p>
        </Link>
        <Link
          href="/account/wishlist"
          className="rounded-lg bg-white p-5 shadow transition hover:shadow-md sm:p-6"
        >
          <h3 className="mb-1 text-base font-semibold sm:text-lg">Wishlist</h3>
          <p className="text-3xl font-bold text-amber-600">
            {wishlistCount !== null ? wishlistCount : '–'}
          </p>
          <p className="mt-1 text-sm text-gray-500">View saved items</p>
        </Link>
      </div>
    </div>
  );
}
