const STORAGE_KEY = 'raota_access_token';
const META_KEY = 'raota_auth_meta';
const AUTO_REFRESH_BLOCKED_KEY = 'raota_auto_refresh_blocked';

export type RaotaAuthMeta = {
  tokenType: string | null;
  expiresIn: number | null;
  memberId: number | null;
  newMember: boolean;
  provider: string | null;
};

export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(STORAGE_KEY);
}

function decodeJwtPayload(token: string): Record<string, any> | null {
  const [, payload] = token.split('.');
  if (!payload) return null;

  try {
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), '=');
    return JSON.parse(atob(padded));
  } catch {
    return null;
  }
}

export function getAccessTokenExpiresAt(token = getAccessToken()): number | null {
  if (!token) return null;
  const payload = decodeJwtPayload(token);
  const exp = payload?.exp;
  return typeof exp === 'number' ? exp * 1000 : null;
}

export function shouldRefreshAccessToken(token = getAccessToken(), thresholdMs = 60_000): boolean {
  if (!token) return true;
  const expiresAt = getAccessTokenExpiresAt(token);
  if (!expiresAt) return false;
  return expiresAt <= Date.now() + thresholdMs;
}

/** 신규 회원 여부 상태만 업데이트 */
export function updateNewMemberStatus(isNewMember: boolean) {
  if (typeof window === 'undefined') return;
  const meta = loadOAuthSessionMeta();
  if (meta) {
    meta.newMember = isNewMember;
    localStorage.setItem(META_KEY, JSON.stringify(meta));
  }
}

/** 토큰만 업데이트 (기존 메타데이터 유지) */
export function updateAccessToken(token: string) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, token);
  localStorage.removeItem(AUTO_REFRESH_BLOCKED_KEY);
}

/** 토큰만 저장(메타 제거). `/oauth2/redirect` 등 토큰만 넘길 때 사용 */
export function setAccessToken(token: string) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, token);
  localStorage.removeItem(META_KEY);
  localStorage.removeItem(AUTO_REFRESH_BLOCKED_KEY);
}

/** 백엔드가 `#accessToken=...&memberId=...` 형태로 넘길 때 */
export function saveRaotaOAuthSession(token: string, meta: RaotaAuthMeta) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, token);
  localStorage.setItem(META_KEY, JSON.stringify(meta));
  localStorage.removeItem(AUTO_REFRESH_BLOCKED_KEY);
}

export function loadOAuthSessionMeta(): RaotaAuthMeta | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(META_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as RaotaAuthMeta;
  } catch {
    return null;
  }
}

export function clearAccessToken() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(META_KEY);
}

export function blockAutoRefresh() {
  if (typeof window === 'undefined') return;
  localStorage.setItem(AUTO_REFRESH_BLOCKED_KEY, 'true');
}

export function isAutoRefreshBlocked() {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(AUTO_REFRESH_BLOCKED_KEY) === 'true';
}
