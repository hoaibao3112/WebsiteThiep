"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle2, UserCheck, Heart } from "lucide-react";
import { ApiClient } from "@/lib/api";
import { useLanguage } from "@/context/LanguageContext";

interface RsvpFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  cardId: string;
  defaultGuestName?: string;
  defaultGuestPhone?: string;
  guestCode?: string;
  primaryColor?: string;
  isDemo?: boolean;
}

export const RsvpFormModal: React.FC<RsvpFormModalProps> = ({
  isOpen,
  onClose,
  cardId,
  defaultGuestName = "",
  defaultGuestPhone = "",
  guestCode,
  primaryColor = "#3B2A1E",
  isDemo = false,
}) => {
  const { t } = useLanguage();
  const [fullName, setFullName] = useState(defaultGuestName);
  const [phone, setPhone] = useState(defaultGuestPhone);
  const [status, setStatus] = useState<"ATTENDING" | "DECLINED" | "UNDECIDED">("ATTENDING");
  const [guestCount, setGuestCount] = useState(1);
  const [side, setSide] = useState<"GROOM_SIDE" | "BRIDE_SIDE" | "MUTUAL">("MUTUAL");
  const [note, setNote] = useState("");

  useEffect(() => {
    if (defaultGuestName) setFullName(defaultGuestName);
    if (defaultGuestPhone) setPhone(defaultGuestPhone);
  }, [defaultGuestName, defaultGuestPhone, isOpen]);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setErrorMsg("Vui lòng nhập họ và tên của bạn");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    if (!cardId || cardId.startsWith("demo-")) {
      setTimeout(() => {
        setLoading(false);
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          onClose();
        }, 2200);
      }, 500);
      return;
    }

    const res = await ApiClient.request("/rsvp", {
      method: "POST",
      body: JSON.stringify({
        cardId,
        guestToken: guestCode,
        fullName: fullName.trim(),
        phone: phone.trim() || undefined,
        status,
        guestCount: status === "ATTENDING" ? guestCount : 0,
        side,
        note: note.trim() || undefined,
      }),
    });

    setLoading(false);
    if (res.success) {
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 2500);
    } else {
      setErrorMsg(res.error || "Gửi phản hồi thất bại. Vui lòng thử lại.");
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3.5 sm:p-4 overflow-y-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="relative w-full max-w-sm sm:max-w-md bg-gradient-to-b from-[#FDFBF7] via-[#FAF6EE] to-[#F5EFE4] font-sans rounded-3xl p-5 sm:p-6 shadow-[0_25px_60px_-15px_rgba(61,42,30,0.25)] border border-[#E8DAC6] ring-1 ring-[#D8C7B0]/30 overflow-hidden max-h-[92vh] overflow-y-auto my-auto"
          initial={{ scale: 0.92, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.92, y: 20 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Nẹp viền vàng champagne sang trọng ở mép trên */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#C5A059]/30 via-[#C5A059] to-[#C5A059]/30" />

          {/* Nút đóng */}
          <button
            onClick={onClose}
            className="absolute top-3.5 right-3.5 sm:top-4 sm:right-4 w-9 h-9 rounded-full bg-[#EFE6D8]/90 text-[#6E5948] hover:bg-[#E3D5C0] hover:text-[#3B2A1E] active:scale-95 flex items-center justify-center cursor-pointer z-10 transition-colors shadow-xs"
            aria-label="Đóng biểu mẫu"
          >
            <X className="w-4 h-4" />
          </button>

          {success ? (
            <div className="py-8 text-center flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-[#EAF5EE] border border-[#3E8055]/30 flex items-center justify-center mb-3 shadow-xs">
                <CheckCircle2 className="w-9 h-9 text-[#2E7A4A] animate-bounce" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold font-serif text-[#3B2A1E]">
                {t("rsvpSuccessTitle") || "Xác Nhận Thành Công!"}
              </h3>
              <p className="text-xs sm:text-sm text-[#7A6756] mt-1.5 max-w-xs leading-relaxed">
                {t("rsvpSuccessDesc") || "Cảm ơn bạn đã phản hồi. Sự hiện diện của bạn là niềm vinh hạnh to lớn của chúng mình!"}
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3.5 sm:space-y-4">
              <div className="text-center pt-1 sm:pt-2">
                {/* Con dấu huy hiệu monogram sang trọng */}
                <div className="w-13 h-13 rounded-full flex items-center justify-center mx-auto mb-2 shadow-sm border border-[#E3D1BA] bg-gradient-to-b from-[#FFFDF9] to-[#F3E8D7]">
                  <UserCheck className="w-6 h-6 text-[#A67C1E]" style={{ color: primaryColor }} />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold font-serif text-[#3B2A1E] tracking-tight">
                  {t("rsvpTitle") || "Xác Nhận Tham Dự (RSVP)"}
                </h2>
                <div className="flex items-center justify-center gap-2 mt-1 mb-1 text-[#C5A059] opacity-75 text-[11px]">
                  <span>✦</span>
                  <span className="h-[1px] w-7 bg-[#D8C7B0]" />
                  <span>❦</span>
                  <span className="h-[1px] w-7 bg-[#D8C7B0]" />
                  <span>✦</span>
                </div>
                <p className="text-xs sm:text-[13px] text-[#7A6756] leading-normal">
                  {t("rsvpSubtitle") || "Vui lòng cho chúng mình biết kế hoạch của bạn"}
                </p>
                {isDemo && (
                  <div className="mt-3.5 px-3.5 py-2.5 rounded-2xl bg-gradient-to-r from-[#F6EFE2] to-[#FAF3E8] border border-[#DECFBA] text-[#6E4F28] text-xs text-left leading-relaxed shadow-xs">
                    <span className="font-semibold text-[#8C5E28]">💡 Xem trước tính năng RSVP:</span> Khách mời của bạn sẽ xác nhận tham dự qua biểu mẫu này. Phản hồi sẽ tự động tổng hợp vào danh sách khách mời trong Dashboard của bạn.
                  </div>
                )}
              </div>

              {errorMsg && (
                <div className="p-2.5 rounded-xl bg-[#FDF0EE] border border-[#F3C4BE] text-[#9A342D] text-xs text-center font-medium shadow-xs">
                  {errorMsg}
                </div>
              )}

              {/* Tên & SĐT - text-base on mobile prevents iOS safari auto-zoom */}
              <div>
                <label className="block text-xs sm:text-[13px] font-semibold text-[#4A3728] mb-1">
                  {t("fullName") || "Họ và tên của bạn"} <span className="text-[#C45E5E]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="VD: Nguyễn Văn A"
                  className="w-full px-3.5 py-2.5 sm:py-3 text-base sm:text-sm rounded-xl border border-[#E2D4BF] focus:outline-none focus:border-[#C5A059] focus:ring-2 focus:ring-[#C5A059]/20 bg-[#FFFDF9] text-[#3B2A1E] placeholder:text-[#A89885] transition-all shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-[13px] font-semibold text-[#4A3728] mb-1">
                  {t("phone") || "Số điện thoại (tùy chọn)"}
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="VD: 0988 888 888"
                  className="w-full px-3.5 py-2.5 sm:py-3 text-base sm:text-sm rounded-xl border border-[#E2D4BF] focus:outline-none focus:border-[#C5A059] focus:ring-2 focus:ring-[#C5A059]/20 bg-[#FFFDF9] text-[#3B2A1E] placeholder:text-[#A89885] transition-all shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
                />
              </div>

              {/* Lựa chọn tham gia */}
              <div>
                <label className="block text-xs sm:text-[13px] font-semibold text-[#4A3728] mb-1.5">
                  {t("attendingQuestion") || "Bạn sẽ tham dự chứ?"}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setStatus("ATTENDING")}
                    className={`py-2.5 px-3 text-xs sm:text-[13px] font-semibold rounded-xl border transition-all cursor-pointer flex items-center justify-center gap-1.5 min-h-[44px] ${
                      status === "ATTENDING"
                        ? "bg-[#EEF7F1] border-2 border-[#3F8557] text-[#1D5434] font-bold shadow-xs scale-[1.01]"
                        : "bg-[#FFFDF9] border-[#E2D4BF] text-[#6E5948] hover:bg-[#F8F2E7] hover:border-[#D1BFAB]"
                    }`}
                  >
                    <span>✅ {t("willAttend") || "Sẽ tham dự"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatus("DECLINED")}
                    className={`py-2.5 px-3 text-xs sm:text-[13px] font-semibold rounded-xl border transition-all cursor-pointer flex items-center justify-center gap-1.5 min-h-[44px] ${
                      status === "DECLINED"
                        ? "bg-[#FDF2F0] border-2 border-[#CD625A] text-[#862D26] font-bold shadow-xs scale-[1.01]"
                        : "bg-[#FFFDF9] border-[#E2D4BF] text-[#6E5948] hover:bg-[#F8F2E7] hover:border-[#D1BFAB]"
                    }`}
                  >
                    <span>❌ {t("willDecline") || "Bận không đến"}</span>
                  </button>
                </div>
              </div>

              {/* Số người đi cùng */}
              {status === "ATTENDING" && (
                <div>
                  <label className="block text-xs sm:text-[13px] font-semibold text-[#4A3728] mb-1">
                    {t("guestCountLabel") || "Số người tham dự"}
                  </label>
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setGuestCount(num)}
                        className={`flex-1 py-2 text-xs sm:text-sm font-bold rounded-xl border transition-all cursor-pointer min-h-[40px] ${
                          guestCount === num
                            ? "bg-[#3B2A1E] border-2 border-[#3B2A1E] text-[#FFF9F0] shadow-sm scale-[1.04]"
                            : "bg-[#FFFDF9] border-[#E2D4BF] text-[#5C4838] hover:bg-[#F8F2E7] hover:border-[#D1BFAB]"
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Khách của bên nào */}
              <div>
                <label className="block text-xs sm:text-[13px] font-semibold text-[#4A3728] mb-1">
                  Bạn là khách của ai?
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { id: "GROOM_SIDE", label: "Nhà Trai" },
                    { id: "BRIDE_SIDE", label: "Nhà Gái" },
                    { id: "MUTUAL", label: "Bạn Chung" },
                  ].map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setSide(s.id as any)}
                      className={`py-2 text-xs font-semibold rounded-xl border transition-all cursor-pointer min-h-[38px] ${
                        side === s.id
                          ? "bg-gradient-to-b from-[#F9EFE0] to-[#F3E5D0] border-2 border-[#C5A059] text-[#543810] font-bold shadow-xs scale-[1.02]"
                          : "bg-[#FFFDF9] border-[#E2D4BF] text-[#6E5948] hover:bg-[#F8F2E7] hover:border-[#D1BFAB]"
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Lời nhắn */}
              <div>
                <label className="block text-xs sm:text-[13px] font-semibold text-[#4A3728] mb-1">
                  {t("dietaryNotes") || "Lời nhắn / Ăn chay / Yêu cầu đặc biệt"}
                </label>
                <textarea
                  rows={2}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="VD: Mình ăn chay / Đến muộn một chút..."
                  className="w-full px-3.5 py-2.5 text-base sm:text-sm rounded-xl border border-[#E2D4BF] focus:outline-none focus:border-[#C5A059] focus:ring-2 focus:ring-[#C5A059]/20 bg-[#FFFDF9] text-[#3B2A1E] placeholder:text-[#A89885] transition-all shadow-[0_1px_2px_rgba(0,0,0,0.02)] resize-none"
                />
              </div>

              {/* Nút Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 sm:py-4 rounded-xl text-white text-xs sm:text-sm font-bold uppercase tracking-wider sm:tracking-widest shadow-[0_8px_22px_-4px_rgba(61,42,30,0.35)] hover:shadow-[0_12px_26px_-4px_rgba(61,42,30,0.45)] hover:brightness-105 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50 min-h-[48px] flex items-center justify-center gap-2"
                style={{ backgroundColor: primaryColor || "#3B2A1E" }}
              >
                {loading ? t("submitting") || "Đang gửi phản hồi..." : t("submitRsvp") || "Gửi Xác Nhận Ngay"}
              </button>
            </form>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
