"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { BarChart3, Loader2 } from "lucide-react";

import { compareShops } from "@/lib/api/recommend";
import { ShopOptionList } from "@/app/(routes)/recommend/_components/ShopOptionList";
import { compareFocusExamples } from "@/app/(routes)/recommend/constants";
import type { ShopOption } from "@/app/(routes)/recommend/types";
import type { Shop } from "@/app/types";
import { useApp } from "@/app/context/AppContext";
import { ApiClientError } from "@/lib/api/client";

type ShopComparePanelProps = {
  shop: Shop;
};

type CompactNarrative = {
  title: string;
  body: string;
};

const sanitizeCompareNarrative = (item: CompactNarrative): CompactNarrative => ({
  title: item.title.replace(/수치적\s*/g, "").replace(/점수/g, "평가").trim(),
  body: item.body
    .replace(/\d+\s*점을\s*기록했다/g, "좋은 반응을 보였다")
    .replace(/\d+\s*점(?:의|으로)?\s*/g, "")
    .replace(/높은\s+재방문\s+점수/g, "높은 재방문 평가")
    .replace(/재방문\s+점수/g, "재방문 평가")
    .replace(/점수를\s*기록했다/g, "평가를 받았다")
    .replace(/점수/g, "평가")
    .replace(/\s{2,}/g, " ")
    .replace(/\s+,/g, ",")
    .trim(),
});

const getCompactNarratives = ({
  primaryName,
  secondaryName,
  focus,
  compareData,
}: {
  primaryName: string;
  secondaryName: string;
  focus: string;
  compareData: any;
}): CompactNarrative[] => {
  const apiNarratives = compareData?.narratives;
  if (Array.isArray(apiNarratives) && apiNarratives.length > 0) {
    return apiNarratives.map(sanitizeCompareNarrative);
  }

  return [
    {
      title: focus ? `${focus} 기준` : "기본 비교",
      body: `${primaryName}와 ${secondaryName}를 같은 기준으로 비교한 간단 요약입니다.`,
    },
    {
      title: "방문 판단",
      body: "분위기, 접근성, 메뉴 취향을 함께 보고 오늘 더 맞는 쪽을 골라보세요.",
    },
  ].map(sanitizeCompareNarrative);
};

const highlightShopNames = (text: string, shopA: string, shopB: string) => {
  if (!text) return "";

  const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`(${escapeRegExp(shopA)}|${escapeRegExp(shopB)})`, "g");

  return text.split(regex).map((part, index) => {
    if (part === shopA) {
      return (
        <strong key={`${part}-${index}`} className="rounded-sm bg-red-50/80 px-1 py-0.5 font-extrabold text-[#e60000]">
          {part}
        </strong>
      );
    }

    if (part === shopB) {
      return (
        <strong key={`${part}-${index}`} className="rounded-sm bg-stone-100 px-1 py-0.5 font-extrabold text-stone-800">
          {part}
        </strong>
      );
    }

    return part;
  });
};

function CompactCompareResult({
  primaryName,
  secondaryName,
  focus,
  compareData,
}: {
  primaryName: string;
  secondaryName: string;
  focus: string;
  compareData: any;
}) {
  const narratives = getCompactNarratives({ primaryName, secondaryName, focus, compareData });

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#e60000]">비교 결과</p>
          <h3 className="mt-1 text-sm font-black text-[#25282b]">
            {primaryName} vs {secondaryName}
          </h3>
        </div>
        {focus && (
          <span className="max-w-[9rem] truncate rounded-sm bg-white px-2.5 py-1.5 text-xs font-bold text-stone-500">
            {focus}
          </span>
        )}
      </div>

      <div className="space-y-2">
        {narratives.map((item) => (
          <article key={item.title} className="rounded-sm border border-stone-200 bg-white px-3 py-2.5">
            <p className="text-xs font-black text-[#25282b]">{item.title}</p>
            <p className="mt-1 text-xs font-medium leading-5 text-stone-600">
              {highlightShopNames(item.body, primaryName, secondaryName)}
            </p>
          </article>
        ))}
      </div>

      <p className="rounded-sm bg-white px-3 py-2 text-[11px] font-bold leading-5 text-stone-500">
        AI 비교 결과는 가게 정보와 리뷰를 바탕으로 생성되며, 실제 방문 경험과 다를 수 있어요.
      </p>
    </div>
  );
}

export default function ShopComparePanel({ shop }: ShopComparePanelProps) {
  const router = useRouter();
  const { isLoggedIn, isAuthChecking, showConfirm } = useApp();
  const [compareTarget, setCompareTarget] = useState<ShopOption | null>(null);
  const [compareFocus, setCompareFocus] = useState("");
  const [compareResult, setCompareResult] = useState<any>(null);
  const [submittedTarget, setSubmittedTarget] = useState<ShopOption | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const secondaryShop = useMemo<Shop | null>(() => {
    if (!submittedTarget) return null;

    return {
      ...shop,
      id: submittedTarget.id,
      name: submittedTarget.name,
      location: submittedTarget.region,
      address: submittedTarget.region,
      description: `${submittedTarget.name}와 ${shop.name}의 차이를 같은 기준으로 확인해보세요.`,
      imageUrl: "/header-shoplist-anime.webp",
    };
  }, [shop, submittedTarget]);

  const handleCompare = async () => {
    if (!compareTarget || isAuthChecking) return;

    if (!isLoggedIn) {
      showConfirm("AI 가게 비교는 로그인 후 이용할 수 있습니다. 로그인하시겠습니까?", () => {
        router.push(`/login?returnTo=${encodeURIComponent(`/shop/${shop.id}`)}`);
      });
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage(null);
      setCompareResult(null);

      const result: any = await compareShops({
        shopAId: shop.id,
        shopBId: compareTarget.id,
        focus: compareFocus.trim() || "기본 비교",
      });

      const nextCompareData = result.data;
      const responseMatchesSelection =
        Number(nextCompareData?.shopA?.id) === Number(shop.id) &&
        Number(nextCompareData?.shopB?.id) === Number(compareTarget.id);

      if (!responseMatchesSelection) {
        setErrorMessage("선택한 가게의 비교 결과를 확인하지 못했습니다. 다시 시도해주세요.");
        return;
      }

      setCompareResult(nextCompareData);
      setSubmittedTarget(compareTarget);
    } catch (error) {
      if (error instanceof ApiClientError && error.status === 401) {
        showConfirm("로그인 정보가 만료되었습니다. 다시 로그인하시겠습니까?", () => {
          router.push(`/login?returnTo=${encodeURIComponent(`/shop/${shop.id}`)}`);
        });
        return;
      }

      if (error instanceof ApiClientError && error.status === 403) {
        setErrorMessage("AI 가게 비교를 이용할 권한이 없습니다.");
        return;
      }

      setErrorMessage("AI 비교 응답을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="relative rounded-sm border border-stone-200 bg-white">
      <div className="border-b border-stone-100 p-3.5 md:p-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-[#e60000]">
              <BarChart3 className="h-3.5 w-3.5" />
              <p className="text-[10px] font-black uppercase tracking-[0.16em]">1:1 비교</p>
            </div>
            <h2 className="mt-1.5 text-base font-black leading-snug text-[#25282b] md:text-lg">
              고민 중인 가게와 비교하기
            </h2>
          </div>
          <p className="min-w-0 truncate rounded-sm bg-stone-50 px-2.5 py-1.5 text-xs font-bold text-stone-500">
            기준: <span className="text-[#25282b]">{shop.name}</span>
          </p>
        </div>
      </div>

      {submittedTarget && secondaryShop && (
        <div className="space-y-3 bg-stone-50 p-3.5 md:p-4">
          <CompactCompareResult
            primaryName={shop.name}
            secondaryName={secondaryShop.name}
            focus={compareFocus.trim()}
            compareData={compareResult}
          />
          <button
            type="button"
            onClick={() => {
              setSubmittedTarget(null);
              setCompareResult(null);
              setErrorMessage(null);
            }}
            className="inline-flex h-10 w-full items-center justify-center rounded-sm border border-stone-200 bg-white px-4 text-xs font-black text-[#25282b] transition-colors hover:border-[#e60000] hover:text-[#e60000]"
          >
            다시 비교하기
          </button>
        </div>
      )}

      {(!submittedTarget || !secondaryShop) && (
        <div className="space-y-3 p-3.5 md:p-4">
          <ShopOptionList
            label="비교 B"
            selectedOption={compareTarget}
            onSelect={setCompareTarget}
            disabledOptionIds={[shop.id]}
            compact
          />

          <div className="space-y-2">
            <label htmlFor={`shop-compare-focus-${shop.id}`} className="sr-only">가게 비교 관점</label>
            <input
              id={`shop-compare-focus-${shop.id}`}
              value={compareFocus}
              onChange={(event) => setCompareFocus(event.target.value)}
              placeholder="비교 관점: 웨이팅, 혼밥, 국물 진함"
              className="h-11 w-full rounded-sm border border-stone-200 bg-white px-3 text-sm font-bold text-[#25282b] outline-none transition-colors placeholder:text-[#bebebe] focus:border-[#e60000]"
            />
            <div className="flex gap-2 overflow-x-auto pb-1">
              {compareFocusExamples.map((example) => (
                <button
                  key={example}
                  type="button"
                  onClick={() => setCompareFocus(example)}
                  className="min-h-11 shrink-0 rounded-sm border border-stone-200 bg-[#f7f7f7] px-3 py-1.5 text-xs font-bold text-[#25282b] transition-colors hover:border-[#e60000] hover:text-[#e60000] md:min-h-0"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={handleCompare}
            disabled={!compareTarget || isLoading || isAuthChecking}
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-sm bg-[#e60000] px-5 text-sm font-black text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:bg-stone-300 disabled:opacity-80"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                비교 중
              </>
            ) : (
              "비교하기"
            )}
          </button>

          {errorMessage && (
            <div className="rounded-sm border border-[#e60000]/20 bg-[#e60000]/5 px-4 py-3 text-sm font-bold text-[#25282b]">
              {errorMessage}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
