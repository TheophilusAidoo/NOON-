'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { api } from '@/lib/axios';
import toast from 'react-hot-toast';
import { useFormatPrice } from '@/hooks/useFormatPrice';
import { HiArrowLeft } from 'react-icons/hi';

type OrderItem = {
  id: string;
  quantity: number;
  price: number;
  wholesaleCost?: number | null;
  sellerPaidToAdmin?: boolean;
  seller?: { name: string; sellerProfile?: { storeName?: string } };
  product?: { title: string; images?: { imageUrl: string }[] };
};

type Order = {
  id: string;
  orderStatus: string;
  paymentStatus: string;
  totalAmount: number;
  shippingAddress: string;
  adminCommission?: number;
  couponCode?: string | null;
  createdAt: string;
  hasSellerItems?: boolean;
  user?: { name: string; email: string };
  items?: OrderItem[];
};

export default function AdminOrderDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const formatPrice = useFormatPrice();

  useEffect(() => {
    if (!id) return;
    api
      .get(`/admin/orders/${id}`)
      .then((res) => setOrder(res.data.data))
      .catch(() => toast.error('Order not found'))
      .finally(() => setLoading(false));
  }, [id]);

  const updateStatus = async (field: 'orderStatus' | 'paymentStatus', value: string) => {
    if (!order) return;
    try {
      await api.put(`/admin/orders/${order.id}/status`, { [field]: value });
      setOrder((prev) => (prev ? { ...prev, [field]: value } : null));
      toast.success('Updated');
    } catch {
      toast.error('Failed to update');
    }
  };

  const parseAddress = (addr: string) => {
    if (!addr) return 'N/A';
    try {
      if (typeof addr === 'string' && addr.startsWith('{')) {
        const parsed = JSON.parse(addr);
        return parsed.line1 || parsed.address || addr;
      }
      return addr;
    } catch {
      return addr;
    }
  };

  if (loading || !order) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="text-gray-500">{loading ? 'Loading...' : 'Order not found'}</div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <Link
        href="/admin/orders"
        className="inline-flex items-center gap-2 text-gray-500 hover:text-amber-600 mb-6 text-sm"
      >
        <HiArrowLeft className="w-4 h-4" />
        Back to Orders
      </Link>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Order #{order.id?.slice(0, 8)}</h1>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 space-y-6">
          {order.hasSellerItems && (() => {
            const wholesaleItems = order.items?.filter((i) => i.wholesaleCost != null) ?? [];
            const allPaid = wholesaleItems.length > 0 && wholesaleItems.every((i) => i.sellerPaidToAdmin);
            return (
              <div className={`p-3 rounded-lg border ${allPaid ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'}`}>
                <p className={`text-sm font-medium ${allPaid ? 'text-green-800' : 'text-amber-800'}`}>
                  Seller Order · {allPaid ? 'Sellers have paid' : 'Awaiting seller payment'}
                </p>
                <p className={`text-xs mt-0.5 ${allPaid ? 'text-green-600' : 'text-amber-600'}`}>
                  {allPaid ? 'Ready to ship' : 'Sellers must purchase from admin first'}
                </p>
              </div>
            );
          })()}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Customer</p>
              <p className="font-medium text-gray-900">{order.user?.name}</p>
              <p className="text-sm text-gray-600">{order.user?.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Date</p>
              <p className="font-medium text-gray-900">
                {new Date(order.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div>
            <p className="text-sm text-gray-500 mb-1">Order Status</p>
            <select
              value={order.orderStatus}
              onChange={(e) => updateStatus('orderStatus', e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-400"
            >
              <option value="PROCESSING">Processing</option>
              <option value="SHIPPED">Shipped</option>
              <option value="DELIVERED">Delivered</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          <div>
            <p className="text-sm text-gray-500 mb-1">Payment Status</p>
            <select
              value={order.paymentStatus}
              onChange={(e) => updateStatus('paymentStatus', e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-400"
            >
              <option value="PENDING">Pending</option>
              <option value="PAID">Paid</option>
              <option value="FAILED">Failed</option>
            </select>
          </div>

          <div>
            <p className="text-sm text-gray-500 mb-1">Shipping Address</p>
            <p className="text-gray-900">{parseAddress(order.shippingAddress)}</p>
          </div>

          {order.couponCode && (
            <div>
              <p className="text-sm text-gray-500">Coupon</p>
              <p className="font-mono text-sm">{order.couponCode}</p>
            </div>
          )}

          <hr className="border-gray-100" />

          <div>
            <h2 className="font-semibold text-gray-900 mb-3">Items</h2>
            <div className="space-y-3">
              {order.items?.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 py-3 border-b border-gray-100 last:border-0"
                >
                  <div className="w-16 h-16 relative shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                    {item.product?.images?.[0]?.imageUrl ? (
                      <Image
                        src={item.product.images[0].imageUrl}
                        alt={item.product.title}
                        fill
                        className="object-cover"
                        unoptimized={item.product.images[0].imageUrl.startsWith('/api/')}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                        No img
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{item.product?.title}</p>
                    <p className="text-sm text-gray-500">
                      Qty: {item.quantity} × {formatPrice(item.price)}
                    </p>
                    {item.seller?.sellerProfile?.storeName && (
                      <p className="text-xs text-emerald-600 font-medium mt-0.5">Seller: {item.seller.sellerProfile.storeName}</p>
                    )}
                    {item.wholesaleCost != null && (
                      <p className={`text-xs font-medium mt-0.5 ${item.sellerPaidToAdmin ? 'text-green-600' : 'text-amber-600'}`}>
                        {item.sellerPaidToAdmin ? '✓ Seller paid' : '○ Awaiting seller payment'}
                      </p>
                    )}
                  </div>
                  <div className="font-semibold text-gray-900 shrink-0">
                    {formatPrice(item.quantity * item.price)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total</span>
              <span className="text-xl font-bold text-gray-900">
                {formatPrice(order.totalAmount ?? 0)}
              </span>
            </div>
            {order.adminCommission != null && order.adminCommission > 0 && (
              <div className="flex justify-between text-sm text-gray-500 mt-1">
                <span>Commission</span>
                <span>{formatPrice(order.adminCommission)}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
