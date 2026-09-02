"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle2, UserCheck, Users } from "lucide-react";
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
}

export const RsvpFormModal: React.FC<RsvpFormModalProps> = ({
  isOpen,
  onClose,
  cardId,
  defaultGuestName = "",
  defaultGuestPhone = "",
  guestCode,
  primaryColor = "#D4AF37",
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
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-3.5 sm:p-4 overflow-y-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="relative w-full max-w-sm sm:max-w-md bg-white rounded-3xl p-5 sm:p-6 shadow-2xl border border-stone-100 overflow-hidden max-h-[92vh] overflow-y-auto my-auto"
          initial={{ scale: 0.92, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.92, y: 20 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Nút đóng */}
          <button
            onClick={onClose}
            className="absolute top-3.5 right-3.5 sm:top-4 sm:right-4 w-9 h-9 rounded-full bg-stone-100 text-stone-500 hover:bg-stone-200 active:scale-95 flex items-center justify-center cursor-pointer z-10"
          >
            <X className="w-4 h-4" />
          </button>

          {success ? (
            <div className="py-8 text-center flex flex-col items-center">
              <CheckCircle2 className="w-14 h-14 sm:w-16 sm:h-16 text-emerald-500 mb-3 animate-bounce" />
              <h3 className="text-lg sm:text-xl font-bold text-stone-800">
                {t("rsvpSuccessTitle") || "Xác Nhận Thành Công!"}
              </h3>
              <p className="text-xs sm:text-sm text-stone-500 mt-1 max-w-xs leading-relaxed">
                {t("rsvpSuccessDesc") || "Cảm ơn bạn đã phản hồi. Sự hiện diện của bạn là niềm vinh hạnh to lớn của chúng mình!"}
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3.5 sm:space-y-4">
              <div className="text-center pt-1 sm:pt-2">
                <div
                  className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center mx-auto mb-2 shadow-md"
                  style={{ backgroundColor: `${primaryColor}20` }}
                >
                  <UserCheck className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: primaryColor }} />
                </div>
                <h2 className="text-lg sm:text-xl font-bold font-serif text-stone-800">
                  {t("rsvpTitle") || "Xác Nhận Tham Dự"}
                </h2>
                <p className="text-[11px] sm:text-xs text-stone-500 mt-0.5">
                  {t("rsvpSubtitle") || "Vui lòng cho chúng mình biết kế hoạch của bạn"}
                </p>
              </div>

              {errorMsg && (
                <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs text-center font-medium">
                  {errorMsg}
                </div>
              )}

              {/* Tên & SĐT - text-base on mobile prevents iOS safari auto-zoom */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  {t("fullName") || "Họ và tên"} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="VD: Nguyễn Văn A"
                  className="w-full px-3.5 py-2.5 text-base sm:text-sm rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/40 bg-stone-50/80"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  {t("phone") || "Số điện thoại"}
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="VD: 0988 888 888"
                  className="w-full px-3.5 py-2.5 text-base sm:text-sm rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/40 bg-stone-50/80"
                />
              </div>

              {/* Lựa chọn tham gia */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  {t("attendingQuestion") || "Bạn sẽ tham dự chứ?"}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setStatus("ATTENDING")}
                    className={`py-2.5 px-3 text-xs font-semibold rounded-xl border transition cursor-pointer flex items-center justify-center gap-1.5 min-h-[42px] ${
                      status === "ATTENDING"
                        ? "bg-emerald-50 border-emerald-500 text-emerald-800 font-bold shadow-xs"
                        : "bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100"
                    }`}
                  >
                    <span>✅ {t("willAttend") || "Sẽ Tham Dự"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatus("DECLINED")}
                    className={`py-2.5 px-3 text-xs font-semibold rounded-xl border transition cursor-pointer flex items-center justify-center gap-1.5 min-h-[42px] ${
                      status === "DECLINED"
                        ? "bg-rose-50 border-rose-500 text-rose-800 font-bold shadow-xs"
                        : "bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100"
                    }`}
                  >
                    <span>❌ {t("willDecline") || "Rất Tiếc Không Thể Đến"}</span>
                  </button>
                </div>
              </div>

              {/* Số người đi cùng */}
              {status === "ATTENDING" && (
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    {t("guestCountLabel") || "Số lượng người tham dự (bao gồm bạn)"}
                  </label>
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setGuestCount(num)}
                        className={`flex-1 py-2 text-xs font-bold rounded-xl border transition cursor-pointer min-h-[38px] ${
                          guestCount === num
                            ? "bg-stone-900 border-stone-900 text-white shadow-xs"
                            : "bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100"
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
                <label className="block text-xs font-semibold text-stone-700 mb-1">
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
                      className={`py-2 text-[11px] font-semibold rounded-xl border transition cursor-pointer min-h-[36px] ${
                        side === s.id
                          ? "bg-amber-50 border-[#BE944E] text-[#6D4C33] font-bold"
                          : "bg-stone-50 border-stone-200 text-stone-500"
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Lời nhắn */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  {t("dietaryNotes") || "Lời nhắn / Lưu ý đặc biệt"}
                </label>
                <textarea
                  rows={2}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="VD: Mình ăn chay / Đến muộn một chút..."
                  className="w-full px-3.5 py-2 text-base sm:text-sm rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/40 bg-stone-50/80 resize-none"
                />
              </div>

              {/* Nút Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl text-white text-xs sm:text-sm font-bold uppercase tracking-wider shadow-lg active:scale-[0.98] transition cursor-pointer disabled:opacity-50 min-h-[46px]"
                style={{ backgroundColor: primaryColor }}
              >
                {loading ? t("submitting") || "Đang gửi..." : t("submitRsvp") || "Gửi Xác Nhận Tham Dự"}
              </button>
            </form>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
