'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAppSelector } from '@/store/hooks';
import DashboardShell from '@/components/DashboardShell';
import {
  HiChartBar,
  HiUserGroup,
  HiFolder,
  HiTag,
  HiCube,
  HiShoppingCart,
  HiTicket,
  HiPhotograph,
  HiCog,
  HiCash,
  HiChat,
  HiCreditCard,
  HiHome,
  HiMail,
  HiUser,
} from 'react-icons/hi';

const linkIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  '/admin': HiChartBar,
  '/admin/users': HiUser,
  '/admin/sellers': HiUserGroup,
  '/admin/deposits': HiCash,
  '/admin/withdrawals': HiCreditCard,
  '/admin/payment-methods': HiCreditCard,
  '/admin/categories': HiFolder,
  '/admin/brands': HiTag,
  '/admin/products': HiCube,
  '/admin/orders': HiShoppingCart,
  '/admin/coupons': HiTicket,
  '/admin/banners': HiPhotograph,
  '/admin/settings': HiCog,
  '/admin/newsletter': HiMail,
  '/admin/chat': HiChat,
};

const NAV_GROUPS = [
  {
    label: 'Overview',
    links: [
      { href: '/admin', label: 'Dashboard' },
      { href: '/admin/users', label: 'Users' },
    ],
  },
  {
    label: 'Commerce',
    links: [
      { href: '/admin/orders', label: 'Orders' },
      { href: '/admin/coupons', label: 'Coupons' },
      { href: '/admin/payment-methods', label: 'Payment Methods' },
    ],
  },
  {
    label: 'Catalog',
    links: [
      { href: '/admin/categories', label: 'Categories' },
      { href: '/admin/brands', label: 'Brands' },
      { href: '/admin/products', label: 'Products' },
    ],
  },
  {
    label: 'Sellers',
    links: [
      { href: '/admin/sellers', label: 'Sellers' },
      { href: '/admin/deposits', label: 'Deposits' },
      { href: '/admin/withdrawals', label: 'Withdrawals' },
    ],
  },
  {
    label: 'Marketing',
    links: [
      { href: '/admin/banners', label: 'Website Banners' },
      { href: '/admin/newsletter', label: 'Newsletter Subscribers' },
    ],
  },
  {
    label: 'System',
    links: [
      { href: '/admin/settings', label: 'Settings' },
      { href: '/admin/chat', label: 'Chat' },
    ],
  },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, initialized } = useAppSelector((s) => s.auth);

  useEffect(() => {
    if (!initialized) return;
    if (!user) {
      router.replace('/login?redirect=/admin');
      return;
    }
    if (user.role !== 'ADMIN') {
      router.replace('/');
    }
  }, [user, initialized, router]);

  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-slate-500 animate-pulse">Loading...</div>
      </div>
    );
  }
  if (!user || user.role !== 'ADMIN') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-slate-500">Redirecting...</div>
      </div>
    );
  }

  const sidebar = (
    <>
      <div className="flex h-16 shrink-0 items-center gap-3 border-b border-slate-100 px-4 sm:px-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 shadow-sm">
          <HiChartBar className="h-5 w-5 text-white" />
        </div>
        <div className="min-w-0">
          <h1 className="text-sm font-bold text-slate-900">Admin Panel</h1>
          <p className="text-xs text-slate-500">Rakuten</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 sm:px-4">
        {NAV_GROUPS.map((group) => (
          <div key={group.label} className="mb-6 last:mb-0">
            <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.links.map((link) => {
                const Icon = linkIcons[link.href];
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-amber-50 text-amber-700 ring-1 ring-amber-200/60'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    {Icon && <Icon className="h-5 w-5 shrink-0 opacity-80" />}
                    <span className="min-w-0 truncate">{link.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="shrink-0 border-t border-slate-100 p-4">
        <Link
          href="/"
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-500 transition hover:bg-slate-50 hover:text-slate-700"
        >
          <HiHome className="h-4 w-4 shrink-0" />
          Back to Store
        </Link>
      </div>
    </>
  );

  return (
    <DashboardShell menuTitle="Admin" sidebar={sidebar}>
      {children}
    </DashboardShell>
  );
}
