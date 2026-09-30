'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cookie, ShieldCheck, X, ChevronRight, Check } from 'lucide-react';

interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  decidedAt: string;
}

const STORAGE_KEY = 'cardvite_cookie_consent';

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);
  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);
  const [isLearnMoreOpen, setIsLearnMoreOpen] = useState(false);

  // Cookie options
  const [analytics, setAnalytics] = useState(true);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    // Kiểm tra xem người dùng đã từng lưu lựa chọn cookie chưa
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) {
        // Đợi 700ms sau khi trang tải để animation mượt mà, không giật màn hình
        const timer = setTimeout(() => {
          setIsVisible(true);
        }, 700);
        return () => clearTimeout(timer);
      }
    } catch {
      // Bỏ qua nếu môi trường không cho phép truy cập localStorage
    }
  }, []);

  const savePreferences = (prefs: CookiePreferences) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    } catch {
      // Bỏ qua lỗi quota / security
    }
    setIsVisible(false);
    setIsCustomizeOpen(false);
    setIsLearnMoreOpen(false);
  };

  const handleAcceptAll = () => {
    savePreferences({
      necessary: true,
      analytics: true,
      marketing: true,
      decidedAt: new Date().toISOString(),
    });
  };

  const handleEssentialOnly = () => {
    savePreferences({
      necessary: true,
      analytics: false,
      marketing: false,
      decidedAt: new Date().toISOString(),
    });
  };

  const handleSaveCustom = () => {
    savePreferences({
      necessary: true,
      analytics,
      marketing,
      decidedAt: new Date().toISOString(),
    });
  };

  if (!isVisible) return null;

  return (
    <>
      {/* BANNER NỔI Ở GÓC DƯỚI (DESKTOP: BOTTOM-LEFT, MOBILE: FULL WIDTH BOTTOM) */}
      <AnimatePresence>
        {isVisible && (
          <motion.aside
            aria-label="Thông báo sử dụng cookie"
            role="region"
            initial={{ opacity: 0, y: 40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-4 left-4 right-4 sm:right-auto sm:max-w-[480px] z-50 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md rounded-2xl border border-neutral-200/80 dark:border-neutral-800 shadow-2xl shadow-black/10 p-5 sm:p-6 text-neutral-800 dark:text-neutral-100"
          >
            {!isCustomizeOpen ? (
              /* GIAO DIỆN CHÍNH - KHỚP 100% ẢNH MẪU */
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-500 flex items-center justify-center shrink-0">
                    <Cookie className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-base sm:text-lg text-neutral-900 dark:text-neutral-50 tracking-tight">
                    Chúng tôi dùng cookie
                  </h3>
                </div>

                <p className="text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">
                  CardVite dùng cookie để cải thiện trải nghiệm và đo lường hiệu quả quảng cáo.
                  Bạn có thể chấp nhận tất cả hoặc chỉ dùng cookie cần thiết.{' '}
                  <button
                    type="button"
                    onClick={() => setIsLearnMoreOpen(true)}
                    className="text-rose-600 hover:text-rose-700 dark:text-rose-400 font-medium underline underline-offset-2 transition-colors cursor-pointer"
                  >
                    Tìm hiểu thêm
                  </button>
                </p>

                {/* HÀNG NÚT BẤM */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  {/* Nút chấp nhận tất cả */}
                  <button
                    type="button"
                    onClick={handleAcceptAll}
                    className="flex-1 sm:flex-none px-4 py-2 sm:py-2.5 rounded-full bg-rose-500 hover:bg-rose-600 active:scale-[0.98] text-white font-medium text-sm transition-all shadow-sm shadow-rose-500/20 text-center cursor-pointer"
                  >
                    Chấp nhận tất cả
                  </button>

                  {/* Nút chỉ cần thiết */}
                  <button
                    type="button"
                    onClick={handleEssentialOnly}
                    className="flex-1 sm:flex-none px-4 py-2 sm:py-2.5 rounded-full border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800/80 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-100 font-medium text-sm transition-all active:scale-[0.98] text-center cursor-pointer"
                  >
                    Chỉ cần thiết
                  </button>

                  {/* Nút tùy chỉnh */}
                  <button
                    type="button"
                    onClick={() => setIsCustomizeOpen(true)}
                    className="w-full sm:w-auto px-3 py-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white font-medium text-sm transition-colors text-center cursor-pointer"
                  >
                    Tùy chỉnh
                  </button>
                </div>
              </div>
            ) : (
              /* GIAO DIỆN TÙY CHỈNH CHI TIẾT */
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-rose-500" />
                    <h3 className="font-bold text-base text-neutral-900 dark:text-neutral-50">
                      Tùy chỉnh quyền riêng tư
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsCustomizeOpen(false)}
                    className="p-1 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 transition-colors cursor-pointer"
                    aria-label="Đóng tùy chỉnh"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-3 text-xs max-h-56 overflow-y-auto pr-1">
                  {/* Cookie cần thiết */}
                  <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200/50 dark:border-neutral-700/50 flex items-start justify-between gap-3">
                    <div>
                      <div className="font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5">
                        <span>Cookie cần thiết</span>
                        <span className="text-[10px] uppercase font-bold bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 px-1.5 py-0.5 rounded">
                          Bắt buộc
                        </span>
                      </div>
                      <p className="text-neutral-500 dark:text-neutral-400 mt-1 leading-relaxed">
                        Cần thiết để website vận hành, đăng nhập, bảo mật giỏ hàng và phiên làm việc.
                      </p>
                    </div>
                    <div className="w-5 h-5 rounded-full bg-rose-500/20 text-rose-600 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  {/* Cookie phân tích */}
                  <label className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200/50 dark:border-neutral-700/50 flex items-start justify-between gap-3 cursor-pointer">
                    <div>
                      <span className="font-semibold text-neutral-900 dark:text-neutral-100 block">
                        Cookie phân tích & hiệu suất
                      </span>
                      <p className="text-neutral-500 dark:text-neutral-400 mt-1 leading-relaxed">
                        Giúp chúng tôi đo lường lượng truy cập thiệp và hoàn thiện tính năng tốt hơn.
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={analytics}
                      onChange={(e) => setAnalytics(e.target.checked)}
                      className="w-4 h-4 rounded text-rose-500 focus:ring-rose-400 mt-0.5 cursor-pointer accent-rose-500"
                    />
                  </label>

                  {/* Cookie tiếp thị */}
                  <label className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200/50 dark:border-neutral-700/50 flex items-start justify-between gap-3 cursor-pointer">
                    <div>
                      <span className="font-semibold text-neutral-900 dark:text-neutral-100 block">
                        Cookie quảng cáo & cá nhân hóa
                      </span>
                      <p className="text-neutral-500 dark:text-neutral-400 mt-1 leading-relaxed">
                        Hiển thị ưu đãi và nội dung phù hợp với sở thích của bạn.
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={marketing}
                      onChange={(e) => setMarketing(e.target.checked)}
                      className="w-4 h-4 rounded text-rose-500 focus:ring-rose-400 mt-0.5 cursor-pointer accent-rose-500"
                    />
                  </label>
                </div>

                <div className="flex items-center gap-2 pt-1 border-t border-neutral-100 dark:border-neutral-800">
                  <button
                    type="button"
                    onClick={handleSaveCustom}
                    className="flex-1 px-4 py-2 rounded-full bg-rose-500 hover:bg-rose-600 text-white font-medium text-xs transition-all shadow-sm cursor-pointer"
                  >
                    Lưu lựa chọn
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsCustomizeOpen(false)}
                    className="px-3 py-2 text-neutral-600 dark:text-neutral-400 text-xs font-medium hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer"
                  >
                    Quay lại
                  </button>
                </div>
              </div>
            )}
          </motion.aside>
        )}
      </AnimatePresence>

      {/* POPUP THÔNG TIN "TÌM HIỂU THÊM" */}
      <AnimatePresence>
        {isLearnMoreOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-neutral-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-neutral-200 dark:border-neutral-800 text-neutral-800 dark:text-neutral-200 space-y-4 max-h-[85vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
                <h3 className="font-bold text-lg text-neutral-900 dark:text-white">
                  Chính sách Cookie & Bảo mật
                </h3>
                <button
                  type="button"
                  onClick={() => setIsLearnMoreOpen(false)}
                  className="p-1 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="text-sm space-y-3 leading-relaxed text-neutral-600 dark:text-neutral-300">
                <p>
                  <strong>Cookie là gì?</strong> Cookie là các tệp văn bản nhỏ được lưu trên thiết bị của bạn khi bạn ghé thăm trang web của chúng tôi. Chúng giúp website ghi nhớ các tùy chọn của bạn như đăng nhập, ngôn ngữ hiển thị và thông tin thiệp cưới đang soạn thảo.
                </p>
                <div className="space-y-2 pt-1">
                  <h4 className="font-semibold text-neutral-900 dark:text-white flex items-center gap-1.5">
                    <ChevronRight className="w-4 h-4 text-rose-500" /> Các loại cookie chúng tôi sử dụng:
                  </h4>
                  <ul className="list-disc pl-5 space-y-1.5 text-xs text-neutral-600 dark:text-neutral-300">
                    <li>
                      <strong>Cookie cần thiết:</strong> Lưu trữ trạng thái phiên đăng nhập (JWT token), bảo vệ CSRF và giữ nội dung thiệp mời không bị mất khi đang chỉnh sửa.
                    </li>
                    <li>
                      <strong>Cookie phân tích:</strong> Thống kê số lượng khách mở thiệp, tương tác RSVP và gửi lời chúc mừng để cặp đôi nắm bắt tình hình.
                    </li>
                    <li>
                      <strong>Cookie quảng cáo:</strong> Giúp giới thiệu các mẫu thiệp và chương trình ưu đãi phù hợp nhất.
                    </li>
                  </ul>
                </div>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 italic pt-2">
                  Chúng tôi cam kết không bán dữ liệu cá nhân của bạn cho bất kỳ bên thứ ba nào. Bạn có thể thay đổi hoặc thu hồi sự đồng ý bất cứ lúc nào trong mục Cài đặt trình duyệt.
                </p>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsLearnMoreOpen(false)}
                  className="px-5 py-2 rounded-full bg-rose-500 hover:bg-rose-600 text-white font-medium text-sm transition-all shadow-sm cursor-pointer"
                >
                  Đã hiểu
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
