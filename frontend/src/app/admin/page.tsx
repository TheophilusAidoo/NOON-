'use client';

import { useEffect, useState } from 'react';
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
  HiUsers,
  HiShoppingCart,
  HiCurrencyDollar,
  HiUserAdd,
  HiCube,
  HiUserGroup,
  HiFolder,
  HiTag,
  HiTrendingUp,
  HiClock,
} from 'react-icons/hi';

type Stats = {
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  pendingSellers: number;
  totalProducts: number;
  totalSellers?: number;
  totalCategories?: number;
  totalBrands?: number;
  ordersByMonth?: Array<{ month: string; orders: number; revenue: number }>;
  productsByCategory?: Array<{ name: string; count: number }>;
  usersByRole?: Array<{ name: string; value: number }>;
  recentOrders?: Array<{
    id: string;
    totalAmount: number;
    orderStatus?: string;
    createdAt: string;
    user?: { name: string; email: string };
    items?: unknown[];
  }>;
};

const StatCard = ({
  title,
  value,
  icon: Icon,
  color,
  subtitle,
}: {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  subtitle?: string;
}) => (
  <div className={`bg-white rounded-xl shadow-sm border overflow-hidden ${color}`}>
    <div className="p-5 flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">{title}</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
      <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-white/80 shadow-sm">
        <Icon className="w-6 h-6 text-gray-700" />
      </div>
    </div>
  </div>
);

export default function AdminDashboard() {
  const formatPrice = useFormatPrice();
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    api.get('/admin/dashboard').then((res) => setStats(res.data.data)).catch(() => {});
  }, []);

  if (!stats) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse text-gray-400">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-0.5">Overview of your Rakuten store performance</p>
      </div>

      {/* Main KPIs */}
      <section>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Key Metrics</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Users"
            value={stats.totalUsers}
            icon={HiUsers}
            color="border border-gray-200"
            subtitle="Registered accounts"
          />
          <StatCard
            title="Total Orders"
            value={stats.totalOrders}
            icon={HiShoppingCart}
            color="border border-gray-200"
            subtitle="All time"
          />
          <StatCard
            title="Revenue"
            value={formatPrice(stats.totalRevenue)}
            icon={HiCurrencyDollar}
            color="border-l-4 border-l-green-500 border border-gray-200"
            subtitle="Paid orders only"
          />
          <StatCard
            title="Pending Sellers"
            value={stats.pendingSellers}
            icon={HiUserAdd}
            color={stats.pendingSellers > 0 ? 'border-l-4 border-l-amber-500 border border-gray-200' : 'border border-gray-200'}
            subtitle={stats.pendingSellers > 0 ? 'Awaiting approval' : 'All caught up'}
          />
        </div>
      </section>

      {/* Catalog & Sellers Summary */}
      <section>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Catalog & Sellers</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-5 border border-amber-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
                <HiCube className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.totalProducts ?? 0}</p>
                <p className="text-xs font-medium text-amber-700">Products</p>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <HiUserGroup className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.totalSellers ?? 0}</p>
                <p className="text-xs font-medium text-blue-700">Active Sellers</p>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-5 border border-emerald-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                <HiFolder className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.totalCategories ?? 0}</p>
                <p className="text-xs font-medium text-emerald-700">Categories</p>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl p-5 border border-purple-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                <HiTag className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.totalBrands ?? 0}</p>
                <p className="text-xs font-medium text-purple-700">Brands</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Charts */}
      <section>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Charts</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 mb-4">Orders & Revenue (Last 6 Months)</h3>
            <div className="h-64">
              {(!stats.ordersByMonth || stats.ordersByMonth.length === 0) ? (
                <div className="h-full flex items-center justify-center text-gray-400 text-sm">No order data yet</div>
              ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.ordersByMonth ?? []} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                  <YAxis yAxisId="left" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} stroke="#9ca3af" tickFormatter={(v) => `$${v}`} />
                  <Tooltip
                    formatter={(value: number, name: string) =>
                      [name?.includes('Revenue') || name === 'revenue' ? formatPrice(value) : value, name]
                    }
                  />
                  <Bar yAxisId="left" dataKey="orders" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Orders" />
                  <Bar yAxisId="right" dataKey="revenue" fill="#10b981" radius={[4, 4, 0, 0]} name="Revenue ($)" />
                </BarChart>
              </ResponsiveContainer>
              )}
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 mb-4">Users by Role</h3>
            <div className="h-64">
              {(!stats.usersByRole || stats.usersByRole.every((r) => r.value === 0)) ? (
                <div className="h-full flex items-center justify-center text-gray-400 text-sm">No users yet</div>
              ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.usersByRole ?? []}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {(stats.usersByRole ?? []).map((_, index) => (
                      <Cell key={index} fill={['#f59e0b', '#3b82f6', '#10b981'][index % 3]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => [value, 'Users']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
              )}
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 lg:col-span-2">
            <h3 className="font-semibold text-gray-900 mb-4">Products by Category</h3>
            <div className="h-64">
              {(!stats.productsByCategory || stats.productsByCategory.length === 0) ? (
                <div className="h-full flex items-center justify-center text-gray-400 text-sm">No products in categories yet</div>
              ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={stats.productsByCategory ?? []}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 60, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis type="number" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                  <YAxis type="category" dataKey="name" width={55} tick={{ fontSize: 11 }} stroke="#9ca3af" />
                  <Tooltip />
                  <Bar dataKey="count" fill="#8b5cf6" radius={[0, 4, 4, 0]} name="Products" />
                </BarChart>
              </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Revenue infographic */}
      <section>
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center">
                <HiTrendingUp className="w-8 h-8" />
              </div>
              <div>
                <p className="text-green-100 text-sm font-medium">Total Revenue</p>
                <p className="text-3xl font-bold">{formatPrice(stats.totalRevenue)}</p>
                <p className="text-green-200 text-xs mt-0.5">From {stats.totalOrders} orders</p>
              </div>
            </div>
            <div className="flex gap-4 text-center">
              <div>
                <p className="text-2xl font-bold">{stats.totalOrders}</p>
                <p className="text-green-200 text-xs">Orders</p>
              </div>
              <div className="w-px bg-green-400/50" />
              <div>
                <p className="text-2xl font-bold">
                  {stats.totalOrders > 0 ? formatPrice(stats.totalRevenue / stats.totalOrders) : formatPrice(0)}
                </p>
                <p className="text-green-200 text-xs">Avg Order</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Orders */}
      <section>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
            <HiClock className="w-5 h-5 text-amber-500" />
            <h2 className="font-semibold text-gray-900">Recent Orders</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {stats.recentOrders?.length ? (
              stats.recentOrders.slice(0, 8).map((o) => (
                <div
                  key={o.id}
                  className="flex items-center justify-between px-6 py-4 hover:bg-gray-50/50 transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                      <HiShoppingCart className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {o.user?.name ?? 'Guest'} <span className="text-gray-400 font-normal">· #{o.id?.slice(-8)}</span>
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(o.createdAt).toLocaleDateString()} · {o.orderStatus ?? 'Processing'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-600">{formatPrice(o.totalAmount)}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-6 py-12 text-center">
                <HiShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">No orders yet</p>
                <p className="text-sm text-gray-400 mt-1">Orders will appear here when customers make purchases</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
