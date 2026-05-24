'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { LogIn } from 'lucide-react';

const numberFormatter = new Intl.NumberFormat('ko-KR');

function useCountUp(target: number, duration = 1200, delay = 350) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    const shouldReduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (shouldReduceMotion) {
      setValue(target);
      return;
    }

    let animationFrame = 0;
    let startTime = 0;

    const timeout = window.setTimeout(() => {
      const animate = (timestamp: number) => {
        if (!startTime) startTime = timestamp;

        const progress = Math.min((timestamp - startTime) / duration, 1);
        const easedProgress = 1 - Math.pow(1 - progress, 3);

        setValue(Math.round(target * easedProgress));

        if (progress < 1) {
          animationFrame = window.requestAnimationFrame(animate);
        }
      };

      animationFrame = window.requestAnimationFrame(animate);
    }, delay);

    return () => {
      window.clearTimeout(timeout);
      window.cancelAnimationFrame(animationFrame);
    };
  }, [delay, duration, target]);

  return numberFormatter.format(value);
}

export default function HomeHeroActions() {
  const stats = [
    { value: useCountUp(150), label: '등록된 라멘집' },
    { value: useCountUp(4213, 1400, 450), label: '오늘의 한 그릇 추천' },
  ];

  return (
    <div className="flex w-full max-w-4xl flex-col items-center gap-7">
      <div className="grid w-full max-w-xl grid-cols-2 overflow-hidden rounded-[6px] border border-white/25 bg-[#25282b]/72 text-white backdrop-blur-sm">
        {stats.map((stat) => (
          <div key={stat.label} className="px-4 py-4 text-center first:border-r first:border-white/20 sm:px-8 sm:py-5">
            <p className="text-[clamp(1.8rem,7vw,3.25rem)] font-extrabold leading-none tracking-normal tabular-nums">
              {stat.value}
            </p>
            <p className="mt-2 break-keep text-xs font-bold text-white/78 sm:text-sm">
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      <Link
        href="/login"
        className="vodafone-button-pill w-56 px-6 py-4 transition-transform hover:-translate-y-0.5 active:translate-y-0"
      >
        <span className="inline-flex items-center gap-2">
          시작하기
        </span>
        <LogIn className="h-5 w-5 text-white" />
      </Link>
    </div>
  );
}
