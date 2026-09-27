'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { useApp } from '../context/AppContext';

const HIDE_UNTIL_KEY = 'HIDE_APP_PRE_REGISTER_UNTIL';
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
// value는 구글 폼 "IOS인지 안드로이드인지?" 선택지 문구와 정확히 같아야 한다
const PLATFORMS = [
  { value: 'IOS', label: 'iPhone' },
  { value: '안드로이드', label: 'Android' },
] as const;
type Platform = (typeof PLATFORMS)[number]['value'];

const APP_SCREENS = [
  { src: '/app-preview/home.webp', label: '홈', alt: '라오타 앱 홈 화면: AI 라멘 큐레이터와 스타일별 탐색' },
  { src: '/app-preview/map.webp', label: '지도', alt: '라오타 앱 지도 화면: 주변 라멘집 핀과 매장 카드' },
  { src: '/app-preview/my.webp', label: '마이', alt: '라오타 앱 마이 화면: 누적 라멘로그와 취향 리포트' },
];

const FEATURES = [
  'AI 큐레이터가 오늘의 한 곳을 골라드려요',
  '지도에서 영업 여부와 라스트오더까지 확인',
  '먹은 라멘을 기록하면 나만의 취향 리포트가 쌓여요',
];

export default function AppPreRegisterModal() {
  const { showToast } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [platform, setPlatform] = useState<Platform | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const hideUntil = Number(localStorage.getItem(HIDE_UNTIL_KEY));
    if (hideUntil && Date.now() <= hideUntil) return;
    // 접속 기기로 선택지를 미리 골라 둔다. iPadOS 사파리는 Mac으로 보고하므로 터치 지원으로 가린다
    const ua = navigator.userAgent;
    if (/iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1)) setPlatform('IOS');
    else if (/Android/.test(ua)) setPlatform('안드로이드');
    setIsOpen(true);
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
          [PLATFORM_ENTRY]: platform ?? '',
          [CONSENT_ENTRY]: CONSENT_VALUE,
        }),
      });
      showToast('출시 알림 신청이 완료됐어요.', 'success');
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
        <div className="overflow-y-auto md:flex md:flex-1 md:flex-row md:overflow-visible">
          {/* 개발 중인 앱 화면 */}
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
                    height={1039}
                    sizes="(min-width: 768px) 160px, 90px"
                    priority={index === 1}
                    className="h-auto w-full rounded-[10px] ring-1 ring-white/15"
                  />
                  <p className="mt-1.5 text-center text-xs font-semibold text-white/70 md:mt-2">{screen.label}</p>
                </div>
              ))}
            </div>
            <figcaption className="mt-2 text-center text-xs text-white/60 md:mt-6">
              개발 중인 실제 앱 화면이에요
            </figcaption>
          </figure>

          {/* 안내 및 신청 폼 */}
          <div className="flex flex-1 flex-col px-5 pb-5 pt-5 md:px-9 md:pb-[80px] md:pt-10">
            <h2
              id="app-pre-register-title"
              className="text-[24px] font-bold leading-[1.3] tracking-[-0.02em] text-[#25282b] md:text-[28px]"
            >
              라오타 앱이
              <br />
              10월 중에 나와요
            </h2>
            <p className="mt-2 text-[15px] leading-relaxed text-stone-600">
              iPhone(iOS) 앱부터 먼저 출시돼요.
              <br />
              출시 소식을 가장 먼저 메일로 알려드릴게요.
            </p>

            {/* 모바일은 위 앱 화면 3장이 기능을 대신 보여주고, 폼이 한 화면에 들어오도록 목록을 뺀다 */}
            <ul className="mt-5 hidden space-y-2 border-y border-stone-200 py-4 md:block">
              {FEATURES.map((feature) => (
                <li key={feature} className="flex items-start gap-2.5 text-sm font-medium text-[#25282b]">
                  <span aria-hidden="true" className="mt-[7px] h-1.5 w-1.5 shrink-0 bg-[#e60000]" />
                  {feature}
                </li>
              ))}
            </ul>

            <form onSubmit={handleSubmit} className="mt-4 space-y-3 md:mt-5">
              <label htmlFor="app-pre-register-email" className="block text-sm font-bold text-[#25282b]">
                알림 받을 이메일
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

              <fieldset>
                <legend className="text-sm font-bold text-[#25282b]">사용 중인 휴대폰</legend>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {PLATFORMS.map((option) => (
                    <label key={option.value} className="relative cursor-pointer">
                      <input
                        type="radio"
                        name="platform"
                        value={option.value}
                        required
                        checked={platform === option.value}
                        onChange={() => setPlatform(option.value)}
                        className="peer absolute inset-0 opacity-0"
                      />
                      <span className="flex h-11 items-center justify-center rounded-sm border border-stone-300 text-sm font-bold text-stone-600 transition-colors peer-checked:border-[#e60000] peer-checked:text-[#e60000] peer-focus-visible:ring-2 peer-focus-visible:ring-[#e60000] peer-focus-visible:ring-offset-2 hover:border-stone-400">
                        {option.label}
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>

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
                    <div className="flex gap-2"><dt className="w-14 shrink-0 font-bold">이용 목적</dt><dd>라오타 앱 출시 알림 발송</dd></div>
                    <div className="flex gap-2"><dt className="w-14 shrink-0 font-bold">보유 기간</dt><dd>출시 알림 발송 후 지체 없이 파기</dd></div>
                    <p className="pt-1">동의를 거부할 수 있으며, 거부 시 출시 알림을 받을 수 없습니다.</p>
                  </dl>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="h-12 w-full rounded-sm bg-[#e60000] text-[15px] font-bold text-white transition-opacity hover:opacity-90 active:opacity-90 disabled:bg-stone-300 disabled:opacity-100"
              >
                {isSubmitting ? '신청하는 중…' : '출시 알림 받기'}
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
