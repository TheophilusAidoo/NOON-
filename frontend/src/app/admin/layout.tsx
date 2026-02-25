'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAppSelector } from '@/store/hooks';
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
} from 'react-icons/hi';

const linkIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  '/admin': HiChartBar,
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
    links: [{ href: '/admin', label: 'Dashboard' }],
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

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="w-72 shrink-0 flex flex-col bg-white border-r border-slate-200">
        {/* Header */}
        <div className="h-16 flex items-center gap-3 px-6 border-b border-slate-100">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-sm">
            <HiChartBar className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-slate-900 text-sm">Admin Panel</h1>
            <p className="text-xs text-slate-500">Rakuten</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-4">
          {NAV_GROUPS.map((group) => (
            <div key={group.label} className="mb-6 last:mb-0">
              <p className="px-3 mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
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
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-amber-50 text-amber-700 ring-1 ring-amber-200/60'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      {Icon && <Icon className="w-5 h-5 shrink-0 opacity-80" />}
                      {link.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100">
          <Link
            href="/"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition"
          >
            <HiHome className="w-4 h-4" />
            Back to Store
          </Link>
        </div>
      </aside>
      <main className="flex-1 overflow-auto min-w-0">
        <div className="p-6 lg:p-8 w-full">{children}</div>
      </main>
    </div>
  );
}
