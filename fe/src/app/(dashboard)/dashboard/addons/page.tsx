"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ApiClient } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import {
  ShoppingCart,
  Clock,
  Layers,
  Image as ImageIcon,
  Eye,
  Globe,
  Heart,
  Sparkles,
  Check,
  Copy,
  Loader2,
  AlertCircle,
  Crown,
  X,
  Search,
  CheckCircle2,
  Bell,
  Moon,
  Zap,
  HelpCircle,
  Lightbulb,
  FileEdit,
  Send,
  Gift,
  PenLine,
  LayoutDashboard,
  PlusCircle,
  User,
  Menu,
} from "lucide-react";
import confetti from "canvas-confetti";

interface AddonCatalogItem {
  code: string;
  name: string;
  category: "time" | "photo" | "card" | "view" | "custom_domain" | "system_domain" | "profile";
  price: number;
  description: string;
  badge: string;
  icon: "clock" | "card" | "image" | "eye" | "globe" | "domain" | "heart";
  isFeatured?: boolean;
  quotaType: string;
  quotaValue: number;
  isEligible: boolean;
  ineligibilityReason?: string;
}

interface AccountQuotaInfo {
  currentPlanCode: string;
  currentPlanName: string;
  planExpiresAt: string | null;
  extraCards: number;
  extraPhotos: number;
  extraViews: number;
  extraDomains: number;
  extraProfiles: number;
}

interface AddonCatalogResponse {
  items: AddonCatalogItem[];
  accountQuota: AccountQuotaInfo;
}

interface ActiveOrderPayment {
  id: string;
  orderCode: string;
  addonCode: string;
  addonName: string;
  amount: number;
  status: "PENDING" | "AWAITING_REVIEW" | "PAID" | "REJECTED" | "EXPIRED";
  paymentInfo: {
    orderCode: string;
    amount: number;
    bankCode: string;
    bankAccount: string;
    bankAccountName: string;
    qrUrl: string;
    expiredAt: string;
  };
}

const CATEGORIES = [
  { key: "all", label: "Tất cả" },
  { key: "time", label: "Gia hạn thời gian" },
  { key: "photo", label: "Tăng kho ảnh" },
  { key: "card", label: "Thêm thiệp" },
  { key: "view", label: "Tăng lượt xem" },
  { key: "custom_domain", label: "Tên miền" },
  { key: "system_domain", label: "Tên miền hệ thống" },
  { key: "profile", label: "Hồ sơ cưới" },
] as const;

export default function AddonsStorePage() {
  const router = useRouter();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addons, setAddons] = useState<AddonCatalogItem[]>([]);
  const [accountQuota, setAccountQuota] = useState<AccountQuotaInfo | null>(null);

  // Mobile menu
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Filter & Search
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Payment Modal State
  const [selectedAddon, setSelectedAddon] = useState<AddonCatalogItem | null>(null);
  const [creatingOrder, setCreatingOrder] = useState(false);
  const [activeOrder, setActiveOrder] = useState<ActiveOrderPayment | null>(null);
  const [submittingTransfer, setSubmittingTransfer] = useState(false);
  const [transferSubmitted, setTransferSubmitted] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Load Catalog
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await ApiClient.getAddonsCatalog<AddonCatalogResponse>();
      if (res.success && res.data) {
        setAddons(res.data.items);
        setAccountQuota(res.data.accountQuota);
      } else {
        setError(res.error || "Không thể tải danh mục tiện ích.");
      }
    } catch {
      setError("Lỗi kết nối máy chủ khi tải cửa hàng tiện ích.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Polling order status
  useEffect(() => {
    if (!activeOrder) return;
    if (activeOrder.status === "PAID" || activeOrder.status === "EXPIRED") return;

    const interval = setInterval(async () => {
      try {
        const res = await ApiClient.getOrderDetail<any>(activeOrder.id);
        if (res.success && res.data) {
          const updated = res.data;
          if (updated.status === "PAID") {
            setActiveOrder((prev) => (prev ? { ...prev, status: "PAID" } : null));
            confetti({
              particleCount: 80,
              spread: 70,
              origin: { y: 0.6 },
              colors: ["#BE944E", "#D4AF37", "#10B981", "#E11D48"],
            });
            loadData();
          } else if (updated.status === "AWAITING_REVIEW") {
            setTransferSubmitted(true);
          }
        }
      } catch {
        // Polling retry
      }
    }, 3500);

    return () => clearInterval(interval);
  }, [activeOrder, loadData]);

  // Mua ngay click
  const handleBuyClick = async (item: AddonCatalogItem) => {
    if (!item.isEligible) {
      router.push("/dashboard/billing?plan=BASIC");
      return;
    }

    try {
      setSelectedAddon(item);
      setCreatingOrder(true);
      setTransferSubmitted(false);
      const res = await ApiClient.createAddonOrder<ActiveOrderPayment>(item.code);
      if (res.success && res.data) {
        setActiveOrder(res.data);
        if (res.data.status === "AWAITING_REVIEW") {
          setTransferSubmitted(true);
        }
      } else {
        alert(res.error || "Không thể khởi tạo đơn hàng. Vui lòng thử lại.");
        setSelectedAddon(null);
      }
    } catch {
      alert("Đã xảy ra lỗi khi tạo đơn hàng tiện ích.");
      setSelectedAddon(null);
    } finally {
      setCreatingOrder(false);
    }
  };

  // Xác nhận đã chuyển khoản
  const handleSubmitTransfer = async () => {
    if (!activeOrder) return;
    try {
      setSubmittingTransfer(true);
      const res = await ApiClient.submitOrderTransfer(activeOrder.id);
      if (res.success) {
        setTransferSubmitted(true);
      } else {
        alert(res.error || "Không thể gửi xác nhận chuyển khoản.");
      }
    } catch {
      alert("Lỗi kết nối khi gửi xác nhận chuyển khoản.");
    } finally {
      setSubmittingTransfer(false);
    }
  };

  // Copy helper
  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Counts per category
  const counts = useMemo(() => {
    const map: Record<string, number> = { all: addons.length };
    addons.forEach((item) => {
      map[item.category] = (map[item.category] || 0) + 1;
    });
    return map;
  }, [addons]);

  // Filtered addons
  const filteredAddons = useMemo(() => {
    return addons.filter((item) => {
      const matchCat = activeCategory === "all" || item.category === activeCategory;
      const matchSearch =
        !searchQuery ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.badge.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [addons, activeCategory, searchQuery]);

  // Featured items (Đề xuất cho bạn)
  const featuredItems = useMemo(() => {
    return addons.filter((item) => item.isFeatured);
  }, [addons]);

  // Render SVG Icon matching zenlove screenshot
  const renderItemIcon = (icon: AddonCatalogItem["icon"]) => {
    switch (icon) {
      case "clock":
        return (
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-400 to-amber-300 p-0.5 shadow-2xs shrink-0 flex items-center justify-center">
            <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center text-amber-500">
              <Clock className="w-6 h-6 text-sky-500" />
            </div>
          </div>
        );
      case "card":
        return (
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-400 via-pink-500 to-indigo-500 p-0.5 shadow-2xs shrink-0 flex items-center justify-center">
            <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center text-rose-500">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-rose-500 to-purple-500 opacity-90" />
            </div>
          </div>
        );
      case "image":
        return (
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-400 to-indigo-600 p-0.5 shadow-2xs shrink-0 flex items-center justify-center">
            <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center text-blue-500">
              <ImageIcon className="w-6 h-6 text-blue-500" />
            </div>
          </div>
        );
      case "eye":
        return (
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-400 to-blue-500 p-0.5 shadow-2xs shrink-0 flex items-center justify-center">
            <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center text-cyan-600">
              <Eye className="w-6 h-6" />
            </div>
          </div>
        );
      case "globe":
        return (
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-400 to-violet-600 p-0.5 shadow-2xs shrink-0 flex items-center justify-center">
            <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center text-purple-600">
              <Globe className="w-6 h-6" />
            </div>
          </div>
        );
      case "domain":
        return (
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-500 p-0.5 shadow-2xs shrink-0 flex items-center justify-center">
            <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center text-amber-600 font-bold text-sm">
              .VN
            </div>
          </div>
        );
      case "heart":
        return (
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-violet-400 to-purple-500 p-0.5 shadow-2xs shrink-0 flex items-center justify-center">
            <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center text-purple-500">
              <Heart className="w-6 h-6 fill-purple-400" />
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-stone-900 flex flex-col font-sans">
      {/* ── TOP MOBILE BAR ── */}
      <div className="lg:hidden h-14 bg-white border-b border-stone-200 px-4 flex items-center justify-between sticky top-0 z-40">
        <button
          type="button"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-xl text-stone-600 hover:bg-stone-100 transition cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>
        <span className="font-bold text-sm text-stone-900">Zen Store</span>
        <Link
          href="/dashboard/billing"
          className="px-3 py-1.5 rounded-full bg-gradient-to-r from-[#E82561] to-[#F43F5E] text-white font-bold text-xs shadow-xs"
        >
          Nâng cấp
        </Link>
      </div>

      {/* ── UNIFIED 2-COLUMN DASHBOARD LAYOUT (MATCHING SCREENSHOT 1) ── */}
      <div className="flex-1 flex w-full relative">
        {/* ======================================================== */}
        {/* LEFT SIDEBAR (STICKY ON DESKTOP, DRAWER ON MOBILE)       */}
        {/* ======================================================== */}
        <aside
          className={`
            fixed lg:sticky top-0 h-screen z-50 lg:z-30
            w-64 bg-white border-r border-stone-200/90
            flex flex-col justify-between p-4 transition-transform duration-300
            ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          `}
        >
          <div className="space-y-6 overflow-y-auto no-scrollbar">
            {/* BRAND LOGO */}
            <div className="px-3 py-2 flex items-center justify-between">
              <Link href="/dashboard/cards" className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#E82561] to-[#F43F5E] text-white flex items-center justify-center shadow-xs">
                  <Heart className="w-4 h-4 fill-white" />
                </div>
                <span className="font-bold text-lg text-stone-900 tracking-tight">
                  zenlove
                </span>
              </Link>
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(false)}
                className="lg:hidden p-1 text-stone-400 hover:text-stone-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* NAV GROUP 1: CHÍNH */}
            <nav className="space-y-1 text-xs sm:text-sm">
              <Link
                href="/dashboard/cards"
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-stone-600 hover:text-stone-900 hover:bg-stone-50 font-medium transition"
              >
                <LayoutDashboard className="w-4 h-4 text-stone-400" />
                <span>Tổng quan</span>
              </Link>
              <Link
                href="/dashboard/cards"
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-stone-600 hover:text-stone-900 hover:bg-stone-50 font-medium transition"
              >
                <Layers className="w-4 h-4 text-stone-400" />
                <span>Thiệp của tôi</span>
              </Link>
              <Link
                href="/dashboard/cards/new"
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-stone-600 hover:text-stone-900 hover:bg-stone-50 font-medium transition"
              >
                <PlusCircle className="w-4 h-4 text-stone-400" />
                <span>Tạo thiết kế</span>
              </Link>
            </nav>

            {/* NAV GROUP 2: LỜI CHÚC & QUÀ TẶNG */}
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-stone-400 px-3 pb-2 select-none">
                Lời chúc &amp; Quà tặng
              </p>
              <nav className="space-y-1 text-xs sm:text-sm">
                <Link
                  href="/dashboard/cards?tab=wishes"
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-stone-600 hover:text-stone-900 hover:bg-stone-50 font-medium transition"
                >
                  <Heart className="w-4 h-4 text-stone-400" />
                  <span>Lời chúc</span>
                </Link>
                <Link
                  href="/dashboard/cards?tab=rsvp"
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-stone-600 hover:text-stone-900 hover:bg-stone-50 font-medium transition"
                >
                  <Send className="w-4 h-4 text-stone-400" />
                  <span>Xác nhận tham dự</span>
                </Link>
                <Link
                  href="/dashboard/cards?tab=banking"
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-stone-600 hover:text-stone-900 hover:bg-stone-50 font-medium transition"
                >
                  <Gift className="w-4 h-4 text-stone-400" />
                  <span>Quà tặng</span>
                </Link>
                <Link
                  href="/dashboard/signatures"
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-stone-600 hover:text-stone-900 hover:bg-stone-50 font-medium transition"
                >
                  <PenLine className="w-4 h-4 text-stone-400" />
                  <span>Chữ ký khách mời</span>
                </Link>
              </nav>
            </div>

            {/* NAV GROUP 3: TIỆN ÍCH */}
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-stone-400 px-3 pb-2 select-none">
                Tiện ích
              </p>
              <nav className="space-y-1 text-xs sm:text-sm">
                <Link
                  href="/dashboard/cards"
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-stone-600 hover:text-stone-900 hover:bg-stone-50 font-medium transition"
                >
                  <Heart className="w-4 h-4 text-stone-400" />
                  <span>Hồ sơ cưới</span>
                </Link>
                <Link
                  href="/dashboard/domains"
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-stone-600 hover:text-stone-900 hover:bg-stone-50 font-medium transition"
                >
                  <Globe className="w-4 h-4 text-stone-400" />
                  <span>Tên miền</span>
                </Link>

                {/* ══ ZEN STORE (ACTIVE RED PILL HIGHLIGHT MATCHING SCREENSHOT) ══ */}
                <div className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl bg-[#E82561] text-white font-bold shadow-xs">
                  <ShoppingCart className="w-4 h-4 fill-white/20" />
                  <span>Zen Store</span>
                </div>
              </nav>
            </div>

            {/* NAV GROUP 4: TÀI KHOẢN */}
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-stone-400 px-3 pb-2 select-none">
                Tài khoản
              </p>
              <nav className="space-y-1 text-xs sm:text-sm">
                <Link
                  href="/dashboard/cards?tab=account"
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-stone-600 hover:text-stone-900 hover:bg-stone-50 font-medium transition"
                >
                  <User className="w-4 h-4 text-stone-400" />
                  <span>Thông tin tài khoản</span>
                </Link>
              </nav>
            </div>
          </div>

          {/* USER BOTTOM CARD */}
          <div className="pt-3 border-t border-stone-100 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#E82561] text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-2xs">
              {user?.name ? user.name.charAt(0).toUpperCase() : "T"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-stone-900 truncate">
                {user?.name || "Trần Hoài Bảo"}
              </p>
              <p className="text-[11px] text-stone-400 truncate">
                {accountQuota?.currentPlanName || "Free Plan"}
              </p>
            </div>
          </div>
        </aside>

        {/* ======================================================== */}
        {/* RIGHT MAIN WORKSPACE (MATCHING ZENLOVE ADDONS SCREENSHOT)*/}
        {/* ======================================================== */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#FDFBF7]">
          {/* ── TOP SEARCH & ACTION BAR ── */}
          <header className="h-16 bg-white border-b border-stone-200 px-4 sm:px-8 flex items-center justify-between gap-4 sticky top-0 z-20">
            {/* Search Input Box (Ctrl K) */}
            <div className="flex-1 max-w-md relative">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm kiếm..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 pl-10 pr-16 bg-stone-50 hover:bg-stone-100 focus:bg-white rounded-xl border border-stone-200 focus:border-rose-400 text-xs font-medium outline-hidden transition shadow-2xs"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded-md bg-stone-200 text-stone-600 text-[10px] font-mono font-bold select-none">
                Ctrl K
              </span>
            </div>

            {/* Right Quick Controls */}
            <div className="flex items-center gap-3 sm:gap-4 shrink-0">
              <button
                type="button"
                className="p-2 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-xl transition cursor-pointer"
                title="Gợi ý"
              >
                <Lightbulb className="w-4 h-4" />
              </button>
              <button
                type="button"
                className="p-2 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-xl transition cursor-pointer"
                title="Trợ giúp"
              >
                <HelpCircle className="w-4 h-4" />
              </button>

              {/* Nút [Nâng cấp ngay] đỏ pill */}
              <Link
                href="/dashboard/billing"
                className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-[#E82561] to-[#F43F5E] hover:from-[#D81B55] hover:to-[#E82561] text-white font-bold text-xs shadow-sm transition active:scale-95"
              >
                <Crown className="w-3.5 h-3.5" />
                <span>Nâng cấp ngay</span>
              </Link>

              <button
                type="button"
                className="p-2 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-xl transition cursor-pointer"
              >
                <Moon className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-1 bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full text-xs font-bold border border-amber-200">
                <Zap className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                <span>0</span>
              </div>

              <button
                type="button"
                className="p-2 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-xl transition cursor-pointer relative"
              >
                <Bell className="w-4 h-4" />
                <span className="w-2 h-2 rounded-full bg-rose-500 absolute top-1.5 right-1.5" />
              </button>

              <div className="w-8 h-8 rounded-full bg-[#E82561] text-white font-bold text-xs flex items-center justify-center shadow-xs cursor-pointer">
                {user?.name ? user.name.charAt(0).toUpperCase() : "T"}
              </div>
            </div>
          </header>

          {/* ── SUBBAR: HORIZONTAL TABS (MATCHING SCREENSHOT 1) ── */}
          <div className="bg-white border-b border-stone-200 px-4 sm:px-8 flex items-center gap-6 overflow-x-auto no-scrollbar text-xs sticky top-16 z-10 shadow-2xs">
            {CATEGORIES.map((cat) => {
              const count = counts[cat.key] || 0;
              const isActive = activeCategory === cat.key;
              return (
                <button
                  key={cat.key}
                  type="button"
                  onClick={() => setActiveCategory(cat.key)}
                  className={`py-3.5 shrink-0 transition flex items-center gap-1.5 border-b-2 font-medium cursor-pointer ${
                    isActive
                      ? "border-[#E82561] text-[#E82561] font-bold"
                      : "border-transparent text-stone-500 hover:text-stone-900"
                  }`}
                >
                  <span>{cat.label}</span>
                  {count > 0 && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                        isActive
                          ? "bg-rose-50 text-rose-600 border border-rose-200"
                          : "bg-stone-100 text-stone-600"
                      }`}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* ── BODY CONTENT ── */}
          <main className="p-4 sm:p-8 space-y-10 max-w-6xl">
            {loading ? (
              <div className="py-24 flex flex-col items-center justify-center gap-3 text-stone-500">
                <Loader2 className="w-8 h-8 text-[#E82561] animate-spin" />
                <p className="text-sm font-medium">Đang tải cửa hàng tiện ích...</p>
              </div>
            ) : error ? (
              <div className="max-w-md mx-auto my-12 bg-white p-6 rounded-2xl border border-rose-200 text-center space-y-3">
                <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
                <p className="text-sm text-stone-700 font-medium">{error}</p>
                <button
                  type="button"
                  onClick={loadData}
                  className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition cursor-pointer"
                >
                  Tải lại trang
                </button>
              </div>
            ) : (
              <>
                {/* ══ SECTION 1: ĐỀ XUẤT CHO BẠN (CHỈ HIỂN THỊ KHI Ở TAB "TẤT CẢ") ══ */}
                {activeCategory === "all" && featuredItems.length > 0 && (
                  <div>
                    <h2 className="text-xs font-bold uppercase tracking-wider text-stone-800 mb-4 select-none">
                      Đề Xuất Cho Bạn
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                      {featuredItems.map((item) => (
                        <div
                          key={`feat-${item.code}`}
                          className="bg-white rounded-2xl border border-stone-200/90 p-5 shadow-2xs hover:shadow-md transition flex flex-col justify-between group hover:border-stone-300"
                        >
                          <div>
                            <div className="flex items-start gap-3.5 mb-3">
                              {renderItemIcon(item.icon)}
                              <div className="min-w-0 flex-1">
                                <h3 className="font-bold text-base text-stone-900 group-hover:text-[#E82561] transition truncate">
                                  {item.name}
                                </h3>
                                <p className="text-[#E82561] font-bold text-sm sm:text-base">
                                  {item.price.toLocaleString("vi-VN")} đ
                                </p>
                              </div>
                            </div>

                            <p className="text-xs text-stone-500 line-clamp-2 mb-3 min-h-[32px]">
                              {item.description}
                            </p>

                            <div className="mb-4">
                              <span className="inline-block px-2.5 py-0.5 rounded-md bg-stone-100 text-stone-600 font-semibold text-[11px] border border-stone-200/80">
                                {item.badge}
                              </span>
                            </div>
                          </div>

                          <div className="pt-2 flex items-center justify-end">
                            <button
                              type="button"
                              onClick={() => handleBuyClick(item)}
                              disabled={creatingOrder}
                              className="px-5 py-2.5 rounded-full bg-[#E82561] hover:bg-[#D81B55] text-white font-bold text-xs flex items-center gap-1.5 transition shadow-2xs cursor-pointer active:scale-95 disabled:opacity-50"
                            >
                              <ShoppingCart className="w-3.5 h-3.5" />
                              <span>Mua ngay</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ══ SECTION 2: TẤT CẢ ADDON (HOẶC THEO DANH MỤC ĐANG CHỌN) ══ */}
                <div>
                  <h2 className="text-xs font-bold uppercase tracking-wider text-stone-800 mb-4 select-none">
                    {activeCategory === "all"
                      ? "Tất Cả Addon"
                      : CATEGORIES.find((c) => c.key === activeCategory)?.label || "Addon"}
                  </h2>

                  {filteredAddons.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center text-stone-500 text-xs">
                      Không tìm thấy tiện ích nào trong danh mục này.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                      {filteredAddons.map((item) => (
                        <div
                          key={item.code}
                          className="bg-white rounded-2xl border border-stone-200/90 p-5 shadow-2xs hover:shadow-md transition flex flex-col justify-between group hover:border-stone-300"
                        >
                          <div>
                            <div className="flex items-start gap-3.5 mb-3">
                              {renderItemIcon(item.icon)}
                              <div className="min-w-0 flex-1">
                                <h3 className="font-bold text-base text-stone-900 group-hover:text-[#E82561] transition truncate">
                                  {item.name}
                                </h3>
                                <p className="text-[#E82561] font-bold text-sm sm:text-base">
                                  {item.price.toLocaleString("vi-VN")} đ
                                </p>
                              </div>
                            </div>

                            <p className="text-xs text-stone-500 line-clamp-2 mb-3 min-h-[32px]">
                              {item.description}
                            </p>

                            <div className="mb-4">
                              <span className="inline-block px-2.5 py-0.5 rounded-md bg-stone-100 text-stone-600 font-semibold text-[11px] border border-stone-200/80">
                                {item.badge}
                              </span>
                            </div>
                          </div>

                          <div className="pt-2 flex flex-col gap-1 items-end">
                            {item.isEligible ? (
                              <button
                                type="button"
                                onClick={() => handleBuyClick(item)}
                                disabled={creatingOrder}
                                className="px-5 py-2.5 rounded-full bg-[#E82561] hover:bg-[#D81B55] text-white font-bold text-xs flex items-center gap-1.5 transition shadow-2xs cursor-pointer active:scale-95 disabled:opacity-50"
                              >
                                <ShoppingCart className="w-3.5 h-3.5" />
                                <span>Mua ngay</span>
                              </button>
                            ) : (
                              <div className="flex flex-col items-end gap-1 w-full">
                                <button
                                  type="button"
                                  onClick={() => handleBuyClick(item)}
                                  className="px-5 py-2.5 rounded-full bg-white text-[#E82561] border border-[#E82561] hover:bg-rose-50 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer active:scale-95"
                                >
                                  <Crown className="w-3.5 h-3.5 text-[#E82561]" />
                                  <span>Nâng cấp gói</span>
                                </button>
                                {item.ineligibilityReason && (
                                  <p className="text-[10px] text-stone-400 font-medium select-none">
                                    {item.ineligibilityReason}
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </main>
        </div>
      </div>

      {/* ── MODAL THANH TOÁN VIETQR TỨC THÌ ── */}
      {activeOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-stone-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#E82561] to-[#F43F5E] px-6 py-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                <h3 className="font-bold text-sm sm:text-base">Thanh Toán Tiện Ích</h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveOrder(null)}
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* PAID STATE */}
              {activeOrder.status === "PAID" ? (
                <div className="py-6 text-center space-y-3">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <h4 className="text-lg font-bold text-stone-900">
                    Thanh Toán Thành Công!
                  </h4>
                  <p className="text-xs text-stone-500 max-w-xs mx-auto">
                    Tiện ích <strong>{activeOrder.addonName}</strong> đã được kích hoạt và cộng hạn mức vào tài khoản của bạn.
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveOrder(null)}
                    className="mt-4 px-6 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition cursor-pointer"
                  >
                    Hoàn tất &amp; Đóng
                  </button>
                </div>
              ) : (
                <>
                  {/* Order summary */}
                  <div className="bg-[#FAF8F5] p-3.5 rounded-2xl border border-[#EAE2D6] flex items-center justify-between">
                    <div>
                      <p className="text-[11px] text-stone-500 uppercase font-bold tracking-wider">
                        Sản phẩm
                      </p>
                      <p className="text-sm font-bold text-stone-900">
                        {activeOrder.addonName}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[11px] text-stone-500 uppercase font-bold tracking-wider">
                        Số tiền
                      </p>
                      <p className="text-base font-bold text-[#E82561]">
                        {activeOrder.amount.toLocaleString("vi-VN")} đ
                      </p>
                    </div>
                  </div>

                  {/* QR Code image */}
                  <div className="text-center space-y-2">
                    <p className="text-xs text-stone-600 font-medium">
                      Quét mã QR bằng ứng dụng ngân hàng bất kỳ:
                    </p>
                    <div className="inline-block p-3 rounded-2xl bg-white border border-stone-200 shadow-sm">
                      <img
                        src={activeOrder.paymentInfo.qrUrl}
                        alt="VietQR Code"
                        className="w-48 h-48 mx-auto object-contain rounded-xl"
                      />
                    </div>
                  </div>

                  {/* Transfer details table */}
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between py-1.5 border-b border-stone-100">
                      <span className="text-stone-500">Ngân hàng:</span>
                      <span className="font-bold text-stone-900">
                        {activeOrder.paymentInfo.bankCode}
                      </span>
                    </div>

                    <div className="flex items-center justify-between py-1.5 border-b border-stone-100">
                      <span className="text-stone-500">Số tài khoản:</span>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-stone-900">
                          {activeOrder.paymentInfo.bankAccount}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopy(activeOrder.paymentInfo.bankAccount, "acc")}
                          className="p-1 rounded hover:bg-stone-100 text-stone-500 transition cursor-pointer"
                          title="Sao chép"
                        >
                          {copiedKey === "acc" ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between py-1.5 border-b border-stone-100">
                      <span className="text-stone-500">Chủ tài khoản:</span>
                      <span className="font-bold text-stone-900 uppercase">
                        {activeOrder.paymentInfo.bankAccountName}
                      </span>
                    </div>

                    <div className="flex items-center justify-between py-1.5 bg-amber-50/70 p-2 rounded-xl border border-amber-200/60">
                      <span className="text-amber-800 font-medium">Nội dung CK:</span>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-amber-950 text-sm">
                          {activeOrder.paymentInfo.orderCode}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopy(activeOrder.paymentInfo.orderCode, "code")}
                          className="p-1 rounded hover:bg-amber-100 text-amber-800 transition cursor-pointer"
                          title="Sao chép nội dung"
                        >
                          {copiedKey === "code" ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-2 space-y-2">
                    {transferSubmitted ? (
                      <div className="p-3 rounded-2xl bg-amber-50 text-amber-800 border border-amber-200 text-center text-xs space-y-1">
                        <div className="flex items-center justify-center gap-1.5 font-bold">
                          <Clock className="w-4 h-4 text-amber-600 animate-spin" />
                          <span>Đang chờ hệ thống đối soát...</span>
                        </div>
                        <p className="text-[11px] text-amber-700">
                          Hệ thống đang tự động kiểm tra giao dịch của bạn. Khi tiền vào, quyền lợi sẽ được mở khóa ngay.
                        </p>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={handleSubmitTransfer}
                        disabled={submittingTransfer}
                        className="w-full py-3 rounded-2xl bg-[#E82561] hover:bg-[#D81B55] text-white font-bold text-xs transition cursor-pointer flex items-center justify-center gap-2 shadow-md active:scale-98 disabled:opacity-50"
                      >
                        {submittingTransfer ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Check className="w-4 h-4" />
                        )}
                        <span>Tôi đã chuyển khoản</span>
                      </button>
                    )}

                    <p className="text-[10px] text-center text-stone-400">
                      Hệ thống tự động kích hoạt sau 1-3 phút kể từ khi tiền vào tài khoản.
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
