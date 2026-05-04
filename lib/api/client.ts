import { clearAccessToken, getAccessToken, loadOAuthSessionMeta, updateAccessToken } from "@/lib/auth/accessToken";

type QueryPrimitive = string | number | boolean | null | undefined;
type QueryValue = QueryPrimitive | QueryPrimitive[];

interface ApiClientOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  query?: Record<string, QueryValue>;
  body?: unknown;
  headers?: HeadersInit;
  cache?: RequestCache;
}

export class ApiClientError extends Error {
  status: number;
  payload: unknown;

  constructor(message: string, status: number, payload: unknown) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
    this.payload = payload;
  }
}

const buildUrl = (path: string, query?: Record<string, QueryValue>) => {
  if (!query) return path;

  const searchParams = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((item) => {
        if (item === null || item === undefined) return;
        searchParams.append(key, String(item));
      });
      return;
    }

    if (value === null || value === undefined) return;
    searchParams.set(key, String(value));
  });

  const queryString = searchParams.toString();
  return queryString ? `${path}?${queryString}` : path;
};

// 동시 다발적인 401 발생 시 한 번만 refresh를 수행하기 위한 간단한 잠금 장치
let refreshPromise: Promise<string> | null = null;

const readAccessTokenFromRefreshPayload = (payload: any): string | null => {
  if (!payload) return null;
  return payload.data?.accessToken ?? payload.accessToken ?? null;
};

const refreshAccessToken = async (apiBaseUrl: string): Promise<string> => {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      const refreshResponse = await fetch(`${apiBaseUrl}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (!refreshResponse.ok) {
        throw new ApiClientError("Session expired", refreshResponse.status, null);
      }

      const contentType = refreshResponse.headers.get("content-type") || "";
      const refreshData = contentType.includes("application/json")
        ? await refreshResponse.json()
        : null;
      const newToken = readAccessTokenFromRefreshPayload(refreshData);
      const isSuccess = !refreshData?.status || refreshData.status === "SUCCESS";

      if (!isSuccess || !newToken) {
        throw new ApiClientError("Session expired", 401, refreshData);
      }

      updateAccessToken(newToken);
      return newToken;
    })().finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
};

export const refreshAuthSession = async (): Promise<string> => {
  return refreshAccessToken(process.env.NEXT_PUBLIC_API_URL || "");
};

export const logoutAuthSession = async (): Promise<void> => {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
  const response = await fetch(`${API_BASE_URL}/auth/logout`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });

  if (!response.ok) {
    throw new ApiClientError("Logout failed", response.status, null);
  }
};

export const apiClient = async <T>(
  path: string,
  options: ApiClientOptions = {},
): Promise<T> => {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
  const fullUrl = path.startsWith("http") ? path : `${API_BASE_URL}${path}`;

  const token = typeof window !== "undefined" ? getAccessToken() : null;
  const authHeaders: Record<string, string> = {};
  if (token) {
    authHeaders.Authorization = `Bearer ${token}`;
  }

  // 신규 회원이 데이터를 생성/수정하려고 할 때 가드 (GET은 허용, 프로필 업데이트는 예외)
  const isRegistrationRequest = path.includes("/users/me/profile");
  
  if (typeof window !== "undefined" && options.method && options.method !== "GET" && !isRegistrationRequest) {
    const meta = loadOAuthSessionMeta();
    const isNewMember = meta && (meta.newMember === true || String(meta.newMember) === "true");
    if (isNewMember) {
      window.location.href = "/register";
      // 리다이렉트 후 즉시 에러를 던져 fetch 실행을 막음
      throw new ApiClientError("Please complete your registration first", 403, null);
    }
  }

  const isFormData = options.body instanceof FormData;

  const fetchOptions: RequestInit = {
    method: options.method || "GET",
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...authHeaders,
      ...options.headers,
    },
    body: isFormData ? (options.body as FormData) : (options.body ? JSON.stringify(options.body) : undefined),
    cache: options.cache || "no-store",
    credentials: "include",
  };

  // FormData일 경우 브라우저가 boundary를 자동으로 붙일 수 있도록 Content-Type 헤더 제거
  if (isFormData && (fetchOptions.headers as any)["Content-Type"]) {
    delete (fetchOptions.headers as any)["Content-Type"];
  }

  const response = await fetch(buildUrl(fullUrl, options.query), fetchOptions);

  // 401 Unauthorized 발생 시 토큰 갱신 시도
  if (response.status === 401 && typeof window !== "undefined") {
    try {
      const newToken = await refreshAuthSession();

      // 새 토큰으로 원래 요청 재시도
      return apiClient<T>(path, {
        ...options,
        headers: {
          ...options.headers,
          Authorization: `Bearer ${newToken}`,
        },
      });
    } catch (error) {
      clearAccessToken();
      window.location.href = "/login";
      throw error;
    }
  }

  const contentType = response.headers.get("content-type") || "";
  const payload = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const message =
      typeof payload === "object" && payload && "message" in payload
        ? String(payload.message)
        : `Request failed with status ${response.status}`;
    throw new ApiClientError(message, response.status, payload);
  }

  return payload as T;
};
