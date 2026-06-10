import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function ContactUsBanner() {
  return (
    <section className="relative overflow-hidden rounded-md bg-[#1a1a1a] p-5 md:p-6 text-white shadow-md border border-stone-850">
      <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="min-w-0">
          <span className="inline-block rounded-sm bg-[#e60000] px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-white mb-2">CONTACT</span>
          <h3 className="mb-1 text-base md:text-lg font-black tracking-tight leading-snug">
            궁금한 점이 있으신가요?
          </h3>
          <p className="text-xs md:text-sm text-white/70 leading-relaxed break-keep">
            서비스 이용 관련 제보, 개선을 위한 건의 사항 등 라오타에 전하고 싶은 모든 의견을 자유롭게 보내주세요.
          </p>
        </div>
        <Link 
          href="/community" 
          className="vodafone-button-pill bg-white/10 hover:bg-white/20 border border-white/20 px-6 py-2.5 text-xs font-bold text-white transition-all text-center shrink-0 whitespace-nowrap self-stretch md:self-auto flex items-center justify-center gap-1.5"
        >
          문의 및 제보하기 <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </section>
  );
}
