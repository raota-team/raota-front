"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, NotebookPen, RefreshCw } from "lucide-react";
import { getRamenLogs, type RamenLog } from "@/lib/api/ramen-logs";
import ResilientImage from "./ResilientImage";

interface ShopRamenLogPreviewProps {
  shopId: number;
  shopName: string;
  onWrite: () => void;
}

export default function ShopRamenLogPreview({
  shopId,
  shopName,
  onWrite,
}: ShopRamenLogPreviewProps) {
  const [logs, setLogs] = useState<RamenLog[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const requestSequenceRef = useRef(0);

  const loadLogs = useCallback(async () => {
    const requestSequence = ++requestSequenceRef.current;
    setIsLoading(true);
    setHasError(false);

    try {
      const result = await getRamenLogs({ page: 0, size: 3, sort: "POPULAR", shopId });
      if (requestSequence !== requestSequenceRef.current) return;
      setLogs(result.items);
      setTotalCount(result.page.totalElements);
    } catch (error) {
      console.error("Failed to fetch shop ramen logs:", error);
      if (requestSequence !== requestSequenceRef.current) return;
      setHasError(true);
    } finally {
      if (requestSequence === requestSequenceRef.current) setIsLoading(false);
    }
  }, [shopId]);

  useEffect(() => {
    void loadLogs();
    return () => {
      requestSequenceRef.current += 1;
    };
  }, [loadLogs]);

  const ramenLogUrl = `/ramen-log?shopId=${shopId}&shopName=${encodeURIComponent(shopName)}`;
  const featuredLog = logs[0];

  return (
    <section className="overflow-hidden rounded-md border border-stone-200 bg-white">
      <div className="flex items-start justify-between gap-4 p-4 pb-3 md:p-6 md:pb-4">
        <div className="min-w-0">
          <p className="text-[10px] font-black tracking-[0.14em] text-[#e60000]">
            라멘로그
          </p>
          <h2 className="mt-1 text-lg font-black leading-tight text-[#25282b] md:text-xl">
            이 가게의 한 그릇들
          </h2>
        </div>
        {!isLoading && totalCount > 0 && (
          <span className="shrink-0 rounded-full bg-stone-100 px-2.5 py-1 text-[10px] font-black text-stone-600">
            {totalCount.toLocaleString("ko-KR")}개 기록
          </span>
        )}
      </div>

      {isLoading ? (
        <div className="mx-4 mb-4 aspect-[4/3] animate-pulse rounded-sm bg-stone-100 md:mx-6 md:mb-6" />
      ) : hasError ? (
        <div className="px-4 pb-4 md:px-6 md:pb-6">
          <div className="flex min-h-44 flex-col items-center justify-center rounded-md bg-stone-50 px-5 py-7 text-center">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-stone-500">
              <RefreshCw className="h-5 w-5" />
            </span>
            <p className="mt-3 text-sm font-black text-[#25282b]">라멘로그를 불러오지 못했어요</p>
            <p className="mt-1 break-keep text-xs leading-5 text-stone-500">
              잠시 후 다시 시도해주세요.
            </p>
            <button
              type="button"
              onClick={() => void loadLogs()}
              className="mt-4 inline-flex items-center gap-2 rounded-sm bg-[#e60000] px-4 py-2.5 text-xs font-black text-white transition-opacity hover:opacity-90"
            >
              다시 불러오기
              <RefreshCw className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      ) : logs.length > 0 ? (
        <>
          <div className="mx-4 grid aspect-[4/3] grid-cols-3 grid-rows-2 gap-1 overflow-hidden rounded-md bg-stone-100 md:mx-6">
            {logs.map((log, index) => (
              <div
                key={log.id}
                className={`relative overflow-hidden ${
                  index === 0 ? "col-span-2 row-span-2" : "col-span-1 row-span-1"
                } ${logs.length === 1 ? "!col-span-3" : ""} ${
                  logs.length === 2 && index === 1 ? "!row-span-2" : ""
                }`}
              >
                <ResilientImage
                  src={log.imageUrl}
                  alt={`${log.menuName} 라멘로그`}
                  fill
                  sizes="(min-width: 1024px) 25vw, 100vw"
                  className="object-cover"
                />
              </div>
            ))}
          </div>

          <div className="p-4 md:p-6">
            <p className="truncate text-sm font-black text-[#25282b]">
              {featuredLog.menuName}
            </p>
            {featuredLog.note && (
              <p className="mt-1 line-clamp-2 text-sm leading-6 text-[#7e7e7e]">
                “{featuredLog.note}”
              </p>
            )}
            <Link
              href={ramenLogUrl}
              aria-label={`${shopName} 라멘로그 ${totalCount}개 보기`}
              className="mt-4 inline-flex w-full items-center justify-between rounded-sm bg-[#e60000] px-4 py-3 text-sm font-black text-white transition-opacity hover:opacity-90"
            >
              <span>라멘로그 {totalCount.toLocaleString("ko-KR")}개 보기</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </>
      ) : (
        <div className="px-4 pb-4 md:px-6 md:pb-6">
          <div className="flex min-h-44 flex-col items-center justify-center rounded-md bg-stone-50 px-5 py-7 text-center">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-[#e60000]">
              <NotebookPen className="h-5 w-5" />
            </span>
            <p className="mt-3 text-sm font-black text-[#25282b]">아직 남겨진 라멘로그가 없어요</p>
            <p className="mt-1 max-w-64 break-keep text-xs leading-5 text-stone-500">
              {shopName}의 첫 번째 한 그릇을 기록해보세요.
            </p>
            <button
              type="button"
              onClick={onWrite}
              className="mt-4 inline-flex items-center gap-2 rounded-sm bg-[#e60000] px-4 py-2.5 text-xs font-black text-white transition-opacity hover:opacity-90"
            >
              첫 라멘로그 남기기
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
