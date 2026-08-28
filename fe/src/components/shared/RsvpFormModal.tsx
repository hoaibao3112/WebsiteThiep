"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle2, UserCheck } from "lucide-react";
import { ApiClient } from "@/lib/api";
import { useLanguage } from "@/context/LanguageContext";

interface RsvpFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  cardId: string;
  defaultGuestName?: string;
  guestCode?: string;
  primaryColor?: string;
}

export const RsvpFormModal: React.FC<RsvpFormModalProps> = ({
  isOpen,
  onClose,
  cardId,
  defaultGuestName = "",
  guestCode,
  primaryColor = "#D4AF37",
}) => {
  const { t } = useLanguage();
  const [fullName, setFullName] = useState(defaultGuestName);
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState<"ATTENDING" | "DECLINED" | "UNDECIDED">("ATTENDING");
  const [guestCount, setGuestCount] = useState(1);
  const [side, setSide] = useState<"GROOM_SIDE" | "BRIDE_SIDE" | "MUTUAL">("MUTUAL");
  const [note, setNote] = useState("");

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setErrorMsg("Vui lòng nhập họ và tên");
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
        }, 2000);
      }, 500);
      return;
    }

    const res = await ApiClient.request("/rsvp", {
      method: "POST",
      body: JSON.stringify({
        cardId,
        guestCode,
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
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="relative w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-stone-100 overflow-hidden"
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
        >
          {/* Nút đóng */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-stone-100 text-stone-500 hover:bg-stone-200 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          {success ? (
            <div className="py-8 text-center flex flex-col items-center">
              <CheckCircle2 className="w-16 h-16 text-emerald-500 mb-3 animate-bounce" />
              <h3 className="text-xl font-bold text-stone-800">
                {t("rsvpSuccessTitle")}
              </h3>
              <p className="text-sm text-stone-500 mt-1 max-w-xs">
                {t("rsvpSuccessDesc")}
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="text-center pt-2">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-2 shadow-md"
                  style={{ backgroundColor: `${primaryColor}20` }}
                >
                  <UserCheck className="w-6 h-6" style={{ color: primaryColor }} />
                </div>
                <h2 className="text-xl font-bold font-serif text-stone-800">
                  {t("rsvpTitle")}
                </h2>
                <p className="text-xs text-stone-500 mt-0.5">
                  {t("rsvpSubtitle")}
                </p>
              </div>

              {errorMsg && (
                <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs text-center font-medium">
                  {errorMsg}
                </div>
              )}

              {/* Tên & SĐT */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  {t("fullName")} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="VD: Nguyen Van A"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/40 bg-stone-50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  {t("phone")}
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="VD: 0988888888"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/40 bg-stone-50"
                />
              </div>

              {/* Lựa chọn tham gia */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  {t("attendingQuestion")}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setStatus("ATTENDING")}
                    className={`py-2.5 px-3 text-xs font-semibold rounded-xl border transition cursor-pointer flex items-center justify-center gap-1.5 ${
                      status === "ATTENDING"
                        ? "bg-emerald-50 border-emerald-500 text-emerald-700 shadow-xs"
                        : "bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100"
                    }`}
                  >
                    <span>✅ {t("willAttend")}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatus("DECLINED")}
                    className={`py-2.5 px-3 text-xs font-semibold rounded-xl border transition cursor-pointer flex items-center justify-center gap-1.5 ${
                      status === "DECLINED"
                        ? "bg-rose-50 border-rose-500 text-rose-700 shadow-xs"
                        : "bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100"
                    }`}
                  >
                    <span>❌ {t("willDecline")}</span>
                  </button>
                </div>
              </div>

              {/* Số người đi cùng */}
              {status === "ATTENDING" && (
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    {t("guestCountLabel")}
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setGuestCount(num)}
                        className={`flex-1 py-2 text-xs font-bold rounded-xl border transition cursor-pointer ${
                          guestCount === num
                            ? "bg-stone-900 border-stone-900 text-white"
                            : "bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100"
                        }`}
                      >
                        {num} {t("people")}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Lời nhắn */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  {t("dietaryNotes")}
                </label>
                <textarea
                  rows={2}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Gửi lời nhắn..."
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/40 bg-stone-50"
                />
              </div>

              {/* Nút Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl text-white text-sm font-semibold shadow-lg transition cursor-pointer disabled:opacity-50"
                style={{ backgroundColor: primaryColor }}
              >
                {loading ? t("submitting") : t("submitRsvp")}
              </button>
            </form>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
