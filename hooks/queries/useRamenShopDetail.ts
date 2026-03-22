"use client";

import { useQuery } from "@tanstack/react-query";
import { getRamenShopDetail } from "@/lib/api/ramen-shops";

export const useRamenShopDetail = (shopId: number) =>
  useQuery({
    queryKey: ["ramen-shop-detail", shopId],
    queryFn: () => getRamenShopDetail(shopId),
    enabled: Number.isFinite(shopId),
  });
