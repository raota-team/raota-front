import type { Shop } from "@/app/types";

export type ModeId = "taste" | "compare" | "summary";

export type ShopOption = {
  id: number;
  name: string;
  region: string;
};

export type SubmittedTaste = {
  soup: string;
  mood: string;
  priority: string;
  focus: string;
};

export type SubmittedCompare = {
  shopA: ShopOption;
  shopB: ShopOption;
  focus: string;
};

export type SubmittedSummary = {
  shop: ShopOption;
  focus: string;
};
