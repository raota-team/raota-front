"use client";

import { useMemo, useState } from "react";
import {
  ArrowRight,
  BarChart3,
  Check,
  ChevronDown,
  MessageSquareText,
  Search,
  Sparkles,
  Star,
  Store,
  ThumbsUp,
  Utensils,
} from "lucide-react";

type ModeId = "taste" | "compare" | "summary";

const modes: Array<{
  id: ModeId;
  label: string;
  eyebrow: string;
  title: string;
  description: string;
  icon: typeof Sparkles;
}> = [
  {
    id: "taste",
    label: "취향 테스트",
    eyebrow: "Vector Matching",
    title: "몇 가지 선택만으로 오늘의 라멘집을 추천받아요",
    description: "국물, 농도, 매운맛, 분위기 같은 취향 신호를 모아 유사한 매장을 찾는 흐름입니다.",
    icon: Sparkles,
  },
  {
    id: "compare",
    label: "매장 비교",
    eyebrow: "RAG Compare",
    title: "고민 중인 두 가게를 한 화면에서 객관적으로 비교해요",
    description: "실제 매장 정보만 기준으로 메뉴, 접근성, 분위기, 강점을 표 형태로 비교하는 화면입니다.",
    icon: BarChart3,
  },
  {
    id: "summary",
    label: "리뷰 요약",
    eyebrow: "Review Digest",
    title: "많은 후기를 장점, 단점, 추천 메뉴로 빠르게 훑어요",
    description: "커뮤니티 리뷰를 모아 방문 전에 필요한 핵심 정보만 3줄로 정리하는 흐름입니다.",
    icon: MessageSquareText,
  },
];

const tasteQuestions = [
  { label: "국물", options: ["진한 돈코츠", "깔끔한 쇼유", "고소한 미소", "담백한 시오"] },
  { label: "무드", options: ["혼밥", "데이트", "웨이팅 가능", "조용한 로컬"] },
  { label: "취향", options: ["매콤함", "두꺼운 차슈", "자가제면", "진한 감칠맛"] },
];

const compareRows = [
  ["대표 스타일", "진한 닭백탕, 크리미한 국물", "깔끔한 쇼유, 맑은 감칠맛"],
  ["추천 상황", "든든한 저녁, 진한 국물 선호", "가벼운 점심, 첫 방문"],
  ["강점", "시그니처 메뉴 완성도와 토핑 구성", "접근성과 회전율, 깔끔한 밸런스"],
  ["주의점", "피크타임 웨이팅 가능성 높음", "진한 국물 선호자에겐 담백할 수 있음"],
];

const summaryItems = [
  { title: "장점", value: "국물 밸런스가 안정적이고 차슈 만족도가 높다는 리뷰가 많아요." },
  { title: "단점", value: "점심 피크에는 대기 시간이 길고 좌석 간격이 좁다는 의견이 있어요." },
  { title: "추천 메뉴", value: "특제 쇼유 라멘, 아지타마 추가 조합이 가장 자주 언급돼요." },
];

export default function RecommendPage() {
  const [activeMode, setActiveMode] = useState<ModeId>("taste");
  const [selectedTaste, setSelectedTaste] = useState<Record<string, string>>({
    국물: "진한 돈코츠",
    무드: "혼밥",
    취향: "두꺼운 차슈",
  });

  const active = useMemo(() => modes.find((mode) => mode.id === activeMode) ?? modes[0], [activeMode]);
  const ActiveIcon = active.icon;

  return (
    <main className="min-h-screen bg-white">
      <section className="relative min-h-[17rem] overflow-hidden md:min-h-[21rem]">
        <div className="absolute inset-0">
          <img src="/header-recommend.png" alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-[#25282b]/45" />
        </div>
        <div className="relative z-10 mx-auto flex min-h-[17rem] max-w-7xl flex-col justify-center px-4 py-8 text-center text-white sm:px-6 md:min-h-[21rem] lg:px-8">
          <div>
            <h1 className="vodafone-display mb-4 text-5xl text-white md:text-7xl">RAMEN RECOMMENDATION</h1>
            <p className="mx-auto max-w-lg text-lg font-medium leading-relaxed text-white/85">
              라멘 선택에 필요한 정보를 빠르게 확인하세요
            </p>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 grid grid-cols-1 gap-2 rounded-sm border border-stone-200 bg-white p-2 md:grid-cols-3">
          {modes.map((mode) => {
            const ModeIcon = mode.icon;
            const isActive = activeMode === mode.id;
            return (
              <button
                key={mode.id}
                onClick={() => setActiveMode(mode.id)}
                className={`flex min-h-24 items-center gap-4 rounded-sm px-4 py-4 text-left transition-colors ${
                  isActive ? "bg-[#25282b] text-white" : "text-stone-600 hover:bg-stone-50 hover:text-[#25282b]"
                }`}
              >
                <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${isActive ? "bg-[#e60000]" : "bg-stone-100"}`}>
                  <ModeIcon className="h-5 w-5" />
                </span>
                <span className="min-w-0">
                  <span className="block text-[10px] font-black uppercase tracking-[0.16em] opacity-70">{mode.eyebrow}</span>
                  <span className="mt-1 block text-sm font-black">{mode.label}</span>
                </span>
              </button>
            );
          })}
        </div>

        <section className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <div className="sticky top-24 rounded-sm border border-stone-200 bg-white p-6">
              <div className="mb-6 flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-stone-100 text-[#e60000]">
                  <ActiveIcon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#e60000]">{active.eyebrow}</p>
                  <h2 className="mt-2 text-2xl font-black leading-tight text-[#25282b]">{active.title}</h2>
                </div>
              </div>
              <p className="mb-6 text-base font-medium leading-relaxed text-[#7e7e7e]">{active.description}</p>

              {activeMode === "taste" && (
                <div className="space-y-6">
                  {tasteQuestions.map((question) => (
                    <div key={question.label}>
                      <div className="mb-3 text-xs font-black uppercase tracking-[0.16em] text-stone-400">{question.label}</div>
                      <div className="flex flex-wrap gap-2">
                        {question.options.map((option) => {
                          const isSelected = selectedTaste[question.label] === option;
                          return (
                            <button
                              key={option}
                              onClick={() => setSelectedTaste((prev) => ({ ...prev, [question.label]: option }))}
                              className={`rounded-sm border px-4 py-3 text-sm font-bold transition-colors ${
                                isSelected ? "border-[#e60000] bg-[#e60000] text-white" : "border-stone-200 bg-white text-stone-600 hover:border-[#e60000]"
                              }`}
                            >
                              {option}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeMode === "compare" && (
                <div className="space-y-4">
                  {["A 가게", "B 가게"].map((label, index) => (
                    <label key={label} className="block">
                      <span className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-stone-400">{label}</span>
                      <span className="flex items-center rounded-sm border border-stone-200 bg-white px-4 py-3">
                        <Store className="mr-3 h-4 w-4 text-[#e60000]" />
                        <span className="flex-1 text-sm font-bold text-[#25282b]">{index === 0 ? "멘야 하루" : "라멘 아오이"}</span>
                        <ChevronDown className="h-4 w-4 text-stone-400" />
                      </span>
                    </label>
                  ))}
                </div>
              )}

              {activeMode === "summary" && (
                <div className="space-y-4">
                  <label className="block">
                    <span className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-stone-400">요약할 매장</span>
                    <span className="flex items-center rounded-sm border border-stone-200 bg-white px-4 py-3">
                      <Search className="mr-3 h-4 w-4 text-[#e60000]" />
                      <span className="flex-1 text-sm font-bold text-[#25282b]">토리파이탄 라보</span>
                      <ChevronDown className="h-4 w-4 text-stone-400" />
                    </span>
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {["최근순", "긍정", "방문팁"].map((filter) => (
                      <button key={filter} className="rounded-sm border border-stone-200 bg-white px-3 py-3 text-xs font-black text-stone-600 transition-colors hover:border-[#e60000] hover:text-[#e60000]">
                        {filter}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <button className="mt-8 flex w-full items-center justify-center gap-2 rounded-sm bg-[#e60000] px-5 py-4 text-sm font-black text-white transition-opacity hover:opacity-90">
                미리보기 생성
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="lg:col-span-7">
            {activeMode === "taste" && (
              <ResultPanel title="오늘의 추천 매칭" caption="선택한 취향 기반 UI 미리보기">
                <div className="grid gap-4 md:grid-cols-2">
                  {["멘야 하루", "라멘 코하쿠"].map((shop, index) => (
                    <article key={shop} className="rounded-md border border-stone-200 bg-white p-5">
                      <div className="mb-4 flex items-center justify-between">
                        <span className="rounded-sm border border-[#e60000] bg-white px-3 py-1 text-xs font-black text-[#25282b]">MATCH {index === 0 ? "94%" : "88%"}</span>
                        <div className="flex text-yellow-500">
                          {Array.from({ length: 5 }).map((_, starIndex) => (
                            <Star key={starIndex} className="h-4 w-4 fill-current" />
                          ))}
                        </div>
                      </div>
                      <h3 className="text-xl font-black text-[#25282b]">{shop}</h3>
                      <p className="mt-2 text-sm font-medium leading-relaxed text-[#7e7e7e]">
                        {selectedTaste.국물}, {selectedTaste.무드}, {selectedTaste.취향} 취향과 잘 맞는 후보입니다.
                      </p>
                      <div className="mt-5 flex flex-wrap gap-2">
                        {Object.values(selectedTaste).map((tag) => (
                          <span key={tag} className="rounded-full bg-[#f2f2f2] px-3 py-1 text-xs font-bold text-[#25282b]">{tag}</span>
                        ))}
                      </div>
                    </article>
                  ))}
                </div>
              </ResultPanel>
            )}

            {activeMode === "compare" && (
              <ResultPanel title="두 매장 심층 비교" caption="실제 DB 기반 비교 결과 테이블 예시">
                <div className="overflow-hidden rounded-md border border-stone-200 bg-white">
                  <div className="grid grid-cols-[0.8fr_1fr_1fr] bg-[#25282b] text-xs font-black uppercase tracking-[0.14em] text-white">
                    <div className="p-4">항목</div>
                    <div className="p-4">멘야 하루</div>
                    <div className="p-4">라멘 아오이</div>
                  </div>
                  {compareRows.map(([label, a, b]) => (
                    <div key={label} className="grid grid-cols-[0.8fr_1fr_1fr] border-t border-stone-100 text-sm">
                      <div className="bg-stone-50 p-4 font-black text-[#25282b]">{label}</div>
                      <div className="p-4 font-medium leading-relaxed text-[#7e7e7e]">{a}</div>
                      <div className="p-4 font-medium leading-relaxed text-[#7e7e7e]">{b}</div>
                    </div>
                  ))}
                </div>
              </ResultPanel>
            )}

            {activeMode === "summary" && (
              <ResultPanel title="다중 리뷰 3줄 요약" caption="커뮤니티 리뷰 청크 검색 결과 요약 예시">
                <div className="space-y-4">
                  {summaryItems.map((item, index) => (
                    <article key={item.title} className="flex gap-4 rounded-md border border-stone-200 bg-white p-5">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#e60000] text-sm font-black text-white">{index + 1}</div>
                      <div>
                        <h3 className="font-black text-[#25282b]">{item.title}</h3>
                        <p className="mt-1 text-sm font-medium leading-relaxed text-[#7e7e7e]">{item.value}</p>
                      </div>
                    </article>
                  ))}
                </div>
              </ResultPanel>
            )}

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {[
                { icon: Utensils, label: "취향 신호", value: "12개 기준" },
                { icon: Check, label: "근거 표시", value: "DB 기반" },
                { icon: ThumbsUp, label: "결과 형태", value: "추천/비교/요약" },
              ].map((item) => {
                const ItemIcon = item.icon;
                return (
                  <div key={item.label} className="rounded-md border border-stone-200 bg-white px-5 py-4">
                    <ItemIcon className="mb-3 h-5 w-5 text-[#e60000]" />
                    <div className="text-xs font-black uppercase tracking-[0.16em] text-stone-400">{item.label}</div>
                    <div className="mt-1 text-lg font-black text-[#25282b]">{item.value}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function ResultPanel({ title, caption, children }: { title: string; caption: string; children: React.ReactNode }) {
  return (
    <section className="rounded-md border border-stone-200 bg-stone-50 p-5">
      <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#e60000]">Preview Output</p>
          <h2 className="mt-1 text-2xl font-black text-[#25282b]">{title}</h2>
        </div>
        <p className="text-xs font-bold text-stone-400">{caption}</p>
      </div>
      {children}
    </section>
  );
}
