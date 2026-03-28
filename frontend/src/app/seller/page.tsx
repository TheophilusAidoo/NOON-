'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/axios';
import { useFormatPrice } from '@/hooks/useFormatPrice';
import { useMediaQuery } from '@/hooks/useMediaQuery';
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

function StatCard({
  href,
  leading,
  borderClass,
  label,
  value,
  sub,
  extra,
}: {
  href?: string;
  leading: React.ReactNode;
  borderClass: string;
  label: string;
  value: React.ReactNode;
  sub?: string;
  extra?: React.ReactNode;
}) {
  const inner = (
    <>
      <div className="mt-0.5 shrink-0">{leading}</div>
      <div className="min-w-0 flex-1">
        <p className="text-[9px] font-medium uppercase leading-tight tracking-wide text-gray-500 sm:text-[10px]">
          {label}
        </p>
        <div className="mt-0.5 break-words text-base font-semibold tabular-nums text-gray-900 sm:text-lg">{value}</div>
        {sub ? (
          <p className="mt-0.5 line-clamp-2 text-[10px] leading-snug text-gray-600 sm:text-xs">{sub}</p>
        ) : null}
        {extra}
      </div>
    </>
  );

  const cardClass = `flex gap-2 rounded-lg border border-gray-200 bg-white p-2.5 transition sm:gap-3 sm:p-3 ${borderClass} ${
    href ? 'hover:bg-gray-50 active:bg-gray-100' : ''
  }`;

  if (href) {
    return (
      <Link href={href} className={cardClass}>
        {inner}
      </Link>
    );
  }
  return <div className={cardClass}>{inner}</div>;
}

export default function SellerDashboard() {
  const formatPrice = useFormatPrice();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const isNarrow = useMediaQuery('(max-width: 639px)');
  const isTablet = useMediaQuery('(max-width: 1023px)');

  useEffect(() => {
    api.get('/seller/dashboard').then((res) => setStats(res.data.data)).catch(() => {});
  }, []);

  if (!stats) {
    return (
      <div className="flex min-h-[240px] items-center justify-center px-2">
        <div className="animate-pulse text-sm text-gray-500 sm:text-base">Loading dashboard…</div>
      </div>
    );
  }

  const pieInner = isNarrow ? 22 : isTablet ? 30 : 35;
  const pieOuter = isNarrow ? 40 : isTablet ? 50 : 55;
  const chartH = isNarrow ? 200 : isTablet ? 220 : 240;
  const legendProps = {
    wrapperStyle: { fontSize: isNarrow ? 10 : 12, paddingTop: isNarrow ? 4 : 8 },
    layout: 'horizontal' as const,
    verticalAlign: 'bottom' as const,
    align: 'center' as const,
  };

  const barMargin = isNarrow
    ? { top: 4, right: 4, left: -12, bottom: 0 }
    : { top: 10, right: 10, left: 0, bottom: 0 };

  return (
    <div className="w-full max-w-[100vw] space-y-4 pb-[env(safe-area-inset-bottom,0px)] sm:space-y-5">
      <div>
        <h1 className="text-lg font-semibold text-gray-900 sm:text-xl">Dashboard</h1>
        <p className="mt-0.5 text-xs text-gray-500 sm:text-sm">Store performance</p>
      </div>

      {/* Stats — 1 col phone, 2 col small+, 3 lg, 6 xl */}
      <div className="grid grid-cols-1 min-[380px]:grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard
          href="/seller/products"
          leading={<HiCube className="h-4 w-4 text-amber-600 sm:h-5 sm:w-5" />}
          borderClass="border-l-4 border-l-amber-500"
          label="Products"
          value={stats.totalProducts}
          sub="Manage"
        />
        <StatCard
          href="/seller/orders"
          leading={<HiShoppingCart className="h-4 w-4 text-emerald-600 sm:h-5 sm:w-5" />}
          borderClass="border-l-4 border-l-emerald-500"
          label="Orders"
          value={stats.totalOrders}
          sub="View"
        />
        <StatCard
          href="/seller/withdrawals"
          leading={<HiCurrencyDollar className="h-4 w-4 text-emerald-600 sm:h-5 sm:w-5" />}
          borderClass="border-l-4 border-l-emerald-500"
          label="Revenue"
          value={formatPrice(stats.totalRevenue)}
          sub="Withdraw"
        />
        <StatCard
          href="/seller/orders"
          leading={<HiTrendingUp className="h-4 w-4 text-green-600 sm:h-5 sm:w-5" />}
          borderClass="border-l-4 border-l-green-500"
          label={isNarrow ? 'Profit' : 'Profit margin'}
          value={formatPrice(stats.accumulatedProfit ?? 0)}
          sub={isNarrow ? 'Wholesale %' : 'Profit % on wholesale'}
        />
        <StatCard
          leading={<HiStar className="h-4 w-4 text-amber-600 sm:h-5 sm:w-5" />}
          borderClass="border-l-4 border-l-amber-500"
          label="Credit"
          value={
            <>
              {stats.creditScore ?? 0}
              <span className="text-xs font-normal text-gray-400">/100</span>
            </>
          }
        />
        <StatCard
          href="/seller/deposits"
          leading={
            <span
              className={`flex h-7 w-7 items-center justify-center rounded text-xs font-bold text-white sm:h-8 sm:w-8 sm:text-sm ${
                LEVEL_COLORS[stats.storeLevel] || 'bg-gray-500'
              }`}
            >
              {stats.storeLevel || 'C'}
            </span>
          }
          borderClass="border-l-4 border-l-purple-500"
          label="Level"
          value={<span className="text-sm sm:text-base">{formatPrice(stats.cumulativeRecharge ?? 0)}</span>}
          sub="Recharged"
          extra={<p className="text-[10px] font-medium text-purple-600 sm:text-xs">Upgrade</p>}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2 lg:gap-4">
        <div className="min-w-0 rounded-lg border border-gray-200 bg-white p-2.5 sm:p-4">
          <h3 className="mb-2 text-xs font-semibold text-gray-800 sm:text-sm">Orders & revenue (6 mo.)</h3>
          <div className="w-full overflow-x-auto overscroll-x-contain" style={{ WebkitOverflowScrolling: 'touch' }}>
            <div className="min-w-[280px] sm:min-w-0" style={{ height: chartH }}>
              {stats.ordersByMonth && stats.ordersByMonth.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.ordersByMonth} margin={barMargin}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="month" tick={{ fontSize: isNarrow ? 9 : 12 }} stroke="#9ca3af" interval={0} angle={isNarrow ? -35 : 0} textAnchor={isNarrow ? 'end' : 'middle'} height={isNarrow ? 48 : 30} />
                    <YAxis yAxisId="left" tick={{ fontSize: isNarrow ? 9 : 12 }} stroke="#9ca3af" width={isNarrow ? 28 : 36} />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      tick={{ fontSize: isNarrow ? 9 : 12 }}
                      stroke="#9ca3af"
                      width={isNarrow ? 36 : 44}
                      tickFormatter={(v) => `${v >= 1000 ? (v / 1000).toFixed(1) + 'k' : v}`}
                    />
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
                <div className="flex h-full items-center justify-center text-xs text-gray-400 sm:text-sm">No order data yet</div>
              )}
            </div>
          </div>
        </div>

        <div className="min-w-0 rounded-lg border border-gray-200 bg-white p-2.5 sm:p-4">
          <h3 className="mb-2 text-xs font-semibold text-gray-800 sm:text-sm">Sales by category</h3>
          <div style={{ height: chartH }}>
            {stats.salesByCategory && stats.salesByCategory.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart margin={{ top: 0, right: 0, bottom: isNarrow ? 8 : 0, left: 0 }}>
                  <Pie
                    data={stats.salesByCategory}
                    cx="50%"
                    cy="50%"
                    innerRadius={pieInner}
                    outerRadius={pieOuter}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {stats.salesByCategory.map((_, index) => (
                      <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => [formatPrice(value), 'Revenue']} />
                  <Legend {...legendProps} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-xs text-gray-400 sm:text-sm">No sales by category yet</div>
            )}
          </div>
        </div>

        <div className="min-w-0 rounded-lg border border-gray-200 bg-white p-2.5 sm:p-4 lg:col-span-2">
          <h3 className="mb-2 text-xs font-semibold text-gray-800 sm:text-sm">Orders by status</h3>
          <div className="mx-auto max-w-md lg:max-w-none" style={{ height: chartH }}>
            {stats.ordersByStatus && stats.ordersByStatus.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart margin={{ top: 0, right: 0, bottom: isNarrow ? 8 : 0, left: 0 }}>
                  <Pie
                    data={stats.ordersByStatus}
                    cx="50%"
                    cy="50%"
                    innerRadius={pieInner}
                    outerRadius={pieOuter}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {stats.ordersByStatus.map((_, index) => (
                      <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend {...legendProps} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-xs text-gray-400 sm:text-sm">No orders yet</div>
            )}
          </div>
        </div>
      </div>

      {/* Recent orders */}
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        <div className="flex items-center justify-between gap-2 border-b border-gray-200 px-3 py-2.5 sm:px-4">
          <h2 className="text-sm font-semibold text-gray-800">Recent orders</h2>
          <Link
            href="/seller/orders"
            className="flex shrink-0 items-center gap-0.5 text-xs font-medium text-amber-600 hover:underline"
          >
            View all <HiExternalLink className="h-3 w-3" />
          </Link>
        </div>
        <div className="divide-y divide-gray-100">
          {stats.recentOrders && stats.recentOrders.length > 0 ? (
            stats.recentOrders.slice(0, 5).map((o) => (
              <div
                key={o.id}
                className="flex flex-col gap-1.5 px-3 py-3 text-sm hover:bg-gray-50 sm:flex-row sm:items-center sm:justify-between sm:px-4 sm:py-2.5"
              >
                <div className="min-w-0">
                  <p className="font-medium leading-snug text-gray-900">
                    <span className="line-clamp-2 sm:line-clamp-1">
                      {o.product?.title ?? 'Product'} × {o.quantity}
                    </span>
                  </p>
                  <p className="text-xs text-gray-500">{o.order?.user?.name ?? 'Customer'}</p>
                </div>
                <p className="shrink-0 text-base font-semibold tabular-nums text-emerald-600 sm:text-sm">
                  {formatPrice(o.price * (o.quantity || 1))}
                </p>
              </div>
            ))
          ) : (
            <div className="px-4 py-8 text-center">
              <HiShoppingCart className="mx-auto mb-2 h-10 w-10 text-gray-300" />
              <p className="text-sm text-gray-500">No orders yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
