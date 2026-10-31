export type RaotaAnalyticsEvent =
  | "shop_search_submitted"
  | "ai_taste_search_submitted"
  | "shop_detail_viewed"
  | "ramen_log_app_prompt_opened"
  | "app_store_clicked"
  | "community_post_started"
  | "community_post_completed";

/** Send a small, non-blocking event to the existing GTM data layer. */
export const trackEvent = (event: RaotaAnalyticsEvent, payload: Record<string, unknown> = {}) => {
  if (typeof window === "undefined") return;

  const dataLayer = window.dataLayer as unknown as Record<string, unknown>[] | undefined;
  dataLayer?.push({ event, ...payload });
};
