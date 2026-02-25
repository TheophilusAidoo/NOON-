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
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="h-14 px-4 sm:px-6 flex items-center justify-between max-w-[1920px] mx-auto">
          <Link
            href={isAdmin ? '/admin' : '/seller'}
            className={`flex items-center gap-2 font-bold text-lg ${c.brand} ${c.brandHover} transition`}
          >
            <span>Rakuten</span>
            <span className="text-slate-500 font-medium text-base">
              {isAdmin ? 'Admin' : 'Seller'}
            </span>
          </Link>

          <div className="flex items-center gap-1 sm:gap-2">
            <Link
              href="/"
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm ${c.link} transition`}
            >
              <HiHome className="w-4 h-4" />
              <span>View Store</span>
            </Link>
            <div className="w-px h-5 bg-slate-200" aria-hidden />
            <div className="flex items-center gap-2 px-3 py-2">
              <HiUser className="w-4 h-4 text-slate-400" />
              <span className="text-sm text-slate-600 truncate max-w-[120px] sm:max-w-[180px]">
                {user?.name}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm ${c.link} transition`}
            >
              <HiLogout className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>
    );
  }

  return <Header />;
}
