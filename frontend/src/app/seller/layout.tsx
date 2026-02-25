'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAppSelector } from '@/store/hooks';
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

  if (!user) return <div className="p-6">Loading...</div>;
  if (user.role !== 'SELLER' || !user.isApproved) {
    return (
      <div className="max-w-md mx-auto p-6 text-center">
        <p>Your seller account is pending approval.</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="w-72 shrink-0 flex flex-col bg-white border-r border-slate-200">
        {/* Header */}
        <div className="h-16 flex items-center gap-3 px-6 border-b border-slate-100">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-sm">
            <HiChartBar className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-slate-900 text-sm">Seller Panel</h1>
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
                  const Icon = link.icon;
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/60'
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
