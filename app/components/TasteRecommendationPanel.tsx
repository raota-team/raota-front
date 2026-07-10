"use client";

import { FormEvent, useEffect, useState } from "react";
import { ArrowRight, RotateCcw, Search, Sparkles, X } from "lucide-react";

export type AiTasteCriteria = {
  prompt: string;
  chips: string[];
};

type TasteRecommendationPanelProps = {
  activeCriteria: AiTasteCriteria | null;
  onApply: (criteria: AiTasteCriteria) => void;
  onClear: () => void;
};

const QUICK_CHIPS = [
  "혼밥",
  "웨이팅 적음",
  "진한 국물",
  "깔끔한 맛",
  "매운맛",
  "데이트",
  "가성비",
  "역 근처",
];

const EXAMPLES = [
  "혼밥하기 좋고 웨이팅 적은 쇼유라멘",
  "진한 국물에 차슈 맛있는 곳",
  "데이트로 가기 좋은 깔끔한 라멘집",
];

export default function TasteRecommendationPanel({
  activeCriteria,
  onApply,
  onClear,
}: TasteRecommendationPanelProps) {
  const [prompt, setPrompt] = useState("");
  const [selectedChips, setSelectedChips] = useState<string[]>([]);

  useEffect(() => {
    setPrompt(activeCriteria?.prompt ?? "");
    setSelectedChips(activeCriteria?.chips ?? []);
  }, [activeCriteria]);

  const isReady = prompt.trim().length > 0 || selectedChips.length > 0;

  const selectChip = (chip: string) => {
    setSelectedChips((current) => {
      const isSelected = current.includes(chip);
      setPrompt(isSelected ? "" : chip);
      return isSelected ? [] : [chip];
    });
  };

  const handleSubmit = (event?: FormEvent) => {
    event?.preventDefault();
    if (!isReady) return;

    const trimmedPrompt = prompt.trim();

    onApply({
      prompt: selectedChips.includes(trimmedPrompt) ? "" : trimmedPrompt,
      chips: selectedChips,
    });
  };

  const handleReset = () => {
    setPrompt("");
    setSelectedChips([]);
    onClear();
  };

  return (
    <section className="w-full overflow-hidden rounded-sm border border-stone-200 bg-white">
      <div className="grid min-w-0 gap-0 lg:grid-cols-[18rem_minmax(0,1fr)]">
        <div className="min-w-0 border-b border-stone-100 p-4 sm:p-5 lg:border-b-0 lg:border-r">
          <div className="flex min-w-0 items-center gap-2 text-[#e60000]">
            <Sparkles className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
            <p className="text-[10px] font-black uppercase tracking-[0.16em] sm:tracking-[0.18em]">AI taste search</p>
          </div>
          <h2 className="mt-1.5 text-lg font-black leading-tight text-[#25282b] sm:text-xl">
            AI 취향 검색
          </h2>
          <p className="mt-1.5 text-xs font-medium leading-5 text-stone-500">
            원하는 취향을 문장으로 검색해보세요.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="min-w-0 overflow-hidden p-4 sm:p-5">
          <div className="grid min-w-0 gap-2 xl:grid-cols-[minmax(18rem,1fr)_auto] xl:items-center">
            <div className="flex min-h-11 min-w-0 max-w-full items-center gap-2 rounded-sm border border-stone-200 bg-white px-3 py-2 transition-colors focus-within:border-[#e60000] sm:min-h-12 sm:py-2.5">
              <Search className="h-4 w-4 shrink-0 text-stone-400" />
              <label htmlFor="ai-taste-search" className="sr-only">AI 취향 검색어</label>
              <input
                id="ai-taste-search"
                value={prompt}
                onChange={(event) => {
                  const nextPrompt = event.target.value;
                  setPrompt(nextPrompt);
                  setSelectedChips((current) =>
                    current.includes(nextPrompt.trim()) ? current : [],
                  );
                }}
                placeholder="예: 혼밥, 웨이팅 적은 쇼유"
                className="min-w-0 flex-1 bg-transparent text-sm font-bold text-[#25282b] outline-none placeholder:text-stone-400"
              />
              {prompt && (
                <button
                  type="button"
                  onClick={() => {
                    setPrompt("");
                    setSelectedChips([]);
                  }}
                  className="shrink-0 rounded-sm p-1 text-stone-400 transition-colors hover:text-[#e60000]"
                  aria-label="입력 내용 지우기"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className={`grid gap-2 ${activeCriteria ? "sm:grid-cols-[auto_1fr]" : ""} xl:flex xl:justify-end`}>
              {activeCriteria && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-sm border border-stone-200 px-4 text-sm font-black text-[#25282b] transition-colors hover:border-[#e60000] hover:text-[#e60000] sm:h-12"
                >
                  <RotateCcw className="h-4 w-4" />
                  초기화
                </button>
              )}
              <button
                type="submit"
                disabled={!isReady}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-sm bg-[#e60000] px-5 text-sm font-black text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:bg-stone-300 disabled:opacity-80 sm:h-12"
              >
                찾아보기
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="mt-3 flex min-w-0 max-w-full gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-visible sm:pb-0">
            {QUICK_CHIPS.map((chip) => {
              const isSelected = selectedChips.includes(chip);
              return (
                <button
                  key={chip}
                  type="button"
                  onClick={() => selectChip(chip)}
                  className={`min-h-11 shrink-0 rounded-sm border px-3 py-1.5 text-xs font-black transition-colors sm:min-h-0 ${
                    isSelected
                      ? "border-[#e60000] bg-[#e60000] text-white"
                      : "border-stone-200 bg-white text-[#25282b] hover:border-[#e60000] hover:text-[#e60000]"
                  }`}
                >
                  {chip}
                </button>
              );
            })}
          </div>

          <div className="mt-2 flex min-w-0 max-w-full gap-2 overflow-x-auto pb-1 sm:mt-3">
            {EXAMPLES.map((example) => (
              <button
                key={example}
                type="button"
                onClick={() => {
                  setPrompt(example);
                  setSelectedChips([]);
                }}
                className="min-h-11 shrink-0 rounded-sm bg-stone-100 px-3 py-1.5 text-xs font-bold text-stone-500 transition-colors hover:bg-red-50 hover:text-[#e60000] sm:min-h-0"
              >
                {example}
              </button>
            ))}
          </div>
        </form>
      </div>
    </section>
  );
}
