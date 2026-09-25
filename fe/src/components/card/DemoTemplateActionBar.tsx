"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sparkles, LayoutGrid } from "lucide-react";

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
 * Nếu chưa đăng nhập, vẫn cho phép vào editor trải nghiệm trước (Zero-friction).
 * Auth gate chỉ kích hoạt khi bấm "Xuất bản" trong editor.
 */
export function DemoTemplateActionBar({
  templateSlug,
  templateName,
  category = "WEDDING",
}: DemoTemplateActionBarProps) {
  const router = useRouter();
  const [visible, setVisible] = useState(false);

  // Slide-up animation: hiện sau 1.5s delay để không phân tán khi đang xem thiệp
  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 1500);
    return () => clearTimeout(timer);
  }, []);

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
      <div className="pointer-events-auto mx-auto w-full max-w-lg mb-4 sm:mb-6 px-4 py-3 sm:px-6 sm:py-4 rounded-2xl bg-white/80 backdrop-blur-xl border border-[#BE944E]/30 shadow-[0_8px_40px_rgba(190,148,78,0.18),0_2px_12px_rgba(0,0,0,0.06)] flex items-center gap-3 sm:gap-4">
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
