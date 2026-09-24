"use client";

import React, { useState } from "react";
import { Sparkles, Check, ChevronRight } from "lucide-react";
import { useEditor } from "../EditorContext";

interface StockItem {
  id: string;
  title: string;
  cat: "wedding" | "vietnam" | "character" | "flower" | "hy" | "heart";
  icon: string;
  color?: string;
  width?: number;
  height?: number;
  isWide?: boolean;
}

const CATEGORIES = [
  { id: "all", label: "Tất cả" },
  { id: "wedding", label: "Yếu tố đám cưới" },
  { id: "character", label: "Nhân vật" },
  { id: "flower", label: "Hoa cưới" },
  { id: "hy", label: "Chữ hỷ" },
  { id: "heart", label: "Trái tim" },
  { id: "vietnam", label: "Văn hóa Việt" },
] as const;

type CategoryId = (typeof CATEGORIES)[number]["id"];

const STOCK_ITEMS: StockItem[] = [
  // ── 1. YẾU TỐ ĐÁM CƯỚI ──
  { id: "w1", title: "Chân nến cổ điển", cat: "wedding", icon: "🕯️" },
  { id: "w2", title: "Bách Niên Hảo Hợp", cat: "wedding", icon: "百年好合", color: "#8B1E0F", isWide: true },
  { id: "w3", title: "Giỏ hoa pastel", cat: "wedding", icon: "🧺" },
  { id: "w4", title: "Cành hoa cưới", cat: "wedding", icon: "💐" },
  { id: "w5", title: "Lời yêu thương", cat: "wedding", icon: "喜欢你", color: "#D946EF", isWide: true },
  { id: "w6", title: "Ruy băng hồng", cat: "wedding", icon: "🎀" },
  { id: "w7", title: "Cặp nhẫn cưới kim cương", cat: "wedding", icon: "💍" },
  { id: "w8", title: "Ly rượu mừng", cat: "wedding", icon: "🥂" },
  { id: "w9", title: "Bồ câu trắng", cat: "wedding", icon: "🕊️" },
  { id: "w10", title: "Chuông cưới vàng", cat: "wedding", icon: "🔔" },

  // ── 2. VĂN HÓA VIỆT ──
  { id: "vn1", title: "Cột cờ Hà Nội", cat: "vietnam", icon: "🏛️" },
  { id: "vn2", title: "Ngày hội 30/4", cat: "vietnam", icon: "30/4", color: "#D4AF37", isWide: true },
  { id: "vn3", title: "Họa tiết Trống Đồng", cat: "vietnam", icon: "🪙", color: "#BE944E" },
  { id: "vn4", title: "Cờ đỏ sao vàng", cat: "vietnam", icon: "🇻🇳" },
  { id: "vn5", title: "Nón lá bài thơ", cat: "vietnam", icon: "👒" },
  { id: "vn6", title: "Hoa sen hồng", cat: "vietnam", icon: "🪷" },
  { id: "vn7", title: "Chim Lạc hoàng cung", cat: "vietnam", icon: "🦅", color: "#BE944E" },
  { id: "vn8", title: "Đường kẻ gấm Á Đông", cat: "vietnam", icon: "❖ ❖ ❖", color: "#BE944E", isWide: true },

  // ── 3. NHÂN VẬT ──
  { id: "c1", title: "Chú rể áo vest", cat: "character", icon: "🤵" },
  { id: "c2", title: "Cô dâu váy cưới", cat: "character", icon: "👰" },
  { id: "c3", title: "Chú rể Áo Dài đỏ", cat: "character", icon: "🤴" },
  { id: "c4", title: "Cô dâu Khăn Đóng đỏ", cat: "character", icon: "👸" },
  { id: "c5", title: "Cặp đôi tay trong tay", cat: "character", icon: "👩‍❤️‍👨" },
  { id: "c6", title: "Chụp ảnh cưới", cat: "character", icon: "📸" },
  { id: "c7", title: "Khiêu vũ ngày cưới", cat: "character", icon: "💃🕺" },
  { id: "c8", title: "Thần tình yêu Cupid", cat: "character", icon: "👼" },

  // ── 4. HOA CƯỚI ──
  { id: "f1", title: "Bó hoa hồng đỏ", cat: "flower", icon: "🌹" },
  { id: "f2", title: "Hoa Tulip thanh lịch", cat: "flower", icon: "🌷" },
  { id: "f3", title: "Cành lá bạch đàn", cat: "flower", icon: "🌿" },
  { id: "f4", title: "Hoa anh đào hồng", cat: "flower", icon: "🌸" },
  { id: "f5", title: "Hoa hướng dương", cat: "flower", icon: "🌻" },
  { id: "f6", title: "Hoa mẫu đơn quý phái", cat: "flower", icon: "🌺" },

  // ── 5. CHỮ HỶ ──
  { id: "h1", title: "Chữ Hỷ Song Hỷ Đỏ", cat: "hy", icon: "囍", color: "#DC2626" },
  { id: "h2", title: "Chữ Hỷ Mạ Vàng", cat: "hy", icon: "囍", color: "#D4AF37" },
  { id: "h3", title: "Chữ Hỷ Tròn Nghệ Thuật", cat: "hy", icon: "💮囍💮", color: "#DC2626", isWide: true },
  { id: "h4", title: "Bách Niên Giai Lão", cat: "hy", icon: "百年偕老", color: "#991B1B", isWide: true },
  { id: "h5", title: "Loan Phụng Hòa Minh", cat: "hy", icon: "鸞鳳和鳴", color: "#991B1B", isWide: true },
  { id: "h6", title: "Hỷ Lồng Hoa Mẫu Đơn", cat: "hy", icon: "🌺囍🌺", color: "#DC2626", isWide: true },

  // ── 6. TRÁI TIM ──
  { id: "ht1", title: "Trái tim pha lê 3D", cat: "heart", icon: "💖" },
  { id: "ht2", title: "Trái tim đôi", cat: "heart", icon: "💕" },
  { id: "ht3", title: "Mũi tên tình yêu", cat: "heart", icon: "💘" },
  { id: "ht4", title: "Bong bóng trái tim", cat: "heart", icon: "🎈" },
  { id: "ht5", title: "Hộp quà trái tim", cat: "heart", icon: "💝" },
  { id: "ht6", title: "Trái tim ánh sao", cat: "heart", icon: "✨❤️✨", isWide: true },
];

export function StockTool() {
  const [activeTab, setActiveTab] = useState<CategoryId>("all");
  const [recentlyAddedId, setRecentlyAddedId] = useState<string | null>(null);
  const { addStockElement } = useEditor();

  const handleAdd = (item: StockItem) => {
    addStockElement({
      id: item.id,
      title: item.title,
      icon: item.icon,
      color: item.color,
      width: item.id === "w1" ? 140 : item.isWide ? 150 : 100,
      height: item.id === "w1" ? 160 : item.isWide ? 80 : 100,
    });
    setRecentlyAddedId(item.id);
    setTimeout(() => {
      setRecentlyAddedId((curr) => (curr === item.id ? null : curr));
    }, 1200);
  };

  const renderItemButton = (item: StockItem) => {
    const isJustAdded = recentlyAddedId === item.id;
    return (
      <button
        key={item.id}
        type="button"
        draggable={true}
        onDragStart={(e) => {
          const payload = {
            type: "stock",
            stockId: item.id,
            icon: item.icon,
            title: item.title,
            color: item.color,
            isWide: item.isWide,
            width: item.id === "w1" ? 140 : item.isWide ? 150 : 100,
            height: item.id === "w1" ? 160 : item.isWide ? 80 : 100,
          };
          if (typeof window !== "undefined") {
            (window as any).__DRAGGED_STOCK_ITEM__ = payload;
          }
          try {
            e.dataTransfer.setData("text/plain", JSON.stringify(payload));
            e.dataTransfer.setData("application/json", JSON.stringify(payload));
          } catch {}
          e.dataTransfer.effectAllowed = "copy";
        }}
        onClick={() => handleAdd(item)}
        className={`p-3 rounded-2xl border text-center transition cursor-grab active:cursor-grabbing group shadow-2xs relative flex flex-col items-center justify-between active:scale-95 min-h-[96px] ${
          isJustAdded
            ? "bg-emerald-50 border-emerald-400 ring-2 ring-emerald-300"
            : "border-stone-200 bg-white hover:bg-amber-50/60 hover:border-amber-300"
        }`}
      >
        <div className="w-full flex-1 flex items-center justify-center py-1">
          {item.id === "w1" ? (
            <div className="size-10 flex items-center justify-center transition transform group-hover:scale-110">
              <svg viewBox="0 0 100 120" className="w-full h-full object-contain drop-shadow-sm">
                <ellipse cx="50" cy="112" rx="20" ry="5" fill="#8BB8D4" />
                <rect x="47" y="55" width="6" height="57" rx="3" fill="#8BB8D4" />
                <path d="M 25 70 Q 25 90 50 90 Q 75 90 75 70" stroke="#8BB8D4" strokeWidth="6" fill="none" strokeLinecap="round" />
                <rect x="22" y="44" width="6" height="25" rx="2" fill="#FEF9E7" stroke="#8BB8D4" strokeWidth="1" />
                <rect x="47" y="28" width="6" height="25" rx="2" fill="#FEF9E7" stroke="#8BB8D4" strokeWidth="1" />
                <rect x="72" y="44" width="6" height="25" rx="2" fill="#FEF9E7" stroke="#8BB8D4" strokeWidth="1" />
                <ellipse cx="25" cy="36" rx="3.5" ry="6.5" fill="#F59E0B" />
                <ellipse cx="50" cy="20" rx="4" ry="7.5" fill="#F59E0B" />
                <ellipse cx="75" cy="36" rx="3.5" ry="6.5" fill="#F59E0B" />
              </svg>
            </div>
          ) : (
            <span
              style={{ color: item.color }}
              className={`transition transform group-hover:scale-110 drop-shadow-sm select-none leading-none ${
                item.isWide ? "text-base font-serif font-bold tracking-wider" : "text-3xl"
              }`}
            >
              {item.icon}
            </span>
          )}
        </div>
        <div className="w-full pt-1 border-t border-stone-100 flex flex-col items-center">
          <p className="text-[10px] font-bold text-stone-700 leading-tight truncate max-w-full">
            {item.title}
          </p>
          <span
            className={`text-[8px] mt-0.5 font-semibold flex items-center gap-0.5 ${
              isJustAdded ? "text-emerald-700" : "text-amber-700 opacity-80 group-hover:opacity-100"
            }`}
          >
            {isJustAdded ? (
              <>
                <Check className="size-2" /> Đã thêm
              </>
            ) : (
              "+ Kéo hoặc chạm"
            )}
          </span>
        </div>
      </button>
    );
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-1">
          Kho Ảnh Minh Họa & Sticker (Stock)
        </h3>
        <p className="text-[11px] text-stone-400">
          Kéo thả trực tiếp vào thiệp hoặc chạm để thêm các yếu tố trang trí.
        </p>
      </div>

      {/* ── CATEGORY PILLS (SCROLLABLE) ── */}
      <div className="flex gap-1.5 p-1 bg-stone-100 rounded-xl overflow-x-auto no-scrollbar">
        {CATEGORIES.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setActiveTab(c.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
              activeTab === c.id
                ? "bg-white text-stone-900 shadow-2xs font-bold"
                : "text-stone-500 hover:text-stone-800"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* ── ALL CATEGORIES VIEW (GROUPED WITH 'XEM THÊM') ── */}
      {activeTab === "all" ? (
        <div className="space-y-5">
          {/* Section: Yếu tố đám cưới */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-800 uppercase tracking-wide">
                Yếu tố đám cưới
              </span>
              <button
                type="button"
                onClick={() => setActiveTab("wedding")}
                className="text-[11px] font-semibold text-stone-400 hover:text-amber-700 flex items-center transition cursor-pointer"
              >
                Xem thêm <ChevronRight className="size-3" />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {STOCK_ITEMS.filter((i) => i.cat === "wedding")
                .slice(0, 6)
                .map(renderItemButton)}
            </div>
          </div>

          {/* Section: Văn hóa Việt */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-800 uppercase tracking-wide">
                Văn hóa Việt
              </span>
              <button
                type="button"
                onClick={() => setActiveTab("vietnam")}
                className="text-[11px] font-semibold text-stone-400 hover:text-amber-700 flex items-center transition cursor-pointer"
              >
                Xem thêm <ChevronRight className="size-3" />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {STOCK_ITEMS.filter((i) => i.cat === "vietnam")
                .slice(0, 6)
                .map(renderItemButton)}
            </div>
          </div>

          {/* Section: Nhân vật */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-800 uppercase tracking-wide">
                Nhân vật
              </span>
              <button
                type="button"
                onClick={() => setActiveTab("character")}
                className="text-[11px] font-semibold text-stone-400 hover:text-amber-700 flex items-center transition cursor-pointer"
              >
                Xem thêm <ChevronRight className="size-3" />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {STOCK_ITEMS.filter((i) => i.cat === "character")
                .slice(0, 6)
                .map(renderItemButton)}
            </div>
          </div>

          {/* Section: Hoa cưới */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-800 uppercase tracking-wide">
                Hoa cưới
              </span>
              <button
                type="button"
                onClick={() => setActiveTab("flower")}
                className="text-[11px] font-semibold text-stone-400 hover:text-amber-700 flex items-center transition cursor-pointer"
              >
                Xem thêm <ChevronRight className="size-3" />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {STOCK_ITEMS.filter((i) => i.cat === "flower")
                .slice(0, 6)
                .map(renderItemButton)}
            </div>
          </div>

          {/* Section: Chữ Hỷ */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-800 uppercase tracking-wide">
                Chữ Hỷ
              </span>
              <button
                type="button"
                onClick={() => setActiveTab("hy")}
                className="text-[11px] font-semibold text-stone-400 hover:text-amber-700 flex items-center transition cursor-pointer"
              >
                Xem thêm <ChevronRight className="size-3" />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {STOCK_ITEMS.filter((i) => i.cat === "hy")
                .slice(0, 6)
                .map(renderItemButton)}
            </div>
          </div>

          {/* Section: Trái tim */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-800 uppercase tracking-wide">
                Trái tim
              </span>
              <button
                type="button"
                onClick={() => setActiveTab("heart")}
                className="text-[11px] font-semibold text-stone-400 hover:text-amber-700 flex items-center transition cursor-pointer"
              >
                Xem thêm <ChevronRight className="size-3" />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {STOCK_ITEMS.filter((i) => i.cat === "heart")
                .slice(0, 6)
                .map(renderItemButton)}
            </div>
          </div>
        </div>
      ) : (
        /* ── SINGLE CATEGORY FILTERED VIEW ── */
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-800">
              {CATEGORIES.find((c) => c.id === activeTab)?.label}
            </span>
            <button
              type="button"
              onClick={() => setActiveTab("all")}
              className="text-[11px] font-semibold text-amber-700 hover:underline cursor-pointer"
            >
              ← Về tất cả
            </button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {STOCK_ITEMS.filter((i) => i.cat === activeTab).map(renderItemButton)}
          </div>
        </div>
      )}
    </div>
  );
}
