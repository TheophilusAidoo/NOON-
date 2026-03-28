'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { logout } from '@/store/slices/authSlice';
import { useRouter } from 'next/navigation';
import { HiHome, HiLogout, HiUser } from 'react-icons/hi';
import Header from './Header';

/**
 * Shows full store header on public/shop pages.
 * Shows minimal dashboard header on /admin and /seller.
 */
export default function ConditionalHeader() {
  const pathname = usePathname();
  const { user } = useAppSelector((s) => s.auth);
  const dispatch = useAppDispatch();
  const router = useRouter();

  const isAdmin = pathname?.startsWith('/admin');
  const isSeller = pathname?.startsWith('/seller');
  const isDashboard = isAdmin || isSeller;

  const handleLogout = () => {
    dispatch(logout());
    router.push('/');
  };

  if (isDashboard) {
    const accent = isAdmin ? 'amber' : 'emerald';
    const accentColors = {
      amber: {
        brand: 'text-amber-600',
        brandHover: 'hover:text-amber-700',
        link: 'text-slate-600 hover:text-slate-900',
      },
      emerald: {
        brand: 'text-emerald-600',
        brandHover: 'hover:text-emerald-700',
        link: 'text-slate-600 hover:text-slate-900',
      },
    };
    const c = accentColors[accent];

    return (
      <header className="shrink-0 border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto flex h-14 max-w-[1920px] items-center justify-between gap-2 px-3 sm:px-6">
          <Link
            href={isAdmin ? '/admin' : '/seller'}
            className={`flex min-w-0 items-center gap-1.5 text-base font-bold sm:gap-2 sm:text-lg ${c.brand} ${c.brandHover} transition`}
          >
            <span className="truncate">Rakuten</span>
            <span className="font-medium text-slate-500 text-xs sm:text-base">
              {isAdmin ? 'Admin' : 'Seller'}
            </span>
          </Link>

          <div className="flex shrink-0 items-center gap-0.5 sm:gap-2">
            <Link
              href="/"
              className={`flex items-center gap-1 rounded-lg px-2 py-2 text-sm sm:gap-1.5 sm:px-3 ${c.link} transition`}
              title="View store"
            >
              <HiHome className="h-4 w-4 shrink-0" />
              <span className="hidden sm:inline">View Store</span>
            </Link>
            <div className="hidden h-5 w-px bg-slate-200 sm:block" aria-hidden />
            <div className="hidden max-w-[100px] items-center gap-1.5 px-1 sm:flex sm:max-w-[160px] md:max-w-[200px]">
              <HiUser className="h-4 w-4 shrink-0 text-slate-400" />
              <span className="truncate text-sm text-slate-600">{user?.name}</span>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className={`flex items-center gap-1 rounded-lg px-2 py-2 text-sm sm:gap-1.5 sm:px-3 ${c.link} transition`}
            >
              <HiLogout className="h-4 w-4 shrink-0" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>
    );
  }

  return <Header />;
}
