"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Gift, Copy, Check } from "lucide-react";
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

  const tab1Label = labelPrimary || t("groomGiftTab");
  const tab2Label = labelSecondary || t("brideGiftTab");

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
          className="relative w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-stone-100 overflow-hidden text-center"
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

          {/* Header */}
          <div className="flex flex-col items-center pt-2">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3 shadow-md"
              style={{ backgroundColor: `${primaryColor}20` }}
            >
              <Gift className="w-6 h-6" style={{ color: primaryColor }} />
            </div>
            <h2 className="text-xl font-bold font-serif text-stone-800">
              {t("giftTitle")}
            </h2>
            <p className="text-xs text-stone-500 mt-1 max-w-xs">
              {t("giftSubtitle")}
            </p>
          </div>

          {/* TAB CHUYỂN ĐỔI CHÚ RỂ / CÔ DÂU */}
          {bankingSecondary && (
            <div className="flex p-1 bg-stone-100 rounded-xl my-4 gap-1">
              <button
                onClick={() => setActiveTab("primary")}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition cursor-pointer ${
                  activeTab === "primary"
                    ? "bg-white text-stone-900 shadow-xs"
                    : "text-stone-500 hover:text-stone-800"
                }`}
              >
                {tab1Label}
              </button>
              <button
                onClick={() => setActiveTab("secondary")}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition cursor-pointer ${
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
            <div className="flex flex-col items-center mt-3">
              <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 shadow-inner">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={
                    currentBanking.qrUrl ||
                    `https://img.vietqr.io/image/${currentBanking.bankCode}-${currentBanking.accountNumber}-compact2.png?accountName=${encodeURIComponent(
                      currentBanking.accountName
                    )}`
                  }
                  alt="VietQR Code"
                  className="w-48 h-48 object-contain rounded-lg"
                />
              </div>

              <div className="w-full mt-4 p-3 bg-stone-50 rounded-xl border border-stone-200 text-left space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-stone-500">{t("bank")}:</span>
                  <span className="font-semibold text-stone-800">
                    {currentBanking.bankCode}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-stone-500">{t("accountHolder")}:</span>
                  <span className="font-semibold text-stone-800">
                    {currentBanking.accountName}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs pt-1 border-t border-stone-200">
                  <span className="text-stone-500">{t("accountNumber")}:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-amber-900">
                      {currentBanking.accountNumber}
                    </span>
                    <button
                      onClick={() => handleCopy(currentBanking.accountNumber)}
                      className="p-1 rounded-md hover:bg-stone-200 text-stone-600 cursor-pointer"
                      title="Sao chép"
                    >
                      {copied ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
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
