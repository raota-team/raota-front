import Link from 'next/link';
import { ArrowRight, Gift } from 'lucide-react';

export default function ContactUsBanner() {
  return (
    <section className="relative overflow-hidden rounded-md bg-[#25282b] p-5 text-white md:p-6">
      <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="min-w-0">
          <span className="mb-2 inline-block rounded-sm bg-[#e60000] px-1.5 py-0.5 text-[9px] font-black uppercase text-white">
            RAMEN LOG EVENT
          </span>
          <h3 className="mb-1 text-base md:text-lg font-black tracking-tight leading-snug">
            라멘로그 남기고 커피 한 잔 받아가세요.
          </h3>
          <p className="text-xs md:text-sm text-white/70 leading-relaxed break-keep">
            라멘로그를 작성한 분들 중 추첨을 통해 메가커피 기프티콘을 드립니다.
          </p>
        </div>
        <Link 
          href="/ramen-log"
          className="vodafone-button-pill bg-white/10 hover:bg-white/20 border border-white/20 px-6 py-2.5 text-xs font-bold text-white transition-all text-center shrink-0 whitespace-nowrap self-stretch md:self-auto flex items-center justify-center gap-1.5"
        >
          <Gift className="h-3.5 w-3.5" />
          라멘로그 작성하기 <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </section>
  );
}
