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
    <div className="flex flex-wrap items-center justify-between gap-4 px-4 py-3 rounded-lg mb-4" style={{ backgroundColor: '#e61502' }}>
      <div className="flex items-center gap-3">
        {icon && (
          <div className="w-10 h-10 rounded-lg bg-amber-400 flex items-center justify-center shrink-0 text-amber-900">
            {icon}
          </div>
        )}
        <h2 className="text-lg font-bold text-white">{title}</h2>
      </div>
      {middleContent && (
        <div className="flex items-center gap-2 text-white">
          {middleContent}
        </div>
      )}
      <Link
        href={seeAllHref}
        className="flex items-center gap-1 text-white font-semibold hover:text-amber-200 hover:underline underline-offset-2 transition-colors ml-auto shrink-0"
      >
        See All
        <HiChevronRight className="w-5 h-5" />
      </Link>
    </div>
  );
}
