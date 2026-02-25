'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/store/hooks';
import { api } from '@/lib/axios';

type Order = {
  id: string;
  totalAmount?: number;
  orderStatus: string;
  paymentStatus: string;
};

export default function AccountOrdersPage() {
  const router = useRouter();
  const { user } = useAppSelector((s) => s.auth);
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    api
      .get('/orders')
      .then((res) => setOrders(res.data.data || []))
      .catch((err) => {
        if (err.response?.status === 403) {
          setError('Orders are available for customer accounts only.');
        } else {
          setError('Failed to load orders.');
        }
      });
  }, [user, router]);

  if (!user) return null;

  if (error) {
    return (
      <div>
        <h2 className="text-xl font-semibold mb-4">Orders</h2>
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-amber-800">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Orders</h2>
      {orders.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-600 mb-4">No orders yet.</p>
          <Link href="/products" className="text-amber-600 hover:underline">
            Start shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/orders/${order.id}`}
              className="block p-4 bg-white rounded-lg shadow hover:shadow-md transition"
            >
              <div className="flex justify-between items-center">
                <span className="font-medium">Order #{order.id.slice(0, 8)}</span>
                <span className="text-amber-600 font-bold">${order.totalAmount?.toFixed(2)}</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Status: {order.orderStatus} • {order.paymentStatus}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
