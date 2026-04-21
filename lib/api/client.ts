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
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

const subscribeTokenRefresh = (callback: (token: string) => void) => {
  refreshSubscribers.push(callback);
};

const onRefreshed = (token: string) => {
  refreshSubscribers.map((callback) => callback(token));
  refreshSubscribers = [];
};

export const apiClient = async <T>(
  path: string,
  options: ApiClientOptions = {},
): Promise<T> => {
  const token = typeof window !== "undefined" ? getAccessToken() : null;
  const authHeaders: Record<string, string> = {};
  if (token) {
    authHeaders.Authorization = `Bearer ${token}`;
  }

  // 신규 회원이 데이터를 생성/수정하려고 할 때 가드 (GET은 허용)
  if (typeof window !== "undefined" && options.method && options.method !== "GET") {
    const meta = loadOAuthSessionMeta();
    const isNewMember = meta && (meta.newMember === true || String(meta.newMember) === "true");
    if (isNewMember) {
      window.location.href = "/register";
      // 리다이렉트 후 즉시 에러를 던져 fetch 실행을 막음
      throw new ApiClientError("Please complete your registration first", 403, null);
    }
  }

  const fetchOptions: RequestInit = {
    method: options.method || "GET",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders,
      ...options.headers,
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
    cache: options.cache || "no-store",
    // Refresh Token 쿠키 전송을 위해 필수
    credentials: "include",
  };

  const response = await fetch(buildUrl(path, options.query), fetchOptions);

  // 401 Unauthorized 발생 시 토큰 갱신 시도
  if (response.status === 401 && typeof window !== "undefined") {
    // 이미 갱신 중이라면 대기 후 새 토큰으로 재시도
    if (isRefreshing) {
      return new Promise((resolve) => {
        subscribeTokenRefresh((newToken) => {
          resolve(apiClient<T>(path, {
            ...options,
            headers: {
              ...options.headers,
              Authorization: `Bearer ${newToken}`,
            },
          }));
        });
      });
    }

    isRefreshing = true;
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

    try {
      const refreshResponse = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (refreshResponse.ok) {
        const refreshData = await refreshResponse.json();
        // 백엔드 응답 구조에 따라 수정 필요 (data.accessToken 혹은 accessToken)
        const newToken = refreshData.data?.accessToken || refreshData.accessToken;
        
        if (newToken) {
          updateAccessToken(newToken);
          isRefreshing = false;
          onRefreshed(newToken);
          
          // 새 토큰으로 원래 요청 재시도
          return apiClient<T>(path, {
            ...options,
            headers: {
              ...options.headers,
              Authorization: `Bearer ${newToken}`,
            },
          });
        }
      }
      
      // 갱신 실패 시 로그아웃 처리 및 로그인 페이지 이동
      clearAccessToken();
      window.location.href = "/login";
      throw new ApiClientError("Session expired", 401, null);
    } catch (error) {
      isRefreshing = false;
      clearAccessToken();
      window.location.href = "/login";
      throw error;
    } finally {
      isRefreshing = false;
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
