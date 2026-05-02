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
    <main className="min-h-screen bg-stone-50">
      <section className="relative min-h-[17rem] overflow-hidden md:min-h-[21rem]">
        <div className="absolute inset-0">
          <img src="/header-recommend.png" alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-stone-900/40" />
        </div>
        <div className="relative z-10 mx-auto flex min-h-[17rem] max-w-7xl flex-col justify-center px-4 py-8 text-center text-white sm:px-6 md:min-h-[21rem] lg:px-8">
          <div>
            <h1 className="mb-4 text-3xl font-black tracking-tight uppercase italic text-white md:text-5xl">RAMEN RECOMMANDATION</h1>
            <p className="mx-auto max-w-lg text-white font-bold leading-relaxed">
              라멘 선택에 필요한 정보를 빠르게 확인하세요
            </p>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 grid grid-cols-1 gap-3 rounded-2xl border border-stone-200 bg-white p-2 shadow-sm md:grid-cols-3">
          {modes.map((mode) => {
            const ModeIcon = mode.icon;
            const isActive = activeMode === mode.id;
            return (
              <button
                key={mode.id}
                onClick={() => setActiveMode(mode.id)}
                className={`flex min-h-24 items-center gap-4 rounded-xl px-4 py-4 text-left transition-all ${
                  isActive ? "bg-stone-900 text-white" : "text-stone-600 hover:bg-stone-50 hover:text-stone-900"
                }`}
              >
                <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${isActive ? "bg-red-600" : "bg-stone-100"}`}>
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
            <div className="sticky top-24 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
              <div className="mb-6 flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-600">
                  <ActiveIcon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-red-600">{active.eyebrow}</p>
                  <h2 className="mt-2 text-2xl font-black leading-tight text-stone-950">{active.title}</h2>
                </div>
              </div>
              <p className="mb-6 text-sm font-medium leading-relaxed text-stone-500">{active.description}</p>

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
                              className={`rounded-full border px-4 py-2 text-sm font-bold transition-colors ${
                                isSelected ? "border-red-600 bg-red-600 text-white" : "border-stone-200 bg-white text-stone-600 hover:border-red-200 hover:bg-red-50"
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
                      <span className="flex items-center rounded-xl border border-stone-200 bg-stone-50 px-4 py-3">
                        <Store className="mr-3 h-4 w-4 text-red-500" />
                        <span className="flex-1 text-sm font-bold text-stone-800">{index === 0 ? "멘야 하루" : "라멘 아오이"}</span>
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
                    <span className="flex items-center rounded-xl border border-stone-200 bg-stone-50 px-4 py-3">
                      <Search className="mr-3 h-4 w-4 text-red-500" />
                      <span className="flex-1 text-sm font-bold text-stone-800">토리파이탄 라보</span>
                      <ChevronDown className="h-4 w-4 text-stone-400" />
                    </span>
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {["최근순", "긍정", "방문팁"].map((filter) => (
                      <button key={filter} className="rounded-lg border border-stone-200 bg-white px-3 py-2 text-xs font-black text-stone-600 transition-colors hover:border-red-200 hover:text-red-600">
                        {filter}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <button className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-stone-900 px-5 py-4 text-sm font-black text-white transition-colors hover:bg-red-600">
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
                    <article key={shop} className="rounded-xl border border-stone-200 bg-white p-5">
                      <div className="mb-4 flex items-center justify-between">
                        <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-black text-red-600">MATCH {index === 0 ? "94%" : "88%"}</span>
                        <div className="flex text-yellow-500">
                          {Array.from({ length: 5 }).map((_, starIndex) => (
                            <Star key={starIndex} className="h-4 w-4 fill-current" />
                          ))}
                        </div>
                      </div>
                      <h3 className="text-xl font-black text-stone-950">{shop}</h3>
                      <p className="mt-2 text-sm font-medium leading-relaxed text-stone-500">
                        {selectedTaste.국물}, {selectedTaste.무드}, {selectedTaste.취향} 취향과 잘 맞는 후보입니다.
                      </p>
                      <div className="mt-5 flex flex-wrap gap-2">
                        {Object.values(selectedTaste).map((tag) => (
                          <span key={tag} className="rounded-full bg-stone-100 px-3 py-1 text-xs font-bold text-stone-600">{tag}</span>
                        ))}
                      </div>
                    </article>
                  ))}
                </div>
              </ResultPanel>
            )}

            {activeMode === "compare" && (
              <ResultPanel title="두 매장 심층 비교" caption="실제 DB 기반 비교 결과 테이블 예시">
                <div className="overflow-hidden rounded-xl border border-stone-200 bg-white">
                  <div className="grid grid-cols-[0.8fr_1fr_1fr] bg-stone-900 text-xs font-black uppercase tracking-[0.14em] text-white">
                    <div className="p-4">항목</div>
                    <div className="p-4">멘야 하루</div>
                    <div className="p-4">라멘 아오이</div>
                  </div>
                  {compareRows.map(([label, a, b]) => (
                    <div key={label} className="grid grid-cols-[0.8fr_1fr_1fr] border-t border-stone-100 text-sm">
                      <div className="bg-stone-50 p-4 font-black text-stone-700">{label}</div>
                      <div className="p-4 font-medium leading-relaxed text-stone-600">{a}</div>
                      <div className="p-4 font-medium leading-relaxed text-stone-600">{b}</div>
                    </div>
                  ))}
                </div>
              </ResultPanel>
            )}

            {activeMode === "summary" && (
              <ResultPanel title="다중 리뷰 3줄 요약" caption="커뮤니티 리뷰 청크 검색 결과 요약 예시">
                <div className="space-y-4">
                  {summaryItems.map((item, index) => (
                    <article key={item.title} className="flex gap-4 rounded-xl border border-stone-200 bg-white p-5">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-50 text-sm font-black text-red-600">{index + 1}</div>
                      <div>
                        <h3 className="font-black text-stone-950">{item.title}</h3>
                        <p className="mt-1 text-sm font-medium leading-relaxed text-stone-600">{item.value}</p>
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
                  <div key={item.label} className="rounded-xl border border-stone-200 bg-white px-5 py-4">
                    <ItemIcon className="mb-3 h-5 w-5 text-red-600" />
                    <div className="text-xs font-black uppercase tracking-[0.16em] text-stone-400">{item.label}</div>
                    <div className="mt-1 text-lg font-black text-stone-950">{item.value}</div>
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
    <section className="rounded-2xl border border-stone-200 bg-stone-100/70 p-5">
      <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-red-600">Preview Output</p>
          <h2 className="mt-1 text-2xl font-black text-stone-950">{title}</h2>
        </div>
        <p className="text-xs font-bold text-stone-400">{caption}</p>
      </div>
      {children}
    </section>
  );
}
