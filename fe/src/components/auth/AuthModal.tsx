"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, Lock, User, Phone, ArrowRight, CheckCircle2, AlertCircle, RefreshCw, Sparkles, HelpCircle, ExternalLink } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

declare global {
  interface Window {
    google?: any;
  }
}

export function AuthModal() {
  const {
    isAuthModalOpen,
    authModalTab,
    openAuthModal,
    closeAuthModal,
    login,
    registerWithOtp,
    sendRegisterOtp,
    googleLogin,
  } = useAuth();

  const [activeTab, setActiveTab] = useState<"login" | "register">(authModalTab);
  const [registerStep, setRegisterStep] = useState<"form" | "otp">("form");

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  // OTP 6-digits state
  const [otpValues, setOtpValues] = useState<string[]>(["", "", "", "", "", ""]);
  const otpInputsRef = useRef<(HTMLInputElement | null)[]>([]);

  // Timer & loading states
  const [countdown, setCountdown] = useState(0);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showGoogleGuide, setShowGoogleGuide] = useState(false);

  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  useEffect(() => {
    setActiveTab(authModalTab);
    setRegisterStep("form");
    setErrorMessage(null);
    setSuccessMessage(null);
    setShowGoogleGuide(false);
  }, [authModalTab, isAuthModalOpen]);

  // Load Google Identity Services SDK
  useEffect(() => {
    if (typeof window === "undefined") return;

    if (!document.getElementById("google-gsi-client")) {
      const script = document.createElement("script");
      script.id = "google-gsi-client";
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = () => {
        if (googleClientId && window.google?.accounts?.id) {
          window.google.accounts.id.initialize({
            client_id: googleClientId,
            callback: (response: any) => {
              if (response.credential) {
                setLoading(true);
                googleLogin(response.credential)
                  .then((res) => {
                    setLoading(false);
                    if (!res.success) setErrorMessage(res.error || "Đăng nhập Google thất bại");
                  })
                  .catch(() => setLoading(false));
              }
            },
          });
        }
      };
      document.body.appendChild(script);
    }
  }, [googleClientId]);

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
      otpInputsRef.current[5]?.focus();
    }
  };

  // 1. Submit Đăng Nhập
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    const res = await login(email, password);
    setLoading(false);
    if (!res.success) {
      setErrorMessage(res.error || "Đăng nhập thất bại");
    }
  };

  // 2. Submit Bước 1: Gửi OTP Đăng Ký
  const handleSendOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email || !name || !password) {
      setErrorMessage("Vui lòng điền đầy đủ Họ tên, Email và Mật khẩu.");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("Mật khẩu phải có ít nhất 6 ký tự.");
      return;
    }

    setLoading(true);
    const res = await sendRegisterOtp(email);
    setLoading(false);

    if (res.success) {
      setRegisterStep("otp");
      setCountdown(res.cooldown || 60);
      setSuccessMessage("Mã xác thực 6 số đã được gửi đến hộp thư Gmail của bạn.");
      setTimeout(() => otpInputsRef.current[0]?.focus(), 100);
    } else {
      setErrorMessage(res.error || "Không thể gửi mã OTP");
    }
  };

  // 3. Submit Bước 2: Xác nhận OTP & Hoàn tất Đăng Ký
  const handleVerifyOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpCode = otpValues.join("");
    if (otpCode.length !== 6) {
      setErrorMessage("Vui lòng nhập đủ 6 chữ số mã OTP.");
      return;
    }

    setErrorMessage(null);
    setLoading(true);

    const res = await registerWithOtp({
      email,
      otp: otpCode,
      name,
      password,
      phone: phone || undefined,
    });

    setLoading(false);
    if (!res.success) {
      setErrorMessage(res.error || "Xác thực OTP thất bại");
    }
  };

  // 4. Gửi lại OTP
  const handleResendOtp = async () => {
    if (countdown > 0) return;
    setErrorMessage(null);
    setLoading(true);
    const res = await sendRegisterOtp(email);
    setLoading(false);
    if (res.success) {
      setCountdown(res.cooldown || 60);
      setSuccessMessage("Đã gửi lại mã OTP mới vào hộp thư.");
      setOtpValues(["", "", "", "", "", ""]);
      otpInputsRef.current[0]?.focus();
    } else {
      setErrorMessage(res.error || "Không thể gửi lại mã OTP");
    }
  };

  // 5. Đăng nhập Google Trigger
  const handleGoogleSignIn = () => {
    if (googleClientId && window.google?.accounts?.id) {
      window.google.accounts.id.prompt();
    } else {
      // Khi chưa cấu hình Google Client ID, mở popup hướng dẫn và cho phép test
      setShowGoogleGuide(true);
    }
  };

  if (!isAuthModalOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.25 }}
          className="relative w-full max-w-md bg-[#FAF7F2] rounded-[36px] p-6 sm:p-8 border border-[#EFE9E1] shadow-2xl overflow-hidden"
        >
          {/* NÚT CLOSE */}
          <button
            onClick={closeAuthModal}
            className="absolute top-6 right-6 w-9 h-9 rounded-full bg-white/80 hover:bg-white text-stone-600 hover:text-stone-900 flex items-center justify-center transition border border-stone-200 cursor-pointer shadow-xs"
          >
            <X className="w-4 h-4" />
          </button>

          {/* HEADER LOGO */}
          <div className="text-center mb-6">
            <span className="text-2xl font-serif font-bold text-[#181716] tracking-tight">
              CardVite
            </span>
            <p className="text-xs text-stone-500 mt-1">
              Nền tảng thiệp cưới & sự kiện trực tuyến cao cấp
            </p>
          </div>

          {/* GOOGLE CLIENT ID GUIDE MODAL POPUP */}
          {showGoogleGuide ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-4"
            >
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 space-y-2.5">
                <div className="flex items-center gap-2 font-bold text-xs">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>Cấu hình Google OAuth 2.0 (Google Sign-In)</span>
                </div>
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  Để nút Google mở popup chọn tài khoản thật, bạn cần tạo <strong>Client ID</strong> trên Google Cloud Console (hoàn toàn miễn phí):
                </p>
                <ol className="text-[11px] text-amber-800 space-y-1 list-decimal pl-4">
                  <li>Truy cập <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noreferrer" className="underline font-bold inline-flex items-center gap-0.5">Google Cloud Credentials <ExternalLink className="w-2.5 h-2.5" /></a></li>
                  <li>Tạo <strong>OAuth Client ID</strong> (Web application).</li>
                  <li>Thêm Authorized JavaScript origins: <code className="bg-amber-100 px-1 py-0.5 rounded">http://localhost:3000</code>.</li>
                  <li>Dán Client ID vào file <code className="bg-amber-100 px-1 py-0.5 rounded">fe/.env.local</code> và <code className="bg-amber-100 px-1 py-0.5 rounded">be/.env</code>:
                    <br />
                    <code className="block mt-1 bg-amber-200/80 p-1.5 rounded text-[10px] font-mono">
                      GOOGLE_CLIENT_ID=&quot;xxxx.apps.googleusercontent.com&quot;
                    </code>
                  </li>
                </ol>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowGoogleGuide(false)}
                  className="flex-1 py-2.5 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs font-bold transition cursor-pointer"
                >
                  ← Quay lại Đăng Nhập
                </button>
              </div>
            </motion.div>
          ) : (
            <>
              {/* TAB CHUYỂN ĐỔI: ĐĂNG NHẬP / ĐĂNG KÝ */}
              <div className="flex rounded-2xl bg-stone-200/70 p-1 mb-6">
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
                    setRegisterStep("form");
                    setErrorMessage(null);
                    setSuccessMessage(null);
                  }}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
                    activeTab === "register"
                      ? "bg-white text-stone-900 shadow-xs"
                      : "text-stone-600 hover:text-stone-900"
                  }`}
                >
                  Đăng Ký
                </button>
              </div>

              {/* THÔNG BÁO LỖI / THÀNH CÔNG */}
              {errorMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2"
                >
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{errorMessage}</span>
                </motion.div>
              )}

              {successMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>{successMessage}</span>
                </motion.div>
              )}

              {/* ------------------------------------------------------------- */}
              {/* TAB 1: FORM ĐĂNG NHẬP */}
              {/* ------------------------------------------------------------- */}
              {activeTab === "login" && (
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                      Email
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="email@example.com"
                        className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl bg-white border border-[#E8E2D8] focus:outline-none focus:ring-2 focus:ring-[#BE944E]/40 text-stone-900 font-medium"
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
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl bg-white border border-[#E8E2D8] focus:outline-none focus:ring-2 focus:ring-[#BE944E]/40 text-stone-900 font-medium"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 rounded-xl bg-[#181716] hover:bg-black text-white text-xs font-bold uppercase tracking-wider shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                  >
                    {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>ĐĂNG NHẬP</span>}
                  </button>

                  {/* NÚT GOOGLE SIGN IN */}
                  <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-stone-300" />
                    </div>
                    <div className="relative flex justify-center text-[10px] uppercase">
                      <span className="bg-[#FAF7F2] px-2 text-stone-500 font-bold">Hoặc</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    className="w-full py-2.5 rounded-xl bg-white hover:bg-stone-50 text-stone-800 text-xs font-bold border border-stone-300 shadow-2xs transition flex items-center justify-center gap-3 cursor-pointer"
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
                    <span>Đăng nhập với Google</span>
                  </button>
                </form>
              )}

              {/* ------------------------------------------------------------- */}
              {/* TAB 2: FORM ĐĂNG KÝ BẰNG GMAIL & OTP */}
              {/* ------------------------------------------------------------- */}
              {activeTab === "register" && registerStep === "form" && (
                <form onSubmit={handleSendOtpSubmit} className="space-y-3.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                      Họ và tên
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Nguyễn Văn A"
                        className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl bg-white border border-[#E8E2D8] focus:outline-none focus:ring-2 focus:ring-[#BE944E]/40 text-stone-900 font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                      Địa chỉ Gmail / Email
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="yourname@gmail.com"
                        className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl bg-white border border-[#E8E2D8] focus:outline-none focus:ring-2 focus:ring-[#BE944E]/40 text-stone-900 font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                      Mật khẩu (tối thiểu 6 ký tự)
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl bg-white border border-[#E8E2D8] focus:outline-none focus:ring-2 focus:ring-[#BE944E]/40 text-stone-900 font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                      Số điện thoại (tùy chọn)
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="0912 345 678"
                        className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl bg-white border border-[#E8E2D8] focus:outline-none focus:ring-2 focus:ring-[#BE944E]/40 text-stone-900 font-medium"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 rounded-xl bg-[#BE944E] hover:bg-[#a67e3a] text-white text-xs font-bold uppercase tracking-wider shadow-md transition flex items-center justify-center gap-2 cursor-pointer mt-2 disabled:opacity-60"
                  >
                    {loading ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <span>NHẬN MÃ XÁC THỰC OTP</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* ------------------------------------------------------------- */}
              {/* TAB 2 - BƯỚC 2: NHẬP MÃ OTP 6 CHỮ SỐ */}
              {/* ------------------------------------------------------------- */}
              {activeTab === "register" && registerStep === "otp" && (
                <form onSubmit={handleVerifyOtpSubmit} className="space-y-5 text-center">
                  <div>
                    <span className="text-xs text-stone-600">
                      Mã OTP đã được gửi đến: <strong className="text-stone-900">{email}</strong>
                    </span>
                    <p className="text-[11px] text-stone-400 mt-1">
                      Vui lòng nhập 6 chữ số để xác thực tài khoản:
                    </p>
                  </div>

                  {/* 6 OTP BOXES */}
                  <div className="flex justify-center gap-2.5" onPaste={handleOtpPaste}>
                    {otpValues.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={(el) => { otpInputsRef.current[idx] = el; }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(idx, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                        className="w-11 h-13 text-center text-xl font-bold font-mono rounded-xl bg-white border-2 border-stone-300 focus:border-[#BE944E] focus:ring-2 focus:ring-[#BE944E]/30 text-stone-900 transition focus:outline-none shadow-xs"
                      />
                    ))}
                  </div>

                  <button
                    type="submit"
                    disabled={loading || otpValues.join("").length !== 6}
                    className="w-full py-3 rounded-xl bg-[#7D6331] hover:bg-[#685226] text-white text-xs font-bold uppercase tracking-wider shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>XÁC NHẬN & HOÀN TẤT</span>}
                  </button>

                  {/* GỬI LẠI OTP / QUAY LẠI */}
                  <div className="flex items-center justify-between text-xs pt-1">
                    <button
                      type="button"
                      onClick={() => setRegisterStep("form")}
                      className="text-stone-500 hover:text-stone-800 underline cursor-pointer"
                    >
                      ← Đổi thông tin
                    </button>

                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={countdown > 0 || loading}
                      className={`font-semibold cursor-pointer ${
                        countdown > 0 ? "text-stone-400" : "text-[#BE944E] hover:underline"
                      }`}
                    >
                      {countdown > 0 ? `Gửi lại mã (${countdown}s)` : "Gửi lại mã OTP"}
                    </button>
                  </div>
                </form>
              )}
            </>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
