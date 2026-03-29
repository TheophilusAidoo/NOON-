'use client';

import { useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAppSelector } from '@/store/hooks';
import DashboardShell from '@/components/DashboardShell';
import {
  HiChartBar,
  HiCube,
  HiShoppingCart,
  HiCurrencyDollar,
  HiCash,
  HiChat,
  HiCog,
  HiHome,
} from 'react-icons/hi';

const NAV_GROUPS = [
  {
    label: 'Overview',
    links: [{ href: '/seller', label: 'Dashboard', icon: HiChartBar }],
  },
  {
    label: 'Business',
    links: [
      { href: '/seller/products', label: 'Products', icon: HiCube },
      { href: '/seller/orders', label: 'Orders', icon: HiShoppingCart },
    ],
  },
  {
    label: 'Finance',
    links: [
      { href: '/seller/deposits', label: 'Deposit / Recharge', icon: HiCash },
      { href: '/seller/withdrawals', label: 'Withdrawals', icon: HiCurrencyDollar },
    ],
  },
  {
    label: 'Support & Account',
    links: [
      { href: '/seller/chat', label: 'Chat with Us', icon: HiChat },
      { href: '/seller/settings', label: 'Settings', icon: HiCog },
    ],
  },
];

export default function SellerLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAppSelector((s) => s.auth);

  useEffect(() => {
    if (user && (user.role !== 'SELLER' || !user.isApproved)) {
      router.push('/');
    }
  }, [user, router]);

  const mobileMenuTitle = useMemo(() => {
    if (pathname === '/seller') return 'Dashboard';
    const flat = NAV_GROUPS.flatMap((g) => g.links);
    const exact = flat.find((l) => pathname === l.href);
    if (exact) return exact.label;
    const prefix = flat
      .filter((l) => l.href !== '/seller')
      .sort((a, b) => b.href.length - a.href.length)
      .find((l) => pathname.startsWith(l.href));
    return prefix?.label ?? 'Seller';
  }, [pathname]);

  if (!user) {
    return (
      <div className="flex min-h-[40vh] flex-1 items-center justify-center p-6 text-slate-500">Loading...</div>
    );
  }
  if (user.role !== 'SELLER' || !user.isApproved) {
    return (
      <div className="mx-auto max-w-md px-4 py-10 text-center text-sm text-slate-600 sm:text-base">
        <p>Your seller account is pending approval.</p>
      </div>
    );
  }

  const sidebar = (
    <>
      <div className="flex h-16 shrink-0 items-center gap-3 border-b border-slate-100 px-4 sm:px-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 shadow-sm">
          <HiChartBar className="h-5 w-5 text-white" />
        </div>
        <div className="min-w-0">
          <h1 className="text-sm font-bold text-slate-900">Seller Panel</h1>
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
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex min-h-[44px] items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/60'
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
    <DashboardShell menuTitle={mobileMenuTitle} sidebar={sidebar}>
      {children}
    </DashboardShell>
  );
}
