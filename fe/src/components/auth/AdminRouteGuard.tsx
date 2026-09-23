"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { ShieldAlert, RefreshCw } from "lucide-react";

export default function AdminRouteGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  const isAdmin = user?.role === "ADMIN";

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.replace("/?auth=login&redirect=%2Fdashboard%2Fadmin%2Fpayments");
      } else if (!isAdmin) {
        router.replace("/dashboard/cards");
      }
    }
  }, [isLoading, isAuthenticated, isAdmin, router]);

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-8 text-stone-500">
        <RefreshCw className="w-8 h-8 animate-spin text-amber-600 mb-3" />
        <p className="text-sm font-medium">Đang kiểm tra quyền quản trị viên...</p>
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-8 text-center space-y-4">
        <div className="w-14 h-14 rounded-full bg-rose-100 flex items-center justify-center text-rose-600">
          <ShieldAlert className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold font-serif text-stone-900">Truy Cập Bị Từ Chối</h2>
        <p className="text-xs sm:text-sm text-stone-500 max-w-sm">
          Trang này chỉ dành cho Quản trị viên hệ thống (Admin). Bạn không có quyền truy cập.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
