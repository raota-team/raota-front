"use client";

import { useEffect } from "react";
import { X, Star, Check, Award } from "lucide-react";

import ProgressBar from "./ProgressBar";

interface VoteMenu {
  id: number;
  name: string;
  votes: number;
  isVoted?: boolean;
}

interface VoteMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVote: (menu: VoteMenu) => Promise<void> | void;
  menus: VoteMenu[];
  totalVotes: number;
  bestMenuId: number | null;
  shopName: string;
}

export default function VoteMenuModal({
  isOpen,
  onClose,
  onVote,
  menus,
  totalVotes,
  bestMenuId,
  shopName,
}: VoteMenuModalProps) {
  useEffect(() => {
    if (!isOpen) return;

    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.body.style.overflow = "hidden";
    document.body.style.paddingRight = `${scrollbarWidth}px`;
    window.addEventListener("keydown", handleEsc);

    return () => {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
      window.removeEventListener("keydown", handleEsc);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-[#25282b]/70" />

      <div
        className="relative z-10 flex max-h-[88dvh] w-full max-w-4xl flex-col overflow-hidden rounded-t-md border border-stone-200 bg-white sm:max-h-[90vh] sm:rounded-sm"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-stone-100 text-stone-600 transition-colors hover:bg-stone-200 sm:right-4 sm:top-4"
          aria-label="투표 모달 닫기"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="grid min-h-0 flex-1 md:grid-cols-[19.5rem_minmax(0,1fr)] lg:grid-cols-[21rem_minmax(0,1fr)]">
          <div className="shrink-0 border-b border-stone-200 bg-stone-50 px-4 pb-4 pt-4 md:min-h-full md:border-b-0 md:border-r md:px-6 md:py-6 lg:px-7">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#e60000]">메뉴 투표</p>
            <h2 className="mt-1.5 pr-10 text-lg font-black leading-tight text-[#25282b] sm:text-xl md:mt-2 md:pr-0 md:text-2xl">
              <span className="md:block">{shopName}에서 </span>
              가장 맛있었던 메뉴는?
            </h2>
            <div className="mt-2 text-xs leading-5 text-stone-500 md:mt-3 md:space-y-2 md:text-sm md:leading-6">
              <p className="break-keep">가장 맛있었던 메뉴에 한 표를 남겨주세요.</p>
              <p className="hidden break-keep md:block">이미 투표한 메뉴는 다시 눌러 취소할 수 있어요.</p>
            </div>

            <div className="mt-3 flex items-center justify-between border-t border-stone-200 pt-3 text-xs font-bold text-stone-600 md:mt-5 md:rounded-sm md:border md:bg-white md:px-4 md:py-3 md:text-sm md:text-stone-700">
              <span className="md:hidden">{menus.length}개 메뉴</span>
              <div className="flex items-center justify-between gap-3">
                <span className="hidden items-center gap-2 md:inline-flex">
                  <Award className="h-4 w-4 text-[#e60000]" />
                  총 참여 수
                </span>
                <span className="font-mono font-black text-[#25282b]">총 {totalVotes}표</span>
              </div>
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-2 [scrollbar-color:#a8a29e_transparent] [scrollbar-width:thin] md:max-h-[70vh] md:px-6 md:py-6">
            <div className="divide-y divide-stone-200 md:grid md:grid-cols-2 md:gap-4 md:divide-y-0">
              {menus.map((menu) => (
                <div
                  key={menu.id}
                  className="bg-white py-3 md:rounded-sm md:border md:border-stone-200 md:p-4"
                >
                  <div className="flex items-center justify-between gap-3 md:mb-3 md:items-start">
                    <div className="min-w-0">
                      <div className="flex min-h-6 items-center">
                        {menu.id === bestMenuId && (
                          <span className="mr-2 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-50 text-[#e60000]">
                            <Star className="h-3 w-3" fill="currentColor" />
                          </span>
                        )}
                        <span className={`truncate text-sm font-bold md:break-words ${
                          menu.id === bestMenuId ? "text-[#25282b]" : "text-stone-700"
                        }`}>
                          {menu.name}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center gap-2 text-[10px] font-bold">
                        <span className={menu.id === bestMenuId ? "text-[#e60000]" : "text-stone-500"}>
                          {menu.id === bestMenuId ? "현재 1위" : `${menu.votes}표`}
                        </span>
                        <span className="text-stone-300">·</span>
                        <span className="font-mono text-stone-500">
                          {totalVotes === 0 ? 0 : Math.round((menu.votes / totalVotes) * 100)}%
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => onVote(menu)}
                      className={`inline-flex min-h-11 shrink-0 items-center gap-1 rounded-sm border px-3 text-xs font-black transition-colors ${
                        menu.isVoted
                          ? "border-[#e60000] bg-[#e60000] text-white"
                          : "border-stone-200 bg-white text-[#25282b] hover:border-[#e60000] hover:text-[#e60000]"
                      }`}
                    >
                      {menu.isVoted && <Check className="h-3 w-3" />}
                      {menu.isVoted ? "내 투표" : "투표"}
                    </button>
                  </div>

                  <div className="mt-2 md:mt-0">
                    <ProgressBar votes={menu.votes} totalVotes={totalVotes} isSelected={menu.id === bestMenuId} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
