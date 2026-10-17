"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ApiClient } from "@/lib/api";
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
  ExternalLink,
  Loader2,
  AlertCircle,
  Crown,
  X,
  ShieldCheck,
  Search,
  CheckCircle2,
  ChevronRight,
  Sparkle,
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addons, setAddons] = useState<AddonCatalogItem[]>([]);
  const [accountQuota, setAccountQuota] = useState<AccountQuotaInfo | null>(null);

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

  // Polling order status if active
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
            // Refresh account quota
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

  // Render Icon component for card
  const renderItemIcon = (icon: AddonCatalogItem["icon"]) => {
    switch (icon) {
      case "clock":
        return (
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-200/60 shadow-2xs">
            <Clock className="w-6 h-6" />
          </div>
        );
      case "card":
        return (
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center shrink-0 border border-rose-200/60 shadow-2xs">
            <Layers className="w-6 h-6" />
          </div>
        );
      case "image":
        return (
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-200/60 shadow-2xs">
            <ImageIcon className="w-6 h-6" />
          </div>
        );
      case "eye":
        return (
          <div className="w-12 h-12 rounded-2xl bg-cyan-50 text-cyan-600 flex items-center justify-center shrink-0 border border-cyan-200/60 shadow-2xs">
            <Eye className="w-6 h-6" />
          </div>
        );
      case "globe":
        return (
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-200/60 shadow-2xs">
            <Globe className="w-6 h-6" />
          </div>
        );
      case "domain":
        return (
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 border border-amber-200/60 shadow-2xs">
            <Sparkle className="w-6 h-6" />
          </div>
        );
      case "heart":
        return (
          <div className="w-12 h-12 rounded-2xl bg-pink-50 text-pink-600 flex items-center justify-center shrink-0 border border-pink-200/60 shadow-2xs">
            <Heart className="w-6 h-6" />
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-stone-900 pb-20">
      {/* ── TOP HEADER ── */}
      <header className="bg-white border-b border-stone-200 sticky top-0 z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <Link
                href="/dashboard/cards"
                className="text-xs text-stone-500 hover:text-stone-900 transition flex items-center gap-1 shrink-0"
              >
                <span>Thiệp của tôi</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
              <h1 className="text-base sm:text-lg font-bold font-serif text-stone-900 flex items-center gap-2 truncate">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
                <span>Cửa Hàng Tiện Ích (Add-on Store)</span>
              </h1>
            </div>

            {/* Quota Badge */}
            {accountQuota && (
              <div className="hidden sm:flex items-center gap-2 bg-stone-100/80 px-3 py-1.5 rounded-xl border border-stone-200 text-xs text-stone-700">
                <Crown className="w-3.5 h-3.5 text-amber-600" />
                <span>Gói hiện tại: <strong>{accountQuota.currentPlanName}</strong></span>
                {accountQuota.extraCards > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 rounded-md bg-rose-100 text-rose-700 font-bold text-[11px]">
                    +{accountQuota.extraCards} thiệp
                  </span>
                )}
              </div>
            )}
          </div>

          {/* ── FILTER HORIZONTAL TABS BAR ── */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-2 border-t border-stone-100 text-xs">
            {CATEGORIES.map((cat) => {
              const count = counts[cat.key] || 0;
              const isActive = activeCategory === cat.key;
              return (
                <button
                  key={cat.key}
                  type="button"
                  onClick={() => setActiveCategory(cat.key)}
                  className={`px-3 py-1.5 rounded-xl font-medium shrink-0 transition flex items-center gap-1.5 cursor-pointer ${
                    isActive
                      ? "bg-rose-50 text-rose-600 font-bold border border-rose-200 shadow-2xs"
                      : "text-stone-600 hover:text-stone-900 hover:bg-stone-100"
                  }`}
                >
                  <span>{cat.label}</span>
                  {count > 0 && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                        isActive
                          ? "bg-rose-600 text-white"
                          : "bg-stone-200/80 text-stone-600"
                      }`}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* ── MAIN CONTENT ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-10">
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-3 text-stone-500">
            <Loader2 className="w-8 h-8 text-rose-500 animate-spin" />
            <p className="text-sm font-medium">Đang tải danh mục tiện ích...</p>
          </div>
        ) : error ? (
          <div className="max-w-md mx-auto my-12 bg-white p-6 rounded-2xl border border-rose-200 text-center space-y-3">
            <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
            <p className="text-sm text-stone-700 font-medium">{error}</p>
            <button
              type="button"
              onClick={loadData}
              className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition"
            >
              Tải lại trang
            </button>
          </div>
        ) : (
          <>
            {/* ══ SECTION 1: ĐỀ XUẤT CHO BẠN (CHỈ HIỆN KHI Ở TAB "TẤT CẢ") ══ */}
            {activeCategory === "all" && featuredItems.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <h2 className="text-sm font-bold uppercase tracking-wider text-stone-700">
                    Đề Xuất Cho Bạn
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                  {featuredItems.map((item) => (
                    <div
                      key={`feat-${item.code}`}
                      className="bg-white rounded-2xl border border-stone-200/80 p-5 shadow-2xs hover:shadow-md transition flex flex-col justify-between group hover:border-amber-300"
                    >
                      <div>
                        <div className="flex items-start gap-3.5 mb-3">
                          {renderItemIcon(item.icon)}
                          <div className="min-w-0 flex-1">
                            <h3 className="font-bold text-base text-stone-900 group-hover:text-rose-600 transition truncate">
                              {item.name}
                            </h3>
                            <p className="text-rose-600 font-bold text-sm sm:text-base">
                              {item.price.toLocaleString("vi-VN")} đ
                            </p>
                          </div>
                        </div>

                        <p className="text-xs text-stone-500 line-clamp-2 mb-3">
                          {item.description}
                        </p>

                        <div className="mb-4">
                          <span className="inline-block px-2.5 py-0.5 rounded-md bg-stone-100 text-stone-600 font-semibold text-[11px] border border-stone-200">
                            {item.badge}
                          </span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-stone-100 flex items-center justify-end">
                        <button
                          type="button"
                          onClick={() => handleBuyClick(item)}
                          disabled={creatingOrder}
                          className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-2xs cursor-pointer active:scale-95 disabled:opacity-50"
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

            {/* ══ SECTION 2: TẤT CẢ ADDON (HOẶC THEO TAB ĐANG CHỌN) ══ */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold uppercase tracking-wider text-stone-700">
                  {activeCategory === "all"
                    ? "Tất Cả Addon"
                    : CATEGORIES.find((c) => c.key === activeCategory)?.label || "Addon"}
                </h2>
                <span className="text-xs text-stone-400">
                  {filteredAddons.length} tiện ích
                </span>
              </div>

              {filteredAddons.length === 0 ? (
                <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center text-stone-500 text-xs">
                  Không tìm thấy tiện ích nào trong danh mục này.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                  {filteredAddons.map((item) => (
                    <div
                      key={item.code}
                      className="bg-white rounded-2xl border border-stone-200/80 p-5 shadow-2xs hover:shadow-md transition flex flex-col justify-between group hover:border-stone-300"
                    >
                      <div>
                        <div className="flex items-start gap-3.5 mb-3">
                          {renderItemIcon(item.icon)}
                          <div className="min-w-0 flex-1">
                            <h3 className="font-bold text-base text-stone-900 group-hover:text-rose-600 transition truncate">
                              {item.name}
                            </h3>
                            <p className="text-rose-600 font-bold text-sm sm:text-base">
                              {item.price.toLocaleString("vi-VN")} đ
                            </p>
                          </div>
                        </div>

                        <p className="text-xs text-stone-500 line-clamp-2 mb-3">
                          {item.description}
                        </p>

                        <div className="mb-4">
                          <span className="inline-block px-2.5 py-0.5 rounded-md bg-stone-100 text-stone-600 font-semibold text-[11px] border border-stone-200">
                            {item.badge}
                          </span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-stone-100 flex flex-col gap-1 items-end">
                        {item.isEligible ? (
                          <button
                            type="button"
                            onClick={() => handleBuyClick(item)}
                            disabled={creatingOrder}
                            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-2xs cursor-pointer active:scale-95 disabled:opacity-50"
                          >
                            <ShoppingCart className="w-3.5 h-3.5" />
                            <span>Mua ngay</span>
                          </button>
                        ) : (
                          <div className="flex flex-col items-end gap-1 w-full">
                            <button
                              type="button"
                              onClick={() => handleBuyClick(item)}
                              className="px-4 py-2 rounded-xl bg-rose-50 text-rose-600 border border-rose-300 hover:bg-rose-100 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer active:scale-95"
                            >
                              <Crown className="w-3.5 h-3.5 text-rose-500" />
                              <span>Nâng cấp gói</span>
                            </button>
                            {item.ineligibilityReason && (
                              <p className="text-[10px] text-stone-400 font-medium">
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

      {/* ── MODAL THANH TOÁN VIETQR TỨC THÌ ── */}
      {activeOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-stone-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="bg-gradient-to-r from-rose-600 to-rose-700 px-6 py-4 text-white flex items-center justify-between">
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
                    className="mt-4 px-6 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition"
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
                      <p className="text-base font-bold text-rose-600">
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
                        className="w-full py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition cursor-pointer flex items-center justify-center gap-2 shadow-md active:scale-98 disabled:opacity-50"
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
