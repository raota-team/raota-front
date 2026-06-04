"use client";

import Loading from "@/app/loading";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ArrowRight, RotateCcw } from "lucide-react";
import { motion } from "framer-motion";

import type { Shop } from "@/app/types";
import type { ModeId, ShopOption, SubmittedTaste, SubmittedCompare, SubmittedSummary } from "./types";
import { modes, modePrompts, tasteOptions, fallbackShopOptions, modeCopy, compareFocusExamples, summaryFocusExamples, tasteFocusExamples } from "./constants";
import { useQuery } from "@tanstack/react-query"; //내가추가
import { getRamenShops } from "@/lib/api/ramen-shops"; //내가 추가

import { ChoiceGroup } from "./_components/ChoiceGroup";
import { RecommendEmptyState } from "./_components/RecommendEmptyState";
import { ShopOptionList } from "./_components/ShopOptionList";
import { TasteResults } from "./_components/TasteResults";
import { CompareResults } from "./_components/CompareResults";
import { SummaryResults } from "./_components/SummaryResults";
import { QuestionCard, PromptField } from "./_components/SharedComponents";
import { compareShops, getReviewSummary} from "@/lib/api/recommend"; //추가


const buildDisplayShop = (template: Shop, option: ShopOption | null): Shop => {
  if (!option) return template;
  return {
    ...template,
    id: option.id,
    name: option.name,
    location: option.region,
    address: option.region,
  };
};

export default function RecommendPage() {
  const contentRef = useRef<HTMLElement | null>(null);
  const tabsRef = useRef<HTMLElement | null>(null);
  const tabsInitialTopRef = useRef<number | null>(null);
  const resultRef = useRef<HTMLDivElement | null>(null);

  const [activeMode, setActiveMode] = useState<ModeId>("taste");
  const [isTabsPinned, setIsTabsPinned] = useState(false);
  const [tabsHeight, setTabsHeight] = useState(0);

  const [selectedSoup, setSelectedSoup] = useState<string | null>(null);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [selectedPriority, setSelectedPriority] = useState<string | null>(null);
  const [tasteFocus, setTasteFocus] = useState("");

  const [compareFocus, setCompareFocus] = useState("");
  const [summaryFocus, setSummaryFocus] = useState("");
  const [compareShopA, setCompareShopA] = useState<ShopOption | null>(null);
  const [compareShopB, setCompareShopB] = useState<ShopOption | null>(null);
  const [summaryShop, setSummaryShop] = useState<ShopOption | null>(null);

  const [submittedTaste, setSubmittedTaste] = useState<SubmittedTaste | null>(null);
  const [submittedCompare, setSubmittedCompare] = useState<SubmittedCompare | null>(null);
  const [submittedSummary, setSubmittedSummary] = useState<SubmittedSummary | null>(null);

  const [tasteStep, setTasteStep] = useState(0);
  const [shakeKey, setShakeKey] = useState(0);
  const [compareResult, setCompareResult] = useState<any>(null); //추가
  const [isCompareLoading, setIsCompareLoading] = useState(false); //추가
  const [summaryResult, setSummaryResult] = useState<any>(null); //추가
  const [isSummaryLoading, setIsSummaryLoading] = useState(false); //추가
  const { data: ramenShopsData } = useQuery({ queryKey: ["recommend-ramen-shops"], queryFn: () => getRamenShops({ page: 0, size: 100, sort: "NAME" }), });

  const shops = ramenShopsData?.shops ?? [];

  const effectiveTaste = submittedTaste;
  const filteredShops = effectiveTaste?.soup
    ? shops.filter((shop) => shop.type.includes(effectiveTaste.soup))
    : shops;
  const displayShops = filteredShops.length > 0 ? filteredShops : shops;

  //여기서부터
  const fallbackPrimaryShop = shops[0];
  const fallbackSecondaryShop = shops[1] ?? shops[0];

  const primaryShop = activeMode === "summary"
    ? fallbackPrimaryShop && buildDisplayShop(fallbackPrimaryShop, submittedSummary?.shop ?? null)
    : fallbackPrimaryShop && buildDisplayShop(displayShops[0] ?? fallbackPrimaryShop, submittedCompare?.shopA ?? fallbackShopOptions[0]);

  const secondaryShop =
    fallbackSecondaryShop &&
    buildDisplayShop(displayShops[1] ?? fallbackSecondaryShop, submittedCompare?.shopB ?? fallbackShopOptions[1]);
  // 여기까지 수정함

  const isTasteReady = Boolean(selectedSoup && selectedMood && selectedPriority);
  const isCompareReady = Boolean(compareShopA && compareShopB);
  const isSummaryReady = Boolean(summaryShop);

  const isTasteSubmitted =
    Boolean(submittedTaste) &&
    submittedTaste?.soup === selectedSoup &&
    submittedTaste?.mood === selectedMood &&
    submittedTaste?.priority === selectedPriority &&
    submittedTaste?.focus === tasteFocus.trim();
  const isCompareSubmitted =
    Boolean(submittedCompare) &&
    submittedCompare?.shopA.id === compareShopA?.id &&
    submittedCompare?.shopB.id === compareShopB?.id;
  const isSummarySubmitted =
    Boolean(submittedSummary) &&
    submittedSummary?.shop.id === summaryShop?.id &&
    submittedSummary?.focus === summaryFocus.trim();

  const shouldShowResults =
    activeMode === "taste" ? isTasteSubmitted : activeMode === "compare" ? isCompareSubmitted : isSummarySubmitted;
  const activePrompt = modePrompts[activeMode];
  const activeStep = activeMode === "taste" ? tasteStep : 0;

  useEffect(() => {
    // Parse URL params for initial mode
    const params = new URLSearchParams(window.location.search);
    const modeParam = params.get('mode') as ModeId;
    if (modeParam && modes.some(m => m.id === modeParam)) {
      setActiveMode(modeParam);
    }

    const updateTabsPin = () => {
      if (!tabsRef.current) return;
      const headerHeight = window.innerWidth >= 768 ? 64 : 56;
      if (tabsInitialTopRef.current === null) {
        tabsInitialTopRef.current = tabsRef.current.getBoundingClientRect().top + window.scrollY;
      }
      setTabsHeight(tabsRef.current.offsetHeight);
      setIsTabsPinned(window.scrollY >= tabsInitialTopRef.current - headerHeight);
    };
    const handleResize = () => {
      tabsInitialTopRef.current = null;
      updateTabsPin();
    };

    updateTabsPin();
    window.addEventListener("scroll", updateTabsPin, { passive: true });
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("scroll", updateTabsPin);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const handleTasteSoupChange = (value: string | null) => {
    setSelectedSoup(value);
    if (value) setTasteStep(1);
  };

  const handleTasteMoodChange = (value: string | null) => {
    setSelectedMood(value);
    if (value) setTasteStep(2);
  };

  const handleTastePriorityChange = (value: string | null) => {
    setSelectedPriority(value);
    if (value) setTasteStep(3);
  };

  const handleModeChange = (mode: ModeId) => {
    setActiveMode(mode);
    window.requestAnimationFrame(() => {
      if (!contentRef.current) return;
      const stickyOffset = window.innerWidth >= 1024 ? 128 : window.innerWidth >= 768 ? 128 : 108;
      const targetTop = contentRef.current.getBoundingClientRect().top + window.scrollY - stickyOffset;
      window.scrollTo({ top: Math.max(targetTop, 0), behavior: "smooth" });
    });
  };

  const handleCompareShopASelect = (option: ShopOption) => {
    setCompareShopA(option);
    if (compareShopB?.id === option.id) {
      setCompareShopB(null);
    }
  };

  const handleCompareShopBSelect = (option: ShopOption) => {
    setCompareShopB(option);
    if (compareShopA?.id === option.id) {
      setCompareShopA(null);
    }
  };

  const handleReset = () => {
    if (activeMode === "taste") {
      setSelectedSoup(null);
      setSelectedMood(null);
      setSelectedPriority(null);
      setTasteFocus("");
      setSubmittedTaste(null);
      setTasteStep(0);
      return;
    }
    if (activeMode === "compare") {
      setCompareShopA(null);
      setCompareShopB(null);
      setCompareFocus("");
      setSubmittedCompare(null);
      setCompareResult(null); // 추가
      return;
    }
    setSummaryShop(null);
    setSummaryFocus("");
    setSubmittedSummary(null);
  };

  const handlePreviousStep = () => {
    setTasteStep((prev) => Math.max(prev - 1, 0));
  };

  const handleGenerateClick = async () => {
    const isCurrentStepReady =
      activeMode === "taste"
        ? activeStep === 0
          ? selectedSoup
          : activeStep === 1
            ? selectedMood
            : activeStep === 2
              ? selectedPriority
              : true // Step 4 (focus) is optional
        : activeMode === "compare"
          ? compareShopA && compareShopB
          : summaryShop;

    if (!isCurrentStepReady) {
      setShakeKey((prev) => prev + 1);
      return;
    }

    if (activeMode === "taste" && activeStep < activePrompt.totalSteps - 1) {
      setTasteStep((prev) => prev + 1);
      return;
    }

    if (activeMode === "taste" && selectedSoup && selectedMood && selectedPriority) {
      setSubmittedTaste({
        soup: selectedSoup,
        mood: selectedMood,
        priority: selectedPriority,
        focus: tasteFocus.trim(),
      });
    }

    if (activeMode === "compare" && compareShopA && compareShopB) {
      try {
        setIsCompareLoading(true);

        const result: any = await compareShops({
          shopAId: compareShopA.id,
          shopBId: compareShopB.id,
          focus: compareFocus.trim() || "기본 비교",
        });

        setCompareResult(result.data);

        setSubmittedCompare({
          shopA: compareShopA,
          shopB: compareShopB,
          focus: compareFocus.trim(),
        });
      } catch (error) {
        console.error("비교 API 실패:", error);

        // API 실패해도 기존 임시 비교 결과 화면은 보여주기
        setSubmittedCompare({
          shopA: compareShopA,
          shopB: compareShopB,
          focus: compareFocus.trim(),
        });
      } finally {
        setIsCompareLoading(false);
      }
    }

    if (activeMode === "summary" && summaryShop) {
      try {
        setIsSummaryLoading(true);

        const result = await getReviewSummary({
          shopId: summaryShop.id,
          focus: summaryFocus.trim() || "기본 요약",
        });

        setSummaryResult(result);

        setSubmittedSummary({
          shop: summaryShop,
          focus: summaryFocus.trim(),
        });
      } catch (error) {
        console.error("요약 API 실패:", error);

        setSubmittedSummary({
          shop: summaryShop,
          focus: summaryFocus.trim(),
        });
      } finally {
        setIsSummaryLoading(false);
      }
    }

    window.requestAnimationFrame(() => {
      const isDesktop = window.innerWidth >= 1024;
      const targetElement = isDesktop ? contentRef.current : resultRef.current;

      if (!targetElement) return;

      const headerHeight = window.innerWidth >= 768 ? 64 : 56;
      const currentTabsHeight = tabsRef.current?.offsetHeight || tabsHeight || 58;

      const fixedOffset = headerHeight + currentTabsHeight + (isDesktop ? 0 : 24);

      const targetTop = targetElement.getBoundingClientRect().top + window.scrollY - fixedOffset;
      window.scrollTo({ top: Math.max(targetTop, 0), behavior: "smooth" });
    });
  };

  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-[#25282b]">
        <div className="absolute inset-0">
          <Image
            src="/header-recommend.png"
            alt="Recommend background"
            fill
            priority
            className="object-cover opacity-55"
          />
          <div className="absolute inset-0 bg-[#25282b]/45" />
        </div>
        <div className="relative z-10 mx-auto flex min-h-[9rem] max-w-7xl flex-col items-center justify-center px-4 py-5 text-center sm:px-6 md:min-h-[16rem] lg:px-8">
          <div className="max-w-3xl">
            <h1 className="vodafone-display text-4xl text-white sm:text-5xl md:text-6xl">
              RECOMMENDATION<span className="text-[#e60000]">.</span>
            </h1>
            <p className="mx-auto mt-3 max-w-xl text-base font-medium leading-relaxed text-white/85 sm:text-lg">
              AI를 통해 추천받고 싶은 방식을 골라보세요.
            </p>
          </div>
        </div>
      </section>

      {/* Mode Selection Tabs */}
      {isTabsPinned && <div aria-hidden="true" style={{ height: tabsHeight }} />}
      <nav
        ref={tabsRef}
        role="tablist"
        aria-label="추천 모드 선택"
        className={`z-40 border-b border-stone-200 bg-white ${isTabsPinned ? "fixed left-0 right-0 top-14 md:top-16 shadow-sm" : "relative"
          }`}
      >
        <div className="mx-auto max-w-7xl px-0 sm:px-6 lg:px-8">
          <div className="grid grid-cols-3 py-1 md:py-0 lg:h-16 relative">
            {/* CSS-based sliding indicator */}
            <div
              className="absolute bottom-0 h-[2px] w-1/3 transition-transform duration-300 ease-in-out z-10"
              style={{ transform: `translateX(${modes.findIndex(m => m.id === activeMode) * 100}%)` }}
            >
              <div className="mx-4 sm:mx-6 h-full bg-[#e60000]" />
            </div>

            {modes.map((mode) => {
              const isActive = activeMode === mode.id;
              return (
                <button
                  key={mode.id}
                  role="tab"
                  aria-selected={isActive}
                  aria-controls="recommend-content"
                  onClick={() => handleModeChange(mode.id)}
                  className={`relative flex min-w-0 items-center justify-center gap-2 whitespace-nowrap px-2 py-4 text-xs font-bold transition-colors sm:px-6 sm:text-sm md:py-5 lg:h-16 lg:py-0 ${isActive ? "text-[#e60000]" : "text-[#25282b] hover:text-[#e60000]"
                    }`}
                >
                  <mode.icon className={`h-4 w-4 transition-colors ${isActive ? "text-[#e60000]" : "text-[#7e7e7e]"}`} />
                  <span className="hidden sm:inline">{mode.label}</span>
                  <span className="sm:hidden">{mode.mobileLabel}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <section ref={contentRef} id="recommend-content" className="mx-auto min-h-[calc(100svh-12rem)] max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:min-h-[48rem] lg:px-8 lg:py-10">
        <div className="grid gap-6 lg:grid-cols-[21rem_minmax(0,1fr)] lg:items-start lg:gap-6">

          {/* Sidebar - Selection Controls */}
          <aside className="border border-stone-200 bg-white p-5 lg:sticky lg:top-36 lg:self-start lg:p-6">
            <div className="border-b border-stone-200 pb-4">
              <p className="text-xs font-extrabold tracking-[0.18em] text-[#e60000]">{activePrompt.label}</p>
              <h2 className="mt-2 text-xl font-bold leading-tight text-[#25282b] sm:text-2xl lg:text-xl">{activePrompt.intro}</h2>
              {activePrompt.totalSteps > 1 && (
                <>
                  <div className="mt-3 flex items-center gap-2">
                    {Array.from({ length: activePrompt.totalSteps }).map((_, index) => (
                      <span
                        key={`${activeMode}-step-${index}`}
                        className={`h-[2px] flex-1 transition-colors duration-300 ${index <= activeStep ? "bg-[#e60000]" : "bg-stone-200"}`}
                      />
                    ))}
                  </div>
                  <p className="mt-2 text-xs font-bold uppercase tracking-[0.14em] text-[#7e7e7e]">
                    질문 {activeStep + 1} / {activePrompt.totalSteps}
                  </p>
                </>
              )}
            </div>

            <div className="mt-4 space-y-4">
              {activeMode === "taste" && (
                <>
                  {tasteStep === 0 && (
                    <QuestionCard step="01" title="지금 어떤 국물이 당기나요?">
                      <ChoiceGroup label="국물" value={selectedSoup} options={tasteOptions.soup} onChange={handleTasteSoupChange} />
                    </QuestionCard>
                  )}
                  {tasteStep === 1 && (
                    <QuestionCard step="02" title="오늘은 어떤 분위기로 먹고 싶나요?">
                      <ChoiceGroup label="상황" value={selectedMood} options={tasteOptions.mood} onChange={handleTasteMoodChange} />
                    </QuestionCard>
                  )}
                  {tasteStep === 2 && (
                    <QuestionCard step="03" title="가장 중요하게 보는 포인트는 무엇인가요?">
                      <ChoiceGroup label="우선순위" value={selectedPriority} options={tasteOptions.priority} onChange={handleTastePriorityChange} />
                    </QuestionCard>
                  )}
                  {tasteStep === 3 && (
                    <QuestionCard step="04" title="그 외에 더 바라는 점이 있나요?">
                      <PromptField value={tasteFocus} onChange={setTasteFocus} placeholder="예: 양이 많은 곳, 토핑이 다양한 곳" examples={tasteFocusExamples} />
                    </QuestionCard>
                  )}
                </>
              )}

              {activeMode !== "taste" && (
                <div className="space-y-6">
                  {activeMode === "compare" && (
                    <QuestionCard title="비교할 매장을 선택해주세요.">
                      <div className="space-y-6">
                        <ShopOptionList
                          label="비교 A"
                          selectedOption={compareShopA}
                          onSelect={handleCompareShopASelect}
                          disabledOptionIds={compareShopB ? [compareShopB.id] : []}
                        />
                        <div className="flex items-center justify-center">
                          <div className="h-px flex-1 bg-[#f2f2f2]" />
                          <span className="px-3 text-[10px] font-bold text-[#bebebe]">비교</span>
                          <div className="h-px flex-1 bg-[#f2f2f2]" />
                        </div>
                        <ShopOptionList
                          label="비교 B"
                          selectedOption={compareShopB}
                          onSelect={handleCompareShopBSelect}
                          disabledOptionIds={compareShopA ? [compareShopA.id] : []}
                        />
                        <PromptField label="추가로 비교하고 싶은 점" value={compareFocus} onChange={setCompareFocus} placeholder="예: 웨이팅 적은 곳, 혼밥하기 좋은 곳" examples={compareFocusExamples} />
                      </div>
                    </QuestionCard>
                  )}

                  {activeMode === "summary" && (
                    <QuestionCard title="요약할 매장과 궁금한 점을 알려주세요.">
                      <div className="space-y-6">
                        <ShopOptionList label="요약 대상" selectedOption={summaryShop} onSelect={setSummaryShop} />
                        <PromptField label="특히 알고 싶은 점" value={summaryFocus} onChange={setSummaryFocus} placeholder="예: 주말 웨이팅, 대표 메뉴 추천" examples={summaryFocusExamples} />
                      </div>
                    </QuestionCard>
                  )}
                </div>
              )}
            </div>

            <div className="mt-6 grid gap-2 sm:grid-cols-2">
              {shouldShowResults ? (
                <button
                  type="button"
                  onClick={handleReset}
                  className="inline-flex items-center justify-center gap-2 rounded-[2px] border border-[#333333] bg-white px-[10px] py-[12px] text-[14.4px] font-bold text-[#333333] transition-colors hover:bg-stone-50"
                >
                  <RotateCcw className="h-4 w-4" />
                  초기화
                </button>
              ) : activeStep > 0 ? (
                <button
                  type="button"
                  onClick={handlePreviousStep}
                  className="inline-flex items-center justify-center gap-2 rounded-[2px] border border-[#333333] bg-white px-[10px] py-[12px] text-[14.4px] font-bold text-[#333333] transition-colors hover:bg-stone-50"
                >
                  이전 질문
                </button>
              ) : (
                <div className="hidden sm:block" />
              )}
              <motion.button
                key={shakeKey}
                animate={shakeKey > 0 ? { x: [-5, 5, -5, 5, 0] } : {}}
                transition={{ duration: 0.4 }}
                onClick={handleGenerateClick}
                className={`vodafone-button-pill w-full ${(
                  activeMode === "taste"
                    ? activeStep === 0
                      ? !selectedSoup
                      : activeStep === 1
                        ? !selectedMood
                        : activeStep === 2
                          ? !selectedPriority
                          : false // Step 4 (focus) is optional
                    : activeMode === "compare"
                      ? !compareShopA || !compareShopB
                      : !summaryShop
                )
                  ? "bg-[#bebebe] opacity-80"
                  : "hover:opacity-90"
                  }`}
              >
                {activeStep < activePrompt.totalSteps - 1 ? "다음 단계" : modeCopy[activeMode].action}
                <ArrowRight className="h-4 w-4" />
              </motion.button>
            </div>
          </aside>

          {/* Results Area */}
          <div ref={resultRef} className="scroll-mt-32">
            <div className="mb-6 border-b border-stone-200 pb-4">
              <h2 className="vodafone-display text-3xl text-[#25282b] sm:text-4xl">
                추천 결과<span className="text-[#e60000]">.</span>
              </h2>
              <p className="mt-2 text-sm font-medium leading-6 text-[#7e7e7e]">{activePrompt.resultHelper}</p>
            </div>

            <div className="min-h-[34rem] lg:min-h-[40rem]">
              {(activeMode === "compare" && isCompareLoading) ||
                (activeMode === "summary" && isSummaryLoading) ? (
                <Loading />
              ) : (
                <>
                  {!shouldShowResults && <RecommendEmptyState mode={activeMode} />}

                  {activeMode === "taste" && shouldShowResults && submittedTaste && (
                    <TasteResults
                      shops={displayShops}
                      selectedSoup={submittedTaste.soup}
                      selectedMood={submittedTaste.mood}
                      selectedPriority={submittedTaste.priority}
                      focus={submittedTaste.focus}
                    />
                  )}

                  {activeMode === "compare" && shouldShowResults && submittedCompare && primaryShop && secondaryShop && (
                    <CompareResults
                      primaryShop={primaryShop}
                      secondaryShop={secondaryShop}
                      focus={submittedCompare.focus}
                      compareData={compareResult}
                    />
                  )}

                  {activeMode === "summary" && shouldShowResults && submittedSummary && primaryShop && (
                    <SummaryResults
                      shop={primaryShop}
                      focus={submittedSummary.focus}
                      summaryData={summaryResult?.data}
                    />
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
