"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import { usePathname } from "next/navigation";
import { mockUserProfile } from "../lib/data";
import type { UserProfile } from "../types";
import { clearAccessToken, getAccessToken, loadOAuthSessionMeta, saveRaotaOAuthSession, updateNewMemberStatus } from "@/lib/auth/accessToken";
import { logoutAuthSession, refreshAuthSession } from "@/lib/api/client";

interface AppContextType {
  isLoggedIn: boolean;
  isAuthChecking: boolean;
  setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
  currentUser: any;
  setCurrentUser: React.Dispatch<React.SetStateAction<any>>;
  handleLogin: () => void;
  handleLogout: () => Promise<void>;
  /** localStorage의 Bearer 토큰 존재 여부로 로그인 상태 동기화 (oauth2/redirect 직후 등) */
  syncAuthFromStorage: () => void;
  /** 회원가입 완료 처리 (newMember 플래그를 false로 전환) */
  completeRegistration: () => void;
  /** 토스트 알림 표시 */
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  toast: { message: string, type: 'success' | 'error' | 'info' } | null;
  /** 확인 모달 표시 */
  showConfirm: (message: string, onConfirm: () => void) => void;
  confirm: { message: string, onConfirm: () => void } | null;
  setConfirm: React.Dispatch<React.SetStateAction<{ message: string, onConfirm: () => void } | null>>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' | 'info' } | null>(null);
  const [confirm, setConfirm] = useState<{ message: string, onConfirm: () => void } | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  const syncAuthFromStorage = useCallback(() => {
    const token = getAccessToken();
    if (!token) {
      setIsLoggedIn(false);
      setCurrentUser(null);
      return;
    }
    setIsLoggedIn(true);
    const meta = loadOAuthSessionMeta();
    if (meta?.memberId != null) {
      const profile: UserProfile = {
        user_id: meta.memberId,
        nickname: `회원 #${meta.memberId}`,
        profile_image_url: '',
        stats: {
          visited_restaurant_count: 0,
          total_photo_count: 0,
          total_bookmark_count: 0,
        },
      };
      setCurrentUser(profile);
    } else {
      setCurrentUser(null);
    }
    setIsAuthChecking(false);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const initializeAuth = async () => {
      // 1. URL 해시에 토큰이 있는지 먼저 확인 (로그인 리다이렉트 직후인 경우)
      const rawHash = window.location.hash;
      if (rawHash && rawHash.includes("accessToken")) {
        const params = new URLSearchParams(rawHash.startsWith("#") ? rawHash.substring(1) : rawHash);
        const token = params.get("accessToken")?.trim();
        
        if (token) {
          const expiresInRaw = params.get("expiresIn");
          const memberIdRaw = params.get("memberId");
          const newMemberVal = params.get("newMember")?.toLowerCase().trim();
          const isNewMember = newMemberVal === "true" || newMemberVal === "1";
          
          saveRaotaOAuthSession(token, {
            tokenType: params.get("tokenType"),
            expiresIn: expiresInRaw ? Number(expiresInRaw) : null,
            memberId: memberIdRaw ? Number(memberIdRaw) : null,
            newMember: isNewMember,
            provider: params.get("provider"),
          });
          
          // 해시 제거 (URL 깔끔하게 유지)
          window.history.replaceState(null, document.title, window.location.pathname + window.location.search);
        }
      }

      // 2. 최종적으로 저장된 토큰(신규 또는 기존) 기반으로 상태 동기화
      syncAuthFromStorage();
      setIsAuthChecking(false);
    };

    initializeAuth();
  }, [syncAuthFromStorage]);

  // 기존의 ensureAuthSession과 hash 처리용 useEffect들은 삭제/통합됨

  const handleLogin = () => {
    setIsLoggedIn(true);
    setCurrentUser(mockUserProfile.data);
  };

  const handleLogout = useCallback(async () => {
    try {
      // 1. 서버 세션 종료 시도
      await logoutAuthSession();
    } finally {
      // 2. 서버 응답 여부와 상관없이 클라이언트 상태는 반드시 초기화 (Best Practice)
      clearAccessToken();
      setIsLoggedIn(false);
      setCurrentUser(null);
      setIsAuthChecking(false);
      
      // 3. 홈으로 리다이렉트 (필요한 경우)
      if (typeof window !== "undefined") {
        window.location.href = "/";
      }
    }
  }, []);

  const completeRegistration = useCallback(() => {
    updateNewMemberStatus(false);
    syncAuthFromStorage();
  }, [syncAuthFromStorage]);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 2000);
  }, []);

  const showConfirm = useCallback((message: string, onConfirm: () => void) => {
    setConfirm({ message, onConfirm });
  }, []);

  return (
    <AppContext.Provider
      value={{
        isLoggedIn,
        isAuthChecking,
        setIsLoggedIn,
        currentUser,
        setCurrentUser,
        handleLogin,
        handleLogout,
        syncAuthFromStorage,
        completeRegistration,
        showToast,
        toast,
        showConfirm,
        confirm,
        setConfirm,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
