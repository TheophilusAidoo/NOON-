'use client';

import { usePathname } from 'next/navigation';
import Footer from './Footer';

/**
 * Shows full store footer on public/shop pages.
 * No footer on /admin and /seller dashboard pages.
 */
export default function ConditionalFooter() {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');
  const isSeller = pathname?.startsWith('/seller');
  const isDashboard = isAdmin || isSeller;

  // Hide footer on admin/seller dashboards
  if (isDashboard) return null;

  return <Footer />;
}
