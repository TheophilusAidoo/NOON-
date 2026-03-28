'use client';

import { useState, useEffect } from 'react';
import { HiClock } from 'react-icons/hi';

export default function FlashCountdown() {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const update = () => {
      const now = new Date();
      const end = new Date(now);
      end.setHours(23, 59, 59, 999);
      const diff = end.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
        return;
      }
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeLeft({ hours, minutes, seconds });
    };

    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  const pad = (n: number) => n.toString().padStart(2, '0');

  return (
    <div className="flex w-full min-w-0 flex-col gap-1 min-[420px]:w-auto min-[420px]:flex-row min-[420px]:items-center min-[420px]:gap-2">
      <span className="flex items-center gap-1.5 text-xs text-white/90 min-[420px]:text-sm">
        <HiClock className="h-4 w-4 shrink-0 text-amber-300 sm:h-5 sm:w-5" />
        <span className="hidden min-[360px]:inline">Ends in </span>
        <span className="min-[360px]:hidden">Ends </span>
      </span>
      <span className="font-bold tabular-nums text-sm tracking-tight text-white sm:text-base">
        {pad(timeLeft.hours)}h {pad(timeLeft.minutes)}m {pad(timeLeft.seconds)}s
      </span>
    </div>
  );
}
