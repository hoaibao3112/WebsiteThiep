"use client";

import React, { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

/**
 * AuthGuard — bảo vệ toàn bộ /dashboard/*
 *
 * Nếu chưa đăng nhập:
 *   - Redirect về trang chủ
 *   - Truyền ?auth=login&redirect=<path> để trang chủ tự mở modal đăng nhập
 *
 * Ngoại lệ: /dashboard/cards/new được phép truy cập tự do (Zero-friction).
 * Người dùng có thể trải nghiệm chỉnh sửa thiệp mẫu trước, auth gate chỉ
 * kích hoạt khi bấm "Lưu thiệp" hoặc "Xuất bản" bên trong trang tạo thiệp.
 *
 * Nếu đang load (chưa biết auth state) → hiển thị spinner
 */

/** Các route dashboard được phép truy cập mà không cần đăng nhập */
const PUBLIC_DASHBOARD_ROUTES = ["/dashboard/cards/new"];

export default function DashboardAuthGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Kiểm tra route hiện tại có được miễn trừ auth hay không
  const isExemptRoute = PUBLIC_DASHBOARD_ROUTES.some(
    (route) => pathname === route || pathname?.startsWith(`${route}?`)
  );

  useEffect(() => {
    if (!isLoading && !isAuthenticated && !isExemptRoute) {
      // Chuyển về trang chủ và kèm đường dẫn đích đầy đủ
      const currentQuery = typeof window !== "undefined" ? window.location.search : "";
      const redirectPath = `${pathname || "/dashboard/cards"}${currentQuery}`;
      router.replace(`/?auth=login&redirect=${encodeURIComponent(redirectPath)}`);
    }
  }, [isAuthenticated, isLoading, router, pathname, isExemptRoute]);

  // Route miễn trừ → cho render ngay (không cần chờ auth)
  if (isExemptRoute) {
    return <>{children}</>;
  }

  // Đang kiểm tra auth → loading screen đẹp
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-50 to-amber-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          {/* Logo spinner */}
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-rose-400 flex items-center justify-center shadow-lg animate-pulse">
            <span className="text-2xl">💌</span>
          </div>
          <div className="flex items-center gap-1.5">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full bg-amber-400 animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
          <p className="text-stone-500 text-sm font-medium">Đang xác thực tài khoản...</p>
        </div>
      </div>
    );
  }

  // Chưa đăng nhập → không render gì (đang redirect về login)
  if (!isAuthenticated) {
    return null;
  }

  // Render dashboard
  return <>{children}</>;
}

