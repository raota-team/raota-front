"use client";

import { useQuery } from "@tanstack/react-query";
import { getRamenShopDetail } from "@/lib/api/ramen-shops";
import { useApp } from "@/app/context/AppContext";
import type { Shop } from "@/app/types";

export const useRamenShopDetail = (shopId: number, initialShop?: Shop) => {
  const { currentUser, isAuthChecking, isLoggedIn } = useApp();
  const memberId = currentUser?.user_id ?? currentUser?.id;

  return useQuery({
    queryKey: ["ramen-shop-detail", shopId, isLoggedIn ? "auth" : "guest", memberId ?? null],
    queryFn: () => getRamenShopDetail(shopId, memberId),
    enabled: Number.isFinite(shopId) && !isAuthChecking,
    initialData: isLoggedIn ? undefined : initialShop,
    refetchOnMount: "always",
  });
};
