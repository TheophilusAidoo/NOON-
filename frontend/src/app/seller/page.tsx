'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/axios';
import { useFormatPrice } from '@/hooks/useFormatPrice';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import {
  HiCube,
  HiShoppingCart,
  HiCurrencyDollar,
  HiTrendingUp,
  HiStar,
  HiExternalLink,
} from 'react-icons/hi';

type DashboardStats = {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  accumulatedProfit?: number;
  creditScore: number;
  storeLevel: string;
  cumulativeRecharge: number;
  recentOrders?: Array<{
    id: string;
    product?: { title: string };
    quantity: number;
    price: number;
    order?: { user?: { name: string }; createdAt?: string };
  }>;
  ordersByMonth?: Array<{ month: string; orders: number; revenue: number }>;
  salesByCategory?: Array<{ name: string; value: number }>;
  ordersByStatus?: Array<{ name: string; value: number }>;
};

const LEVEL_COLORS: Record<string, string> = {
  C: 'bg-amber-500',
  B: 'bg-emerald-500',
  A: 'bg-blue-500',
  S: 'bg-purple-500',
};

const CHART_COLORS = ['#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#f97316'];

export default function SellerDashboard() {
  const formatPrice = useFormatPrice();
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    api.get('/seller/dashboard').then((res) => setStats(res.data.data)).catch(() => {});
  }, []);

  if (!stats) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="animate-pulse text-gray-500">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-5">
      <div>
        <h1 className="text-lg font-semibold text-gray-900">Dashboard</h1>
        <p className="text-xs text-gray-500 mt-0.5">Store performance</p>
      </div>

      {/* Stats - compact flat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <Link href="/seller/products" className="flex gap-3 p-3 bg-white border-l-4 border-l-amber-500 rounded border border-gray-200 hover:bg-gray-50 transition">
          <HiCube className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="min-w-0">
            <p className="text-[10px] uppercase text-gray-500">Products</p>
            <p className="text-lg font-semibold text-gray-900">{stats.totalProducts}</p>
            <p className="text-xs text-amber-600">Manage</p>
          </div>
        </Link>
        <Link href="/seller/orders" className="flex gap-3 p-3 bg-white border-l-4 border-l-emerald-500 rounded border border-gray-200 hover:bg-gray-50 transition">
          <HiShoppingCart className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="min-w-0">
            <p className="text-[10px] uppercase text-gray-500">Orders</p>
            <p className="text-lg font-semibold text-gray-900">{stats.totalOrders}</p>
            <p className="text-xs text-emerald-600">View</p>
          </div>
        </Link>
        <Link href="/seller/withdrawals" className="flex gap-3 p-3 bg-white border-l-4 border-l-emerald-500 rounded border border-gray-200 hover:bg-gray-50 transition">
          <HiCurrencyDollar className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="min-w-0">
            <p className="text-[10px] uppercase text-gray-500">Revenue</p>
            <p className="text-lg font-semibold text-gray-900">{formatPrice(stats.totalRevenue)}</p>
            <p className="text-xs text-emerald-600">Withdraw</p>
          </div>
        </Link>
        <Link href="/seller/orders" className="flex gap-3 p-3 bg-white border-l-4 border-l-green-500 rounded border border-gray-200 hover:bg-gray-50 transition">
          <HiTrendingUp className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
          <div className="min-w-0">
            <p className="text-[10px] uppercase text-gray-500">Profit Margin</p>
            <p className="text-lg font-semibold text-gray-900">{formatPrice(stats.accumulatedProfit ?? 0)}</p>
            <p className="text-xs text-green-600">Profit % on wholesale</p>
          </div>
        </Link>
        <div className="flex gap-3 p-3 bg-white border-l-4 border-l-amber-500 rounded border border-gray-200">
          <HiStar className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="min-w-0">
            <p className="text-[10px] uppercase text-gray-500">Credit</p>
            <p className="text-lg font-semibold text-gray-900">{stats.creditScore ?? 0}<span className="text-xs text-gray-400">/100</span></p>
          </div>
        </div>
        <Link href="/seller/deposits" className="flex gap-3 p-3 bg-white border-l-4 border-l-purple-500 rounded border border-gray-200 hover:bg-gray-50 transition">
          <span className={`w-8 h-8 rounded flex items-center justify-center text-white font-bold text-sm shrink-0 ${LEVEL_COLORS[stats.storeLevel] || 'bg-gray-500'}`}>
            {stats.storeLevel || 'C'}
          </span>
          <div className="min-w-0">
            <p className="text-[10px] uppercase text-gray-500">Level</p>
            <p className="text-xs font-medium text-gray-700">Recharged {formatPrice(stats.cumulativeRecharge ?? 0)}</p>
            <p className="text-xs text-purple-600">Upgrade</p>
          </div>
        </Link>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded border border-gray-200 p-4">
          <h3 className="text-sm font-semibold text-gray-800 mb-2">Orders & Revenue (6 Months)</h3>
          <div className="h-48">
            {stats.ordersByMonth && stats.ordersByMonth.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.ordersByMonth} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                  <YAxis yAxisId="left" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} stroke="#9ca3af" tickFormatter={(v) => `${v >= 1000 ? (v/1000).toFixed(1)+'k' : v}`} />
                  <Tooltip
                    formatter={(value: number, name: string) =>
                      [name === 'revenue' ? formatPrice(value) : value, name === 'revenue' ? 'Revenue' : 'Orders']
                    }
                  />
                  <Bar yAxisId="left" dataKey="orders" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Orders" />
                  <Bar yAxisId="right" dataKey="revenue" fill="#10b981" radius={[4, 4, 0, 0]} name="Revenue" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400 text-sm">No order data yet</div>
            )}
          </div>
        </div>

        <div className="bg-white rounded border border-gray-200 p-4">
          <h3 className="text-sm font-semibold text-gray-800 mb-2">Sales by Category</h3>
          <div className="h-48">
            {stats.salesByCategory && stats.salesByCategory.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.salesByCategory}
                    cx="50%"
                    cy="50%"
                    innerRadius={35}
                    outerRadius={55}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {stats.salesByCategory.map((_, index) => (
                      <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => [formatPrice(value), 'Revenue']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400 text-sm">No sales by category yet</div>
            )}
          </div>
        </div>

        <div className="bg-white rounded border border-gray-200 p-4 lg:col-span-2">
          <h3 className="text-sm font-semibold text-gray-800 mb-2">Orders by Status</h3>
          <div className="h-48">
            {stats.ordersByStatus && stats.ordersByStatus.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.ordersByStatus}
                    cx="50%"
                    cy="50%"
                    innerRadius={35}
                    outerRadius={55}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {stats.ordersByStatus.map((_, index) => (
                      <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400 text-sm">No orders yet</div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded border border-gray-200 overflow-hidden">
        <div className="px-4 py-2 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-800">Recent Orders</h2>
          <Link href="/seller/orders" className="text-xs text-amber-600 hover:underline flex items-center gap-0.5">
            View all <HiExternalLink className="w-3 h-3" />
          </Link>
        </div>
        <div className="divide-y divide-gray-100">
          {stats.recentOrders && stats.recentOrders.length > 0 ? (
            stats.recentOrders.slice(0, 5).map((o) => (
              <div key={o.id} className="flex items-center justify-between px-4 py-2.5 text-sm hover:bg-gray-50">
                <div>
                  <p className="font-medium text-gray-900 truncate">{o.product?.title ?? 'Product'} × {o.quantity}</p>
                  <p className="text-xs text-gray-500">{o.order?.user?.name ?? 'Customer'}</p>
                </div>
                <p className="font-semibold text-emerald-600 text-sm">{formatPrice(o.price * (o.quantity || 1))}</p>
              </div>
            ))
          ) : (
            <div className="px-4 py-8 text-center">
              <HiShoppingCart className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No orders yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
