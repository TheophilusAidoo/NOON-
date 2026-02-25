'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/store/hooks';
import { api } from '@/lib/axios';

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAppSelector((s) => s.auth);
  const [order, setOrder] = useState<{
    id: string;
    orderStatus: string;
    paymentStatus: string;
    totalAmount: number;
    shippingAddress?: string;
    items?: { id: string; quantity: number; price: number; product?: { title: string; images?: { imageUrl: string }[] } }[];
  } | null>(null);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    api.get(`/orders/${params.id}`).then((res) => setOrder(res.data.data)).catch(() => {});
  }, [user, params.id, router]);

  if (!user || !order) return <div className="p-6">Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Order #{order.id?.slice(0, 8)}</h1>
      <div className="bg-white rounded shadow p-6 space-y-4">
        <div className="flex justify-between">
          <span className="text-gray-500">Status</span>
          <span>{order.orderStatus}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Payment</span>
          <span>{order.paymentStatus}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Total</span>
          <span className="font-bold">${order.totalAmount?.toFixed(2)}</span>
        </div>
        <div>
          <span className="text-gray-500 block">Shipping Address</span>
          <p>
            {(() => {
              try {
                const addr = typeof order.shippingAddress === 'string' && order.shippingAddress.startsWith('{')
                  ? JSON.parse(order.shippingAddress)
                  : order.shippingAddress;
                return addr?.line1 || order.shippingAddress || 'N/A';
              } catch {
                return order.shippingAddress || 'N/A';
              }
            })()}
          </p>
        </div>
        <hr />
        <h2 className="font-bold">Items</h2>
        {order.items?.map((item) => (
          <div key={item.id} className="flex gap-4 py-2 border-b">
            <div className="w-16 h-16 relative shrink-0 bg-gray-100 rounded">
              {item.product?.images?.[0]?.imageUrl ? (
                <Image
                  src={item.product.images[0].imageUrl}
                  alt={item.product.title}
                  fill
                  className="object-cover rounded"
                  unoptimized={item.product.images[0].imageUrl.startsWith('/api/')}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs">No img</div>
              )}
            </div>
            <div className="flex-1">
              <p className="font-medium">{item.product?.title}</p>
              <p>Qty: {item.quantity} × ${item.price?.toFixed(2)}</p>
            </div>
            <div className="font-bold">${(item.quantity * item.price).toFixed(2)}</div>
          </div>
        ))}
      </div>
      <Link href="/orders" className="block mt-4 text-amber-600">← Back to orders</Link>
    </div>
  );
}
