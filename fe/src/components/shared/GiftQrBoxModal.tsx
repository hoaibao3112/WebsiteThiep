"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Gift, Copy, Check, Download } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

interface BankingInfo {
  bankCode: string;
  accountNumber: string;
  accountName: string;
  qrUrl?: string;
}

interface GiftQrBoxModalProps {
  isOpen: boolean;
  onClose: () => void;
  bankingPrimary?: BankingInfo | null;
  bankingSecondary?: BankingInfo | null;
  labelPrimary?: string;
  labelSecondary?: string;
  primaryColor?: string;
}

export const GiftQrBoxModal: React.FC<GiftQrBoxModalProps> = ({
  isOpen,
  onClose,
  bankingPrimary,
  bankingSecondary,
  labelPrimary,
  labelSecondary,
  primaryColor = "#D4AF37",
}) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<"primary" | "secondary">("primary");
  const [copied, setCopied] = useState(false);

  const currentBanking = activeTab === "primary" ? bankingPrimary : bankingSecondary;

  const tab1Label = labelPrimary || t("groomGiftTab") || "Nhà Trai (Chú Rể)";
  const tab2Label = labelSecondary || t("brideGiftTab") || "Nhà Gái (Cô Dâu)";

  const qrImageUrl = currentBanking
    ? currentBanking.qrUrl ||
      `https://img.vietqr.io/image/${currentBanking.bankCode}-${currentBanking.accountNumber}-compact2.png?accountName=${encodeURIComponent(
        currentBanking.accountName
      )}`
    : "";

  const handleCopy = (text: string) => {
    try {
      navigator.clipboard.writeText(text);
      if (typeof navigator !== "undefined" && navigator.vibrate) {
        navigator.vibrate(40);
      }
    } catch {
      // fallback
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadQr = () => {
    if (!qrImageUrl) return;
    const link = document.createElement("a");
    link.href = qrImageUrl;
    link.download = `VietQR-${currentBanking?.bankCode || "MungCuoi"}.png`;
    link.target = "_blank";
    link.click();
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
          className="relative w-full max-w-sm sm:max-w-md bg-white rounded-3xl p-5 sm:p-6 shadow-2xl border border-stone-100 overflow-hidden text-center max-h-[90vh] overflow-y-auto my-auto"
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

          {/* Header */}
          <div className="flex flex-col items-center pt-1 sm:pt-2">
            <div
              className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center mb-2.5 sm:mb-3 shadow-md"
              style={{ backgroundColor: `${primaryColor}20` }}
            >
              <Gift className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: primaryColor }} />
            </div>
            <h2 className="text-lg sm:text-xl font-bold font-serif text-stone-800">
              {t("giftTitle") || "Mừng Cưới & Chúc Phúc"}
            </h2>
            <p className="text-[11px] sm:text-xs text-stone-500 mt-0.5 max-w-xs leading-relaxed">
              {t("giftSubtitle") || "Gửi lời chúc phúc và quà mừng đến tân lang & tân nương qua mã QR"}
            </p>
          </div>

          {/* TAB CHUYỂN ĐỔI CHÚ RỂ / CÔ DÂU */}
          {bankingSecondary && (
            <div className="flex p-1 bg-stone-100 rounded-xl my-3 sm:my-4 gap-1">
              <button
                onClick={() => setActiveTab("primary")}
                className={`flex-1 py-2 sm:py-2.5 text-xs font-semibold rounded-lg transition cursor-pointer min-h-[38px] ${
                  activeTab === "primary"
                    ? "bg-white text-stone-900 shadow-xs"
                    : "text-stone-500 hover:text-stone-800"
                }`}
              >
                {tab1Label}
              </button>
              <button
                onClick={() => setActiveTab("secondary")}
                className={`flex-1 py-2 sm:py-2.5 text-xs font-semibold rounded-lg transition cursor-pointer min-h-[38px] ${
                  activeTab === "secondary"
                    ? "bg-white text-stone-900 shadow-xs"
                    : "text-stone-500 hover:text-stone-800"
                }`}
              >
                {tab2Label}
              </button>
            </div>
          )}

          {/* MÃ QR & THÔNG TIN TÀI KHOẢN */}
          {currentBanking ? (
            <div className="flex flex-col items-center mt-2">
              <div className="p-2.5 sm:p-3 bg-[#FAF7F2] rounded-2xl border border-stone-200 shadow-inner relative group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={qrImageUrl}
                  alt="VietQR Code"
                  className="w-40 h-40 sm:w-48 sm:h-48 object-contain rounded-lg"
                />
              </div>

              {/* ACTION: LƯU ẢNH QR */}
              <button
                onClick={handleDownloadQr}
                className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium text-stone-600 bg-stone-100 hover:bg-stone-200 rounded-lg transition cursor-pointer active:scale-95"
              >
                <Download className="w-3 h-3 text-[#BE944E]" />
                <span>Tải ảnh QR về máy</span>
              </button>

              <div className="w-full mt-3 p-3 sm:p-3.5 bg-stone-50 rounded-2xl border border-stone-200 text-left space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-stone-500">{t("bank") || "Ngân hàng"}:</span>
                  <span className="font-bold text-stone-800">
                    {currentBanking.bankCode}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-stone-500">{t("accountHolder") || "Chủ tài khoản"}:</span>
                  <span className="font-semibold text-stone-800 truncate max-w-[180px]">
                    {currentBanking.accountName}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs pt-1.5 border-t border-stone-200">
                  <span className="text-stone-500">{t("accountNumber") || "Số tài khoản"}:</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-bold text-amber-900 text-sm">
                      {currentBanking.accountNumber}
                    </span>
                    <button
                      onClick={() => handleCopy(currentBanking.accountNumber)}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-100 hover:bg-amber-200 active:scale-95 text-amber-900 text-[11px] font-semibold transition cursor-pointer"
                      title="Sao chép"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span className="text-emerald-700">Đã chép</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Sao chép</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-8 text-sm text-stone-400">
              Chưa có thông tin tài khoản
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

