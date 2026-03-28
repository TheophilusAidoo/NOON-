'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAppSelector } from '@/store/hooks';

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAppSelector((s) => s.auth);

  useEffect(() => {
    if (!user) router.push('/login');
  }, [user, router]);

  if (!user) return null;

  const links = [
    { href: '/account', label: 'Profile' },
    { href: '/account/orders', label: 'Orders' },
    { href: '/account/wishlist', label: 'Wishlist' },
  ];

  return (
    <div className="mx-auto max-w-6xl px-3 py-4 sm:px-4 sm:py-6 md:px-6">
      <h1 className="mb-4 text-xl font-bold sm:mb-6 sm:text-2xl">My Account</h1>
      <div className="flex flex-col gap-3 sm:gap-6 md:flex-row md:items-start">
        <aside className="w-full shrink-0 md:w-56">
          <nav className="flex gap-4 overflow-x-auto scroll-smooth pb-2 -mx-1 px-1 md:flex-col md:gap-1 md:overflow-visible md:rounded-lg md:bg-white md:p-2 md:shadow md:pb-0">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition md:rounded-lg md:px-4 md:py-3 ${
                  pathname === link.href
                    ? 'bg-amber-500 text-white'
                    : 'bg-white text-gray-700 shadow-sm ring-1 ring-gray-200 hover:bg-gray-50 md:bg-transparent md:shadow-none md:ring-0'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </aside>
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
