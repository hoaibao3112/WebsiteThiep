"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
} from "lucide-react";
import { QuickFillModal, QuickFillData } from "@/components/card/QuickFillModal";

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
  const [activeTab, setActiveTab] = useState<SidebarTab>("cards");
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

  useEffect(() => {
    fetchCards();
    fetchProfile();
  }, []);

  // Quick fill callback
  const handleApplyQuickFill = (data: QuickFillData) => {
    setWeddingProfile(data);
    setShowQuickFill(false);
    setToastMessage("Đã lưu hồ sơ cưới thành công! Khi tạo thiệp mới sẽ được tự động điền.");
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Copy link
  const handleCopyLink = (slug: string, id: string) => {
    const fullUrl = `${window.location.origin}/thiep/${slug}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedId(id);
    setToastMessage("Đã sao chép link thiệp vào bộ nhớ tạm!");
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
    <div className="min-h-screen bg-[#F9F5EE] text-[#2D241E] flex flex-col font-sans selection:bg-[#EADDCB] selection:text-[#4A3728] relative overflow-x-hidden">
      {/* ======================================================== */}
      {/* BOTANICAL WATERCOLOR & LINE-ART BACKGROUND DECORATIONS   */}
      {/* ======================================================== */}
      {/* Bottom-left botanical illustration (matching user screenshot) */}
      <div className="fixed bottom-0 left-0 w-72 sm:w-96 h-72 sm:h-96 pointer-events-none z-0 select-none opacity-85">
        <svg viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          {/* Main branch stems */}
          <path d="M-20 420 C50 350 110 260 160 150 C180 100 200 60 210 20" stroke="#C2AE93" strokeWidth="1.8" strokeLinecap="round" opacity="0.65" />
          <path d="M30 410 C90 320 140 230 190 120 C220 50 250 10 260 -10" stroke="#D1BEA5" strokeWidth="1.5" strokeLinecap="round" opacity="0.55" />
          
          {/* Side twigs */}
          <path d="M120 220 C145 195 170 180 200 175" stroke="#C2AE93" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
          <path d="M90 280 C120 260 155 250 185 248" stroke="#C2AE93" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
          <path d="M60 340 C95 325 130 320 165 315" stroke="#C2AE93" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
          
          {/* Gentle leaves & flower buds */}
          <ellipse cx="160" cy="150" rx="14" ry="7" transform="rotate(-35 160 150)" fill="#EADDCB" opacity="0.7" />
          <ellipse cx="200" cy="175" rx="16" ry="8" transform="rotate(-15 200 175)" fill="#E4D5C1" opacity="0.65" />
          <ellipse cx="185" cy="248" rx="18" ry="9" transform="rotate(-10 185 248)" fill="#EFE5D7" opacity="0.75" />
          <ellipse cx="140" cy="200" rx="12" ry="6" transform="rotate(-40 140 200)" fill="#E4D5C1" opacity="0.65" />
          <ellipse cx="105" cy="270" rx="15" ry="7" transform="rotate(-30 105 270)" fill="#EADDCB" opacity="0.7" />
          <ellipse cx="165" cy="315" rx="20" ry="9" transform="rotate(-8 165 315)" fill="#E8D9C6" opacity="0.65" />
          <ellipse cx="120" cy="330" rx="16" ry="7" transform="rotate(-20 120 330)" fill="#EFE5D7" opacity="0.75" />

          {/* Delicate baby's breath flower clusters */}
          <circle cx="210" cy="20" r="3.5" fill="#C2AE93" opacity="0.8" />
          <circle cx="218" cy="15" r="2.5" fill="#EADDCB" opacity="0.9" />
          <circle cx="204" cy="26" r="3" fill="#D9C7B2" opacity="0.7" />
          <circle cx="260" cy="-10" r="3.5" fill="#C2AE93" opacity="0.8" />
          <circle cx="202" cy="173" r="3" fill="#D1BEA5" opacity="0.8" />
          <circle cx="188" cy="246" r="3" fill="#C2AE93" opacity="0.8" />
        </svg>
      </div>

      {/* MOBILE TOP BAR */}
      <header className="lg:hidden bg-white/95 backdrop-blur-md border-b border-[#EADDCB] px-4 py-3 sticky top-0 z-30 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-xl text-[#78695A] hover:bg-[#F3EDE2] transition"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <span className="font-serif font-bold text-base text-[#2D241E]">
            Studio Quản Lý Thiệp
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowQuickFill(true)}
            className="p-1.5 rounded-full bg-[#F3EDE2] text-[#8C6D45] text-xs font-semibold flex items-center gap-1 px-2.5"
            title="Hồ sơ cưới"
          >
            <Heart className="w-3.5 h-3.5 fill-[#C29D67] text-[#C29D67]" />
            <span className="hidden sm:inline">Hồ sơ cưới</span>
          </button>
          <div className="w-8 h-8 rounded-full bg-[#E82561] text-white font-bold text-xs flex items-center justify-center shadow-xs">
            {user?.name ? user.name.charAt(0).toUpperCase() : "T"}
          </div>
        </div>
      </header>

      {/* DASHBOARD LAYOUT CONTAINER */}
      <div className="flex-1 flex max-w-[1400px] w-full mx-auto relative z-10">
        {/* ======================================================== */}
        {/* LEFT SIDEBAR (STICKY ON DESKTOP, DRAWER ON MOBILE)       */}
        {/* ======================================================== */}
        <aside
          className={`
            fixed lg:sticky top-0 lg:top-0 h-screen z-40 lg:z-10
            w-68 sm:w-72 bg-[#F9F5EE]/95 lg:bg-transparent backdrop-blur-md lg:backdrop-blur-none
            flex flex-col justify-between p-5 sm:p-6 transition-transform duration-300
            ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          `}
        >
          <div className="space-y-6">
            {/* USER PROFILE BOX (MATCHING SCREENSHOT) */}
            <div
              onClick={() => setActiveTab("account")}
              className="bg-white/95 rounded-2xl p-3.5 border border-[#EFE5D8] shadow-xs hover:shadow-sm transition cursor-pointer relative overflow-hidden flex items-center justify-between group"
            >
              {/* Subtle botanical branch watermark in corner of card */}
              <div className="absolute right-0 bottom-0 w-16 h-16 pointer-events-none opacity-40">
                <svg viewBox="0 0 100 100" fill="none" className="w-full h-full">
                  <path d="M40 90 C60 60 75 40 90 20" stroke="#C2AE93" strokeWidth="1.5" />
                  <ellipse cx="65" cy="50" rx="8" ry="4" transform="rotate(-30 65 50)" fill="#EADDCB" />
                  <ellipse cx="80" cy="30" rx="7" ry="3.5" transform="rotate(-20 80 30)" fill="#D9C7B2" />
                </svg>
              </div>

              <div className="flex items-center gap-3 relative z-10 overflow-hidden">
                {/* Avatar with bright rose-red circle (like screenshot) */}
                <div className="w-11 h-11 rounded-full bg-[#E82561] text-white font-bold text-base flex items-center justify-center shrink-0 shadow-xs">
                  {user?.name ? user.name.charAt(0).toUpperCase() : "T"}
                </div>
                <div className="overflow-hidden">
                  <h4 className="text-xs font-bold text-[#2B2118] truncate group-hover:text-[#8C6239] transition">
                    {user?.name || "Trần Hoài Bảo"}
                  </h4>
                  <p className="text-[11px] text-[#8E7E70] truncate max-w-[115px]">
                    {user?.email || "baohoaitran3112@gm..."}
                  </p>
                </div>
              </div>

              <ChevronRight className="w-4 h-4 text-[#8E7E70] group-hover:translate-x-0.5 transition-transform shrink-0 relative z-10" />
            </div>

            {/* SIDEBAR NAVIGATION GROUP */}
            <div>
              <p className="text-xs font-semibold text-[#8E7E70] px-2 pb-3 select-none">
                Thiệp của tôi
              </p>
              <nav className="space-y-1.5">
                {/* 1. THIỆP CƯỚI (ACTIVE HIGHLIGHT MATCHING SCREENSHOT) */}
                <button
                  onClick={() => {
                    setActiveTab("cards");
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm transition cursor-pointer relative ${
                    activeTab === "cards"
                      ? "bg-[#F0E6D8] border border-[#E2D5C3]/70 text-[#2B2118] font-bold shadow-2xs"
                      : "text-[#5C4D40] hover:bg-[#F3ECE2]/80 hover:text-[#2B2118] font-medium"
                  }`}
                >
                  {/* Thick vertical active bar on the left edge (like screenshot) */}
                  {activeTab === "cards" && (
                    <span className="w-1 h-5 bg-[#8C6239] rounded-full absolute left-1" />
                  )}
                  <BookOpen
                    className={`w-4 h-4 shrink-0 ${
                      activeTab === "cards" ? "text-[#8C6239]" : "text-[#7A6B5D]"
                    }`}
                  />
                  <span>Thiệp cưới</span>
                </button>

                {/* 2. XÁC NHẬN THAM DỰ */}
                <button
                  onClick={() => {
                    setActiveTab("rsvp");
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm transition cursor-pointer relative ${
                    activeTab === "rsvp"
                      ? "bg-[#F0E6D8] border border-[#E2D5C3]/70 text-[#2B2118] font-bold shadow-2xs"
                      : "text-[#5C4D40] hover:bg-[#F3ECE2]/80 hover:text-[#2B2118] font-medium"
                  }`}
                >
                  {activeTab === "rsvp" && (
                    <span className="w-1 h-5 bg-[#8C6239] rounded-full absolute left-1" />
                  )}
                  <Armchair
                    className={`w-4 h-4 shrink-0 ${
                      activeTab === "rsvp" ? "text-[#8C6239]" : "text-[#7A6B5D]"
                    }`}
                  />
                  <span>Xác nhận tham dự</span>
                </button>

                {/* 3. SỔ LƯU BÚT */}
                <button
                  onClick={() => {
                    setActiveTab("wishes");
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm transition cursor-pointer relative ${
                    activeTab === "wishes"
                      ? "bg-[#F0E6D8] border border-[#E2D5C3]/70 text-[#2B2118] font-bold shadow-2xs"
                      : "text-[#5C4D40] hover:bg-[#F3ECE2]/80 hover:text-[#2B2118] font-medium"
                  }`}
                >
                  {activeTab === "wishes" && (
                    <span className="w-1 h-5 bg-[#8C6239] rounded-full absolute left-1" />
                  )}
                  <FileEdit
                    className={`w-4 h-4 shrink-0 ${
                      activeTab === "wishes" ? "text-[#8C6239]" : "text-[#7A6B5D]"
                    }`}
                  />
                  <span>Sổ lưu bút</span>
                </button>

                {/* 4. ƯU ĐÃI CỦA TÔI */}
                <button
                  onClick={() => {
                    setActiveTab("perks");
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm transition cursor-pointer relative ${
                    activeTab === "perks"
                      ? "bg-[#F0E6D8] border border-[#E2D5C3]/70 text-[#2B2118] font-bold shadow-2xs"
                      : "text-[#5C4D40] hover:bg-[#F3ECE2]/80 hover:text-[#2B2118] font-medium"
                  }`}
                >
                  {activeTab === "perks" && (
                    <span className="w-1 h-5 bg-[#8C6239] rounded-full absolute left-1" />
                  )}
                  <Ticket
                    className={`w-4 h-4 shrink-0 ${
                      activeTab === "perks" ? "text-[#8C6239]" : "text-[#7A6B5D]"
                    }`}
                  />
                  <span>Ưu đãi của tôi</span>
                </button>

                {/* 5. TÀI KHOẢN */}
                <button
                  onClick={() => {
                    setActiveTab("account");
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm transition cursor-pointer relative ${
                    activeTab === "account"
                      ? "bg-[#F0E6D8] border border-[#E2D5C3]/70 text-[#2B2118] font-bold shadow-2xs"
                      : "text-[#5C4D40] hover:bg-[#F3ECE2]/80 hover:text-[#2B2118] font-medium"
                  }`}
                >
                  {activeTab === "account" && (
                    <span className="w-1 h-5 bg-[#8C6239] rounded-full absolute left-1" />
                  )}
                  <User
                    className={`w-4 h-4 shrink-0 ${
                      activeTab === "account" ? "text-[#8C6239]" : "text-[#7A6B5D]"
                    }`}
                  />
                  <span>Tài khoản</span>
                </button>
              </nav>
            </div>
          </div>

          {/* SIDEBAR FOOTER */}
          <div className="space-y-2 pt-4 border-t border-[#EADDCB]/60">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-[#8C7662] hover:text-rose-700 hover:bg-rose-50/80 transition"
            >
              <LogOut className="w-4 h-4" />
              <span>Đăng xuất</span>
            </button>
          </div>
        </aside>

        {/* MOBILE OVERLAY BACKDROP */}
        {isMobileMenuOpen && (
          <div
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-stone-900/40 z-30 lg:hidden backdrop-blur-2xs"
          />
        )}

        {/* ======================================================== */}
        {/* MAIN CONTENT AREA                                        */}
        {/* ======================================================== */}
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
              <div>
                <h2 className="text-2xl font-serif font-bold text-[#2B2118]">
                  Thông tin tài khoản
                </h2>
                <p className="text-xs text-[#8E7E70] mt-0.5">
                  Quản lý thông tin cá nhân và hồ sơ cưới lưu trữ của tài khoản
                </p>
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
                    <span className="inline-block mt-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                      Thành viên chính thức
                    </span>
                  </div>
                </div>
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
