"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  BookOpen,
  Armchair,
  FileEdit,
  PenLine,
  User,
  Globe,
  ShoppingBag,
  Crown,
  LogOut,
  X,
  Gift,
  ChevronRight,
} from "lucide-react";

interface DashboardSidebarProps {
  isMobileOpen: boolean;
  onClose: () => void;
  onLogout?: () => void;
  currentTab?: string;
}

export function DashboardSidebar({
  isMobileOpen,
  onClose,
  onLogout,
  currentTab,
}: DashboardSidebarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user, logout } = useAuth();

  const activeTabQuery = currentTab || searchParams.get("tab") || "cards";

  const handleLogout = () => {
    if (onLogout) onLogout();
    else logout();
  };

  const isNavActive = (href: string, tabQuery?: string) => {
    if (tabQuery) {
      return pathname.startsWith("/dashboard/cards") && activeTabQuery === tabQuery;
    }
    if (href === "/dashboard/cards") {
      return pathname === "/dashboard/cards" && (!searchParams.get("tab") || activeTabQuery === "cards");
    }
    return pathname === href || pathname.startsWith(href + "/");
  };

  const navItemClass = (active: boolean) =>
    "w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs sm:text-sm transition-all duration-150 cursor-pointer " +
    (active
      ? "bg-[#EFE8DD] text-[#2B2118] font-bold shadow-2xs border border-[#E2D5C3]/70"
      : "text-[#6A5A4D] hover:text-[#2B2118] hover:bg-[#F3EDE2]/80 font-medium");

  const iconClass = (active: boolean) =>
    "w-4 h-4 shrink-0 transition-colors " +
    (active ? "text-[#8C6239]" : "text-[#9E8D7D]");

  return (
    <>
      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-stone-900/40 z-40 lg:hidden backdrop-blur-2xs transition-opacity"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={
          "fixed lg:sticky top-0 h-screen z-50 lg:z-10 w-64 sm:w-68 bg-[#FAF7F2] border-r border-[#EADDCB] flex flex-col justify-between p-4 sm:p-5 transition-transform duration-300 shrink-0 " +
          (isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0")
        }
      >
        <div className="flex flex-col gap-5 overflow-y-auto pr-0.5">
          {/* User profile card */}
          <div className="flex items-center justify-between">
            <Link
              href="/dashboard/cards?tab=account"
              onClick={onClose}
              className="flex-1 bg-white/90 rounded-2xl p-3 border border-[#EADDCB] shadow-2xs hover:shadow-xs hover:border-[#DFCBB6] transition cursor-pointer flex items-center justify-between group mr-1"
            >
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div className="w-9 h-9 rounded-full bg-[#8C6239] text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-2xs">
                  {user?.name ? user.name.charAt(0).toUpperCase() : "T"}
                </div>
                <div className="overflow-hidden">
                  <h4 className="text-xs font-bold text-[#2B2118] truncate group-hover:text-[#8C6239] transition">
                    {user?.name || "Cô dâu & Chú rể"}
                  </h4>
                  <p className="text-[10px] text-[#8E7E70] truncate max-w-[120px]">
                    {user?.email || "Tài khoản cưới"}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-[#A39281] group-hover:translate-x-0.5 transition-transform shrink-0" />
            </Link>

            <button
              type="button"
              onClick={onClose}
              className="lg:hidden p-2 rounded-xl text-[#78695A] hover:bg-[#F3EDE2] transition cursor-pointer"
              aria-label="Đóng menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Section 1: THIỆP CỦA TÔI */}
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#A39281] px-2.5 pb-2 select-none">
              Thiệp của tôi
            </p>
            <nav className="space-y-1">
              <Link
                href="/dashboard/cards?tab=cards"
                onClick={onClose}
                className={navItemClass(isNavActive("/dashboard/cards", "cards"))}
              >
                <div className="flex items-center gap-2.5">
                  <BookOpen className={iconClass(isNavActive("/dashboard/cards", "cards"))} />
                  <span>Thiệp cưới</span>
                </div>
              </Link>

              <Link
                href="/dashboard/cards?tab=rsvp"
                onClick={onClose}
                className={navItemClass(isNavActive("/dashboard/cards", "rsvp"))}
              >
                <div className="flex items-center gap-2.5">
                  <Armchair className={iconClass(isNavActive("/dashboard/cards", "rsvp"))} />
                  <span>Xác nhận tham dự</span>
                </div>
              </Link>

              <Link
                href="/dashboard/cards?tab=wishes"
                onClick={onClose}
                className={navItemClass(isNavActive("/dashboard/cards", "wishes"))}
              >
                <div className="flex items-center gap-2.5">
                  <FileEdit className={iconClass(isNavActive("/dashboard/cards", "wishes"))} />
                  <span>Sổ lưu bút</span>
                </div>
              </Link>

              <Link
                href="/dashboard/cards?tab=perks"
                onClick={onClose}
                className={navItemClass(isNavActive("/dashboard/cards", "perks"))}
              >
                <div className="flex items-center gap-2.5">
                  <Gift className={iconClass(isNavActive("/dashboard/cards", "perks"))} />
                  <span>Quà tặng &amp; Mừng cưới</span>
                </div>
              </Link>

              <Link
                href="/dashboard/signatures"
                onClick={onClose}
                className={navItemClass(isNavActive("/dashboard/signatures"))}
              >
                <div className="flex items-center gap-2.5">
                  <PenLine className={iconClass(isNavActive("/dashboard/signatures"))} />
                  <span>Chữ ký khách mời</span>
                </div>
              </Link>
            </nav>
          </div>

          {/* Section 2: TIỆN ÍCH */}
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#A39281] px-2.5 pb-2 select-none">
              Tiện ích
            </p>
            <nav className="space-y-1">
              <Link
                href="/dashboard/domains"
                onClick={onClose}
                className={navItemClass(isNavActive("/dashboard/domains"))}
              >
                <div className="flex items-center gap-2.5">
                  <Globe className={iconClass(isNavActive("/dashboard/domains"))} />
                  <span>Tên miền</span>
                </div>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-[#EAE0D0] text-[#7A5B35] tracking-wide">
                  VIP
                </span>
              </Link>

              <Link
                href="/dashboard/addons"
                onClick={onClose}
                className={navItemClass(isNavActive("/dashboard/addons"))}
              >
                <div className="flex items-center gap-2.5">
                  <ShoppingBag className={iconClass(isNavActive("/dashboard/addons"))} />
                  <span>Cửa hàng Add-on</span>
                </div>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-[#F5E6DC] text-[#A64B2A] tracking-wide">
                  Mới
                </span>
              </Link>

              <Link
                href="/dashboard/billing"
                onClick={onClose}
                className={navItemClass(isNavActive("/dashboard/billing"))}
              >
                <div className="flex items-center gap-2.5">
                  <Crown className={"w-4 h-4 shrink-0 " + (isNavActive("/dashboard/billing") ? "text-[#8C6239]" : "text-amber-600")} />
                  <span>Nâng cấp gói</span>
                </div>
              </Link>
            </nav>
          </div>

          {/* Section 3: TÀI KHOẢN */}
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#A39281] px-2.5 pb-2 select-none">
              Tài khoản
            </p>
            <nav className="space-y-1">
              <Link
                href="/dashboard/cards?tab=account"
                onClick={onClose}
                className={navItemClass(isNavActive("/dashboard/cards", "account"))}
              >
                <div className="flex items-center gap-2.5">
                  <User className={iconClass(isNavActive("/dashboard/cards", "account"))} />
                  <span>Thông tin tài khoản</span>
                </div>
              </Link>
            </nav>
          </div>
        </div>

        {/* Bottom logout action */}
        <div className="pt-3 border-t border-[#EADDCB]">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#8C7662] hover:text-rose-700 hover:bg-rose-50/70 transition cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>
    </>
  );
}