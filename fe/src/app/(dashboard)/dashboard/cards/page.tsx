"use client";

import React, { useState, useEffect } from "react";
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
  Home,
  HeartHandshake,
  MailOpen,
  Sparkle,
} from "lucide-react";

export default function MyCardsPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [cards, setCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchCards = async () => {
    setLoading(true);
    const res = await ApiClient.request("/cards/my-cards");
    if (res.success && Array.isArray(res.data)) {
      setCards(res.data);
    } else {
      // Dữ liệu mẫu demo nếu chưa kết nối backend
      setCards([
        {
          id: "demo-card-1",
          slug: "quan-va-ha-wedding",
          cardCategory: "WEDDING",
          status: "ACTIVE",
          plan: { code: "VIP", name: "Gói VIP" },
          viewCount: 1420,
          createdAt: new Date(),
          _count: { rsvpResponses: 86, wishes: 42, guests: 120 },
        },
        {
          id: "demo-card-2",
          slug: "thoi-noi-be-dau",
          cardCategory: "NEWBORN",
          status: "ACTIVE",
          plan: { code: "BASIC", name: "Gói Tiêu Chuẩn" },
          viewCount: 380,
          createdAt: new Date(),
          _count: { rsvpResponses: 25, wishes: 18, guests: 35 },
        },
      ]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCards();
  }, []);

  const handleCopyLink = (slug: string, id: string) => {
    const fullUrl = `${window.location.origin}/thiep/${slug}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-stone-800 selection:bg-amber-100 selection:text-amber-900">
      {/* TOP NAVIGATION BAR */}
      <header className="bg-white border-b border-stone-200/80 sticky top-0 z-30 shadow-2xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-2 text-stone-700 hover:text-stone-900 transition group"
              title="Về Trang Chủ"
            >
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center group-hover:scale-105 transition">
                <MailOpen className="w-5 h-5" />
              </div>
              <span className="font-serif font-bold text-lg text-stone-900 tracking-tight">
                CardVite
              </span>
            </Link>
            <span className="text-stone-300">/</span>
            <span className="text-xs font-semibold text-stone-500 bg-stone-100 px-2.5 py-1 rounded-full">
              Studio Quản Lý Thiệp
            </span>
          </div>

          {/* USER PROFILE & ACTIONS */}
          <div className="flex items-center gap-3">
            {user && (
              <div className="flex items-center gap-2 bg-stone-100/80 px-3 py-1.5 rounded-full border border-stone-200/60">
                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-amber-400 to-rose-400 text-white font-bold text-xs flex items-center justify-center">
                  {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                </div>
                <span className="text-xs font-semibold text-stone-700 max-w-[120px] truncate sm:max-w-none">
                  {user.name || user.email}
                </span>
              </div>
            )}

            <button
              onClick={handleLogout}
              className="p-2 rounded-xl text-stone-500 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
              title="Đăng xuất"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="max-w-6xl mx-auto p-4 sm:p-8 space-y-8">
        {/* HERO TITLE & CALL TO ACTION */}
        <div className="bg-gradient-to-r from-stone-900 via-stone-800 to-amber-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          {/* Decorative glows */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-rose-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[11px] font-bold uppercase tracking-wider flex items-center gap-1 border border-amber-400/30">
                <Sparkle className="w-3 h-3 fill-amber-300" />
                <span>Host Dashboard</span>
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-serif tracking-tight text-stone-100">
              Danh Sách Thiệp Của {user?.name ? user.name : "Bạn"}
            </h1>
            <p className="text-stone-300 text-xs sm:text-sm max-w-xl">
              Tạo mới, tuỳ chỉnh phong bì 3D, album ảnh, upload nhạc MP3 và quản lý danh sách khách mời RSVP chuyên nghiệp.
            </p>
          </div>

          <Link
            href="/dashboard/cards/new"
            className="relative z-10 inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-stone-950 font-bold text-xs sm:text-sm rounded-2xl shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 transition transform hover:-translate-y-0.5 cursor-pointer self-start sm:self-auto shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Tạo Thiệp Mới</span>
          </Link>
        </div>

        {/* LOADING STATE */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
            {[1, 2].map((i) => (
              <div key={i} className="bg-white rounded-3xl p-6 border border-stone-200 h-64 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="h-6 bg-stone-200 rounded-full w-24" />
                  <div className="h-5 bg-stone-200 rounded w-48" />
                  <div className="h-4 bg-stone-100 rounded w-32" />
                </div>
                <div className="h-16 bg-stone-100 rounded-2xl" />
                <div className="h-10 bg-stone-200 rounded-xl" />
              </div>
            ))}
          </div>
        )}

        {/* EMPTY STATE */}
        {!loading && cards.length === 0 && (
          <div className="bg-white rounded-3xl p-12 border border-stone-200/80 shadow-sm text-center max-w-lg mx-auto my-8 space-y-5">
            <div className="w-20 h-20 rounded-full bg-amber-50 text-amber-500 mx-auto flex items-center justify-center shadow-inner">
              <MailOpen className="w-10 h-10 stroke-[1.5]" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold font-serif text-stone-900">
                Chưa có thiệp nào được tạo
              </h3>
              <p className="text-xs sm:text-sm text-stone-500 leading-relaxed">
                Hãy bắt đầu tạo tấm thiệp điện tử đầu tiên dành cho ngày vui của bạn với đầy đủ album ảnh, nhạc nền MP3 và RSVP!
              </p>
            </div>
            <Link
              href="/dashboard/cards/new"
              className="inline-flex items-center gap-2 px-6 py-3 bg-stone-900 hover:bg-black text-white font-semibold text-xs sm:text-sm rounded-xl shadow-md transition"
            >
              <Plus className="w-4 h-4" />
              <span>Bắt Đầu Tạo Thiệp Ngay</span>
            </Link>
          </div>
        )}

        {/* CARDS LIST GRID */}
        {!loading && cards.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {cards.map((card) => (
              <div
                key={card.id}
                className="bg-white rounded-3xl p-6 sm:p-7 border border-stone-200/80 shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  {/* CARD TAGS */}
                  <div className="flex items-center justify-between mb-4">
                    <span
                      className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                        card.cardCategory === "WEDDING"
                          ? "bg-rose-50 text-rose-700 border border-rose-200"
                          : card.cardCategory === "BIRTHDAY"
                          ? "bg-amber-50 text-amber-700 border border-amber-200"
                          : "bg-sky-50 text-sky-700 border border-sky-200"
                      }`}
                    >
                      {card.cardCategory === "WEDDING"
                        ? "💍 Thiệp Cưới"
                        : card.cardCategory === "BIRTHDAY"
                        ? "🎂 Thiệp Sinh Nhật"
                        : "👶 Thôi Nôi / Báo Hỷ"}
                    </span>

                    <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-900 text-[11px] font-bold border border-amber-200/60">
                      <Crown className="w-3.5 h-3.5 text-amber-600" />
                      <span>{card.plan?.name || "Gói VIP"}</span>
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-stone-900 font-serif mb-1 group-hover:text-amber-700 transition">
                    /thiep/{card.slug}
                  </h3>
                  <p className="text-xs text-stone-400">
                    Khởi tạo: {new Date(card.createdAt).toLocaleDateString("vi-VN")}
                  </p>

                  {/* QUICK STATS */}
                  <div className="grid grid-cols-3 gap-2 my-5 p-3.5 rounded-2xl bg-stone-50/80 border border-stone-100 text-center">
                    <div>
                      <span className="text-[11px] text-stone-500 block font-medium">Lượt xem</span>
                      <span className="text-base font-bold text-stone-900">
                        {card.viewCount || 0}
                      </span>
                    </div>
                    <div>
                      <span className="text-[11px] text-stone-500 block font-medium">Khách RSVP</span>
                      <span className="text-base font-bold text-emerald-600">
                        {card._count?.rsvpResponses || 0}
                      </span>
                    </div>
                    <div>
                      <span className="text-[11px] text-stone-500 block font-medium">Lời chúc</span>
                      <span className="text-base font-bold text-amber-600">
                        {card._count?.wishes || 0}
                      </span>
                    </div>
                  </div>
                </div>

                {/* ACTION BUTTONS */}
                <div className="pt-4 border-t border-stone-100 flex items-center justify-between gap-2 text-xs font-semibold">
                  <button
                    onClick={() => handleCopyLink(card.slug, card.id)}
                    className="px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                  >
                    {copiedId === card.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700 font-bold">Đã chép</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-stone-500" />
                        <span>Chép link</span>
                      </>
                    )}
                  </button>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/dashboard/cards/${card.id}/edit`}
                      className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl transition flex items-center gap-1.5 shadow-2xs"
                      title="Chỉnh sửa chi tiết thiệp"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      <span>Chỉnh sửa</span>
                    </Link>

                    <Link
                      href={`/dashboard/cards/${card.id}/rsvp`}
                      className="px-3.5 py-2 bg-stone-900 hover:bg-black text-white rounded-xl transition flex items-center gap-1.5 shadow-2xs"
                    >
                      <Users className="w-3.5 h-3.5" />
                      <span>RSVP</span>
                    </Link>

                    <Link
                      href={`/thiep/${card.slug}`}
                      target="_blank"
                      className="p-2 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-100 transition"
                      title="Xem thiệp thực tế"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
