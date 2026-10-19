import type { AdminV2BusinessStatus } from "@/lib/api/admin-v2";

export const businessStatusLabels: Record<AdminV2BusinessStatus, string> = {
  OPERATIONAL: "영업 중",
  TEMPORARILY_CLOSED: "임시 휴업",
  CLOSED: "폐업",
  UNKNOWN: "알 수 없음",
};

export const ramenTypeOptions = ["쇼유", "시오", "미소", "돈코츠", "토리파이탄", "츠케멘", "마제소바", "아부라소바", "탄탄멘", "이에케"];
