const RETURN_TO_BASE_URL = "https://raota.local";

export function sanitizeReturnTo(value: string | null | undefined, fallback = "/"): string {
  if (!value || !value.startsWith("/")) return fallback;

  try {
    const parsed = new URL(value, RETURN_TO_BASE_URL);
    if (parsed.origin !== RETURN_TO_BASE_URL) return fallback;

    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return fallback;
  }
}
