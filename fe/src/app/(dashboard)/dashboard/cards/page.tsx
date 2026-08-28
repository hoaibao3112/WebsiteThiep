"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ApiClient } from "@/lib/api";
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
} from "lucide-react";

export default function MyCardsPage() {
  const [cards, setCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchCards = async () => {
    setLoading(true);
    const res = await ApiClient.request("/cards/my-cards");
    if (res.success && res.data) {
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

  return (
    <div className="min-h-screen bg-stone-50 p-4 sm:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold font-serif text-stone-900">
              Danh Sách Thiệp Của Bạn
            </h1>
            <p className="text-xs text-stone-500 mt-0.5">
              Quản lý thiệp mời, theo dõi số lượt xem và phản hồi khách mời
            </p>
          </div>

          <Link
            href="/dashboard/cards/new"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold shadow-md transition cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Tạo Thiệp Mới</span>
          </Link>
        </div>

        {/* DANH SÁCH THIỆP */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {cards.map((card) => (
            <div
              key={card.id}
              className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-xs hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
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
                      ? "Thiệp Cưới"
                      : card.cardCategory === "BIRTHDAY"
                      ? "Thiệp Sinh Nhật"
                      : "Thiệp Báo Hỷ / Thôi Nôi"}
                  </span>

                  <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100/70 text-amber-900 text-[11px] font-bold">
                    <Crown className="w-3 h-3 text-amber-600" />
                    <span>{card.plan?.name || "Gói VIP"}</span>
                  </span>
                </div>

                <h3 className="text-lg font-bold text-stone-900 font-serif mb-1">
                  /thiep/{card.slug}
                </h3>
                <p className="text-xs text-stone-400">
                  Ngày tạo: {new Date(card.createdAt).toLocaleDateString("vi-VN")}
                </p>

                {/* THỐNG KÊ NHANH */}
                <div className="grid grid-cols-3 gap-2 my-5 p-3 rounded-2xl bg-stone-50 text-center">
                  <div>
                    <span className="text-xs text-stone-500 block">Lượt xem</span>
                    <span className="text-base font-bold text-stone-900">
                      {card.viewCount || 0}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-stone-500 block">RSVP</span>
                    <span className="text-base font-bold text-emerald-600">
                      {card._count?.rsvpResponses || 0}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-stone-500 block">Lời chúc</span>
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
                      <span>Đã chép link</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Chép link</span>
                    </>
                  )}
                </button>

                <div className="flex items-center gap-2">
                  <Link
                    href={`/dashboard/cards/${card.id}/rsvp`}
                    className="px-3.5 py-2 bg-stone-900 hover:bg-black text-white rounded-xl transition flex items-center gap-1.5"
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>Quản lý RSVP</span>
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
      </div>
    </div>
  );
}
