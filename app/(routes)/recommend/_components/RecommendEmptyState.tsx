import React from "react";
import Image from "next/image";
import type { ModeId } from "../types";

export function RecommendEmptyState({ mode }: { mode: ModeId }) {
  const getCopy = (m: ModeId) => {
    switch (m) {
      case "taste": return "선호하는 조합을 고르면 추천을 확인할 수 있어요.";
      case "compare": return "비교할 매장 두 곳을 선택해보세요.";
      case "summary": return "요약할 매장을 선택해보세요.";
    }
  };

  return (
    <div className="flex flex-col items-center justify-center border border-stone-200 bg-white p-8 text-center lg:p-14">
      <div className="relative mb-8 flex h-24 w-24 items-center justify-center">
        <div className="relative z-10 flex h-20 w-20 animate-noodle-float items-center justify-center rounded-full bg-white ring-1 ring-stone-200 overflow-hidden">
          <Image 
            src="/ramen-bowl-icon.svg" 
            alt="Ramen bowl empty state" 
            width={48} 
            height={48} 
            className="opacity-40" 
          />
        </div>
      </div>
      <h3 className="text-lg font-bold text-[#25282b] sm:text-xl">
        {getCopy(mode)}
      </h3>
    </div>
  );
}
