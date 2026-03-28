'use client';

import Link from 'next/link';
import { HiChevronRight } from 'react-icons/hi';

type Props = {
  title: string;
  seeAllHref: string;
  icon?: React.ReactNode;
  middleContent?: React.ReactNode;
};

export default function SectionBanner({ title, seeAllHref, icon, middleContent }: Props) {
  return (
    <div
      className="mb-4 rounded-lg px-3 py-3 sm:px-4"
      style={{ backgroundColor: '#e61502' }}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-4">
        <div className="flex min-w-0 items-center justify-between gap-3 sm:justify-start">
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            {icon && (
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-400 text-amber-900 sm:h-10 sm:w-10 [&>svg]:h-5 [&>svg]:w-5 sm:[&>svg]:h-6 sm:[&>svg]:w-6">
                {icon}
              </div>
            )}
            <h2 className="min-w-0 text-base font-bold leading-tight text-white sm:text-lg">{title}</h2>
          </div>
          <Link
            href={seeAllHref}
            className="flex shrink-0 items-center gap-0.5 text-sm font-semibold text-white transition-colors hover:text-amber-200 hover:underline hover:underline-offset-2 sm:hidden"
          >
            See All
            <HiChevronRight className="h-4 w-4" />
          </Link>
        </div>
        {middleContent ? (
          <div className="min-w-0 sm:flex sm:flex-1 sm:justify-center lg:flex-[unset]">{middleContent}</div>
        ) : null}
        <Link
          href={seeAllHref}
          className="hidden shrink-0 items-center gap-1 text-sm font-semibold text-white transition-colors hover:text-amber-200 hover:underline hover:underline-offset-2 sm:flex sm:text-base"
        >
          See All
          <HiChevronRight className="h-5 w-5" />
        </Link>
      </div>
    </div>
  );
}
