"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import { QrCode, X, Copy, Check, Smartphone } from "lucide-react";

interface DesktopMobileQrWidgetProps {
  /**
   * Tùy chọn truyền URL cụ thể. Nếu không truyền, widget tự lấy window.location.href.
   */
  url?: string;
  /**
   * Tiêu đề hiển thị dưới mã QR
   */
  title?: string;
  /**
   * Tùy chọn class bổ sung
   */
  className?: string;
}

export const DesktopMobileQrWidget: React.FC<DesktopMobileQrWidgetProps> = ({
  url: propUrl,
  title = "Quét mã QR để xem trên điện thoại",
  className = "",
}) => {
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(true);
  const [copied, setCopied] = useState(false);
  const [currentUrl, setCurrentUrl] = useState<string>(propUrl || "");

  useEffect(() => {
    setMounted(true);
    if (!propUrl && typeof window !== "undefined") {
      setCurrentUrl(window.location.href);
    }
  }, [propUrl]);

  const qrTargetUrl = propUrl || currentUrl;

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!qrTargetUrl) return;

    try {
      await navigator.clipboard.writeText(qrTargetUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback nếu clipboard API bị hạn chế
      const textArea = document.createElement("textarea");
      textArea.value = qrTargetUrl;
      textArea.style.position = "fixed";
      textArea.style.left = "-9999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand("copy");
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        // ignore
      }
      document.body.removeChild(textArea);
    }
  };

  // Tránh hydration mismatch trên Next.js SSR
  if (!mounted || !qrTargetUrl) {
    return null;
  }

  return (
    <aside
      aria-label="Quét mã QR trên điện thoại"
      className={`hidden md:block fixed bottom-6 right-6 z-40 select-none ${className}`}
    >
      <AnimatePresence mode="wait">
        {isOpen ? (
          <motion.div
            key="qr-card"
            initial={{ opacity: 0, scale: 0.88, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.88, y: 15 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            className="w-56 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md rounded-2xl p-4 shadow-2xl border border-stone-200/90 dark:border-stone-800 text-stone-800 dark:text-stone-100 flex flex-col items-center"
          >
            {/* Header: Nút đóng */}
            <div className="w-full flex items-center justify-between pb-2 mb-1">
              <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                <Smartphone className="w-3.5 h-3.5 text-rose-500" />
                Mobile View
              </span>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Thu nhỏ mã QR"
                className="p-1 -mr-1 rounded-full text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Khung mã QR */}
            <div className="p-2.5 bg-white rounded-xl shadow-xs border border-stone-100 flex items-center justify-center">
              <QRCodeSVG
                value={qrTargetUrl}
                size={148}
                level="M"
                marginSize={1}
                imageSettings={{
                  src: "/logo.png",
                  height: 24,
                  width: 24,
                  excavate: true,
                }}
              />
            </div>

            {/* Dòng chữ hướng dẫn */}
            <p className="mt-3 text-xs text-center font-medium text-stone-600 dark:text-stone-300 leading-snug">
              {title}
            </p>

            {/* Nút sao chép liên kết */}
            <button
              type="button"
              onClick={handleCopy}
              className="mt-2.5 w-full py-1.5 px-2.5 rounded-lg text-[11px] font-medium bg-stone-100 hover:bg-stone-200/80 dark:bg-stone-800 dark:hover:bg-stone-700/80 text-stone-600 dark:text-stone-300 transition-colors flex items-center justify-center gap-1.5"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-emerald-700 dark:text-emerald-400 font-semibold">Đã chép link!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>Sao chép liên kết</span>
                </>
              )}
            </button>
          </motion.div>
        ) : (
          <motion.button
            key="qr-button"
            type="button"
            initial={{ opacity: 0, scale: 0.85, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 10 }}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => setIsOpen(true)}
            aria-label="Mở mã QR xem trên điện thoại"
            className="flex items-center gap-2 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md px-3.5 py-2.5 rounded-full shadow-xl border border-stone-200/90 dark:border-stone-800 text-stone-700 dark:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-800/80 transition-all group"
          >
            <div className="w-6 h-6 rounded-full bg-rose-50 dark:bg-rose-950/60 flex items-center justify-center text-rose-500">
              <QrCode className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
            </div>
            <span className="text-xs font-semibold tracking-tight">Xem trên điện thoại</span>
          </motion.button>
        )}
      </AnimatePresence>
    </aside>
  );
};
