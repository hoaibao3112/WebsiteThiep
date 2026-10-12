"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Mail,
  Lock,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Eye,
  EyeOff,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";

declare global {
  interface Window {
    google?: any;
  }
}

export function AuthModal() {
  const { t } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    isAuthModalOpen,
    authModalTab,
    closeAuthModal,
    login,
    register,
    googleLogin,
  } = useAuth();

  // Tab chính: "login" | "register"
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Status & loading states
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [googleBtnRendered, setGoogleBtnRendered] = useState(false);

  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  useEffect(() => {
    setActiveTab(authModalTab || "login");
    setErrorMessage(null);
    setSuccessMessage(null);
    setPassword("");
    setGoogleBtnRendered(false);
  }, [authModalTab, isAuthModalOpen]);

  const handleAuthSuccess = () => {
    closeAuthModal();
    const redirectParam = searchParams.get("redirect") || (typeof window !== "undefined" ? sessionStorage.getItem("auth_redirect") : null);
    if (redirectParam && redirectParam !== "/" && redirectParam !== "/?") {
      if (typeof window !== "undefined") sessionStorage.removeItem("auth_redirect");
      router.push(redirectParam);
    }
  };

  // Load & Initialize Google Identity Services SDK
  useEffect(() => {
    if (typeof window === "undefined" || !isAuthModalOpen) return;

    const initGsi = () => {
      if (googleClientId && window.google?.accounts?.id) {
        try {
          window.google.accounts.id.initialize({
            client_id: googleClientId,
            use_fedcm_for_prompt: false,
            auto_select: false,
            cancel_on_tap_outside: true,
            callback: (response: any) => {
              if (response.credential) {
                setLoading(true);
                googleLogin(response.credential)
                  .then((res) => {
                    setLoading(false);
                    if (res.success) {
                      handleAuthSuccess();
                    } else {
                      setErrorMessage(res.error || "Đăng nhập Google thất bại");
                    }
                  })
                  .catch(() => {
                    setLoading(false);
                    setErrorMessage("Lỗi kết nối máy chủ khi đăng nhập Google");
                  });
              }
            },
          });

          const btnContainer = document.getElementById("google-btn-container");
          if (btnContainer) {
            btnContainer.innerHTML = "";
            window.google.accounts.id.renderButton(btnContainer, {
              theme: "outline",
              size: "large",
              type: "standard",
              text: activeTab === "login" ? "signin_with" : "signup_with",
              shape: "pill",
              width: 330,
              logo_alignment: "left",
            });
            setGoogleBtnRendered(true);
          }
        } catch (e) {
          console.warn("[GSI] Init error:", e);
        }
      }
    };

    if (!document.getElementById("google-gsi-client")) {
      const script = document.createElement("script");
      script.id = "google-gsi-client";
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = initGsi;
      document.body.appendChild(script);
    } else {
      initGsi();
    }

    return () => {
      try {
        window.google?.accounts?.id?.cancel();
      } catch (e) {
        // cleanup
      }
    };
  }, [googleClientId, isAuthModalOpen, activeTab]);

  // Fallback Google Login qua popup
  const triggerGoogleFallback = () => {
    if (typeof window === "undefined" || !googleClientId) {
      setErrorMessage("Hệ thống Google OAuth chưa được kích hoạt");
      return;
    }
    const redirectUri = `${window.location.origin}/auth/google/callback`;
    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${googleClientId}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&response_type=token&scope=openid%20email%20profile&prompt=select_account`;

    const width = 500;
    const height = 600;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;
    const popup = window.open(
      googleAuthUrl,
      "google_login_popup",
      `width=${width},height=${height},left=${left},top=${top},status=no,resizable=yes`
    );

    const handleMessage = async (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type === "GOOGLE_AUTH_SUCCESS" && event.data?.token) {
        window.removeEventListener("message", handleMessage);
        popup?.close();
        setLoading(true);
        const res = await googleLogin(event.data.token);
        setLoading(false);
        if (res.success) {
          handleAuthSuccess();
        } else {
          setErrorMessage(res.error || "Đăng nhập Google thất bại");
        }
      }
    };
    window.addEventListener("message", handleMessage);
  };

  // =============================================================
  // 1. ĐĂNG NHẬP (Email + Mật khẩu đã có)
  // =============================================================
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    const res = await login(email.trim(), password);
    setLoading(false);

    if (res.success) {
      handleAuthSuccess();
    } else {
      setErrorMessage(res.error || "Email hoặc mật khẩu không chính xác");
    }
  };

  // =============================================================
  // 2. ĐĂNG KÝ TÀI KHOẢN (Email + Mật khẩu trực tiếp - Nhanh gọn, không phụ thuộc SMTP)
  // =============================================================
  const handleRegisterWithPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !trimmedEmail.includes("@")) {
      setErrorMessage("Vui lòng nhập địa chỉ Email/Gmail hợp lệ.");
      return;
    }
    if (password.length < 6) {
      setErrorMessage("Mật khẩu phải có ít nhất 6 ký tự.");
      return;
    }

    setLoading(true);
    try {
      const defaultName = trimmedEmail.split("@")[0] || "Khách hàng";
      const validName = defaultName.length >= 2 ? defaultName : `${defaultName}User`;
      const res = await register({
        email: trimmedEmail,
        password,
        name: validName,
      });
      if (res.success) {
        handleAuthSuccess();
      } else {
        if (res.error?.includes("Email này đã được sử dụng") || res.error?.includes("đã tồn tại")) {
          setErrorMessage("Email này đã được đăng ký trước đó. Bạn vui lòng chuyển sang tab 'Đăng Nhập' để đăng nhập nhé!");
        } else {
          setErrorMessage(res.error || "Đăng ký không thành công");
        }
      }
    } catch {
      setErrorMessage("Lỗi kết nối máy chủ khi đăng ký. Bạn có thể sử dụng nút Google bên dưới để vào ngay!");
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthModalOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 15 }}
          transition={{ duration: 0.25 }}
          className="relative w-full max-w-[410px] bg-gradient-to-b from-[#FDFBF7] to-[#F7F2E8] rounded-[32px] p-6 sm:p-8 border border-[#E6D9C5] shadow-[0_20px_50px_rgba(0,0,0,0.18)] overflow-hidden text-stone-900"
        >
          {/* TOP ACCENT GLOW */}
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-20 bg-amber-400/20 rounded-full blur-2xl pointer-events-none" />

          {/* CLOSE BUTTON */}
          <button
            onClick={closeAuthModal}
            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/80 hover:bg-white text-stone-500 hover:text-stone-900 flex items-center justify-center transition border border-stone-200/80 cursor-pointer shadow-2xs"
          >
            <X className="w-4 h-4" />
          </button>

          {/* HEADER BRAND */}
          <div className="text-center mb-5 space-y-1 flex flex-col items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/logo.png" alt="Logo" className="h-12 w-auto object-contain mb-1" />
            <p className="text-xs text-stone-500">
              {activeTab === "login"
                ? (t("authModalLoginSubtitle") || "Đăng nhập để quản lý thiệp cưới của bạn")
                : (t("authModalRegisterSubtitle") || "Bắt đầu tạo thiệp cưới số sang trọng chỉ trong vài phút")}
            </p>
          </div>

          {/* TAB CHUYỂN ĐỔI: ĐĂNG NHẬP / ĐĂNG KÝ */}
          <div className="flex rounded-2xl bg-stone-200/70 p-1 mb-5">
            <button
              onClick={() => {
                setActiveTab("login");
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
                activeTab === "login"
                  ? "bg-white text-stone-900 shadow-xs"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              {t("authTabLogin") || "Đăng Nhập"}
            </button>
            <button
              onClick={() => {
                setActiveTab("register");
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
                activeTab === "register"
                  ? "bg-white text-stone-900 shadow-xs"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              {t("authTabRegister") || "Đăng Ký"}
            </button>
          </div>

          {/* THÔNG BÁO LỖI / THÀNH CÔNG */}
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2"
            >
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </motion.div>
          )}

          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMessage}</span>
            </motion.div>
          )}

          {/* ============================================================= */}
          {/* TAB 1: GIAO DIỆN ĐĂNG NHẬP (EMAIL + MẬT KHẨU) */}
          {/* ============================================================= */}
          {activeTab === "login" && (
            <form onSubmit={handleLoginSubmit} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                  {t("authFieldEmail") || "Địa chỉ Email"}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    autoFocus
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t("authFieldEmailPlaceholder") || "vidu@gmail.com"}
                    className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl bg-white border border-[#E5DACE] focus:border-[#C59E58] focus:ring-2 focus:ring-[#C59E58]/20 focus:outline-none text-stone-900 font-medium shadow-2xs transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                  {t("authFieldPassword") || "Mật khẩu"}
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t("authFieldPasswordPlaceholder") || "Nhập mật khẩu..."}
                    className="w-full pl-10 pr-10 py-2.5 text-xs rounded-xl bg-white border border-[#E5DACE] focus:border-[#C59E58] focus:ring-2 focus:ring-[#C59E58]/20 focus:outline-none text-stone-900 font-medium shadow-2xs transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-[#181716] hover:bg-black text-white text-xs font-bold uppercase tracking-wider shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>{t("authBtnLogin") || "ĐĂNG NHẬP"}</span>}
              </button>

              {/* DIVIDER */}
              <div className="relative my-3.5">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-stone-200/90" />
                </div>
                <div className="relative flex justify-center text-[10px] uppercase">
                  <span className="bg-[#FAF7F2] px-3 text-stone-400 font-bold tracking-wider">
                    {t("authOrGoogle") || "Hoặc tiếp tục với Google"}
                  </span>
                </div>
              </div>

              {/* DUY NHẤT 1 NÚT GOOGLE */}
              <div className="flex justify-center w-full">
                <div id="google-btn-container" className="w-full flex justify-center min-h-[44px]" />

                {!googleBtnRendered && (
                  <button
                    type="button"
                    onClick={triggerGoogleFallback}
                    className="w-full py-2.5 px-4 rounded-full bg-white hover:bg-stone-50 text-stone-800 text-xs font-semibold border border-stone-300 shadow-2xs transition flex items-center justify-center gap-2.5 cursor-pointer"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.04 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                      />
                    </svg>
                    <span>Google</span>
                  </button>
                )}
              </div>
            </form>
          )}

          {/* ============================================================= */}
          {/* TAB 2: GIAO DIỆN ĐĂNG KÝ (EMAIL + MẬT KHẨU TRỰC TIẾP) */}
          {/* ============================================================= */}
          {activeTab === "register" && (
            <form onSubmit={handleRegisterWithPassword} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                  {t("authFieldEmail") || "Địa chỉ Email"}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    autoFocus
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t("authFieldEmailPlaceholder") || "vidu@gmail.com"}
                    className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl bg-white border border-[#E5DACE] focus:border-[#C59E58] focus:ring-2 focus:ring-[#C59E58]/20 focus:outline-none text-stone-900 font-medium shadow-2xs transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                  {t("authFieldPassword") || "Tạo mật khẩu (tối thiểu 6 ký tự)"}
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Nhập mật khẩu..."
                    className="w-full pl-10 pr-10 py-2.5 text-xs rounded-xl bg-white border border-[#E5DACE] focus:border-[#C59E58] focus:ring-2 focus:ring-[#C59E58]/20 focus:outline-none text-stone-900 font-medium shadow-2xs transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#BE944E] to-[#9E7329] hover:from-[#9E7329] hover:to-[#825B1D] text-white text-xs font-bold uppercase tracking-wider shadow-md hover:shadow-amber-500/20 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>ĐĂNG KÝ TÀI KHOẢN</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>

              {/* DIVIDER */}
              <div className="relative my-3">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-stone-200/90" />
                </div>
                <div className="relative flex justify-center text-[10px] uppercase">
                  <span className="bg-[#FAF7F2] px-3 text-stone-400 font-bold tracking-wider">
                    {t("authOrGoogle") || "Hoặc tiếp tục với Google"}
                  </span>
                </div>
              </div>

              {/* DUY NHẤT 1 NÚT GOOGLE */}
              <div className="flex justify-center w-full">
                <div id="google-btn-container" className="w-full flex justify-center min-h-[44px]" />

                {!googleBtnRendered && (
                  <button
                    type="button"
                    onClick={triggerGoogleFallback}
                    className="w-full py-2.5 px-4 rounded-full bg-white hover:bg-stone-50 text-stone-800 text-xs font-semibold border border-stone-300 shadow-2xs transition flex items-center justify-center gap-2.5 cursor-pointer"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.04 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                      />
                    </svg>
                    <span>Google</span>
                  </button>
                )}
              </div>
            </form>
          )}

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
