import React, { useDeferredValue, useMemo, useState, useEffect, useRef } from "react";
import { ChevronDown, Search, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getRamenShopOptions } from "@/lib/api/community";
import type { ShopOption } from "../types";
import { motion, AnimatePresence } from "framer-motion";

const normalizeShopOption = (item: any, index: number): ShopOption => ({
  id: Number(item?.id ?? item?.restaurant_id ?? item?.ramenShopId ?? index + 1),
  name: item?.name ?? item?.restaurant_name ?? item?.restaurantName ?? "이름 미정",
  region: item?.region ?? item?.location ?? item?.address_simple ?? item?.address ?? "지역 정보 없음",
});

export function ShopOptionList({
  label,
  selectedOption,
  onSelect,
  disabledOptionIds = [],
  compact = false,
}: {
  label: string;
  selectedOption: ShopOption | null;
  onSelect: (option: ShopOption) => void;
  disabledOptionIds?: number[];
  compact?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const inputRef = useRef<HTMLInputElement>(null);

  const shopOptionsQuery = useQuery({
    queryKey: ["recommend-shop-options", label, deferredSearchQuery],
    queryFn: () => getRamenShopOptions(deferredSearchQuery.trim(), 0, "NAME"),
    enabled: isOpen,
    staleTime: 60 * 1000,
  });
  
  const options = useMemo(() => {
    const items = shopOptionsQuery.data?.data?.items;
    if (!Array.isArray(items) || items.length === 0) return [];
    return items.map(normalizeShopOption);
  }, [shopOptionsQuery.data]);
  const showInitialLoading = shopOptionsQuery.isFetching && options.length === 0;

  const disabledOptionIdSet = useMemo(() => new Set(disabledOptionIds), [disabledOptionIds]);

  const handleSelect = (option: ShopOption) => {
    if (disabledOptionIdSet.has(option.id) && selectedOption?.id !== option.id) return;
    onSelect(option);
    setIsOpen(false);
  };

  useEffect(() => {
    if (isOpen && inputRef.current && window.innerWidth >= 768) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  return (
    <div className="relative">
      <span className={`${compact ? "mb-1.5 text-[11px] tracking-[0.14em]" : "mb-2 text-[12px] tracking-widest"} block font-bold uppercase text-[#7e7e7e]`}>{label}</span>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`flex w-full items-center justify-between gap-3 rounded-[2px] border text-left transition-colors ${
          compact ? "min-h-11 px-3 py-2.5" : "min-h-12 px-4 py-3 sm:min-h-[4.375rem]"
        } ${
          isOpen ? "border-[#e60000]" : "border-[#333333] hover:border-[#e60000]"
        }`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="min-w-0">
          <span className={`block truncate text-[14.4px] font-bold ${selectedOption ? "text-[#25282b]" : "text-[#bebebe]"}`}>
            {selectedOption ? selectedOption.name : "매장 선택"}
          </span>
          {selectedOption && !compact && (
            <span className="mt-0.5 hidden truncate text-[12px] font-medium text-[#7e7e7e] sm:block">{selectedOption.region}</span>
          )}
        </span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-[#25282b] transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute left-0 right-0 z-30 mt-2 overflow-hidden rounded-[2px] border border-stone-200 bg-white shadow-lg"
          >
            <div className="border-b border-stone-200 bg-stone-50 p-3">
              <div className="flex items-center rounded-[2px] border border-stone-200 bg-white px-3 py-2 focus-within:border-[#e60000]">
                <Search className="mr-2 h-4 w-4 text-[#bebebe]" />
                <input
                  ref={inputRef}
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="가게 이름 검색"
                  className="min-w-0 flex-1 bg-transparent text-sm font-bold text-[#25282b] outline-none placeholder:text-[#bebebe]"
                />
                {shopOptionsQuery.isFetching && <Loader2 className="ml-2 h-4 w-4 animate-spin text-[#bebebe]" />}
              </div>
            </div>

            <div className="max-h-60 overflow-y-auto overscroll-contain" role="listbox">
              {showInitialLoading ? (
                <div className="flex items-center gap-2 px-4 py-5 text-sm font-bold text-[#7e7e7e]">
                  <Loader2 className="h-4 w-4 animate-spin text-[#bebebe]" />
                  라멘집 목록을 불러오는 중
                </div>
              ) : options.length === 0 ? (
                <div className="px-4 py-5 text-sm font-bold text-[#7e7e7e]">
                  검색 결과가 없습니다.
                </div>
              ) : (
                options.map((option) => {
                const isSelected = selectedOption?.id === option.id;
                const isDisabled = disabledOptionIdSet.has(option.id) && !isSelected;
                return (
                  <button
                    key={`${label}-${option.id}`}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    aria-disabled={isDisabled}
                    disabled={isDisabled}
                    onClick={() => handleSelect(option)}
                    className={`block w-full px-4 py-4 text-left transition-colors ${
                      isDisabled
                        ? "cursor-not-allowed bg-stone-50 text-[#bebebe]"
                        : isSelected
                          ? "bg-red-50 text-[#e60000]"
                          : "text-[#25282b] hover:bg-stone-50"
                    }`}
                  >
                    <span className="block truncate font-bold">{option.name}</span>
                    <span className={`mt-0.5 block truncate text-xs font-medium ${isDisabled ? "text-[#bebebe]" : "text-[#7e7e7e]"}`}>
                      {isDisabled ? "이미 선택한 매장" : option.region}
                    </span>
                  </button>
                );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
