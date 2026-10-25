"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ApiClient } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import {
  Plus,
  Copy,
  Check,
  Eye,
  Calendar,
  Users,
  ExternalLink,
  Crown,
  Sparkles,
  Pencil,
  LogOut,
  Heart,
  Send,
  BookOpen,
  FileEdit,
  Ticket,
  User,
  Menu,
  X,
  Trash2,
  MessageCircle,
  ChevronRight,
  Armchair,
  CheckCircle2,
  Globe,
  PenLine,
  ShoppingBag,
  ShieldCheck,
  Layers,
  Image as ImageIcon,
  Clock,
  ArrowUpRight,
  Zap,
} from "lucide-react";
import { QuickFillModal, QuickFillData } from "@/components/card/QuickFillModal";
import { DashboardSidebar } from "@/components/shared/DashboardSidebar";
import { BillingSummary } from "@/types/billing.types";

interface DashboardCard {
  id: string;
  slug: string;
  cardCategory: "WEDDING" | "BIRTHDAY" | "NEWBORN";
  status: "DRAFT" | "ACTIVE" | "EXPIRED" | "ARCHIVED";
  createdAt: string;
  viewCount?: number;
  plan?: { name?: string; code?: "FREE" | "BASIC" | "VIP" };
  template?: { name?: string; thumbnailUrl?: string; previewUrl?: string };
  categoryData?: any;
  _count?: { rsvpResponses?: number; wishes?: number; guests?: number };
}

type SidebarTab = "cards" | "rsvp" | "wishes" | "perks" | "account";

export default function MyCardsPage() {
  const { user, logout } = useAuth();
  const router = useRouter();

  // State
  const searchParams = useSearchParams();
  const queryTab = searchParams.get("tab") as SidebarTab | null;
  const [activeTab, setActiveTab] = useState<SidebarTab>(
    queryTab && ["cards", "rsvp", "wishes", "perks", "account"].includes(queryTab) ? queryTab : "cards"
  );

  useEffect(() => {
    if (queryTab && ["cards", "rsvp", "wishes", "perks", "account"].includes(queryTab)) {
      setActiveTab(queryTab);
    }
  }, [queryTab]);
  const [cards, setCards] = useState<DashboardCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [weddingProfile, setWeddingProfile] = useState<any>(null);
  const [showQuickFill, setShowQuickFill] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Selected card for quick detail modal
  const [selectedCard, setSelectedCard] = useState<DashboardCard | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isPublishing, setIsPublishing] = useState<string | null>(null);
  const [deleteConfirmCardId, setDeleteConfirmCardId] = useState<string | null>(null);

  // Floating Support Chat State
  const [isChatOpen, setIsChatOpen] = useState(false);

  const [billingSummary, setBillingSummary] = useState<BillingSummary | null>(null);
  const [billingLoading, setBillingLoading] = useState(false);

  // Fetch cards
  const fetchCards = async () => {
    setLoading(true);
    try {
      const res = await ApiClient.request<DashboardCard[]>("/cards/my-cards");
      if (res.success && Array.isArray(res.data)) {
        setCards(res.data);
      } else {
        setCards([]);
      }
    } catch {
      setCards([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch wedding profile
  const fetchProfile = async () => {
    try {
      const res = await ApiClient.request<{ weddingProfile?: any }>("/user/wedding-profile");
      if (res.success && res.data) {
        setWeddingProfile(res.data);
      }
    } catch {}
  };

  // Fetch billing summary (active plan, addon quotas, paid orders)
  const fetchBillingSummary = async () => {
    setBillingLoading(true);
    try {
      const res = await ApiClient.request<BillingSummary>("/billing/summary");
      if (res.success && res.data) {
        setBillingSummary(res.data);
      }
    } catch {
      // silent fallback
    } finally {
      setBillingLoading(false);
    }
  };

  useEffect(() => {
    fetchCards();
    fetchProfile();
    fetchBillingSummary();
  }, []);

  // Quick fill callback
  const handleApplyQuickFill = (data: QuickFillData) => {
    setWeddingProfile(data);
    setShowQuickFill(false);
    setToastMessage("Đã lưu hồ sơ cưới thành công! Khi tạo thiệp mới sẽ được tự động điền.");
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Copy link gửi người thân / khách mời
  const handleCopyLink = (slug: string, id: string) => {
    const fullUrl = `${window.location.origin}/thiep/${slug}?invite=1`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedId(id);
    setToastMessage("Đã sao chép link thiệp gửi người thân!");
    setTimeout(() => {
      setCopiedId(null);
      setToastMessage(null);
    }, 2500);
  };

  // Publish / Active card
  const handlePublishCard = async (cardId: string) => {
    setIsPublishing(cardId);
    try {
      const res = await ApiClient.request(`/cards/${cardId}/publish`, {
        method: "PATCH",
      });
      if (res.success) {
        setToastMessage("Kích hoạt và xuất bản thiệp thành công!");
        fetchCards();
      } else {
        setToastMessage((res as any).error || "Không thể kích hoạt thiệp. Vui lòng thử lại.");
      }
    } catch (err: any) {
      setToastMessage(err.message || "Lỗi khi kích hoạt thiệp.");
    } finally {
      setIsPublishing(null);
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  // Delete card
  const handleDeleteCard = async (cardId: string) => {
    try {
      const res = await ApiClient.request(`/cards/${cardId}`, {
        method: "DELETE",
      });
      if (res.success) {
        setToastMessage("Đã xóa thiệp thành công");
        setCards((prev) => prev.filter((c) => c.id !== cardId));
        setDeleteConfirmCardId(null);
      } else {
        setToastMessage((res as any).error || "Không thể xóa thiệp.");
      }
    } catch {
      setToastMessage("Lỗi khi xóa thiệp.");
    } finally {
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  // Helpers to get card display data
  const getCardCoupleInfo = (card: DashboardCard) => {
    const groom =
      card.categoryData?.groom?.fullName ||
      card.categoryData?.groomName ||
      weddingProfile?.groomName ||
      "Phùng Hải Nam";
    const bride =
      card.categoryData?.bride?.fullName ||
      card.categoryData?.brideName ||
      weddingProfile?.brideName ||
      "Lê Minh Anh";
    return {
      title: `${groom} ❤️ ${bride}`,
      description: `Thiệp cưới online của ${groom} và ${bride}...`,
      date: card.createdAt ? new Date(card.createdAt).toLocaleDateString("vi-VN") : "23/09/2026",
    };
  };

  const getCardCoverImage = (card: DashboardCard) => {
    return (
      card.categoryData?.coverPhotoUrl ||
      card.categoryData?.photos?.[0]?.url ||
      card.template?.thumbnailUrl ||
      "/images/wedding_card_sample.jpg"
    );
  };

  // Summary counts
  const totalRsvps = useMemo(
    () => cards.reduce((sum, c) => sum + (c._count?.rsvpResponses || 0), 0),
    [cards]
  );
  const totalWishes = useMemo(
    () => cards.reduce((sum, c) => sum + (c._count?.wishes || 0), 0),
    [cards]
  );

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#2B2118] flex font-sans">
      {/* MOBILE TOP BAR */}
      <header className="lg:hidden bg-[#FAF7F2] border-b border-[#EADDCB] px-4 py-3 sticky top-0 z-30 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-xl text-[#78695A] hover:bg-[#F3EDE2] transition cursor-pointer"
            aria-label="Toggle menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <span className="font-bold text-sm text-[#2B2118]">Quản lý thiệp</span>
        </div>
        <div className="w-8 h-8 rounded-full bg-[#8C6239] text-white font-bold text-xs flex items-center justify-center">
          {user?.name ? user.name.charAt(0).toUpperCase() : "T"}
        </div>
      </header>

      {/* SHARED SIDEBAR */}
      <DashboardSidebar
        isMobileOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        onLogout={handleLogout}
        currentTab={activeTab}
      />

      {/* MAIN CONTENT WRAPPER */}
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 p-4 sm:p-7 lg:p-9 max-w-5xl overflow-y-auto">
          {/* TAB 1: THIỆP CƯỚI (MATCHES USER SCREENSHOT EXACTLY) */}
          {activeTab === "cards" && (
            <div className="space-y-6 animate-fadeIn">
              {/* TOP HEADER ROW: WITH OUTLINE HEART & CALLIGRAPHY SLOGAN */}
              <div className="flex items-start justify-between">
                <div>
                  {/* Outline heart above title (like screenshot) */}
                  <div className="text-[#C5A582] text-xl font-light mb-0.5 select-none leading-none">
                    ♡
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-bold font-serif text-[#2B2118] tracking-tight">
                    Thiệp cưới
                  </h1>
                  <p className="text-xs text-[#8E7E70] mt-0.5">
                    {cards.length} thiệp
                  </p>
                </div>

                {/* Elegant calligraphy watermark on the top-right (matching screenshot) */}
                <div className="hidden sm:flex flex-col items-end pointer-events-none select-none opacity-85 pr-4 pt-1">
                  <span
                    className="italic text-xl sm:text-2xl text-[#BFA082] tracking-wide"
                    style={{ fontFamily: "Playfair Display, Georgia, serif" }}
                  >
                    Lưu giữ khoảnh khắc đẹp nhất
                  </span>
                  <span className="text-[#C5A582] text-sm mt-0.5 mr-6 font-light">♡</span>
                </div>
              </div>

              {/* LOADING STATE */}
              {loading && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                  {[1, 2].map((i) => (
                    <div
                      key={i}
                      className="h-[300px] rounded-3xl bg-white/70 border border-[#EADBCC] animate-pulse flex flex-col justify-between p-6"
                    >
                      <div className="flex gap-2">
                        <div className="w-20 h-6 bg-[#EADBCC]/60 rounded-full" />
                        <div className="w-20 h-6 bg-[#EADBCC]/60 rounded-full" />
                      </div>
                      <div className="space-y-2">
                        <div className="w-48 h-6 bg-[#EADBCC]/80 rounded-md" />
                        <div className="w-36 h-4 bg-[#EADBCC]/50 rounded-md" />
                      </div>
                      <div className="flex gap-2">
                        <div className="w-24 h-9 bg-[#EADBCC]/70 rounded-xl" />
                        <div className="w-24 h-9 bg-[#EADBCC]/70 rounded-xl" />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* CARDS GRID: DASHED "+ TẠO THIỆP MỚI" & WEDDING CARD ITEMS */}
              {!loading && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start pt-1">
                  {/* CARD 1: "+ TẠO THIỆP MỚI" (MATCHING SCREENSHOT) */}
                  <div className="space-y-1.5">
                    {/* Invisible spacer so dashed card aligns neatly with items having date header */}
                    <div className="text-xs text-transparent select-none">Tạo mới</div>
                    <Link
                      href="/dashboard/cards/new"
                      className="group min-h-[295px] h-[300px] w-full rounded-3xl border-2 border-dashed border-[#DDD0BF] hover:border-[#8C6239] bg-white/80 hover:bg-[#FDFBF7] transition-all duration-300 flex flex-col items-center justify-center gap-1 p-6 text-center cursor-pointer shadow-2xs hover:shadow-md relative overflow-hidden"
                    >
                      {/* Gentle decorative leaf illustration behind the plus button */}
                      <div className="relative flex items-center justify-center my-2">
                        <svg
                          className="absolute w-24 h-24 text-[#D8C7B0]/60 pointer-events-none -right-5 -top-4 transition-transform group-hover:scale-105"
                          viewBox="0 0 100 100"
                          fill="currentColor"
                        >
                          <path
                            d="M20 80 C40 60 60 40 85 20 C82 35 70 50 55 62 C40 74 30 78 20 80 Z"
                            opacity="0.65"
                          />
                          <path
                            d="M45 55 C58 45 70 38 82 25 C75 40 60 52 48 60 Z"
                            opacity="0.45"
                          />
                          <path
                            d="M30 68 C42 58 55 50 70 38 C62 50 50 60 38 68 Z"
                            opacity="0.35"
                          />
                        </svg>

                        {/* Soft circular circle with + in the middle */}
                        <div className="relative z-10 w-12 h-12 rounded-full bg-[#EFE6D9] text-[#5C4530] flex items-center justify-center shadow-2xs group-hover:scale-110 group-hover:bg-[#E2D5C3] transition-all">
                          <Plus className="w-5 h-5 stroke-[2.2]" />
                        </div>
                      </div>

                      {/* Text below (exact match to screenshot) */}
                      <span className="text-sm font-bold text-[#2B2118] group-hover:text-[#8C6239] transition-colors mt-2">
                        Tạo thiệp mới
                      </span>
                      <p className="text-xs text-[#8E7E70] mt-1 text-center max-w-[210px] leading-relaxed">
                        Bắt đầu tạo thiệp cưới của riêng bạn chỉ trong vài phút
                      </p>
                    </Link>
                  </div>

                  {/* CARD 2..N: WEDDING CARDS (MATCHING SCREENSHOT) */}
                  {cards.map((card) => {
                    const info = getCardCoupleInfo(card);
                    const cover = getCardCoverImage(card);
                    const isDraft = card.status === "DRAFT";
                    const isVip = card.plan?.code === "VIP";

                    return (
                      <div key={card.id} className="space-y-1.5">
                        {/* TOP CREATED DATE (MATCHING SCREENSHOT) */}
                        <div className="text-xs text-[#8E7E70] font-normal text-left pl-1">
                          Tạo ngày: {info.date}
                        </div>

                        {/* CARD MOCKUP CONTAINER */}
                        <div className="group relative min-h-[295px] h-[300px] rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between p-5 bg-stone-900 border border-[#E7DDCE]">
                          {/* BACKGROUND COVER IMAGE WITH ZOOM EFFECT */}
                          <div
                            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                            style={{ backgroundImage: `url(${cover})` }}
                          />

                          {/* GRADIENT OVERLAY (FOR CRISP LEGIBILITY) */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/30 pointer-events-none" />

                          {/* TOP FLOATING BADGES (MATCHING SCREENSHOT) */}
                          <div className="relative z-10 flex flex-wrap items-center gap-1.5 sm:gap-2">
                            {/* BADGE 1: Ưu đãi miễn phí / Gói VIP */}
                            <span className="bg-white/95 backdrop-blur-md text-[#2B2118] text-[11px] font-bold px-2.5 py-1 rounded-full shadow-2xs border border-white/60 flex items-center gap-1.5">
                              <span
                                className={`w-2 h-2 rounded-full ${
                                  isVip ? "bg-amber-500" : "bg-emerald-500"
                                }`}
                              />
                              <span>{isVip ? "Gói VIP" : "Ưu đãi miễn phí"}</span>
                            </span>

                            {/* BADGE 2: Công khai / Bản nháp */}
                            <span className="bg-white/95 backdrop-blur-md text-[#2B2118] text-[11px] font-bold px-2.5 py-1 rounded-full shadow-2xs border border-white/60 flex items-center gap-1.5">
                              <span
                                className={`w-2 h-2 rounded-full ${
                                  !isDraft ? "bg-emerald-500" : "bg-amber-500"
                                }`}
                              />
                              <span>{!isDraft ? "Công khai" : "Bản nháp"}</span>
                            </span>

                            {/* BADGE 3: Form */}
                            <span className="bg-white/95 backdrop-blur-md text-[#2B2118] text-[11px] font-bold px-2.5 py-1 rounded-full shadow-2xs border border-white/60 flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-blue-500" />
                              <span>Form</span>
                            </span>
                          </div>

                          {/* MIDDLE CONTENT: COUPLE NAME & DESCRIPTION */}
                          <div className="relative z-10 space-y-0.5">
                            <h3 className="text-lg sm:text-xl font-bold font-serif text-white tracking-tight drop-shadow-md">
                              {info.title}
                            </h3>
                            <p className="text-xs text-white/90 line-clamp-1 drop-shadow font-normal">
                              {info.description}
                            </p>
                          </div>

                          {/* BOTTOM ACTIONS BAR (MATCHING SCREENSHOT) */}
                          <div className="relative z-10 flex items-center gap-2 pt-2">
                            {/* PREVIEW / OPEN LINK BUTTON (WHITE SQUARE PILL) */}
                            <Link
                              href={`/thiep/${card.slug}`}
                              target="_blank"
                              className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-white hover:bg-stone-50 text-stone-800 flex items-center justify-center shadow-md transition transform hover:scale-105 shrink-0"
                              title="Xem trang thiệp trực tiếp"
                            >
                              <Eye className="w-4 h-4 text-stone-700" />
                            </Link>

                            {/* XEM CHI TIẾT BUTTON (DANH THANG VAO CHINH SUA THIEP) */}
                            <Link
                              href={`/dashboard/cards/${card.id}/edit`}
                              className="flex-1 py-2 sm:py-2.5 px-3 rounded-2xl bg-white hover:bg-stone-50 text-[#2B2118] font-bold text-xs sm:text-sm text-center shadow-md transition transform hover:scale-[1.02] flex items-center justify-center"
                            >
                              Xem chi tiết
                            </Link>

                            {/* KÍCH HOẠT BUTTON (DARK BROWN / ESPRESSO BUTTON) */}
                            {isDraft ? (
                              <button
                                onClick={() => handlePublishCard(card.id)}
                                disabled={isPublishing === card.id}
                                className="flex-1 py-2 sm:py-2.5 px-3 rounded-2xl bg-[#3D2C1D] hover:bg-[#2B1E12] text-white font-bold text-xs sm:text-sm text-center shadow-md transition transform hover:scale-[1.02] cursor-pointer disabled:opacity-50"
                              >
                                {isPublishing === card.id ? "Đang xử lý..." : "Kích hoạt"}
                              </button>
                            ) : (
                              <Link
                                href={`/dashboard/cards/${card.id}/guests`}
                                className="flex-1 py-2 sm:py-2.5 px-3 rounded-2xl bg-[#3D2C1D] hover:bg-[#2B1E12] text-white font-bold text-xs sm:text-sm text-center shadow-md transition transform hover:scale-[1.02]"
                              >
                                Khách mời
                              </Link>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: XÁC NHẬN THAM DỰ (RSVP MANAGEMENT) */}
          {activeTab === "rsvp" && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-serif font-bold text-[#2B2118]">
                    Xác nhận tham dự (RSVP)
                  </h2>
                  <p className="text-xs text-[#8E7E70] mt-0.5">
                    Quản lý khách xác nhận có mặt, gửi lời chúc và danh sách bàn tiệc
                  </p>
                </div>
              </div>

              {/* RSVP SUMMARY METRICS */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                <div className="bg-white p-4 rounded-2xl border border-[#EADBCC] shadow-2xs">
                  <span className="text-xs text-[#8E7E70] block">Tổng số khách</span>
                  <span className="text-2xl font-bold text-[#2B2118] mt-1 block">
                    {totalRsvps}
                  </span>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-[#EADBCC] shadow-2xs">
                  <span className="text-xs text-emerald-700 block">Sẽ tham dự</span>
                  <span className="text-2xl font-bold text-emerald-600 mt-1 block">
                    {totalRsvps}
                  </span>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-[#EADBCC] shadow-2xs">
                  <span className="text-xs text-rose-700 block">Không tham dự</span>
                  <span className="text-2xl font-bold text-rose-600 mt-1 block">0</span>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-[#EADBCC] shadow-2xs">
                  <span className="text-xs text-amber-700 block">Chưa rõ</span>
                  <span className="text-2xl font-bold text-amber-600 mt-1 block">0</span>
                </div>
              </div>

              {/* CARD SELECTION & ACTIONS */}
              <div className="bg-white rounded-3xl p-6 border border-[#EADBCC] shadow-2xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-[#2B2118]">
                    Danh sách thiệp của bạn
                  </h3>
                  <span className="text-xs text-[#8E7E70]">
                    Chọn thiệp để xem chi tiết khách RSVP
                  </span>
                </div>

                <div className="divide-y divide-[#F3EDE2]">
                  {cards.map((card) => {
                    const info = getCardCoupleInfo(card);
                    return (
                      <div
                        key={card.id}
                        className="py-3 flex items-center justify-between gap-4"
                      >
                        <div>
                          <p className="font-bold text-sm text-[#2B2118]">{info.title}</p>
                          <p className="text-xs text-[#8E7E70]">
                            /thiep/{card.slug} • {card._count?.rsvpResponses || 0} khách xác nhận
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/dashboard/cards/${card.id}/rsvp`}
                            className="px-3.5 py-1.5 rounded-xl bg-[#F0E6D8] hover:bg-[#E2D5C3] text-[#4A3728] text-xs font-bold transition flex items-center gap-1.5"
                          >
                            <Users className="w-3.5 h-3.5" />
                            <span>Bảng RSVP</span>
                          </Link>
                          <Link
                            href={`/dashboard/cards/${card.id}/guests`}
                            className="px-3.5 py-1.5 rounded-xl bg-white border border-[#EADBCC] hover:bg-[#FAF7F2] text-[#4A3728] text-xs font-semibold transition flex items-center gap-1.5"
                          >
                            <Send className="w-3.5 h-3.5 text-[#C29D67]" />
                            <span>Gửi Zalo</span>
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SỔ LƯU BÚT */}
          {activeTab === "wishes" && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <h2 className="text-2xl font-serif font-bold text-[#2B2118]">
                  Sổ lưu bút & Lời chúc phúc
                </h2>
                <p className="text-xs text-[#8E7E70] mt-0.5">
                  Tổng hợp tất cả lời chúc ấm áp từ người thân, bạn bè gửi tặng cặp đôi
                </p>
              </div>

              {cards.length === 0 ? (
                <div className="bg-white rounded-3xl p-8 border border-[#EADBCC] text-center text-xs text-[#8E7E70]">
                  Bạn chưa có thiệp nào. Hãy tạo thiệp để bắt đầu nhận lời chúc!
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {cards.map((card) => {
                    const info = getCardCoupleInfo(card);
                    return (
                      <div
                        key={card.id}
                        className="bg-white rounded-3xl p-5 border border-[#EADBCC] shadow-2xs space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-[#8C6239]">
                            💍 {info.title}
                          </span>
                          <span className="text-[11px] bg-amber-50 text-amber-900 border border-amber-200 px-2 py-0.5 rounded-full font-bold">
                            {card._count?.wishes || 0} lời chúc
                          </span>
                        </div>
                        <p className="text-xs text-[#8E7E70]">
                          Lời chúc được khách nhập trực tiếp trên trang thiệp cưới và tự động hiển thị trong sổ lưu bút online.
                        </p>
                        <div className="pt-2">
                          <Link
                            href={`/thiep/${card.slug}#wishes`}
                            target="_blank"
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#4A3728] hover:text-[#8C6239]"
                          >
                            <span>Xem tường lời chúc trên thiệp</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: ƯU ĐÃI CỦA TÔI */}
          {activeTab === "perks" && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <h2 className="text-2xl font-serif font-bold text-[#2B2118]">
                  Ưu đãi của tôi & Gói dịch vụ
                </h2>
                <p className="text-xs text-[#8E7E70] mt-0.5">
                  Các đặc quyền thành viên và mã giảm giá dành riêng cho tài khoản của bạn
                </p>
              </div>

              {/* CURRENT PLAN CARD */}
              <div className="bg-gradient-to-r from-[#FAF3EA] via-white to-[#F5E9DC] rounded-3xl p-6 border border-[#E8DFC8] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-5">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[11px] font-bold border border-amber-300">
                      Gói hiện tại
                    </span>
                    <h3 className="text-lg font-bold text-[#2B2118]">
                      {user?.account?.entitlement?.planName || "Gói Dùng Thử Miễn Phí"}
                    </h3>
                  </div>
                  <p className="text-xs text-[#78695A] max-w-xl">
                    Tạo thiệp không giới hạn bản nháp, trải nghiệm hiệu ứng phong bì sáp nến 3D và tự động hoá RSVP.
                  </p>
                </div>

                <Link
                  href="/dashboard/billing"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#C29D67] to-[#A87948] hover:from-[#B5915B] hover:to-[#966B3D] text-white text-xs font-bold transition shadow-sm text-center shrink-0"
                >
                  Nâng cấp gói VIP
                </Link>
              </div>
            </div>
          )}

          {/* TAB 5: TÀI KHOẢN */}
          {activeTab === "account" && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-serif font-bold text-[#2B2118]">
                    Thông tin tài khoản & Gói dịch vụ
                  </h2>
                  <p className="text-xs text-[#8E7E70] mt-0.5">
                    Quản lý thông tin cá nhân, gói bản quyền và các tính năng tiện ích đã mua thành công
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    href="/dashboard/billing"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-xs font-bold transition shadow-xs"
                  >
                    <Crown className="w-4 h-4 text-white" />
                    <span>Nâng cấp VIP</span>
                  </Link>
                  <Link
                    href="/dashboard/addons"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-[#EADBCC] hover:bg-[#FAF7F2] text-[#4A3728] text-xs font-semibold transition"
                  >
                    <ShoppingBag className="w-4 h-4 text-amber-600" />
                    <span>Cửa hàng tiện ích</span>
                  </Link>
                </div>
              </div>

              {/* USER INFO CARD */}
              <div className="bg-white rounded-3xl p-6 border border-[#EADBCC] shadow-2xs space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-[#E82561] text-white font-bold text-xl flex items-center justify-center shadow-xs">
                    {user?.name ? user.name.charAt(0).toUpperCase() : "T"}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#2B2118]">
                      {user?.name || "Trần Hoài Bảo"}
                    </h3>
                    <p className="text-xs text-[#8E7E70]">{user?.email}</p>
                    <div className="flex flex-wrap items-center gap-2 mt-1.5">
                      <span className="inline-block text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                        Thành viên chính thức
                      </span>
                      {billingSummary?.effectivePlan.planCode === "VIP" && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-gradient-to-r from-amber-100 to-amber-200 px-2.5 py-0.5 rounded-full border border-amber-300">
                          <Crown className="w-3 h-3 text-amber-700" />
                          Gói VIP Trọn Đời
                        </span>
                      )}
                      {billingSummary?.effectivePlan.planCode === "BASIC" && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-800 bg-blue-100 px-2.5 py-0.5 rounded-full border border-blue-200">
                          <ShieldCheck className="w-3 h-3 text-blue-700" />
                          Gói Tiêu Chuẩn (BASIC)
                        </span>
                      )}
                      {billingSummary?.effectivePlan.planCode === "FREE" && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-stone-600 bg-stone-100 px-2.5 py-0.5 rounded-full border border-stone-200">
                          Gói Miễn Phí (FREE)
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* CURRENT PLAN & ENTITLEMENTS STATUS */}
              <div className="bg-white rounded-3xl p-6 border border-[#EADBCC] shadow-2xs space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#F0E6D8]">
                  <div className="flex items-center gap-3">
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
                      billingSummary?.effectivePlan.planCode === "VIP"
                        ? "bg-amber-100 text-amber-700 border border-amber-300"
                        : billingSummary?.effectivePlan.planCode === "BASIC"
                        ? "bg-blue-100 text-blue-700 border border-blue-200"
                        : "bg-stone-100 text-stone-600 border border-stone-200"
                    }`}>
                      {billingSummary?.effectivePlan.planCode === "VIP" ? (
                        <Crown className="w-6 h-6 text-amber-600" />
                      ) : (
                        <ShieldCheck className="w-6 h-6 text-blue-600" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-[#2B2118]">
                          {billingSummary?.effectivePlan.planName || "Gói Dịch Vụ Tài Khoản"}
                        </h3>
                        {billingSummary?.effectivePlan.isPaid ? (
                          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                            ✓ Đã kích hoạt
                          </span>
                        ) : (
                          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-stone-100 text-stone-600">
                            Mặc định
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#8E7E70] mt-0.5">
                        {billingSummary?.effectivePlan.planCode === "VIP"
                          ? "Thời hạn: Vĩnh viễn không giới hạn thời gian sử dụng"
                          : billingSummary?.effectivePlan.planExpiresAt
                          ? `Thời hạn: Còn ${billingSummary.effectivePlan.daysRemaining ?? 0} ngày (Hạn dùng: ${new Date(billingSummary.effectivePlan.planExpiresAt).toLocaleDateString("vi-VN")})`
                          : "Đang sử dụng phiên bản miễn phí cơ bản"}
                      </p>
                    </div>
                  </div>

                  <Link
                    href="/dashboard/billing"
                    className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 hover:text-amber-800 transition"
                  >
                    <span>Quản lý gói dịch vụ</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                {/* HẠN MỨC & QUYỀN LỢI TÀI KHOẢN (CỘNG DỒN TỪ GÓI VÀ TIỆN ÍCH) */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#8E7E70] mb-3">
                    Hạn Mức & Dung Lượng Đã Mua (Cộng dồn)
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* Thẻ tạo thiệp */}
                    <div className="bg-[#FAF7F2] rounded-2xl p-4 border border-[#EADBCC] space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-[#78695A] font-medium flex items-center gap-1.5">
                          <Layers className="w-4 h-4 text-purple-600" />
                          Số thiệp được tạo
                        </span>
                        {(billingSummary?.accountQuota?.extraCards ?? 0) > 0 && (
                          <span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-md border border-purple-200">
                            +{billingSummary?.accountQuota?.extraCards} đã kích hoạt
                          </span>
                        )}
                      </div>
                      <p className="text-xl font-bold font-serif text-[#2B2118]">
                        {billingSummary?.accountQuota?.totalAllowedCards ?? 2} <span className="text-xs font-sans font-normal text-[#8E7E70]">thiệp</span>
                      </p>
                      <p className="text-[11px] text-[#8E7E70]">
                        2 thiệp cơ bản {(billingSummary?.accountQuota?.extraCards ?? 0) > 0 ? `+ ${billingSummary?.accountQuota?.extraCards} mua thêm` : ""}
                      </p>
                    </div>

                    {/* Album ảnh */}
                    <div className="bg-[#FAF7F2] rounded-2xl p-4 border border-[#EADBCC] space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-[#78695A] font-medium flex items-center gap-1.5">
                          <ImageIcon className="w-4 h-4 text-blue-600" />
                          Kho ảnh album cưới
                        </span>
                        {(billingSummary?.accountQuota?.extraPhotos ?? 0) > 0 && (
                          <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-md border border-blue-200">
                            +{billingSummary?.accountQuota?.extraPhotos} đã kích hoạt
                          </span>
                        )}
                      </div>
                      <p className="text-xl font-bold font-serif text-[#2B2118]">
                        {billingSummary?.accountQuota?.totalAllowedPhotos ?? 10} <span className="text-xs font-sans font-normal text-[#8E7E70]">ảnh tối đa</span>
                      </p>
                      <p className="text-[11px] text-[#8E7E70]">
                        {billingSummary?.effectivePlan.capabilities.maxPhotos ?? 10} ảnh theo gói {(billingSummary?.accountQuota?.extraPhotos ?? 0) > 0 ? `+ ${billingSummary?.accountQuota?.extraPhotos} mua thêm` : ""}
                      </p>
                    </div>

                    {/* Tên miền riêng */}
                    <div className="bg-[#FAF7F2] rounded-2xl p-4 border border-[#EADBCC] space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-[#78695A] font-medium flex items-center gap-1.5">
                          <Globe className="w-4 h-4 text-emerald-600" />
                          Slot tên miền riêng
                        </span>
                        {(billingSummary?.accountQuota?.extraDomains ?? 0) > 0 && (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md border border-emerald-200">
                            +{billingSummary?.accountQuota?.extraDomains} đã kích hoạt
                          </span>
                        )}
                      </div>
                      <p className="text-xl font-bold font-serif text-[#2B2118]">
                        {billingSummary?.accountQuota?.totalAllowedDomains ?? 0} <span className="text-xs font-sans font-normal text-[#8E7E70]">slot kết nối</span>
                      </p>
                      <p className="text-[11px] text-[#8E7E70]">
                        {billingSummary?.effectivePlan.capabilities.allowCustomDomain ? "1 slot theo gói" : "0 theo gói"} {(billingSummary?.accountQuota?.extraDomains ?? 0) > 0 ? `+ ${billingSummary?.accountQuota?.extraDomains} mua thêm` : ""}
                      </p>
                    </div>
                  </div>
                </div>

                {/* ĐẶC QUYỀN ĐÃ MỞ KHÓA */}
                <div className="pt-1">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#8E7E70] mb-3">
                    Đặc Quyền Đã Mở Khóa
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                    <div className="p-3 rounded-xl bg-white border border-[#EADBCC] flex items-center gap-2.5 shadow-2xs">
                      <CheckCircle2 className={`w-4 h-4 shrink-0 ${!billingSummary?.effectivePlan.capabilities.hasWatermark ? "text-emerald-600" : "text-stone-300"}`} />
                      <span className={!billingSummary?.effectivePlan.capabilities.hasWatermark ? "font-semibold text-[#2B2118]" : "text-stone-400"}>
                        {!billingSummary?.effectivePlan.capabilities.hasWatermark ? "Đã gỡ Watermark" : "Có logo bản quyền"}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-white border border-[#EADBCC] flex items-center gap-2.5 shadow-2xs">
                      <CheckCircle2 className={`w-4 h-4 shrink-0 ${billingSummary?.effectivePlan.capabilities.allowMusicUpload ? "text-emerald-600" : "text-stone-300"}`} />
                      <span className={billingSummary?.effectivePlan.capabilities.allowMusicUpload ? "font-semibold text-[#2B2118]" : "text-stone-400"}>
                        {billingSummary?.effectivePlan.capabilities.allowMusicUpload ? "Tải nhạc MP3 tự chọn" : "Nhạc mặc định"}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-white border border-[#EADBCC] flex items-center gap-2.5 shadow-2xs">
                      <CheckCircle2 className={`w-4 h-4 shrink-0 ${billingSummary?.effectivePlan.capabilities.allowTelegramNoti ? "text-emerald-600" : "text-stone-300"}`} />
                      <span className={billingSummary?.effectivePlan.capabilities.allowTelegramNoti ? "font-semibold text-[#2B2118]" : "text-stone-400"}>
                        {billingSummary?.effectivePlan.capabilities.allowTelegramNoti ? "Thông báo Telegram" : "Chưa bật Telegram"}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-white border border-[#EADBCC] flex items-center gap-2.5 shadow-2xs">
                      <CheckCircle2 className={`w-4 h-4 shrink-0 ${billingSummary?.effectivePlan.capabilities.allowPremiumTemplates ? "text-emerald-600" : "text-stone-300"}`} />
                      <span className={billingSummary?.effectivePlan.capabilities.allowPremiumTemplates ? "font-semibold text-[#2B2118]" : "text-stone-400"}>
                        {billingSummary?.effectivePlan.capabilities.allowPremiumTemplates ? "Kho mẫu thiệp VIP" : "Mẫu thiệp cơ bản"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* LỊCH SỬ GÓI & TIỆN ÍCH ĐÃ MUA THÀNH CÔNG */}
              <div className="bg-white rounded-3xl p-6 border border-[#EADBCC] shadow-2xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-base font-bold text-[#2B2118]">
                      Lịch sử gói & tiện ích đã mua thành công
                    </h3>
                    <p className="text-xs text-[#8E7E70] mt-0.5">
                      Danh sách các gói cước và tiện ích mở rộng đã thanh toán & kích hoạt cho tài khoản của bạn
                    </p>
                  </div>
                  {billingSummary?.paidOrders && billingSummary.paidOrders.length > 0 && (
                    <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                      Đã kích hoạt {billingSummary.paidOrders.length} mục
                    </span>
                  )}
                </div>

                {billingLoading ? (
                  <div className="py-8 text-center text-xs text-[#8E7E70]">
                    Đang tải dữ liệu đơn hàng đã mua...
                  </div>
                ) : !billingSummary?.paidOrders || billingSummary.paidOrders.length === 0 ? (
                  <div className="text-center py-8 px-4 rounded-2xl bg-[#FAF7F2] border border-[#EADBCC] space-y-3">
                    <div className="w-12 h-12 mx-auto rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
                      <Crown className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#2B2118]">Chưa có đơn hàng nào được mua</p>
                      <p className="text-xs text-[#8E7E70] mt-1 max-w-md mx-auto">
                        Bạn hiện đang sử dụng Gói Miễn Phí. Khi mua Gói VIP hoặc Tiện ích bổ sung, danh sách các mục đã kích hoạt thành công sẽ hiển thị chi tiết tại đây.
                      </p>
                    </div>
                    <div className="pt-1 flex items-center justify-center gap-3">
                      <Link
                        href="/dashboard/billing"
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-white text-xs font-bold hover:opacity-95 transition shadow-xs"
                      >
                        Nâng cấp Gói VIP
                      </Link>
                      <Link
                        href="/dashboard/addons"
                        className="px-4 py-2 rounded-xl bg-white border border-[#EADBCC] text-[#4A3728] text-xs font-semibold hover:bg-[#FAF7F2] transition"
                      >
                        Xem Tiện ích mở rộng
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {billingSummary.paidOrders.map((order) => {
                      const isPlan = order.orderType === "PLAN";
                      return (
                        <div
                          key={order.id}
                          className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-[#FAF7F2] border border-[#EADBCC] hover:border-amber-300 transition"
                        >
                          <div className="flex items-start sm:items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                              isPlan
                                ? "bg-amber-100 text-amber-700 border border-amber-300"
                                : "bg-purple-100 text-purple-700 border border-purple-200"
                            }`}>
                              {isPlan ? (
                                <Crown className="w-5 h-5 text-amber-600" />
                              ) : order.itemCode.includes("CARD") ? (
                                <Layers className="w-5 h-5 text-purple-600" />
                              ) : order.itemCode.includes("PHOTO") ? (
                                <ImageIcon className="w-5 h-5 text-blue-600" />
                              ) : order.itemCode.includes("DOMAIN") ? (
                                <Globe className="w-5 h-5 text-emerald-600" />
                              ) : (
                                <Clock className="w-5 h-5 text-amber-600" />
                              )}
                            </div>
                            <div className="space-y-0.5">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="text-sm font-bold text-[#2B2118]">
                                  {order.itemName}
                                </span>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                  isPlan
                                    ? "bg-amber-100 text-amber-800 border border-amber-200"
                                    : "bg-purple-100 text-purple-800 border border-purple-200"
                                }`}>
                                  {isPlan ? "Gói Dịch Vụ" : "Tiện Ích"}
                                </span>
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                                  <Check className="w-3 h-3" />
                                  Đã kích hoạt thành công
                                </span>
                              </div>
                              <p className="text-xs text-[#8E7E70]">
                                Mã đơn: <strong className="font-mono text-[#4A3728]">{order.orderCode}</strong>
                                {order.paidAt && (
                                  <> • Kích hoạt lúc: {new Date(order.paidAt).toLocaleString("vi-VN")}</>
                                )}
                              </p>
                            </div>
                          </div>

                          <div className="sm:text-right shrink-0">
                            <span className="text-sm font-bold text-emerald-700">
                              {order.amount.toLocaleString("vi-VN")} đ
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* WEDDING PROFILE SHORTCUT */}
              <div className="bg-gradient-to-r from-[#FAF3EA] via-white to-[#F5E9DC] rounded-3xl p-6 border border-[#E8DFC8] shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Heart className="w-5 h-5 text-rose-500 fill-rose-500/20" />
                    <h3 className="text-base font-bold text-[#2B2118]">
                      Hồ sơ cưới 23 mục (Tự động điền)
                    </h3>
                  </div>
                  {weddingProfile ? (
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                      ✓ Đã lưu thông tin
                    </span>
                  ) : (
                    <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full animate-pulse">
                      Chưa điền
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#78695A] leading-relaxed">
                  Lưu trước họ tên Chú rể, Cô dâu, phụ mẫu 2 bên, ngày giờ, địa điểm tổ chức và album ảnh vào tài khoản. Bất kỳ khi nào tạo thiệp mới hoặc đổi mẫu thiệp, bạn chỉ cần 1 click là hoàn tất!
                </p>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={() => setShowQuickFill(true)}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#C29D67] to-[#A87948] text-white text-xs font-bold shadow-2xs hover:opacity-95 transition"
                  >
                    {weddingProfile ? "Chỉnh sửa hồ sơ cưới" : "Điền hồ sơ ngay"}
                  </button>
                  <Link
                    href="/dashboard/profile/wedding"
                    className="px-4 py-2 rounded-xl bg-white border border-[#EADBCC] text-xs font-semibold text-[#4A3728] hover:bg-[#FAF7F2] transition"
                  >
                    Xem chi tiết 23 mục
                  </Link>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ======================================================== */}
      {/* CARD DETAIL PREVIEW MODAL                                */}
      {/* ======================================================== */}
      {isDetailModalOpen && selectedCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden border border-[#EADBCC] shadow-2xl space-y-4 p-6">
            <div className="flex items-center justify-between pb-3 border-b border-[#F3EDE2]">
              <div>
                <h3 className="text-lg font-bold font-serif text-[#2B2118]">
                  Chi tiết thiệp cưới
                </h3>
                <p className="text-xs text-[#8E7E70]">
                  Khởi tạo ngày: {new Date(selectedCard.createdAt).toLocaleDateString("vi-VN")}
                </p>
              </div>
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="p-1.5 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* CARD THUMBNAIL PREVIEW */}
            <div className="relative h-44 rounded-2xl overflow-hidden bg-stone-100 border border-[#EADBCC]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={getCardCoverImage(selectedCard)}
                alt="Card Cover"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent" />
              <div className="absolute bottom-3 left-3 text-white">
                <p className="font-serif font-bold text-base drop-shadow">
                  {getCardCoupleInfo(selectedCard).title}
                </p>
                <p className="text-xs text-stone-200">
                  /thiep/{selectedCard.slug}
                </p>
              </div>
            </div>

            {/* ACTION LINKS */}
            <div className="space-y-2 pt-2">
              <div className="flex gap-2">
                <button
                  onClick={() => handleCopyLink(selectedCard.slug, selectedCard.id)}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-[#F0E6D8] hover:bg-[#E2D4C3] text-[#4A3728] text-xs font-bold transition flex items-center justify-center gap-1.5"
                >
                  {copiedId === selectedCard.id ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Đã chép link!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Chép link thiệp</span>
                    </>
                  )}
                </button>

                <Link
                  href={`/thiep/${selectedCard.slug}`}
                  target="_blank"
                  className="flex-1 py-2.5 px-3 rounded-xl bg-[#2B2118] hover:bg-black text-white text-xs font-bold transition flex items-center justify-center gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Mở thiệp online</span>
                </Link>
              </div>

              <div className="flex gap-2">
                <Link
                  href={`/dashboard/cards/${selectedCard.id}/edit`}
                  className="flex-1 py-2 px-3 rounded-xl border border-[#EADBCC] text-[#4A3728] text-xs font-semibold hover:bg-[#FAF7F2] transition text-center flex items-center justify-center gap-1"
                >
                  <Pencil className="w-3.5 h-3.5 text-[#8C6239]" />
                  <span>Trình chỉnh sửa</span>
                </Link>
                <Link
                  href={`/dashboard/cards/${selectedCard.id}/guests`}
                  className="flex-1 py-2 px-3 rounded-xl border border-[#EADBCC] text-[#4A3728] text-xs font-semibold hover:bg-[#FAF7F2] transition text-center flex items-center justify-center gap-1"
                >
                  <Send className="w-3.5 h-3.5 text-blue-500" />
                  <span>Khách mời Zalo</span>
                </Link>
              </div>

              {/* DELETE BUTTON */}
              <div className="pt-2 text-center">
                {deleteConfirmCardId === selectedCard.id ? (
                  <div className="flex items-center justify-center gap-2 text-xs">
                    <span className="text-rose-600 font-medium">Bạn chắc chắn muốn xóa?</span>
                    <button
                      onClick={() => {
                        handleDeleteCard(selectedCard.id);
                        setIsDetailModalOpen(false);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-rose-600 text-white font-bold"
                    >
                      Xóa
                    </button>
                    <button
                      onClick={() => setDeleteConfirmCardId(null)}
                      className="px-2.5 py-1 rounded-lg bg-stone-200 text-stone-700"
                    >
                      Hủy
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setDeleteConfirmCardId(selectedCard.id)}
                    className="text-xs text-stone-400 hover:text-rose-600 transition inline-flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Xóa thiệp này</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* FLOATING SUPPORT CHAT BUTTON (MATCHING SCREENSHOT)       */}
      {/* ======================================================== */}
      <button
        onClick={() => setIsChatOpen(!isChatOpen)}
        className="fixed bottom-6 right-6 z-40 w-12 h-12 rounded-full bg-[#1F1914] hover:bg-black text-white flex items-center justify-center shadow-xl hover:scale-105 transition transform cursor-pointer border border-stone-800"
        title="Hỗ trợ & Hướng dẫn tạo thiệp"
        aria-label="Support Chat"
      >
        <MessageCircle className="w-5 h-5" />
      </button>

      {/* FLOATING CHAT DIALOG */}
      {isChatOpen && (
        <div className="fixed bottom-22 right-6 z-50 w-80 sm:w-88 bg-white rounded-3xl border border-[#EADBCC] shadow-2xl p-5 space-y-3.5 animate-fadeIn">
          <div className="flex items-center justify-between pb-2 border-b border-[#F3EDE2]">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#8C6239] text-white flex items-center justify-center text-xs font-bold">
                💍
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#2B2118]">
                  Trợ Lý Studio Thiệp Cưới
                </h4>
                <p className="text-[10px] text-emerald-600 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Trực tuyến hỗ trợ
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsChatOpen(false)}
              className="p-1 rounded-full text-stone-400 hover:text-stone-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-[#78695A] leading-relaxed">
            Xin chào <strong>{user?.name || "bạn"}</strong>! Bạn cần hỗ trợ gì khi tạo thiệp cưới, cấu hình QR mừng cưới hay gửi link Zalo cho khách?
          </p>

          <div className="space-y-1.5 pt-1">
            <button
              onClick={() => {
                setShowQuickFill(true);
                setIsChatOpen(false);
              }}
              className="w-full text-left p-2.5 rounded-xl bg-[#FAF7F2] hover:bg-[#F3EDE2] text-xs font-semibold text-[#4A3728] transition flex items-center justify-between"
            >
              <span>⚡ Điền hồ sơ cưới tự động điền</span>
              <ChevronRight className="w-3.5 h-3.5 text-[#8C6239]" />
            </button>
            <Link
              href="/dashboard/cards/new"
              onClick={() => setIsChatOpen(false)}
              className="w-full text-left p-2.5 rounded-xl bg-[#FAF7F2] hover:bg-[#F3EDE2] text-xs font-semibold text-[#4A3728] transition flex items-center justify-between block"
            >
              <span>🎨 Xem 10+ mẫu thiệp mới nhất</span>
              <ChevronRight className="w-3.5 h-3.5 text-[#8C6239]" />
            </Link>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TOAST NOTIFICATION                                       */}
      {/* ======================================================== */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl bg-[#2B2118] text-white font-bold text-xs sm:text-sm shadow-2xl flex items-center gap-2 animate-bounce border border-stone-700">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 stroke-[2.5]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ======================================================== */}
      {/* QUICK FILL MODAL (HỒ SƠ CƯỚI 23 MỤC)                     */}
      {/* ======================================================== */}
      <QuickFillModal
        isOpen={showQuickFill}
        onClose={() => setShowQuickFill(false)}
        onApply={handleApplyQuickFill}
        initialData={weddingProfile || undefined}
      />
    </div>
  );
}