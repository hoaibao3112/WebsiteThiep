"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Sparkles, LayoutGrid, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface DemoTemplateActionBarProps {
  templateSlug: string;
  templateName?: string;
  category?: string;
}

/**
 * Floating Action Bar hiển thị ở cuối trang khi xem thiệp mẫu (demo template).
 * Cung cấp 2 CTA chính:
 * - "Tùy Chỉnh Mẫu Này" → chuyển sang Visual Studio Editor
 * - "Xem Mẫu Khác" → chuyển sang trang /collections
 *
 * Chỉ hiển thị cho khách vãng lai / người dùng chưa đăng nhập đang khám phá mẫu.
 * TỰ ĐỘNG ẨN KHI:
 * 1. Thiệp được gửi cho người thân / khách mời (?g=, ?invite=1, ?share=1, ?mode=invite).
 * 2. Mở trong ứng dụng nhắn tin (Zalo, Messenger, Facebook in-app browser).
 * 3. Người dùng đã đăng nhập tài khoản.
 * 4. Người dùng bấm nút tắt "X".
 */
export function DemoTemplateActionBar({
  templateSlug,
  templateName,
  category = "WEDDING",
}: DemoTemplateActionBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [isSocialInApp, setIsSocialInApp] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined" && /zalo|fbav|fban|messenger/i.test(window.navigator.userAgent)) {
      setIsSocialInApp(true);
    }
  }, []);

  // 1. Kiểm tra query params: nếu là chế độ gửi cho khách / người thân thì ẩn hoàn toàn
  const isInviteMode = Boolean(
    searchParams?.get("g") ||
    searchParams?.get("invite") === "1" ||
    searchParams?.get("invite") === "true" ||
    searchParams?.get("share") === "1" ||
    searchParams?.get("share") === "true" ||
    searchParams?.get("mode") === "invite"
  );

  // Slide-up animation: hiện sau 1.5s delay để không phân tán khi đang xem thiệp
  useEffect(() => {
    if (!mounted || isInviteMode || dismissed) {
      return;
    }
    const timer = setTimeout(() => setVisible(true), 1500);
    return () => clearTimeout(timer);
  }, [mounted, isInviteMode, dismissed]);

  // Không hiển thị trên server hoặc nếu là lời mời đích danh cho khách mời, hoặc người dùng đã đóng
  if (!mounted || isInviteMode || dismissed) {
    return null;
  }

  const handleCustomize = () => {
    // Zero-friction: Cho phép vào editor trực tiếp, không yêu cầu đăng nhập.
    // Auth gate sẽ kích hoạt khi bấm Lưu / Xuất bản trong trang new.
    router.push(
      `/dashboard/cards/new?category=${encodeURIComponent(category)}&template=${encodeURIComponent(templateSlug)}`
    );
  };

  return (
    <div
      className="fixed bottom-0 inset-x-0 z-50 pointer-events-none print:hidden"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(24px)",
        transition: "opacity 0.5s cubic-bezier(0.16,1,0.3,1), transform 0.5s cubic-bezier(0.16,1,0.3,1)",
      }}
    >
      {/* ─── GLASSMORPHISM CONTAINER ─── */}
      <div className="pointer-events-auto relative mx-auto w-full max-w-lg mb-4 sm:mb-6 px-4 py-3 sm:px-6 sm:py-4 rounded-2xl bg-white/85 backdrop-blur-xl border border-[#BE944E]/30 shadow-[0_8px_40px_rgba(190,148,78,0.18),0_2px_12px_rgba(0,0,0,0.06)] flex items-center gap-2.5 sm:gap-4">
        {/* Nút đóng thanh action bar */}
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="absolute -top-2.5 -right-2.5 w-6 h-6 rounded-full bg-stone-100 hover:bg-stone-200 border border-stone-300 text-stone-600 flex items-center justify-center shadow-xs text-xs cursor-pointer transition"
          title="Ẩn thanh này"
          aria-label="Đóng thanh điều hướng"
        >
          <X className="w-3.5 h-3.5" />
        </button>

        {/* ── Mô tả ngắn ── */}
        <div className="hidden sm:flex flex-col min-w-0 flex-1">
          <p className="text-[11px] text-stone-500 font-medium leading-tight truncate">
            {templateName || "Mẫu thiệp này"}
          </p>
          <p className="text-[10px] text-stone-400 leading-tight">
            Ưng ý? Bấm để sửa theo phong cách của bạn!
          </p>
        </div>

        {/* ── CTA: Xem Mẫu Khác ── */}
        <Link
          href="/collections"
          className="shrink-0 flex items-center gap-1.5 px-3 py-2.5 sm:px-4 sm:py-2.5 rounded-xl bg-white border border-stone-200 text-stone-700 text-xs font-semibold hover:bg-stone-50 hover:border-stone-300 active:scale-95 transition-all shadow-2xs cursor-pointer"
        >
          <LayoutGrid className="w-3.5 h-3.5 text-stone-500" />
          <span>Mẫu Khác</span>
        </Link>

        {/* ── CTA: Tùy Chỉnh Mẫu Này (PRIMARY) ── */}
        <button
          type="button"
          onClick={handleCustomize}
          className="shrink-0 flex items-center gap-1.5 px-4 py-2.5 sm:px-5 sm:py-2.5 rounded-xl bg-gradient-to-r from-[#BE944E] to-[#D4AF37] hover:from-[#A88240] hover:to-[#BE944E] text-white text-xs sm:text-sm font-bold shadow-[0_4px_16px_rgba(190,148,78,0.35)] hover:shadow-[0_6px_24px_rgba(190,148,78,0.45)] active:scale-95 transition-all cursor-pointer"
        >
          <Sparkles className="w-4 h-4" />
          <span>Tùy Chỉnh Mẫu Này</span>
        </button>
      </div>
    </div>
  );
}
