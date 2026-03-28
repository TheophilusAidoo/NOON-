'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { HiMenu } from 'react-icons/hi';

type Props = {
  /** Shown next to the hamburger on small screens */
  menuTitle: string;
  sidebar: React.ReactNode;
  children: React.ReactNode;
};

/**
 * Responsive shell: sidebar is a fixed drawer on &lt; lg, full-height column on desktop.
 */
export default function DashboardShell({ menuTitle, sidebar, children }: Props) {
  const [navOpen, setNavOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setNavOpen(false);
  }, [pathname]);

  return (
    <div className="flex flex-1 min-h-0 min-w-0 w-full bg-slate-50">
      {/* Mobile backdrop */}
      {navOpen ? (
        <button
          type="button"
          aria-label="Close navigation menu"
          className="fixed bottom-0 left-0 right-0 top-14 z-40 bg-slate-900/50 backdrop-blur-[1px] lg:hidden"
          onClick={() => setNavOpen(false)}
        />
      ) : null}

      <aside
        id="dashboard-sidebar"
        className={[
          'fixed bottom-0 left-0 top-14 z-50 flex w-[min(18rem,92vw)] max-w-[20rem] flex-col border-r border-slate-200 bg-white shadow-2xl transition-transform duration-200 ease-out',
          'lg:static lg:top-auto lg:min-h-0 lg:max-w-none lg:w-72 lg:shrink-0 lg:shadow-none',
          navOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        ].join(' ')}
      >
        {sidebar}
      </aside>

      <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <div className="flex shrink-0 items-center gap-3 border-b border-slate-200 bg-white/95 px-3 py-2.5 backdrop-blur-sm lg:hidden">
          <button
            type="button"
            onClick={() => setNavOpen(true)}
            className="rounded-lg p-2 text-slate-700 hover:bg-slate-100"
            aria-expanded={navOpen}
            aria-controls="dashboard-sidebar"
          >
            <HiMenu className="h-6 w-6" />
          </button>
          <span className="text-sm font-semibold text-slate-900">{menuTitle}</span>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-3 py-3 sm:px-5 sm:py-5 lg:px-8 lg:py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
