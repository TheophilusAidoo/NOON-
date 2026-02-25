'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAppSelector } from '@/store/hooks';
import { api } from '@/lib/axios';
import toast from 'react-hot-toast';

function OrdersContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAppSelector((s) => s.auth);
  const [orders, setOrders] = useState<{ id: string; totalAmount?: number; orderStatus: string; paymentStatus: string }[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = () => api.get('/orders').then((res) => setOrders(res.data.data || [])).catch(() => setOrders([]));

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    const paymentIntent = searchParams.get('payment_intent');
    const redirectStatus = searchParams.get('redirect_status');

    if (paymentIntent && redirectStatus === 'succeeded') {
      api
        .post('/payment/confirm-order', { paymentIntentId: paymentIntent })
        .then(() => {
          toast.success('Order placed successfully!');
          window.history.replaceState({}, '', '/orders');
          fetchOrders();
        })
        .catch((err) => {
          toast.error(err.response?.data?.message || 'Could not confirm order');
          fetchOrders();
        })
        .finally(() => setLoading(false));
    } else {
      fetchOrders().finally(() => setLoading(false));
    }
  }, [user, router, searchParams]);

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">My Orders</h1>
      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : orders.length === 0 ? (
        <p className="text-gray-600">No orders yet.</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/orders/${order.id}`}
              className="block p-4 bg-white rounded-lg shadow hover:shadow-md"
            >
              <div className="flex justify-between">
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

export default function OrdersPage() {
  return (
    <Suspense fallback={<div className="max-w-4xl mx-auto px-4 py-6">Loading...</div>}>
      <OrdersContent />
    </Suspense>
  );
}
