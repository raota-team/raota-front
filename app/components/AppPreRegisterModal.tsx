'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { useApp } from '../context/AppContext';
import { UPCOMING_FEATURES } from '../lib/upcomingFeatures';

// iOS 출시(2026.11) 안내로 바뀌어 키를 새로 둔다. 예전 키로 1년 숨긴 사람(사전예약 신청자)에게도 출시를 한 번 보여 준다
const HIDE_UNTIL_KEY = 'HIDE_APP_LAUNCH_UNTIL';
const APP_STORE_URL = 'https://apps.apple.com/kr/app/raota/id6825202179';
const DAY_MS = 24 * 60 * 60 * 1000;

// 구글 폼 "라오타 사전예약" (https://forms.gle/SFEKRZd7sg4jZ4p39) 응답 엔드포인트.
// 체크박스 값은 폼의 선택지 문구와 정확히 같아야 한다. 다르면 구글이 400을 돌려주지만
// no-cors 응답이라 브라우저에서는 실패를 감지할 수 없으니 폼 선택지를 바꾸면 여기도 같이 바꾼다.
const FORM_ACTION_URL =
  'https://docs.google.com/forms/d/e/1FAIpQLSf0InBp20cIiu9SK6-Q6QJcVoHQNixvopYHlyuiAYjTZtSKag/formResponse';
const EMAIL_ENTRY = 'entry.478493864';
const CONSENT_ENTRY = 'entry.201549479';
const CONSENT_VALUE = '옵션 1';

const PLATFORM_ENTRY = 'entry.1371125767';
// 구글 폼 "IOS인지 안드로이드인지?" 선택지 문구와 정확히 같아야 한다. iOS는 출시돼 이제 Android만 사전예약을 받는다
const ANDROID_PLATFORM_VALUE = '안드로이드';

// 화면을 바꾸면 파일 이름도 바꾼다. 이미지가 같은 주소로 7일 캐시돼(next.config minimumCacheTTL) 이름이 같으면 예전 화면이 계속 보인다
const APP_SCREENS = [
  { src: '/app-preview/home-20261030.webp', label: '홈', alt: '라오타 앱 홈 화면: AI 라멘 추천과 오늘의 큐레이션' },
  { src: '/app-preview/map-20261030.webp', label: '지도', alt: '라오타 앱 지도 화면: 주변 라멘집 핀과 영업 중인 매장 카드' },
  { src: '/app-preview/my-20261030.webp', label: '마이', alt: '라오타 앱 마이 화면: 라멘로그 수, 등급, 종류별 기록' },
];

/** 지금 출시 앱에서 되는 것만 적는다. 예고는 UPCOMING_FEATURES(app/lib/upcomingFeatures.ts)에 둔다 */
const AVAILABLE_FEATURES = [
  'AI 큐레이터가 오늘의 한 곳을 골라드려요',
  '지도에서 영업 여부와 라스트오더까지 확인',
  '먹은 라멘을 그릇마다 기록해요',
];

const OPEN_EVENT = 'raota:open-app-launch';

/** 다른 화면(홈 "곧 나와요")에서 출시 팝업을 연다. "보지 않기"로 숨겼어도 직접 누른 것이라 연다 */
export function openAppLaunchModal() {
  window.dispatchEvent(new Event(OPEN_EVENT));
}

export default function AppPreRegisterModal() {
  const { showToast } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  // Android 기기에서는 App Store 버튼이 쓸모없어 빼고, 사전예약을 주 버튼으로 둔다
  const [isAndroid, setIsAndroid] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // iPadOS 사파리는 Mac으로 보고하지만 iPad는 App Store를 쓰니 따로 가릴 필요가 없다
    setIsAndroid(/Android/.test(navigator.userAgent));
    const open = () => setIsOpen(true);
    window.addEventListener(OPEN_EVENT, open);
    const hideUntil = Number(localStorage.getItem(HIDE_UNTIL_KEY));
    if (!hideUntil || Date.now() > hideUntil) setIsOpen(true);
    return () => window.removeEventListener(OPEN_EVENT, open);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialogRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isOpen]);

  const hideFor = (durationMs: number) => {
    localStorage.setItem(HIDE_UNTIL_KEY, String(Date.now() + durationMs));
    setIsOpen(false);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      await fetch(FORM_ACTION_URL, {
        method: 'POST',
        mode: 'no-cors',
        body: new URLSearchParams({
          [EMAIL_ENTRY]: email.trim(),
          [PLATFORM_ENTRY]: ANDROID_PLATFORM_VALUE,
          [CONSENT_ENTRY]: CONSENT_VALUE,
        }),
      });
      showToast('Android 출시 알림 신청이 완료됐어요.', 'success');
      hideFor(365 * DAY_MS);
    } catch {
      showToast('신청하지 못했어요. 네트워크를 확인하고 다시 시도해주세요.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center md:items-center md:p-6">
      <div className="absolute inset-0 bg-black/60 motion-safe:animate-fade-in" onClick={() => setIsOpen(false)} />

      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="app-pre-register-title"
        tabIndex={-1}
        className="relative flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-md bg-white focus:outline-none focus-visible:outline-none motion-safe:animate-sheet-up md:max-h-[90dvh] md:max-w-[920px] md:flex-row md:rounded-sm md:motion-safe:animate-slide-up"
      >
        {/* 데스크톱은 오른쪽 열만 스크롤한다. 동의 내용을 펼치거나 화면이 낮으면 아래 고정 버튼 줄에 가리지 않게 한다 */}
        <div className="overflow-y-auto md:flex md:min-h-0 md:flex-1 md:flex-row md:overflow-visible">
          {/* 실제 앱 화면 */}
          <figure className="relative bg-[#25282b] px-5 pb-3 pt-4 md:flex md:w-[440px] md:shrink-0 md:flex-col md:justify-center md:px-6 md:py-10">
            <div className="mx-auto flex max-w-[216px] items-start justify-center md:max-w-none">
              {APP_SCREENS.map((screen, index) => (
                <div
                  key={screen.src}
                  className={index === 1 ? 'relative z-10 w-[37%]' : `w-[31.5%] pt-3 md:pt-9 ${index === 0 ? '-mr-1.5' : '-ml-1.5'}`}
                >
                  <Image
                    src={screen.src}
                    alt={screen.alt}
                    width={480}
                    height={1044}
                    sizes="(min-width: 768px) 160px, 90px"
                    priority={index === 1}
                    className="h-auto w-full rounded-[10px] ring-1 ring-white/15"
                  />
                  <p className="mt-1.5 text-center text-xs font-semibold text-white/70 md:mt-2">{screen.label}</p>
                </div>
              ))}
            </div>
            <figcaption className="mt-2 text-center text-xs text-white/60 md:mt-6">
              실제 앱 화면이에요
            </figcaption>
          </figure>

          {/* 안내, App Store 링크, Android 사전예약 */}
          <div className="flex flex-1 flex-col px-5 pb-5 pt-5 md:min-h-0 md:overflow-y-auto md:px-9 md:pb-[80px] md:pt-10">
            <h2
              id="app-pre-register-title"
              className="text-[24px] font-bold leading-[1.3] tracking-[-0.02em] text-[#25282b] md:text-[28px]"
            >
              {isAndroid ? '라오타 Android 앱은' : '라오타 iPhone 앱이'}
              <br />
              {isAndroid ? '11월에 나와요' : '나왔어요'}
            </h2>
            <p className="mt-2 text-[15px] leading-relaxed text-stone-600">
              {isAndroid ? 'iPhone 앱이 먼저 나왔어요. 출시되면 메일로 알려드릴게요.' : 'App Store에서 지금 받을 수 있어요. Android 앱은 11월에 나와요.'}
            </p>

            {/* 모바일은 위 앱 화면 3장이 기능을 대신 보여주고, 시트가 한 화면에 들어오도록 목록을 뺀다 */}
            <div className="mt-5 hidden grid-cols-2 gap-5 border-y border-stone-200 py-4 md:grid">
              <div>
                <h3 className="mb-2.5 text-xs font-bold text-stone-500">지금 앱에서</h3>
                <ul className="space-y-2">
                  {AVAILABLE_FEATURES.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5 text-[13px] font-semibold leading-snug text-[#25282b]">
                      <span aria-hidden="true" className="mt-[6px] h-1.5 w-1.5 shrink-0 bg-[#e60000]" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="mb-2.5 text-xs font-bold text-stone-500">곧 나와요</h3>
                <ul className="space-y-2">
                  {UPCOMING_FEATURES.map((feature) => (
                    <li key={feature.id} className="flex items-start gap-2.5 text-[13px] font-semibold leading-snug text-[#25282b]">
                      <span aria-hidden="true" className="mt-[5px] h-[7px] w-[7px] shrink-0 border-[1.5px] border-stone-400" />
                      <span>
                        {feature.title}
                        <span className={`ml-1.5 inline-block rounded-sm px-1.5 align-[1px] text-[11px] font-bold ${feature.id === 'android' ? 'bg-[#e60000] text-white' : 'bg-[#f2f2f2] text-stone-600'}`}>
                          {feature.when}
                        </span>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {!isAndroid && (
              // Apple 공식 한국어 검정 배지를 폭에 맞춰 늘린 모양. 로고·글자(app-store-badge-ko-mark.svg)는 배지 그대로 두고,
              // 배지의 회색 테두리(#a6a6a6)와 검정 바탕만 버튼이 그린다(사용자 결정 2026.11.01)
              <a
                href={APP_STORE_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => hideFor(365 * DAY_MS)}
                className="mt-4 flex h-[52px] w-full items-center justify-center rounded-[10px] border border-[#a6a6a6] bg-black transition-opacity hover:opacity-85 active:opacity-85 md:mt-5"
              >
                <Image src="/app-store-badge-ko-mark.svg" alt="App Store에서 다운로드하기" width={130} height={40} unoptimized className="h-12 w-auto" />
                <span className="sr-only"> (새 창)</span>
              </a>
            )}

            <form onSubmit={handleSubmit} className={`space-y-3 ${isAndroid ? 'mt-4 md:mt-5' : 'mt-5 border-t border-stone-200 pt-4'}`}>
              <label htmlFor="app-pre-register-email" className="block text-sm font-bold text-[#25282b]">
                Android 출시 알림 받을 이메일
              </label>
              <input
                id="app-pre-register-email"
                type="email"
                inputMode="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="ramen@example.com"
                className="h-12 w-full rounded-sm border border-stone-300 px-3.5 text-base text-[#25282b] placeholder:text-stone-500 focus:border-[#e60000] focus:outline-none focus:ring-1 focus:ring-[#e60000]"
              />

              <div className="text-sm text-stone-600">
                <div className="flex min-h-[44px] items-center justify-between gap-2">
                  <label className="flex cursor-pointer items-center gap-2.5">
                    <input type="checkbox" required className="h-5 w-5 shrink-0 accent-[#e60000]" />
                    <span>
                      <span className="font-bold text-[#25282b]">(필수)</span> 개인정보 수집·이용 동의
                    </span>
                  </label>
                  <button
                    type="button"
                    aria-expanded={showTerms}
                    aria-controls="app-pre-register-terms"
                    onClick={() => setShowTerms((shown) => !shown)}
                    className="h-11 shrink-0 px-1 text-xs font-semibold text-stone-500 underline underline-offset-2 hover:text-[#25282b]"
                  >
                    {showTerms ? '접기' : '내용 보기'}
                  </button>
                </div>
                {showTerms && (
                  <dl id="app-pre-register-terms" className="mb-1 space-y-1 rounded-sm bg-[#f2f2f2] p-3 text-xs leading-relaxed text-stone-600">
                    <div className="flex gap-2"><dt className="w-14 shrink-0 font-bold">수집 항목</dt><dd>이메일 주소</dd></div>
                    <div className="flex gap-2"><dt className="w-14 shrink-0 font-bold">이용 목적</dt><dd>라오타 Android 앱 출시 알림 발송</dd></div>
                    <div className="flex gap-2"><dt className="w-14 shrink-0 font-bold">보유 기간</dt><dd>출시 알림 발송 후 지체 없이 파기</dd></div>
                    <p className="pt-1">동의를 거부할 수 있으며, 거부 시 출시 알림을 받을 수 없습니다.</p>
                  </dl>
                )}
              </div>

              {/* 빨간 버튼은 한 화면에 하나. Android 기기에서만 사전예약이 주 버튼이다 */}
              <button
                type="submit"
                disabled={isSubmitting}
                className={`h-12 w-full rounded-sm text-[15px] font-bold transition-opacity hover:opacity-90 active:opacity-90 disabled:bg-stone-300 disabled:text-white disabled:opacity-100 ${isAndroid ? 'bg-[#e60000] text-white' : 'border border-[#25282b] bg-white text-[#25282b]'}`}
              >
                {isSubmitting ? '신청하는 중…' : 'Android 출시 알림 받기'}
              </button>
            </form>
          </div>
        </div>

        {/* 모바일: 시트 하단 고정 / 데스크톱: 폼 영역 하단 */}
        <div className="flex shrink-0 border-t border-stone-200 pb-[env(safe-area-inset-bottom)] md:absolute md:bottom-0 md:left-[440px] md:right-0 md:pb-0">
          <button
            type="button"
            onClick={() => hideFor(DAY_MS)}
            className="h-12 flex-1 text-sm font-medium text-stone-600 hover:bg-stone-50 hover:text-[#25282b]"
          >
            오늘 하루 보지 않기
          </button>
          <span aria-hidden="true" className="my-3 w-px bg-stone-200" />
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="h-12 flex-1 text-sm font-medium text-stone-600 hover:bg-stone-50 hover:text-[#25282b]"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
