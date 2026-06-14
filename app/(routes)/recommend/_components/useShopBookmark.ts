"use client";

import { useEffect, useState, type MouseEvent } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";

import { useApp } from "@/app/context/AppContext";
import { toggleBookmark } from "@/lib/api/ramen-shops";

export function useShopBookmark(shopId: number, initialIsBookmarked?: boolean) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isLoggedIn, showConfirm, showToast } = useApp();
  const [isBookmarked, setIsBookmarked] = useState(Boolean(initialIsBookmarked));
  const [isBookmarkPending, setIsBookmarkPending] = useState(false);

  useEffect(() => {
    setIsBookmarked(Boolean(isLoggedIn && initialIsBookmarked));
  }, [initialIsBookmarked, isLoggedIn, shopId]);

  const handleBookmark = async (event?: MouseEvent<HTMLElement>) => {
    event?.preventDefault();
    event?.stopPropagation();

    if (!isLoggedIn) {
      showConfirm("로그인이 필요한 기능입니다.\n로그인 페이지로 이동하시겠습니까?", () => {
        router.push("/login");
      });
      return;
    }

    if (isBookmarkPending) return;

    try {
      setIsBookmarkPending(true);
      const newStatus = await toggleBookmark(shopId);
      setIsBookmarked(newStatus);
      queryClient.invalidateQueries({ queryKey: ["ramen-shop-detail", shopId] });
      queryClient.invalidateQueries({ queryKey: ["ramen-shops"] });
      queryClient.invalidateQueries({ queryKey: ["recommend-ramen-shops"] });
      queryClient.invalidateQueries({ queryKey: ["user-bookmarks"] });
      queryClient.invalidateQueries({ queryKey: ["bookmarks"] });
    } catch (error) {
      showToast("북마크 처리 중 오류가 발생했습니다.", "error");
    } finally {
      setIsBookmarkPending(false);
    }
  };

  return { isBookmarked: isLoggedIn ? isBookmarked : false, isBookmarkPending, handleBookmark };
}
