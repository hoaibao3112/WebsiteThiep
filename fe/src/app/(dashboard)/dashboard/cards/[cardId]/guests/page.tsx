"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Bell,
  Calendar,
  Check,
  ChevronDown,
  Clipboard,
  Clock,
  CreditCard,
  Eye,
  FileText,
  Filter,
  LayoutDashboard,
  Loader2,
  LogOut,
  Menu,
  MessageCircle,
  Plus,
  Search,
  Send,
  Settings,
  Sparkles,
  Trash2,
  Upload,
  Users,
  BarChart3,
  X,
} from "lucide-react";
import { ApiClient } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { parseGuestText } from "@/lib/guests/parse-guest-text";
import {
  buildGuestInvitation,
  copyInvitation,
  DEFAULT_INVITATION,
  openZaloShare,
} from "@/lib/guests/zalo-share";
import {
  formatExactDateTime,
  formatRelativeTime,
} from "@/lib/guests/format-relative-time";

type DeliveryStatus = "NOT_SENT" | "OPENED_ZALO" | "CONFIRMED_SENT" | "FAILED";
type StatusFilter = "all" | "not_sent" | "sent_unopened" | "viewed" | "responded";

interface Guest {
  id: string;
  fullName: string;
  salutation: string;
  group?: string | null;
  phone?: string | null;
  guestToken: string;
  customUrl: string;
  deliveryStatus: DeliveryStatus;
  openedAt?: string | null;
  lastViewedAt?: string | null;
  viewCount?: number;
  rsvpResponses?: Array<{ status: string; guestCount: number }>;
}

interface GuestResult {
  items: Guest[];
  pagination: { total: number };
  metrics: {
    total: number;
    notSent: number;
    sentUnopened: number;
    viewed: number;
    confirmedSent: number;
    responded: number;
    attendingPeople: number;
  };
}

const emptyResult: GuestResult = {
  items: [],
  pagination: { total: 0 },
  metrics: {
    total: 0,
    notSent: 0,
    sentUnopened: 0,
    viewed: 0,
    confirmedSent: 0,
    responded: 0,
    attendingPeople: 0,
  },
};

export default function GuestsPage() {
  const { cardId } = useParams<{ cardId: string }>();
  const router = useRouter();
  const { user, logout } = useAuth();

  const [result, setResult] = useState<GuestResult>(emptyResult);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const [showAdd, setShowAdd] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [fullName, setFullName] = useState("");
  const [salutation, setSalutation] = useState("Bạn");
  const [phone, setPhone] = useState("");
  const [group, setGroup] = useState("");
  const [paste, setPaste] = useState("");
  const [notice, setNotice] = useState("");
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [messageTemplate, setMessageTemplate] = useState(DEFAULT_INVITATION);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    const query = new URLSearchParams({
      search,
      statusFilter,
      pageSize: "50",
    });
    const response = await ApiClient.request<GuestResult>(
      `/cards/${cardId}/guests?${query.toString()}`
    );
    setLoading(false);
    if (response.success && response.data) {
      setResult(response.data);
    } else {
      setError(response.error || "Không thể tải danh sách khách mời");
    }
  }, [cardId, search, statusFilter]);

  useEffect(() => {
    const timer = setTimeout(load, 300);
    return () => clearTimeout(timer);
  }, [load]);

  const parsed = useMemo(() => parseGuestText(paste), [paste]);

  async function createGuest() {
    const response = await ApiClient.request(`/cards/${cardId}/guests`, {
      method: "POST",
      body: JSON.stringify({ fullName, salutation, phone, group }),
    });
    if (!response.success) {
      return setError(response.error || "Không thể thêm khách");
    }
    setShowAdd(false);
    setFullName("");
    setPhone("");
    setGroup("");
    await load();
  }

  async function importGuests() {
    if (!parsed.items.length || parsed.errors.length) return;
    const response = await ApiClient.request(`/cards/${cardId}/guests/import`, {
      method: "POST",
      headers: { "Idempotency-Key": crypto.randomUUID() },
      body: JSON.stringify({ guests: parsed.items, mode: "SKIP_DUPLICATES" }),
    });
    if (!response.success) {
      return setError(response.error || "Không thể nhập danh sách");
    }
    setShowImport(false);
    setPaste("");
    await load();
  }

  function guestUrl(guest: Guest) {
    return new URL(guest.customUrl, window.location.origin).toString();
  }

  /**
   * 1-Click Gửi Zalo:
   * 1. Tạo lời mời cá nhân hóa & copy vào Clipboard.
   * 2. Tự động đánh dấu CONFIRMED_SENT trong hệ thống.
   * 3. Mở khung chat Zalo (mở thẳng SĐT nếu có).
   */
  async function share(guest: Guest) {
    setPendingId(guest.id);
    const url = guestUrl(guest);
    const message = buildGuestInvitation(messageTemplate, {
      salutation: guest.salutation,
      fullName: guest.fullName,
      url,
    });

    try {
      await copyInvitation(message);
      setNotice(
        `Đã sao chép lời mời riêng cho ${guest.salutation} ${guest.fullName}! Hãy dán (Ctrl+V) vào khung chat Zalo vừa mở.`
      );
    } catch {
      setNotice(message);
    }

    // Cập nhật ngay local state để icon/trạng thái đổi ngay lập tức
    setResult((prev) => ({
      ...prev,
      items: prev.items.map((item) =>
        item.id === guest.id ? { ...item, deliveryStatus: "CONFIRMED_SENT" } : item
      ),
      metrics: {
        ...prev.metrics,
        confirmedSent:
          guest.deliveryStatus === "NOT_SENT"
            ? prev.metrics.confirmedSent + 1
            : prev.metrics.confirmedSent,
        notSent:
          guest.deliveryStatus === "NOT_SENT"
            ? Math.max(0, prev.metrics.notSent - 1)
            : prev.metrics.notSent,
        sentUnopened:
          guest.deliveryStatus === "NOT_SENT" && !guest.openedAt
            ? prev.metrics.sentUnopened + 1
            : prev.metrics.sentUnopened,
      },
    }));

    // Gửi request PATCH lên backend
    ApiClient.request(`/cards/${cardId}/guests/${guest.id}/delivery`, {
      method: "PATCH",
      body: JSON.stringify({ status: "CONFIRMED_SENT" }),
    }).catch(console.error);

    // Mở Zalo (nếu có số ĐT sẽ mở thẳng hộp chat)
    openZaloShare(url, guest.phone);
    setPendingId(null);
  }

  async function remove(guest: Guest) {
    if (!window.confirm(`Xóa ${guest.salutation} ${guest.fullName}?`)) return;
    await ApiClient.request(`/cards/${cardId}/guests/${guest.id}`, {
      method: "DELETE",
    });
    await load();
  }

  const avatarInitial = (user?.name || user?.email || "T").charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#2C1E14] flex flex-col font-sans relative selection:bg-[#E8DCCB]">
      {/* ───────────────────────────────────────────────────────────── */}
      {/* 1. TOP HEADER (BRAND, NOTIFICATIONS, USER ACCOUNT)           */}
      {/* ───────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-[#FAF7F2]/95 backdrop-blur-md border-b border-[#EAE2D5] px-4 lg:px-8 py-3.5 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl text-[#5A4A3C] hover:bg-[#EFE7DC] transition"
            aria-label="Toggle navigation"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <Link href="/dashboard/cards" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#A6825E] to-[#735338] flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition">
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current text-[#FAF7F2]">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            </div>
            <div>
              <span className="font-serif font-bold text-lg tracking-tight text-[#2D1F15] block leading-tight">
                Thiệp Việt
              </span>
              <span className="text-[9px] font-semibold tracking-widest text-[#8C7A6B] block uppercase -mt-0.5">
                Kết nối yêu thương
              </span>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-3.5">
          <button
            type="button"
            className="relative p-2 rounded-full text-[#6B5A4B] hover:text-[#2D1F15] hover:bg-[#EFE7DC] transition"
            title="Thông báo"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-[#FAF7F2]" />
          </button>

          <div className="relative">
            <button
              type="button"
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              className="flex items-center gap-2.5 p-1 pr-2 rounded-full hover:bg-[#EFE7DC] transition cursor-pointer"
            >
              <div className="w-8 h-8 rounded-full bg-[#433022] text-white flex items-center justify-center text-sm font-bold shadow-xs">
                {avatarInitial}
              </div>
              <span className="text-sm font-medium text-[#4A382A] hidden sm:inline">
                Tài khoản
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-[#8C7A6B] hidden sm:inline" />
            </button>

            {showUserDropdown && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl border border-[#E5DDD2] shadow-xl py-2 z-50 text-sm animate-in fade-in zoom-in-95 duration-100">
                <div className="px-4 py-2 border-b border-[#F0EAE1]">
                  <p className="font-semibold text-[#2D1F15] truncate">
                    {user?.name || "Khách hàng"}
                  </p>
                  <p className="text-xs text-[#8C7A6B] truncate">{user?.email}</p>
                </div>
                <Link
                  href="/dashboard/cards"
                  onClick={() => setShowUserDropdown(false)}
                  className="flex items-center gap-2 px-4 py-2 text-[#4A382A] hover:bg-[#F9F5EE] transition"
                >
                  <CreditCard className="w-4 h-4 text-[#8C7A6B]" />
                  Thiệp của tôi
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setShowUserDropdown(false);
                    logout();
                    router.push("/");
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-rose-600 hover:bg-rose-50 transition text-left"
                >
                  <LogOut className="w-4 h-4" />
                  Đăng xuất
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 2. BODY LAYOUT (SIDEBAR + MAIN CONTENT)                      */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="flex-1 flex w-full relative">
        {/* SIDEBAR NAVIGATION */}
        <aside
          className={`fixed inset-y-0 left-0 z-30 w-60 bg-[#FAF7F2] border-r border-[#EAE2D5] pt-20 lg:pt-6 px-4 flex flex-col justify-between transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 ${
            mobileMenuOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
          }`}
        >
          <nav className="space-y-1.5">
            <Link
              href="/dashboard/cards"
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-[#6B5A4B] hover:bg-[#EFE7DC] hover:text-[#2D1F15] transition"
            >
              <LayoutDashboard className="w-4 h-4" />
              Tổng quan
            </Link>
            <Link
              href={`/dashboard/cards/${cardId}/guests`}
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold bg-[#EAE0D2] text-[#2D1F15] transition shadow-2xs"
            >
              <Users className="w-4 h-4 text-[#A6825E]" />
              Khách mời cá nhân
            </Link>
            <Link
              href={`/dashboard/cards/${cardId}/rsvp`}
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-[#6B5A4B] hover:bg-[#EFE7DC] hover:text-[#2D1F15] transition"
            >
              <BarChart3 className="w-4 h-4" />
              Báo cáo RSVP
            </Link>
            <Link
              href={`/dashboard/cards/${cardId}/memories`}
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-[#6B5A4B] hover:bg-[#EFE7DC] hover:text-[#2D1F15] transition"
            >
              <Sparkles className="w-4 h-4 text-amber-600" />
              Bức tường ảnh Live
            </Link>
          </nav>
        </aside>

        {/* MAIN VIEWPORT */}
        <main className="flex-1 min-w-0 px-4 sm:px-6 lg:px-10 py-6 sm:py-8 flex flex-col justify-between">
          <div>
            {/* HERO HEADER */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <Link
                  href="/dashboard/cards"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#8C7A6B] hover:text-[#2D1F15] transition"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Danh sách thiệp
                </Link>
                <h1 className="mt-2 text-2xl sm:text-3xl font-serif font-bold text-[#2A1D14] tracking-tight">
                  Khách mời & Tracking Zalo
                </h1>
                <p className="mt-1 text-xs sm:text-sm text-[#76685C]">
                  Gửi 1-click qua Zalo, nhận biết ngay ai đã đọc thiệp và theo dõi số lượng đi tiệc.
                </p>
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
                <Link
                  href={`/dashboard/cards/${cardId}/share`}
                  className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl bg-[#C77834] hover:bg-[#B36922] text-white text-xs sm:text-sm font-semibold shadow-xs hover:shadow-md transition active:scale-95"
                >
                  <Send className="w-4 h-4" />
                  <span>Gửi Hàng Loạt</span>
                </Link>

                <button
                  type="button"
                  onClick={() => setShowImport(true)}
                  className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl bg-white hover:bg-[#F6F1EA] border border-[#E4DCD0] text-[#3A2B1E] text-xs sm:text-sm font-semibold shadow-2xs hover:shadow-xs transition active:scale-95"
                >
                  <Upload className="w-4 h-4" />
                  <span>Nhập nhanh</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowAdd(true)}
                  className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl bg-[#3D2C1E] hover:bg-[#2B1E14] text-white text-xs sm:text-sm font-semibold shadow-xs hover:shadow-md transition active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  <span>Thêm khách</span>
                </button>
              </div>
            </div>

            {/* NOTICES & ERRORS */}
            {notice && (
              <div className="mb-4 rounded-xl bg-[#FAF0E6] border border-[#ECD9C5] px-4 py-2.5 text-xs sm:text-sm text-[#8A562B] flex items-center justify-between">
                <span>{notice}</span>
                <button
                  type="button"
                  onClick={() => setNotice("")}
                  className="text-xs font-bold ml-2 underline cursor-pointer"
                >
                  Đóng
                </button>
              </div>
            )}
            {error && (
              <div className="mb-4 rounded-xl bg-rose-50 border border-rose-200 px-4 py-2.5 text-xs sm:text-sm text-rose-700">
                {error}
              </div>
            )}

            {/* 5 STAT METRICS CARDS */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-3.5 mb-6">
              {/* Metric 1: Tổng khách */}
              <div className="bg-white rounded-2xl p-3.5 sm:p-4 border border-[#EDE5DA] shadow-xs relative overflow-hidden flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#FFF1E0] flex items-center justify-center shrink-0 text-[#C77834]">
                  <Users className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-medium text-[#7A6D60]">Tổng khách</p>
                  <p className="text-xl sm:text-2xl font-bold font-serif text-[#1E140D] tabular-nums">
                    {result.metrics.total}
                  </p>
                </div>
              </div>

              {/* Metric 2: Chưa gửi */}
              <div className="bg-white rounded-2xl p-3.5 sm:p-4 border border-[#EDE5DA] shadow-xs relative overflow-hidden flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center shrink-0 text-stone-500">
                  <Clock className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-medium text-[#7A6D60]">Chưa gửi</p>
                  <p className="text-xl sm:text-2xl font-bold font-serif text-stone-700 tabular-nums">
                    {result.metrics.notSent ?? 0}
                  </p>
                </div>
              </div>

              {/* Metric 3: Đã gửi */}
              <div className="bg-white rounded-2xl p-3.5 sm:p-4 border border-[#EDE5DA] shadow-xs relative overflow-hidden flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center shrink-0 text-amber-600">
                  <Send className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-medium text-[#7A6D60]">Đã gửi</p>
                  <p className="text-xl sm:text-2xl font-bold font-serif text-amber-800 tabular-nums">
                    {result.metrics.confirmedSent}
                  </p>
                </div>
              </div>

              {/* Metric 4: Đã xem thiệp (VIP Tracking) */}
              <div className="bg-white rounded-2xl p-3.5 sm:p-4 border border-emerald-200/80 bg-gradient-to-br from-white via-white to-emerald-50/40 shadow-xs relative overflow-hidden flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 text-emerald-700 shadow-2xs">
                  <Eye className="w-4 h-4 animate-pulse" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-medium text-emerald-800 flex items-center gap-1">
                    Đã xem thiệp
                  </p>
                  <p className="text-xl sm:text-2xl font-bold font-serif text-emerald-900 tabular-nums">
                    {result.metrics.viewed ?? 0}
                  </p>
                </div>
              </div>

              {/* Metric 5: Đã RSVP */}
              <div className="col-span-2 sm:col-span-1 bg-white rounded-2xl p-3.5 sm:p-4 border border-[#EDE5DA] shadow-xs relative overflow-hidden flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#E8F2FA] flex items-center justify-center shrink-0 text-[#3A7DB5]">
                  <MessageCircle className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-medium text-[#7A6D60]">Đã phản hồi</p>
                  <p className="text-xl sm:text-2xl font-bold font-serif text-[#1E140D] tabular-nums">
                    {result.metrics.responded}
                    <span className="text-xs font-normal text-[#8A7A6B] ml-1">
                      ({result.metrics.attendingPeople} đi)
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* SEARCH & MESSAGE TEMPLATE ROW */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-3 mb-4">
              <div className="relative">
                <Search className="absolute left-3.5 top-3 w-4 h-4 text-[#A69788]" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Tìm tên hoặc số điện thoại..."
                  className="h-10 w-full rounded-xl bg-white border border-[#E5DDD2] pl-10 pr-3 text-xs sm:text-sm text-[#2C1E14] placeholder-[#A09386] outline-none focus:border-[#C77834] focus:ring-2 focus:ring-[#C77834]/20 transition shadow-2xs"
                />
              </div>

              <div className="relative flex items-center">
                <FileText className="absolute left-3.5 w-4 h-4 text-[#A69788] pointer-events-none" />
                <input
                  type="text"
                  value={messageTemplate}
                  onChange={(e) => setMessageTemplate(e.target.value)}
                  aria-label="Mẫu lời mời Zalo"
                  title="Tùy chỉnh mẫu tin nhắn gửi kèm thiệp mời"
                  className="h-10 w-full rounded-xl bg-white border border-[#E5DDD2] pl-10 pr-3 text-xs sm:text-sm text-[#524438] outline-none focus:border-[#C77834] focus:ring-2 focus:ring-[#C77834]/20 transition shadow-2xs truncate"
                />
              </div>
            </div>

            {/* ───────────────────────────────────────────────────────── */}
            {/* FILTER TABS (TẤT CẢ / CHƯA GỬI / ĐÃ GỬI / ĐÃ XEM / RSVP) */}
            {/* ───────────────────────────────────────────────────────── */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-4 scrollbar-none">
              <button
                type="button"
                onClick={() => setStatusFilter("all")}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                  statusFilter === "all"
                    ? "bg-[#3D2C1E] text-white shadow-2xs"
                    : "bg-white hover:bg-[#F2ECE2] text-[#6B5A4B] border border-[#E5DDD2]"
                }`}
              >
                <span>Tất cả</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/15 text-inherit">
                  {result.metrics.total}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setStatusFilter("not_sent")}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                  statusFilter === "not_sent"
                    ? "bg-stone-700 text-white shadow-2xs"
                    : "bg-white hover:bg-stone-50 text-stone-600 border border-[#E5DDD2]"
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-stone-400" />
                <span>Chưa gửi</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-stone-100 text-stone-700 font-bold">
                  {result.metrics.notSent ?? 0}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setStatusFilter("sent_unopened")}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                  statusFilter === "sent_unopened"
                    ? "bg-amber-600 text-white shadow-2xs"
                    : "bg-white hover:bg-amber-50 text-amber-700 border border-[#E5DDD2]"
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span>Đã gửi (chưa mở)</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-100 text-amber-800 font-bold">
                  {result.metrics.sentUnopened ?? 0}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setStatusFilter("viewed")}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                  statusFilter === "viewed"
                    ? "bg-emerald-700 text-white shadow-2xs"
                    : "bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-200"
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <Eye className="w-3.5 h-3.5 text-emerald-600" />
                <span>Đã xem thiệp</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-100 text-emerald-800 font-bold">
                  {result.metrics.viewed ?? 0}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setStatusFilter("responded")}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                  statusFilter === "responded"
                    ? "bg-[#2563EB] text-white shadow-2xs"
                    : "bg-white hover:bg-blue-50 text-blue-700 border border-[#E5DDD2]"
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                <span>Đã RSVP</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-blue-100 text-blue-800 font-bold">
                  {result.metrics.responded}
                </span>
              </button>
            </div>

            {/* ───────────────────────────────────────────────────────── */}
            {/* MAIN CONTENT AREA: EMPTY STATE OR GUEST TABLE             */}
            {/* ───────────────────────────────────────────────────────── */}
            {loading ? (
              <div className="flex h-64 items-center justify-center">
                <Loader2 className="w-7 h-7 animate-spin text-[#A6825E]" />
              </div>
            ) : !result.items.length ? (
              <div className="rounded-2xl sm:rounded-3xl border border-dashed border-[#DFD5C8] bg-white/40 backdrop-blur-2xs py-14 sm:py-20 px-4 text-center my-2 shadow-2xs">
                <div className="relative inline-flex items-center justify-center mb-3">
                  <span className="text-[#C8B6A2] text-xl absolute -left-8 -top-2 select-none">
                    ✦
                  </span>
                  <span className="text-[#D4C4B2] text-sm absolute -right-6 -top-3 select-none">
                    ✦
                  </span>
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#A58C77] text-white flex items-center justify-center shadow-md relative">
                    <Users className="w-8 h-8 sm:w-10 sm:h-10 text-[#FAF7F2]" />
                    <div className="absolute -bottom-0.5 -right-0.5 w-6 h-6 rounded-full bg-[#C77834] text-white flex items-center justify-center text-xs font-bold border-2 border-white shadow-xs">
                      +
                    </div>
                  </div>
                </div>

                <h2 className="mt-2 text-xl sm:text-2xl font-serif font-bold text-[#2A1D12]">
                  {statusFilter === "all"
                    ? "Chưa có khách mời"
                    : "Không tìm thấy khách nào phù hợp"}
                </h2>
                <p className="mt-1.5 text-xs sm:text-sm text-[#7D6F64]">
                  {statusFilter === "all"
                    ? "Thêm một khách hoặc dán danh sách để bắt đầu gửi thiệp."
                    : "Thử chọn tab 'Tất cả' hoặc nhập từ khóa tìm kiếm khác."}
                </p>
                <div className="w-12 h-0.5 bg-[#D5C6B3] rounded-full mx-auto mt-4" />
              </div>
            ) : (
              /* GUEST TABLE WITH DETAILED TRACKING */
              <div className="overflow-hidden rounded-2xl border border-[#EDE5DA] bg-white shadow-xs">
                <div className="hidden md:grid grid-cols-[1.5fr_1fr_1.4fr_1fr_auto] gap-4 border-b border-[#EDE5DA] bg-[#F7F2EA] px-5 py-3 text-xs font-semibold uppercase tracking-wider text-[#73675C]">
                  <span>Khách mời</span>
                  <span>Điện thoại</span>
                  <span>Trạng thái & Xem thiệp</span>
                  <span>Phản hồi RSVP</span>
                  <span>Hành động</span>
                </div>
                <div className="divide-y divide-[#F2EBE1]">
                  {result.items.map((guest) => {
                    const hasViewed = Boolean(guest.openedAt);
                    const viewTimeStr = formatRelativeTime(
                      guest.lastViewedAt || guest.openedAt
                    );
                    const exactViewTimeStr = formatExactDateTime(
                      guest.lastViewedAt || guest.openedAt
                    );

                    return (
                      <article
                        key={guest.id}
                        className="grid gap-3 p-4 sm:p-5 md:grid-cols-[1.5fr_1fr_1.4fr_1fr_auto] md:items-center hover:bg-[#FAF7F2]/60 transition"
                      >
                        {/* 1. Thông tin khách */}
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-[#2D1F15]">
                            {guest.salutation} {guest.fullName}
                          </p>
                          <p className="text-xs text-[#8C7A6B]">
                            {guest.group || "Chưa phân nhóm"}
                          </p>
                        </div>

                        {/* 2. Số điện thoại */}
                        <p className="text-xs sm:text-sm text-[#5A4D42]">
                          {guest.phone || "—"}
                        </p>

                        {/* 3. Trạng thái & Tracking đã xem */}
                        <div className="text-xs sm:text-sm flex flex-col items-start gap-1">
                          {hasViewed ? (
                            <div
                              className="group relative cursor-pointer"
                              title={exactViewTimeStr ? `Xem lần cuối: ${exactViewTimeStr}` : ""}
                            >
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200/80 font-medium text-xs shadow-2xs">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                <Eye className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Đã xem thiệp</span>
                                {guest.viewCount && guest.viewCount > 1 && (
                                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/80 px-1 py-0.2 rounded">
                                    {guest.viewCount} lần
                                  </span>
                                )}
                              </span>
                              {viewTimeStr && (
                                <p className="text-[11px] text-emerald-700/90 font-medium mt-0.5 ml-1">
                                  {viewTimeStr}
                                </p>
                              )}
                            </div>
                          ) : guest.deliveryStatus === "CONFIRMED_SENT" ||
                            guest.deliveryStatus === "OPENED_ZALO" ? (
                            <div>
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 font-medium text-xs">
                                <span className="w-2 h-2 rounded-full bg-amber-400" />
                                <span>Đã gửi • Chưa mở</span>
                              </span>
                              <p className="text-[10px] text-amber-700/80 mt-0.5 ml-1">
                                Đang đợi khách xem
                              </p>
                            </div>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-stone-100 text-stone-500 font-medium text-xs">
                              <span className="w-1.5 h-1.5 rounded-full bg-stone-300" />
                              <span>Chưa gửi thiệp</span>
                            </span>
                          )}
                        </div>

                        {/* 4. RSVP */}
                        <div className="text-xs sm:text-sm text-[#5A4D42]">
                          {guest.rsvpResponses?.[0]?.status === "ATTENDING" ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-medium border border-blue-100">
                              <Check className="w-3.5 h-3.5 text-blue-600" />
                              Tham dự ({guest.rsvpResponses[0].guestCount} người)
                            </span>
                          ) : guest.rsvpResponses?.[0]?.status === "DECLINED" ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 font-medium border border-rose-100">
                              Bận không tới
                            </span>
                          ) : (
                            <span className="text-stone-400 italic text-xs">Chưa phản hồi</span>
                          )}
                        </div>

                        {/* 5. Nút Hành động */}
                        <div className="flex flex-wrap items-center gap-1.5">
                          {/* Nút 1-Click Gửi Zalo */}
                          <button
                            type="button"
                            onClick={() => share(guest)}
                            disabled={pendingId === guest.id}
                            title={
                              guest.phone
                                ? `Gửi Zalo trực tiếp tới ${guest.fullName} (${guest.phone})`
                                : `Sao chép lời mời và mở Zalo gửi cho ${guest.fullName}`
                            }
                            className="inline-flex items-center gap-1.5 rounded-xl bg-[#0068FF] hover:bg-[#0055D4] px-3.5 py-1.5 text-xs font-semibold text-white shadow-2xs hover:shadow-xs active:scale-95 disabled:opacity-50 transition cursor-pointer"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>Gửi Zalo</span>
                          </button>

                          {/* Nút Sao chép link */}
                          <button
                            type="button"
                            onClick={async () => {
                              await copyInvitation(guestUrl(guest));
                              setNotice(
                                `Đã sao chép link xem thiệp riêng của ${guest.salutation} ${guest.fullName}`
                              );
                            }}
                            title={`Sao chép link xem riêng của ${guest.fullName}`}
                            className="rounded-xl border border-[#E0D6C8] hover:bg-[#F2ECE2] p-1.5 text-[#5A4D42] transition cursor-pointer"
                          >
                            <Clipboard className="w-3.5 h-3.5" />
                          </button>

                          {/* Nút Xóa */}
                          <button
                            type="button"
                            onClick={() => remove(guest)}
                            title={`Xóa ${guest.fullName}`}
                            className="rounded-xl border border-rose-100 hover:bg-rose-50 p-1.5 text-rose-600 transition cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* ───────────────────────────────────────────────────────── */}
          {/* 3. BOTANICAL ILLUSTRATION & CALLIGRAPHY FOOTER ELEMENTS    */}
          {/* ───────────────────────────────────────────────────────── */}
          <div className="mt-12 pt-6 flex items-end justify-between pointer-events-none select-none relative">
            <div className="flex items-end gap-2 opacity-85">
              <svg
                className="w-16 sm:w-24 h-20 sm:h-28 text-[#C4B19A] opacity-75 shrink-0"
                viewBox="0 0 100 120"
                fill="none"
              >
                <path
                  d="M10 115 C25 95 45 70 55 20"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
                <path
                  d="M35 85 C20 78 15 65 24 56 C34 65 37 77 35 85 Z"
                  fill="currentColor"
                  fillOpacity="0.4"
                />
                <path
                  d="M48 60 C62 50 68 38 59 29 C50 38 50 51 48 60 Z"
                  fill="currentColor"
                  fillOpacity="0.4"
                />
                <path
                  d="M26 102 C14 94 10 82 18 73 C26 81 28 93 26 102 Z"
                  fill="currentColor"
                  fillOpacity="0.4"
                />
                <path
                  d="M52 35 C63 26 65 14 55 9 C46 17 50 28 52 35 Z"
                  fill="currentColor"
                  fillOpacity="0.4"
                />
              </svg>

              <div className="font-serif italic text-xs sm:text-sm text-[#968372] leading-tight pb-2">
                Những khoảnh khắc
                <br />
                đẹp hơn cùng nhau
                <span className="inline-block ml-1 text-xs">♡</span>
              </div>
            </div>

            <div className="text-right opacity-85 pb-2">
              <p className="font-serif italic text-xs sm:text-sm text-[#968372] leading-tight">
                Lan tỏa niềm vui
                <br />
                qua từng tấm thiệp
                <span className="inline-block ml-1 text-xs">♡</span>
              </p>
            </div>
          </div>
        </main>
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 4. MODALS (THÊM KHÁCH & NHẬP NHANH DANH SÁCH)                */}
      {/* ───────────────────────────────────────────────────────────── */}
      {(showAdd || showImport) && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <section
            role="dialog"
            aria-modal="true"
            className="w-full max-w-lg rounded-3xl bg-[#FAF7F2] border border-[#E5DDD2] p-6 shadow-2xl relative"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#EDE5DA]">
              <h2 className="text-lg sm:text-xl font-serif font-bold text-[#2D1F15]">
                {showImport ? "Nhập nhanh danh sách khách" : "Thêm khách mời mới"}
              </h2>
              <button
                type="button"
                onClick={() => {
                  setShowAdd(false);
                  setShowImport(false);
                }}
                className="p-1 rounded-full text-[#8C7A6B] hover:text-[#2D1F15] hover:bg-[#EFE7DC] transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {showImport ? (
              <div className="mt-4">
                <p className="text-xs sm:text-sm text-[#7D6F64] mb-2">
                  Dán danh sách, mỗi dòng 1 khách:{" "}
                  <span className="font-medium text-[#2D1F15]">
                    Danh xưng, Họ tên, Nhóm, Số điện thoại
                  </span>{" "}
                  (hoặc chỉ cần tên).
                </p>
                <textarea
                  value={paste}
                  onChange={(e) => setPaste(e.target.value)}
                  rows={8}
                  placeholder={`Ví dụ:\nBạn, Nguyễn Văn A, Bạn Cấp 3, 0901234567\nAnh, Trần Văn B, Đồng Nghiệp\nChị, Lê Thị C`}
                  className="w-full rounded-2xl bg-white border border-[#E0D6C8] p-3.5 text-xs sm:text-sm text-[#2D1F15] outline-none focus:border-[#C77834] focus:ring-2 focus:ring-[#C77834]/20 transition shadow-2xs font-mono"
                />
                <p className="mt-2 text-xs text-[#7A6D60]">
                  Hợp lệ: <span className="font-bold text-emerald-700">{parsed.items.length}</span>{" "}
                  khách · Lỗi:{" "}
                  <span className="font-bold text-rose-600">{parsed.errors.length}</span>
                </p>
              </div>
            ) : (
              <div className="mt-4 grid gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#6B5A4B] mb-1">
                    Danh xưng
                  </label>
                  <input
                    value={salutation}
                    onChange={(e) => setSalutation(e.target.value)}
                    placeholder="VD: Bạn, Anh, Chị, Cô, Chú"
                    className="h-10 w-full rounded-xl bg-white border border-[#E0D6C8] px-3.5 text-sm text-[#2D1F15] outline-none focus:border-[#C77834] focus:ring-2 focus:ring-[#C77834]/20 transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#6B5A4B] mb-1">
                    Họ và tên <span className="text-rose-500">*</span>
                  </label>
                  <input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="VD: Nguyễn Văn Nam"
                    className="h-10 w-full rounded-xl bg-white border border-[#E0D6C8] px-3.5 text-sm text-[#2D1F15] outline-none focus:border-[#C77834] focus:ring-2 focus:ring-[#C77834]/20 transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#6B5A4B] mb-1">
                    Nhóm (tùy chọn)
                  </label>
                  <input
                    value={group}
                    onChange={(e) => setGroup(e.target.value)}
                    placeholder="VD: Bạn cấp 3, Bạn Đại Học, Đồng nghiệp"
                    className="h-10 w-full rounded-xl bg-white border border-[#E0D6C8] px-3.5 text-sm text-[#2D1F15] outline-none focus:border-[#C77834] focus:ring-2 focus:ring-[#C77834]/20 transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#6B5A4B] mb-1">
                    Số điện thoại (tùy chọn)
                  </label>
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="VD: 0912345678"
                    className="h-10 w-full rounded-xl bg-white border border-[#E0D6C8] px-3.5 text-sm text-[#2D1F15] outline-none focus:border-[#C77834] focus:ring-2 focus:ring-[#C77834]/20 transition"
                  />
                </div>
              </div>
            )}

            <div className="mt-6 flex items-center justify-end gap-2.5 pt-3 border-t border-[#EDE5DA]">
              <button
                type="button"
                onClick={() => {
                  setShowAdd(false);
                  setShowImport(false);
                }}
                className="px-4 py-2 rounded-xl bg-white border border-[#E0D6C8] text-xs sm:text-sm font-semibold text-[#5A4D42] hover:bg-[#F2ECE2] transition"
              >
                Hủy
              </button>
              <button
                type="button"
                disabled={
                  showImport
                    ? parsed.items.length === 0 || parsed.errors.length > 0
                    : fullName.trim().length < 2
                }
                onClick={showImport ? importGuests : createGuest}
                className="px-5 py-2 rounded-xl bg-[#3D2C1E] hover:bg-[#2B1E14] text-xs sm:text-sm font-semibold text-white shadow-xs disabled:opacity-40 transition"
              >
                {showImport ? "Nhập danh sách" : "Thêm khách"}
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
