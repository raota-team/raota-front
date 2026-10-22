import type { AdminV2BusinessStatus } from "@/lib/api/admin-v2";

export const businessStatusLabels: Record<AdminV2BusinessStatus, string> = {
  OPERATIONAL: "영업 중",
  TEMPORARILY_CLOSED: "임시 휴업",
  CLOSED: "폐업",
  UNKNOWN: "알 수 없음",
};

// 서버 v2 라멘 종류 값과 같아야 한다(앱과 같은 순서)
export const ramenTypeOptions = ["쇼유", "돈코츠", "이에케", "시오", "미소", "토리파이탄", "니보시", "지로", "츠케멘", "탄탄멘", "마제소바", "아부라소바", "기타"];
