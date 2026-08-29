"use client";

import React, { useState, useEffect, useRef } from "react";
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
  KeyRound,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

declare global {
  interface Window {
    google?: any;
  }
}

export function AuthModal() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    isAuthModalOpen,
    authModalTab,
    closeAuthModal,
    login,
    registerWithOtp,
    sendRegisterOtp,
    googleLogin,
  } = useAuth();

  // Tab chính: "login" | "register"
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");

  // Luồng 3 bước của ĐĂNG KÝ:
  // Step 1: "email" (Chỉ nhập Email để lấy mã OTP)
  // Step 2: "otp" (Nhập 6 số OTP gửi về Gmail)
  // Step 3: "password" (Sau khi có OTP, nhập Mật khẩu muốn tạo)
  const [registerStep, setRegisterStep] = useState<"email" | "otp" | "password">("email");

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // OTP 6-digits state
  const [otpValues, setOtpValues] = useState<string[]>(["", "", "", "", "", ""]);
  const otpInputsRef = useRef<(HTMLInputElement | null)[]>([]);

  // Timer & loading states
  const [countdown, setCountdown] = useState(0);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [googleBtnRendered, setGoogleBtnRendered] = useState(false);

  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  useEffect(() => {
    setActiveTab(authModalTab || "login");
    setRegisterStep("email");
    setErrorMessage(null);
    setSuccessMessage(null);
    setPassword("");
    setOtpValues(["", "", "", "", "", ""]);
    setGoogleBtnRendered(false);
  }, [authModalTab, isAuthModalOpen]);

  const handleAuthSuccess = () => {
    closeAuthModal();
    const redirectParam = searchParams.get("redirect");
    if (redirectParam && redirectParam !== "/" && redirectParam !== "/?") {
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

  // Countdown timer effect
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  // Xử lý OTP box input
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otpValues];
    newOtp[index] = value.slice(-1);
    setOtpValues(newOtp);

    // Tự động focus sang ô kế tiếp
    if (value && index < 5) {
      otpInputsRef.current[index + 1]?.focus();
    }

    // Khi đã nhập đủ 6 số -> tự động chuyển sang bước 3 (nhập mật khẩu)
    if (value && index === 5 && newOtp.every((d) => d !== "")) {
      setErrorMessage(null);
      setSuccessMessage("Mã OTP hợp lệ! Hãy tạo mật khẩu cho tài khoản của bạn.");
      setRegisterStep("password");
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otpValues[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();
    if (/^\d{6}$/.test(pastedData)) {
      const digits = pastedData.split("");
      setOtpValues(digits);
      setErrorMessage(null);
      setSuccessMessage("Mã OTP hợp lệ! Hãy tạo mật khẩu cho tài khoản của bạn.");
      setRegisterStep("password");
    }
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
  // 2. ĐĂNG KÝ - BƯỚC 1: NHẬP EMAIL -> GỬI MÃ OTP
  // =============================================================
  const handleSendRegisterOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !trimmedEmail.includes("@")) {
      setErrorMessage("Vui lòng nhập địa chỉ Email/Gmail hợp lệ.");
      return;
    }

    setLoading(true);
    const res = await sendRegisterOtp(trimmedEmail);
    setLoading(false);

    if (res.success) {
      setRegisterStep("otp");
      setCountdown(res.cooldown || 60);
      setSuccessMessage(`Mã xác thực 6 số đã được gửi tới ${trimmedEmail}`);
      setTimeout(() => otpInputsRef.current[0]?.focus(), 150);
    } else {
      setErrorMessage(res.error || "Không thể gửi mã OTP");
    }
  };

  // =============================================================
  // 3. ĐĂNG KÝ - BƯỚC 2: TIẾP TỤC SAU KHI NHẬP OTP
  // =============================================================
  const handleOtpStepSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const otpCode = otpValues.join("");
    if (otpCode.length !== 6) {
      setErrorMessage("Vui lòng nhập đủ 6 chữ số mã OTP.");
      return;
    }
    setErrorMessage(null);
    setRegisterStep("password");
  };

  // =============================================================
  // 4. ĐĂNG KÝ - BƯỚC 3: NHẬP MẬT KHẨU VÀ HOÀN TẤT
  // =============================================================
  const handleFinishRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (password.length < 6) {
      setErrorMessage("Mật khẩu phải có ít nhất 6 ký tự.");
      return;
    }

    const otpCode = otpValues.join("");
    if (otpCode.length !== 6) {
      setErrorMessage("Thiếu mã xác thực OTP. Vui lòng quay lại bước trước.");
      setRegisterStep("otp");
      return;
    }

    setLoading(true);
    const res = await registerWithOtp({
      email: email.trim(),
      password: password,
      otp: otpCode,
    });
    setLoading(false);

    if (res.success) {
      handleAuthSuccess();
    } else {
      setErrorMessage(res.error || "Mã OTP không đúng hoặc đã hết hạn");
      setRegisterStep("otp");
    }
  };

  // Gửi lại mã OTP
  const handleResendOtp = async () => {
    if (countdown > 0) return;
    setErrorMessage(null);
    setLoading(true);
    const res = await sendRegisterOtp(email.trim());
    setLoading(false);
    if (res.success) {
      setCountdown(res.cooldown || 60);
      setSuccessMessage("Đã gửi lại mã OTP mới vào hộp thư của bạn.");
      setOtpValues(["", "", "", "", "", ""]);
      otpInputsRef.current[0]?.focus();
    } else {
      setErrorMessage(res.error || "Không thể gửi lại mã OTP");
    }
  };

  // Trigger Google Fallback
  const triggerGoogleFallback = () => {
    if (window.google?.accounts?.id) {
      window.google.accounts.id.prompt();
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
            <img src="/images/logo.png" alt="Logo CardVite" className="h-10 w-auto object-contain mb-1" />
            <h2 className="text-2xl font-serif font-bold text-[#2A231C] tracking-tight">
              CardVite
            </h2>
            <p className="text-xs text-stone-500">
              Nền tảng tạo thiệp cưới & sự kiện trực tuyến cao cấp
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
              Đăng Nhập
            </button>
            <button
              onClick={() => {
                setActiveTab("register");
                setRegisterStep("email");
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
                activeTab === "register"
                  ? "bg-white text-stone-900 shadow-xs"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              Đăng Ký Mới
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
                  Địa chỉ Email / Gmail
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    autoFocus
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="vidu@gmail.com"
                    className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl bg-white border border-[#E5DACE] focus:border-[#C59E58] focus:ring-2 focus:ring-[#C59E58]/20 focus:outline-none text-stone-900 font-medium shadow-2xs transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                  Mật khẩu
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
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
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
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>ĐĂNG NHẬP</span>}
              </button>

              {/* DIVIDER */}
              <div className="relative my-3.5">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-stone-200/90" />
                </div>
                <div className="relative flex justify-center text-[10px] uppercase">
                  <span className="bg-[#FAF7F2] px-3 text-stone-400 font-bold tracking-wider">
                    Hoặc đăng nhập với
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
                    <span>Tiếp tục với Google</span>
                  </button>
                )}
              </div>
            </form>
          )}

          {/* ============================================================= */}
          {/* TAB 2 - BƯỚC 1: ĐĂNG KÝ CHỈ NHẬP ĐÚNG 1 Ô EMAIL */}
          {/* ============================================================= */}
          {activeTab === "register" && registerStep === "email" && (
            <form onSubmit={handleSendRegisterOtp} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-semibold text-stone-600 mb-1.5">
                  Địa chỉ Email / Gmail của bạn
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    autoFocus
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="vidu@gmail.com"
                    className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl bg-white border border-[#E5DACE] focus:border-[#C59E58] focus:ring-2 focus:ring-[#C59E58]/20 focus:outline-none text-stone-900 font-medium shadow-2xs transition"
                  />
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
                    <span>NHẬN MÃ OTP ĐĂNG KÝ</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>

              {/* DIVIDER */}
              <div className="relative my-3.5">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-stone-200/90" />
                </div>
                <div className="relative flex justify-center text-[10px] uppercase">
                  <span className="bg-[#FAF7F2] px-3 text-stone-400 font-bold tracking-wider">
                    Hoặc đăng ký nhanh với
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
                    <span>Đăng ký nhanh với Google</span>
                  </button>
                )}
              </div>
            </form>
          )}

          {/* ============================================================= */}
          {/* TAB 2 - BƯỚC 2: NHẬP 6 SỐ OTP ĐĂNG KÝ */}
          {/* ============================================================= */}
          {activeTab === "register" && registerStep === "otp" && (
            <form onSubmit={handleOtpStepSubmit} className="space-y-4">
              <div className="text-center space-y-1">
                <span className="text-xs text-stone-500 block">
                  Nhập mã xác thực 6 số gửi về Gmail:
                </span>
                <span className="text-xs font-bold text-[#8C6424] block font-mono bg-amber-50/80 px-3 py-1 rounded-full mx-auto max-w-xs truncate border border-amber-200/50">
                  {email}
                </span>
              </div>

              {/* 6 OTP DIGIT BOXES */}
              <div className="flex justify-center gap-1.5 sm:gap-2" onPaste={handleOtpPaste}>
                {otpValues.map((val, idx) => (
                  <input
                    key={idx}
                    ref={(el) => {
                      otpInputsRef.current[idx] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={val}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    className="w-10 h-11 sm:w-11 sm:h-12 text-center text-lg font-bold rounded-xl bg-white border border-[#E5DACE] focus:border-[#BE944E] focus:ring-2 focus:ring-[#BE944E]/30 focus:outline-none text-stone-900 shadow-2xs transition"
                  />
                ))}
              </div>

              <button
                type="submit"
                disabled={otpValues.some((d) => !d)}
                className="w-full py-3 rounded-xl bg-[#181716] hover:bg-black text-white text-xs font-bold uppercase tracking-wider shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <span>TIẾP TỤC TẠO MẬT KHẨU →</span>
              </button>

              <div className="flex items-center justify-between text-[11px] pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setRegisterStep("email");
                    setErrorMessage(null);
                    setSuccessMessage(null);
                  }}
                  className="text-stone-500 hover:text-stone-800 transition cursor-pointer"
                >
                  ← Đổi email
                </button>

                <button
                  type="button"
                  disabled={countdown > 0 || loading}
                  onClick={handleResendOtp}
                  className="text-[#8C6424] font-bold hover:underline disabled:text-stone-400 disabled:no-underline cursor-pointer"
                >
                  {countdown > 0 ? `Gửi lại sau ${countdown}s` : "Gửi lại OTP"}
                </button>
              </div>
            </form>
          )}

          {/* ============================================================= */}
          {/* TAB 2 - BƯỚC 3: TẠO MẬT KHẨU CHO TÀI KHOẢN */}
          {/* ============================================================= */}
          {activeTab === "register" && registerStep === "password" && (
            <form onSubmit={handleFinishRegister} className="space-y-4">
              <div className="text-center space-y-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Xác thực OTP thành công</span>
                </div>
                <p className="text-xs text-stone-600">
                  Tạo mật khẩu cho tài khoản <strong>{email}</strong>
                </p>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                  Mật khẩu mới (tối thiểu 6 ký tự)
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    autoFocus
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Nhập mật khẩu của bạn..."
                    className="w-full pl-10 pr-10 py-2.5 text-xs rounded-xl bg-white border border-[#E5DACE] focus:border-[#C59E58] focus:ring-2 focus:ring-[#C59E58]/20 focus:outline-none text-stone-900 font-medium shadow-2xs transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || password.length < 6}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#BE944E] to-[#9E7329] hover:from-[#9E7329] hover:to-[#825B1D] text-white text-xs font-bold uppercase tracking-wider shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <span>HOÀN TẤT ĐĂNG KÝ & BẮT ĐẦU</span>
                )}
              </button>

              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => setRegisterStep("otp")}
                  className="text-[11px] text-stone-500 hover:text-stone-800 transition cursor-pointer"
                >
                  ← Nhập lại mã OTP
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
