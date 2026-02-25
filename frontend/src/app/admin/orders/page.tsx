'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { api } from '@/lib/axios';
import toast from 'react-hot-toast';
import { useFormatPrice } from '@/hooks/useFormatPrice';

type OrderItem = {
  id?: string;
  wholesaleCost?: number | null;
  sellerPaidToAdmin?: boolean;
  seller?: { name: string; role: string; sellerProfile?: { storeName?: string } };
  product?: { images?: { imageUrl: string }[] };
};
type Order = {
  id: string;
  user?: { name: string; email: string };
  totalAmount: number;
  orderStatus: string;
  paymentStatus: string;
  hasSellerItems?: boolean;
  sellerStores?: string[];
  items?: OrderItem[];
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const formatPrice = useFormatPrice();

  const fetchOrders = () => {
    setLoading(true);
    api
      .get('/admin/orders')
      .then((res) => setOrders(res.data.data || []))
      .catch(() => toast.error('Could not load orders'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateStatus = async (orderId: string, updates: { orderStatus?: string; paymentStatus?: string }) => {
    try {
      await api.put(`/admin/orders/${orderId}/status`, updates);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, ...updates } : o))
      );
      toast.success('Order updated');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || 'Failed to update');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="text-gray-500">Loading orders...</div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Orders</h1>
      <p className="text-gray-500 text-sm mb-6">Manage order and payment status</p>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="p-4 text-left text-xs font-semibold text-gray-500 uppercase">Products</th>
                <th className="p-4 text-left text-xs font-semibold text-gray-500 uppercase">Customer</th>
                <th className="p-4 text-left text-xs font-semibold text-gray-500 uppercase">Type</th>
                <th className="p-4 text-left text-xs font-semibold text-gray-500 uppercase">Seller Paid</th>
                <th className="p-4 text-left text-xs font-semibold text-gray-500 uppercase">Amount</th>
                <th className="p-4 text-left text-xs font-semibold text-gray-500 uppercase">Payment</th>
                <th className="p-4 text-left text-xs font-semibold text-gray-500 uppercase">Order Status</th>
                <th className="p-4 text-left text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-b border-gray-100 hover:bg-gray-50/50">
                  <td className="p-4">
                    <div className="flex gap-1.5 flex-wrap">
                      {o.items?.slice(0, 3).map((item, i) => {
                        const img = item.product?.images?.[0]?.imageUrl;
                        return (
                          <div key={item.id ?? i} className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                            {img ? (
                              <Image
                                src={img}
                                alt=""
                                width={40}
                                height={40}
                                className="object-cover w-full h-full"
                                unoptimized={img.startsWith('/api/')}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">—</div>
                            )}
                          </div>
                        );
                      })}
                      {(o.items?.length ?? 0) > 3 && (
                        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-xs text-gray-500 shrink-0">
                          +{o.items!.length - 3}
                        </div>
                      )}
                      {(!o.items || o.items.length === 0) && (
                        <span className="text-gray-400 text-sm">—</span>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <div>
                      <p className="font-medium text-gray-900">{o.user?.name}</p>
                      <p className="text-sm text-gray-500">{o.user?.email}</p>
                    </div>
                  </td>
                  <td className="p-4">
                    {o.hasSellerItems ? (
                      <div>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">Seller</span>
                        {o.sellerStores && o.sellerStores.length > 0 && (
                          <p className="text-xs text-gray-500 mt-1 truncate max-w-[120px]" title={o.sellerStores.join(', ')}>
                            {o.sellerStores.join(', ')}
                          </p>
                        )}
                      </div>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">Admin</span>
                    )}
                  </td>
                  <td className="p-4">
                    {(() => {
                      const wholesaleItems = o.items?.filter((i) => i.wholesaleCost != null) ?? [];
                      const paidCount = wholesaleItems.filter((i) => i.sellerPaidToAdmin).length;
                      const totalWholesale = wholesaleItems.length;
                      if (totalWholesale === 0) return <span className="text-gray-400">—</span>;
                      if (paidCount === totalWholesale) {
                        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Paid</span>;
                      }
                      return (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                          Pending ({paidCount}/{totalWholesale})
                        </span>
                      );
                    })()}
                  </td>
                  <td className="p-4 font-semibold text-gray-900">{formatPrice(o.totalAmount ?? 0)}</td>
                  <td className="p-4">
                    <select
                      value={o.paymentStatus || 'PENDING'}
                      onChange={(e) => updateStatus(o.id, { paymentStatus: e.target.value })}
                      className="px-2.5 py-1.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-400 focus:border-amber-500 outline-none"
                    >
                      <option value="PENDING">Pending</option>
                      <option value="PAID">Paid</option>
                      <option value="FAILED">Failed</option>
                    </select>
                  </td>
                  <td className="p-4">
                    {(() => {
                      const unpaidWholesale = o.items?.some((i) => i.wholesaleCost != null && !i.sellerPaidToAdmin);
                      return (
                        <div className="flex flex-col gap-1">
                          {unpaidWholesale && (
                            <span className="text-xs text-amber-600 font-medium">Sellers must purchase first</span>
                          )}
                          <select
                            value={o.orderStatus || 'PROCESSING'}
                            onChange={(e) => updateStatus(o.id, { orderStatus: e.target.value })}
                            className="px-2.5 py-1.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-400 focus:border-amber-500 outline-none"
                          >
                            <option value="PROCESSING">Processing</option>
                            <option value="SHIPPED" disabled={unpaidWholesale}>Shipped</option>
                            <option value="DELIVERED" disabled={unpaidWholesale}>Delivered</option>
                            <option value="CANCELLED">Cancelled</option>
                          </select>
                        </div>
                      );
                    })()}
                  </td>
                  <td className="p-4">
                    <Link
                      href={`/admin/orders/${o.id}`}
                      className="inline-flex items-center px-3 py-1.5 bg-amber-50 text-amber-700 hover:bg-amber-100 font-medium rounded-lg text-sm transition"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {orders.length === 0 && (
          <div className="p-12 text-center text-gray-500">
            <p className="font-medium">No orders yet</p>
            <p className="text-sm mt-1">Orders will appear here when customers checkout</p>
          </div>
        )}
      </div>
    </div>
  );
}
