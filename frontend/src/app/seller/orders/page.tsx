'use client';

import { useEffect, useState, useMemo } from 'react';
import Image from 'next/image';
import { api } from '@/lib/axios';
import toast from 'react-hot-toast';
import { useFormatPrice } from '@/hooks/useFormatPrice';
import { HiShoppingCart } from 'react-icons/hi';

type OrderItem = {
  id: string;
  quantity: number;
  price: number;
  wholesaleCost?: number | null;
  sellerPaidToAdmin?: boolean;
  product?: { title: string; sku?: string; images?: { imageUrl: string }[] };
  order?: {
    id: string;
    orderStatus: string;
    paymentStatus: string;
    createdAt: string;
    user?: { name: string; email: string };
  };
};

function StatusBadge({ status, type, expiredByWholesale }: { status: string; type: 'order' | 'payment'; expiredByWholesale?: boolean }) {
  const config: Record<string, { label: string; className: string }> =
    type === 'order'
      ? {
          PROCESSING: { label: 'Processing', className: 'bg-amber-100 text-amber-800' },
          SHIPPED: { label: 'Shipped', className: 'bg-blue-100 text-blue-800' },
          DELIVERED: { label: 'Delivered', className: 'bg-green-100 text-green-800' },
          CANCELLED: { label: 'Cancelled', className: 'bg-gray-100 text-gray-600' },
        }
      : {
          PENDING: { label: 'Pending', className: 'bg-amber-100 text-amber-800' },
          PAID: { label: 'Paid', className: 'bg-green-100 text-green-800' },
          FAILED: { label: 'Failed', className: 'bg-red-100 text-red-800' },
        };
  let label = (config[status] || { label: status }).label;
  if (type === 'order' && status === 'CANCELLED' && expiredByWholesale) label = 'Expired';
  const className = (config[status] || { className: 'bg-gray-100 text-gray-600' }).className;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`}>
      {label}
    </span>
  );
}

export default function SellerOrdersPage() {
  const [items, setItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [levelInfo, setLevelInfo] = useState<{ availableBalance: number; accumulatedProfit?: number; profitMargin?: number } | null>(null);
  const formatPrice = useFormatPrice();

  const loadData = () => {
    setLoading(true);
    api.get('/seller/orders').then((res) => setItems(res.data.data || [])).catch(() => toast.error('Could not load orders')).finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
    api.get('/seller/level').then((res) => setLevelInfo(res.data.data)).catch(() => {});
  }, []);

  const purchaseFromAdmin = async (orderId: string) => {
    setPurchasing(orderId);
    try {
      await api.post(`/seller/orders/${orderId}/purchase-from-admin`);
      toast.success('Purchased! Your profit margin has been applied. Admin can now ship.');
      loadData();
      api.get('/seller/level').then((res) => setLevelInfo(res.data.data)).catch(() => {});
    } catch (err: unknown) {
      toast.error((err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed');
    } finally {
      setPurchasing(null);
    }
  };

  const groupedByOrder = useMemo(() => {
    const map = new Map<string, OrderItem[]>();
    for (const item of items) {
      const orderId = item.order?.id ?? 'unknown';
      if (!map.has(orderId)) map.set(orderId, []);
      map.get(orderId)!.push(item);
    }
    const filtered =
      statusFilter === 'all'
        ? Array.from(map.entries())
        : Array.from(map.entries()).filter(([, orderItems]) => orderItems[0]?.order?.orderStatus === statusFilter);
    return filtered.sort(
      (a, b) => new Date(b[1][0]?.order?.createdAt ?? 0).getTime() - new Date(a[1][0]?.order?.createdAt ?? 0).getTime()
    );
  }, [items, statusFilter]);

  const getUnpaidWholesaleTotal = (orderItems: OrderItem[]) =>
    orderItems.filter((i) => i.wholesaleCost != null && !i.sellerPaidToAdmin).reduce((s, i) => s + (i.wholesaleCost ?? 0), 0);

  const getUnpaidWholesaleSaleTotal = (orderItems: OrderItem[]) =>
    orderItems.filter((i) => i.wholesaleCost != null && !i.sellerPaidToAdmin).reduce((s, i) => s + i.price * i.quantity, 0);

  const getUnpaidWholesaleProfit = (orderItems: OrderItem[]) =>
    getUnpaidWholesaleSaleTotal(orderItems) - getUnpaidWholesaleTotal(orderItems);

  const hasUnpaidWholesale = (orderItems: OrderItem[]) => orderItems.some((i) => i.wholesaleCost != null && !i.sellerPaidToAdmin);

  const WHOLESALE_DEADLINE_HOURS = 48;
  const getHoursLeft = (createdAt: string) => {
    const deadline = new Date(new Date(createdAt).getTime() + WHOLESALE_DEADLINE_HOURS * 60 * 60 * 1000).getTime();
    const now = Date.now();
    return Math.max(0, (deadline - now) / (60 * 60 * 1000));
  };
  const isWholesaleOverdue = (createdAt: string) => getHoursLeft(createdAt) <= 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="text-slate-500">Loading orders...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Orders</h1>
          <p className="text-slate-500 text-sm mt-1 max-w-lg">
            View and track your product orders. Purchase wholesale items from admin before admin can ship.
          </p>
        </div>
        {levelInfo != null && (
          <div className="flex flex-wrap gap-3 shrink-0">
            <div className="px-5 py-4 bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/60 rounded-xl shadow-sm">
              <p className="text-xs font-medium text-amber-800 uppercase tracking-wide">Wholesale balance</p>
              <p className="text-xl font-bold text-amber-700 mt-0.5">{formatPrice(levelInfo.availableBalance ?? 0)}</p>
            </div>
            <div className="px-5 py-4 bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-200/60 rounded-xl shadow-sm">
              <p className="text-xs font-medium text-emerald-800 uppercase tracking-wide">Profit Margin</p>
              <p className="text-xl font-bold text-emerald-700 mt-0.5">{formatPrice(levelInfo.accumulatedProfit ?? 0)}</p>
              <p className="text-xs text-emerald-600 mt-0.5">Your {levelInfo.profitMargin ?? 0}% profit margin on wholesale</p>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setStatusFilter('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
            statusFilter === 'all' ? 'bg-emerald-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setStatusFilter('PROCESSING')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
            statusFilter === 'PROCESSING' ? 'bg-amber-500 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          Processing
        </button>
        <button
          onClick={() => setStatusFilter('SHIPPED')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
            statusFilter === 'SHIPPED' ? 'bg-blue-500 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          Shipped
        </button>
        <button
          onClick={() => setStatusFilter('DELIVERED')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
            statusFilter === 'DELIVERED' ? 'bg-green-500 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          Delivered
        </button>
        <button
          onClick={() => setStatusFilter('CANCELLED')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
            statusFilter === 'CANCELLED' ? 'bg-gray-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          Cancelled
        </button>
      </div>

      <div className="space-y-6">
        {groupedByOrder.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <HiShoppingCart className="w-14 h-14 text-slate-300 mx-auto mb-4" />
            <p className="font-medium text-slate-600">No orders yet</p>
            <p className="text-sm text-slate-500 mt-1">Orders containing your products will appear here</p>
          </div>
        ) : (
          groupedByOrder.map(([orderId, orderItems]) => {
            const order = orderItems[0]?.order;
            const orderTotal = orderItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
            return (
              <div key={orderId} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-4">
                    <div>
                      <p className="text-xs text-slate-500">Order</p>
                      <p className="font-mono font-semibold text-slate-900">#{orderId.slice(0, 8)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Date</p>
                      <p className="text-sm font-medium text-slate-900">
                        {order?.createdAt ? new Date(order.createdAt).toLocaleDateString() : '—'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Customer</p>
                      <p className="text-sm font-medium text-slate-900">{order?.user?.name ?? '—'}</p>
                      <p className="text-xs text-slate-500">{order?.user?.email}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-4">
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Order Status</p>
                      <StatusBadge
                        status={order?.orderStatus ?? 'PROCESSING'}
                        type="order"
                        expiredByWholesale={order?.orderStatus === 'CANCELLED' && hasUnpaidWholesale(orderItems)}
                      />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Payment</p>
                      <StatusBadge status={order?.paymentStatus ?? 'PENDING'} type="payment" />
                    </div>
                    {hasUnpaidWholesale(orderItems) && order?.orderStatus !== 'CANCELLED' && (
                      <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                        <p className="text-xs text-amber-700 font-semibold mb-1">Action required</p>
                        <p className="text-sm text-amber-800">Pay admin: {formatPrice(getUnpaidWholesaleTotal(orderItems))}</p>
                        <p className="text-sm text-emerald-600 font-medium mt-0.5">Your profit: {formatPrice(getUnpaidWholesaleProfit(orderItems))} (margin applied)</p>
                        {order?.createdAt && (
                          <p className="text-xs text-red-600 mt-1.5">
                            {isWholesaleOverdue(order.createdAt)
                              ? 'Overdue — order may expire soon'
                              : `Purchase within ${Math.ceil(getHoursLeft(order.createdAt))}h or order expires & −10 credit score`}
                          </p>
                        )}
                      </div>
                    )}
                    <div className="text-right">
                      <p className="text-xs text-slate-500">Your total</p>
                      <p className="font-bold text-slate-900">{formatPrice(orderTotal)}</p>
                    </div>
                    {hasUnpaidWholesale(orderItems) && order?.orderStatus !== 'CANCELLED' && (
                      <div className="flex flex-col gap-1">
                        <button
                          onClick={() => purchaseFromAdmin(orderId)}
                          disabled={purchasing === orderId || (levelInfo != null && (levelInfo.availableBalance ?? 0) < getUnpaidWholesaleTotal(orderItems))}
                          className="px-5 py-2.5 bg-amber-500 text-white text-sm font-semibold rounded-lg hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                        >
                          {purchasing === orderId ? 'Purchasing...' : 'Purchase from Admin'}
                        </button>
                        {(levelInfo != null && (levelInfo.availableBalance ?? 0) < getUnpaidWholesaleTotal(orderItems)) && (
                          <p className="text-xs text-red-600">Insufficient balance. Deposit first.</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50/50">
                      <tr>
                        <th className="p-4 text-left text-xs font-semibold text-slate-500 uppercase">Product</th>
                        <th className="p-4 text-left text-xs font-semibold text-slate-500 uppercase w-20">Qty</th>
                        <th className="p-4 text-left text-xs font-semibold text-slate-500 uppercase">Unit Price</th>
                        <th className="p-4 text-right text-xs font-semibold text-slate-500 uppercase">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orderItems.map((item) => (
                        <tr key={item.id} className="border-t border-slate-100">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              {item.wholesaleCost != null && !item.sellerPaidToAdmin && (
                                <span className="shrink-0 px-1.5 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-medium rounded">Wholesale</span>
                              )}
                              <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-100 shrink-0">
                                {item.product?.images?.[0]?.imageUrl ? (
                                  <Image
                                    src={item.product.images[0].imageUrl}
                                    alt={item.product.title ?? ''}
                                    width={48}
                                    height={48}
                                    className="object-cover w-full h-full"
                                    unoptimized={item.product.images[0].imageUrl.startsWith('/api/')}
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
                                    No img
                                  </div>
                                )}
                              </div>
                              <span className="font-medium text-slate-900">{item.product?.title ?? '—'}</span>
                            </div>
                          </td>
                          <td className="p-4 text-slate-700">{item.quantity}</td>
                          <td className="p-4 text-slate-700">{formatPrice(item.price)}</td>
                          <td className="p-4 text-right font-semibold text-slate-900">
                            {formatPrice(item.price * item.quantity)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
