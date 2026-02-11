"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import { Shop } from "../types";
import { initialShops, mockUserProfile } from "../lib/data";

interface AppContextType {
  shops: Shop[];
  setShops: React.Dispatch<React.SetStateAction<Shop[]>>;
  isLoggedIn: boolean;
  setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
  currentUser: any;
  setCurrentUser: React.Dispatch<React.SetStateAction<any>>;
  handleVote: (shopId: number, menuIndex: number) => void;
  handleLogin: () => void;
  handleLogout: () => void;
  getTotalVotes: (shop: Shop) => number;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [shops, setShops] = useState<Shop[]>(initialShops);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const pathname = usePathname();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  const handleVote = (shopId: number, menuIndex: number) => {
    const updatedShops = shops.map((shop) => {
      if (shop.id === shopId) {
        const newMenus = [...shop.menus];
        newMenus[menuIndex].votes += 1;
        return { ...shop, menus: newMenus };
      }
      return shop;
    });
    setShops(updatedShops);
  };

  const handleLogin = () => {
    setIsLoggedIn(true);
    setCurrentUser(mockUserProfile.data);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
  };

  const getTotalVotes = (shop: Shop) =>
    shop.menus.reduce((acc: number, curr) => acc + curr.votes, 0);

  return (
    <AppContext.Provider
      value={{
        shops,
        setShops,
        isLoggedIn,
        setIsLoggedIn,
        currentUser,
        setCurrentUser,
        handleVote,
        handleLogin,
        handleLogout,
        getTotalVotes,
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
