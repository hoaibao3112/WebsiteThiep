"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { ApiClient } from "@/lib/api";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  phone?: string;
  avatar?: string;
  role: "USER" | "ADMIN";
  emailVerified: boolean;
  hasPassword: boolean;
  googleId?: string;
  telegramId?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAuthModalOpen: boolean;
  authModalTab: "login" | "register";
  openAuthModal: (tab?: "login" | "register") => void;
  closeAuthModal: () => void;
  sendRegisterOtp: (email: string) => Promise<{ success: boolean; error?: string; cooldown?: number }>;
  registerWithOtp: (payload: { email: string; otp: string; name?: string; password?: string; phone?: string }) => Promise<{ success: boolean; error?: string }>;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  googleLogin: (idToken: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalTab, setAuthModalTab] = useState<"login" | "register">("login");

  const openAuthModal = React.useCallback((tab: "login" | "register" = "login") => {
    setAuthModalTab(tab);
    setIsAuthModalOpen(true);
  }, []);

  const closeAuthModal = React.useCallback(() => {
    setIsAuthModalOpen(false);
  }, []);

  const refreshUser = async () => {
    try {
      const res = await ApiClient.request<AuthUser>("/auth/me");
      if (res.success && res.data) {
        setUser(res.data);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const sendRegisterOtp = async (email: string) => {
    const res = await ApiClient.request<{ cooldown: number }>("/auth/send-otp", {
      method: "POST",
      body: JSON.stringify({ email, type: "REGISTER" }),
    });

    if (res.success) {
      return { success: true, cooldown: res.data?.cooldown || 60 };
    }
    return { success: false, error: res.error || "Không thể gửi mã OTP" };
  };

  const registerWithOtp = async (payload: { email: string; otp: string; name?: string; password?: string; phone?: string }) => {
    const res = await ApiClient.request<{ user: AuthUser }>("/auth/verify-otp-register", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    if (res.success && res.data) {
      setUser(res.data.user);
      closeAuthModal();
      return { success: true };
    }
    return { success: false, error: res.error || "Đăng ký không thành công" };
  };

  const login = async (email: string, password: string) => {
    const res = await ApiClient.request<{ user: AuthUser }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    if (res.success && res.data) {
      setUser(res.data.user);
      closeAuthModal();
      return { success: true };
    }
    return { success: false, error: res.error || "Đăng nhập không thành công" };
  };

  const googleLogin = async (idToken: string) => {
    const res = await ApiClient.request<{ user: AuthUser }>("/auth/google", {
      method: "POST",
      body: JSON.stringify({ idToken }),
    });

    if (res.success && res.data) {
      setUser(res.data.user);
      closeAuthModal();
      return { success: true };
    }
    return { success: false, error: res.error || "Đăng nhập Google không thành công" };
  };

  const logout = React.useCallback(async () => {
    await ApiClient.request("/auth/logout", { method: "POST" });
    setUser(null);
  }, []);


  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!user,
        isAuthModalOpen,
        authModalTab,
        openAuthModal,
        closeAuthModal,
        sendRegisterOtp,
        registerWithOtp,
        login,
        googleLogin,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
