"use client";

import React, { useState, useEffect } from "react";
import { Camera, Tv, Sparkles, Heart, MessageCircle } from "lucide-react";
import { ApiClient } from "@/lib/api";
import { WeddingMemory } from "@/types/wedding-memory.types";
import { PhotoboothModal } from "./PhotoboothModal";

interface PhotoWallSectionProps {
  slug: string;
  coupleName: string;
  weddingDate?: string;
  monogram?: string;
  defaultGuestName?: string;
  primaryColor?: string;
}

export function PhotoWallSection({
  slug,
  coupleName,
  weddingDate,
  monogram,
  defaultGuestName,
  primaryColor = "#D4AF37",
}: PhotoWallSectionProps) {
  const [memories, setMemories] = useState<WeddingMemory[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Tải danh sách ảnh kỷ niệm
  useEffect(() => {
    let isMounted = true;
    ApiClient.getWeddingMemories<WeddingMemory[]>(slug)
      .then((res) => {
        if (!isMounted) return;
        if (res.success && Array.isArray(res.data)) {
          setMemories(res.data);
        }
      })
      .catch((err) => console.warn("Lỗi tải ảnh photobooth:", err))
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [slug]);

  return (
    <section className="py-14 px-4 sm:px-6 relative overflow-hidden bg-gradient-to-b from-[#FAF8F5] via-white to-[#FAF8F5]">
      <div className="max-w-4xl mx-auto">
        {/* HEADER TIÊU ĐỀ */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Khoảnh Khắc Kỷ Niệm</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 tracking-tight">
            Bức Tường Ảnh Tiệc Cưới &amp; Photobooth
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 max-w-md mx-auto mt-2 leading-relaxed">
            Chụp ảnh selfie tại bàn tiệc để gửi ảnh và lời chúc xuất hiện trực tiếp lên màn hình LED sân khấu!
          </p>

          {/* CẶP NÚT ACTION: CHỤP ẢNH & XEM MÀN HÌNH LED */}
          <div className="flex flex-wrap items-center justify-center gap-3 mt-5">
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="px-5 py-2.5 rounded-full bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition flex items-center gap-2 cursor-pointer"
            >
              <Camera className="w-4 h-4" />
              <span>Chụp ảnh kỷ niệm ngay</span>
            </button>

            <a
              href={`/thiep/${slug}/live`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 rounded-full bg-stone-900 hover:bg-black text-white font-bold text-xs sm:text-sm shadow-md transition flex items-center gap-2 cursor-pointer"
            >
              <Tv className="w-4 h-4 text-amber-400" />
              <span>Xem Màn Hình LED Chiếu Sân Khấu</span>
            </a>
          </div>
        </div>

        {/* LƯỚI ẢNH KỶ NIỆM (POLAROID MOSAIC STYLE) */}
        {loading ? (
          <div className="py-12 text-center text-xs text-stone-400">
            Đang tải những khoảnh khắc kỷ niệm...
          </div>
        ) : memories.length === 0 ? (
          <div
            onClick={() => setIsModalOpen(true)}
            className="py-12 px-6 rounded-3xl border-2 border-dashed border-stone-200 bg-stone-50/50 text-center cursor-pointer hover:border-amber-300 transition"
          >
            <Camera className="w-10 h-10 text-stone-300 mx-auto mb-2" />
            <p className="text-xs sm:text-sm font-bold text-stone-700">
              Chưa có bức ảnh nào được gửi lên
            </p>
            <p className="text-[11px] text-stone-400 mt-1">
              Hãy là người đầu tiên chụp ảnh check-in và gửi lời chúc lên màn hình nhé!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
            {memories.map((item, idx) => {
              // Xoay nhẹ ảnh ngẫu nhiên tạo cảm giác dán tường tự nhiên
              const rotate = idx % 2 === 0 ? "rotate-1 hover:rotate-0" : "-rotate-1 hover:rotate-0";

              return (
                <div
                  key={item.id}
                  className={`bg-white p-2.5 pb-4 rounded-2xl shadow-md border border-stone-200/80 transition-all duration-300 transform ${rotate} hover:shadow-xl hover:scale-105 flex flex-col`}
                >
                  {/* Khung ảnh */}
                  <div className="aspect-square rounded-xl overflow-hidden bg-stone-100 relative">
                    <img
                      src={item.photoUrl}
                      alt={item.senderName}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>

                  {/* Thông tin người gửi & lời chúc */}
                  <div className="mt-2.5 px-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-bold text-stone-900 truncate">
                        {item.senderName}
                      </span>
                      {item.relationship && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 font-medium shrink-0">
                          {item.relationship}
                        </span>
                      )}
                    </div>

                    {item.message && (
                      <p className="text-[11px] text-stone-600 line-clamp-2 mt-1 leading-snug italic font-serif">
                        &ldquo;{item.message}&rdquo;
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MODAL PHOTOBOOTH */}
      <PhotoboothModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        slug={slug}
        coupleName={coupleName}
        weddingDate={weddingDate}
        monogram={monogram}
        defaultGuestName={defaultGuestName}
        onSuccess={(newMem) => {
          setMemories((prev) => [newMem, ...prev]);
        }}
      />
    </section>
  );
}
