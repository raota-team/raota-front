export const RAMEN_LOG_FALLBACK_IMAGE = "/logo.png";
export const RAMEN_LOG_FALLBACK_IMAGE_URL = "https://www.raota.net/logo.png";

export const isRamenLogFallbackImage = (src?: string | null) =>
  !src?.trim() ||
  src.endsWith("/menu-no-image.png") ||
  src.endsWith("/logo.png");
