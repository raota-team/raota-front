'use client';

import { ChartColumn, Smartphone, Sparkles, type LucideIcon } from 'lucide-react';
import { openAppLaunchModal } from './AppPreRegisterModal';
import { UPCOMING_FEATURES, type UpcomingFeature } from '../lib/upcomingFeatures';

const APP_STORE_URL = 'https://apps.apple.com/kr/app/raota/id6825202179';

const ICONS: Record<UpcomingFeature['id'], LucideIcon> = {
  android: Smartphone,
  'taste-report': ChartColumn,
  'personal-ai': Sparkles,
};

/**
 * 홈 맨 아래 "곧 나와요". 날짜가 정해진 Android만 진한 카드와 빨간 버튼(출시 알림 팝업 열기)으로 두고,
 * 나머지는 같은 크기의 조용한 카드로 둔다. 내용은 app/lib/upcomingFeatures.ts 하나에서 고친다.
 */
export default function UpcomingFeatures() {
  return (
    <section aria-labelledby="upcoming-title" className="rounded-md bg-white p-4 ring-1 ring-stone-200 md:p-6">
      <div className="mb-4 flex items-end justify-between gap-4 md:mb-6">
        <div>
          <div className="flex items-center gap-2 md:gap-3">
            <div className="h-6 w-1 rounded-full bg-[#e60000] md:h-8 md:w-1.5" />
            <h2 id="upcoming-title" className="text-xl font-black text-[#25282b] md:text-2xl">곧 나와요</h2>
          </div>
          <p className="mt-1.5 pl-3 text-xs text-stone-500 md:pl-[18px] md:text-sm">라오타가 다음에 준비하고 있는 것들이에요.</p>
        </div>
        <a
          href={APP_STORE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 border-b border-[#25282b] pb-0.5 text-xs font-bold text-[#25282b] hover:border-[#e60000] hover:text-[#e60000] md:text-sm"
        >
          iPhone 앱 받기 →<span className="sr-only"> (새 창)</span>
        </a>
      </div>

      <ul className="grid gap-3 md:grid-cols-3 md:gap-4">
        {UPCOMING_FEATURES.map((feature) => {
          const Icon = ICONS[feature.id];
          const lead = feature.id === 'android';
          return (
            <li
              key={feature.id}
              className={`flex flex-col rounded-md p-4 md:min-h-[236px] md:p-5 ${lead ? 'bg-[#25282b] text-white' : 'border border-stone-200 bg-white text-[#25282b]'}`}
            >
              <div className="flex items-center justify-between gap-3 md:block">
                <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-bold ${lead ? 'bg-[#e60000] text-white' : 'bg-[#f2f2f2] text-stone-600'}`}>
                  {feature.when}
                </span>
                <Icon aria-hidden="true" className={`h-6 w-6 md:mt-4 md:h-8 md:w-8 ${lead ? 'text-white' : 'text-[#25282b]'}`} strokeWidth={1.75} />
              </div>
              <h3 className="mt-3 text-lg font-black tracking-[-0.02em] md:text-xl">{feature.title}</h3>
              <p className={`mt-1.5 flex-1 text-sm leading-relaxed ${lead ? 'text-white/75' : 'text-stone-600'}`}>{feature.description}</p>
              {lead ? (
                <button
                  type="button"
                  onClick={openAppLaunchModal}
                  className="mt-4 h-11 w-full rounded-sm bg-[#e60000] text-sm font-bold text-white transition-opacity hover:opacity-90"
                >
                  출시 알림 받기
                </button>
              ) : (
                feature.note && <p className="mt-3 text-xs text-stone-500">{feature.note}</p>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
