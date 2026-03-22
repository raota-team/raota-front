"use client";

import { useQuery } from "@tanstack/react-query";
import {
  getRamenShops,
  RamenShopsParams,
  RamenShopsResult,
} from "@/lib/api/ramen-shops";

export const useRamenShops = (params: RamenShopsParams) =>
  useQuery<RamenShopsResult>({
    queryKey: [
      "ramen-shops",
      params.page ?? 0,
      params.size ?? 12,
      params.region ?? "",
      params.keyword ?? "",
      (params.sort ?? []).join("|"),
    ],
    queryFn: () => getRamenShops(params),
  });
