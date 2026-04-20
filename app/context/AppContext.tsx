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
import { clearAccessToken, getAccessToken, loadOAuthSessionMeta, saveRaotaOAuthSession } from "@/lib/auth/accessToken";

interface AppContextType {
  isLoggedIn: boolean;
  setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
  currentUser: any;
  setCurrentUser: React.Dispatch<React.SetStateAction<any>>;
  handleLogin: () => void;
  handleLogout: () => void;
  /** localStorage의 Bearer 토큰 존재 여부로 로그인 상태 동기화 (oauth2/redirect 직후 등) */
  syncAuthFromStorage: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
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
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const rawHash = window.location.hash;
    if (!rawHash || !rawHash.includes("accessToken")) return;

    const params = new URLSearchParams(rawHash.startsWith("#") ? rawHash.substring(1) : rawHash);
    const token = params.get("accessToken")?.trim();
    if (!token) return;

    const expiresInRaw = params.get("expiresIn");
    const memberIdRaw = params.get("memberId");
    saveRaotaOAuthSession(token, {
      tokenType: params.get("tokenType"),
      expiresIn: expiresInRaw ? Number(expiresInRaw) : null,
      memberId: memberIdRaw ? Number(memberIdRaw) : null,
      newMember: params.get("newMember") === "true",
      provider: params.get("provider"),
    });
    syncAuthFromStorage();

    // URL hash에서 민감 정보 제거
    window.history.replaceState(null, document.title, `${window.location.pathname}${window.location.search}`);
  }, [syncAuthFromStorage]);

  useEffect(() => {
    syncAuthFromStorage();
  }, [syncAuthFromStorage]);

  const handleLogin = () => {
    setIsLoggedIn(true);
    setCurrentUser(mockUserProfile.data);
  };

  const handleLogout = () => {
    clearAccessToken();
    setIsLoggedIn(false);
    setCurrentUser(null);
  };

  return (
    <AppContext.Provider
      value={{
        isLoggedIn,
        setIsLoggedIn,
        currentUser,
        setCurrentUser,
        handleLogin,
        handleLogout,
        syncAuthFromStorage,
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
