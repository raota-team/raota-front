import { apiClient } from "@/lib/api/client";

/** 한 묶음(전체·로직 버전·국물·순위)의 건수. 비율은 화면에서 계산한다. */
export interface RecommendationStatsRow {
  key: string;
  /** 매장을 1곳 이상 보여준 추천 수 */
  runs: number;
  /** 보여준 매장 칸 수 */
  impressions: number;
  /** 추천 결과에서 연 칸 수 */
  opened: number;
  /** 1위 매장을 연 추천 수 */
  topOpened: number;
  /** 추천 뒤 attributionDays일 안에 같은 회원이 찜한 칸 수(지금도 찜 상태인 것만) */
  bookmarked: number;
  /** 추천 뒤 attributionDays일 안에 같은 회원이 기록을 쓴 칸 수 */
  logged: number;
}

export interface RecommendationStats {
  /** 한국 날짜(YYYY-MM-DD), 양 끝 포함 */
  from: string;
  to: string;
  attributionDays: number;
  overall: RecommendationStatsRow;
  byAlgorithmVersion: RecommendationStatsRow[];
  bySoup: RecommendationStatsRow[];
  byRank: RecommendationStatsRow[];
}

interface ApiEnvelope<T> {
  status?: string;
  message?: string;
  data: T;
}

/** 기간을 비우면 서버가 오늘까지 최근 30일로 본다. 기간은 최대 92일이다. */
export const getRecommendationStats = async (range: { from?: string; to?: string } = {}): Promise<RecommendationStats> => {
  const params = new URLSearchParams();
  if (range.from) params.set("from", range.from);
  if (range.to) params.set("to", range.to);
  const query = params.toString();
  const response = await apiClient<ApiEnvelope<RecommendationStats>>(
    `/admin/api/v2/recommendations/stats${query ? `?${query}` : ""}`,
  );
  return response.data;
};
