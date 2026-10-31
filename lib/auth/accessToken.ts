const STORAGE_KEY = 'raota_access_token';
const META_KEY = 'raota_auth_meta';
const ADMIN_ACCESS_CACHE_PREFIX = 'raota-admin-access:';

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
}

/** 토큰만 저장(메타 제거). `/oauth2/redirect` 등 토큰만 넘길 때 사용 */
export function setAccessToken(token: string) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, token);
  localStorage.removeItem(META_KEY);
  clearAdminAccessCache();
}

/** 백엔드가 `#accessToken=...&memberId=...` 형태로 넘길 때 */
export function saveRaotaOAuthSession(token: string, meta: RaotaAuthMeta) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, token);
  localStorage.setItem(META_KEY, JSON.stringify(meta));
  clearAdminAccessCache();
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
  clearAdminAccessCache();
}

/** 헤더 관리자 바로가기의 권한 확인 결과를 회원별로 담는 sessionStorage 키. */
export function adminAccessCacheKey(memberId: string | number): string {
  return `${ADMIN_ACCESS_CACHE_PREFIX}${memberId}`;
}

/** 로그인·로그아웃 때 이전 권한 확인 결과를 지운다. */
function clearAdminAccessCache() {
  for (let index = window.sessionStorage.length - 1; index >= 0; index--) {
    const key = window.sessionStorage.key(index);
    if (key?.startsWith(ADMIN_ACCESS_CACHE_PREFIX)) {
      window.sessionStorage.removeItem(key);
    }
  }
}
