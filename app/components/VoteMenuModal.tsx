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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      <div
        className="relative z-10 w-full max-w-4xl overflow-hidden rounded-sm border border-stone-200 bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-20 rounded-full bg-stone-100 p-2 text-stone-600 transition-colors hover:bg-stone-200"
          aria-label="투표 모달 닫기"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="grid md:grid-cols-[19.5rem_minmax(0,1fr)] lg:grid-cols-[21rem_minmax(0,1fr)]">
          <div className="border-b border-stone-100 bg-stone-50 px-5 py-5 md:min-h-full md:border-b-0 md:border-r md:border-stone-100 md:px-6 md:py-6 lg:px-7">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#e60000]">메뉴 투표</p>
            <h2 className="mt-2 text-xl font-black leading-tight text-[#25282b] md:text-2xl">
              {shopName}에서
              <br />
              가장 맛있었던 메뉴는?
            </h2>
            <div className="mt-3 space-y-2 text-sm leading-6 text-stone-500">
              <p className="break-keep">가장 맛있었던 메뉴에 한 표를 남겨주세요.</p>
              <p className="break-keep">이미 투표한 메뉴는 다시 눌러 취소할 수 있어요.</p>
            </div>

            <div className="mt-5 rounded-sm border border-stone-200 bg-white px-4 py-3 text-sm font-bold text-stone-700">
              <div className="flex items-center justify-between gap-3">
                <span className="inline-flex items-center gap-2">
                  <Award className="h-4 w-4 text-[#e60000]" />
                  총 참여 수
                </span>
                <span className="font-mono text-[#25282b]">{totalVotes} 표</span>
              </div>
            </div>
          </div>

          <div className="max-h-[70vh] overflow-y-auto px-5 py-5 md:px-6 md:py-6">
            <div className="grid gap-4 md:grid-cols-2">
              {menus.map((menu) => (
                <div key={menu.id} className="rounded-sm border border-stone-200 bg-white p-4">
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center">
                        {menu.id === bestMenuId && (
                          <span className="mr-2 text-yellow-500">
                            <Star className="h-4 w-4" fill="currentColor" />
                          </span>
                        )}
                        <span className={`break-words font-bold ${menu.id === bestMenuId ? "text-stone-950" : "text-stone-700"}`}>
                          {menu.name}
                        </span>
                      </div>
                      <p className={`mt-1 text-[10px] font-black ${menu.id === bestMenuId ? "text-[#e60000]" : "text-stone-400"}`}>
                        {menu.id === bestMenuId ? "현재 가장 많은 선택" : "\u00A0"}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onVote(menu)}
                      className={`inline-flex shrink-0 items-center gap-1 rounded-sm px-3 py-1.5 text-[10px] font-black uppercase tracking-widest transition-colors ${
                        menu.isVoted ? "bg-[#e60000] text-white" : "bg-stone-100 text-stone-700 hover:bg-stone-200"
                      }`}
                    >
                      {menu.isVoted && <Check className="h-3 w-3" />}
                      {menu.isVoted ? "내 투표" : "투표"}
                    </button>
                  </div>

                  <ProgressBar votes={menu.votes} totalVotes={totalVotes} isSelected={menu.id === bestMenuId} />

                  <div className="mt-2 flex items-center justify-end">
                    <span className="text-[10px] font-mono font-bold text-stone-600">{menu.votes} 표</span>
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
