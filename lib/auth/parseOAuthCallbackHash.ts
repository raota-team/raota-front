export type OAuthCallbackParsed =
  | {
      kind: 'token';
      accessToken: string;
      tokenType: string | null;
      expiresIn: number | null;
      memberId: number | null;
      newMember: boolean;
      provider: string | null;
    }
  | { kind: 'error'; error: string; errorDescription: string | null; provider: string | null }
  | { kind: 'empty' };

function decodeParam(raw: string | null): string | null {
  if (raw == null || raw === '') return null;
  try {
    return decodeURIComponent(raw.replace(/\+/g, ' ')).trim();
  } catch {
    return raw.trim();
  }
}

/** `#accessToken=...&tokenType=Bearer&...` 또는 `#error=...` */
export function parseOAuthCallbackHash(): OAuthCallbackParsed {
  if (typeof window === 'undefined') {
    return { kind: 'empty' };
  }

  const raw = window.location.hash.replace(/^#/, '');
  if (!raw) {
    return { kind: 'empty' };
  }

  const p = new URLSearchParams(raw);
  const accessToken = p.get('accessToken')?.trim();
  if (accessToken) {
    const expiresRaw = p.get('expiresIn');
    const memberRaw = p.get('memberId');
    let expiresIn: number | null = null;
    let memberId: number | null = null;
    if (expiresRaw != null && expiresRaw !== '') {
      const n = parseInt(expiresRaw, 10);
      expiresIn = Number.isFinite(n) ? n : null;
    }
    if (memberRaw != null && memberRaw !== '') {
      const n = parseInt(memberRaw, 10);
      memberId = Number.isFinite(n) ? n : null;
    }
    return {
      kind: 'token',
      accessToken,
      tokenType: p.get('tokenType'),
      expiresIn,
      memberId,
      newMember: p.get('newMember') === 'true',
      provider: p.get('provider'),
    };
  }

  const err = p.get('error');
  if (err) {
    return {
      kind: 'error',
      error: decodeParam(err) ?? err,
      errorDescription: decodeParam(p.get('error_description')),
      provider: p.get('provider'),
    };
  }

  return { kind: 'empty' };
}
