"use client";

import React, { useState, useRef, useEffect } from "react";
import { Check, ChevronRight, ChevronDown } from "lucide-react";
import { useEditor } from "../EditorContext";
import {
  STOCK_CATEGORIES,
  STOCK_CATALOG,
  StockItem,
  StockCategoryId,
} from "@/config/stock-catalog";

const PRIMARY_CATEGORY_IDS: StockCategoryId[] = [
  "all",
  "wedding",
  "character",
  "flower",
  "hy",
  "heart",
];

const MORE_CATEGORY_IDS: StockCategoryId[] = ["frames", "dividers", "vietnam"];

export function StockTool() {
  const [activeTab, setActiveTab] = useState<StockCategoryId>("all");
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [recentlyAddedId, setRecentlyAddedId] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { addStockElement } = useEditor();

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsMoreOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAdd = (item: StockItem) => {
    addStockElement({
      id: item.id,
      title: item.title,
      icon: item.icon,
      color: item.color,
      svgContent: item.svgContent,
      svgType: item.svgType,
      width: item.width,
      height: item.height,
    });
    setRecentlyAddedId(item.id);
    setTimeout(() => {
      setRecentlyAddedId((curr) => (curr === item.id ? null : curr));
    }, 1200);
  };

  const renderStockThumbnail = (item: StockItem) => {
    // 1. Vector SVG (Khung viền, Đường phân cách)
    if (item.svgContent) {
      return (
        <div
          className="w-full h-full flex items-center justify-center p-2 text-stone-700 transition-transform duration-200 group-hover:scale-105"
          style={{ color: item.color || "#E11D48" }}
          dangerouslySetInnerHTML={{ __html: item.svgContent }}
        />
      );
    }

    // 2. Chân nến cưới đặc thù w1
    if (item.id === "w1") {
      return (
        <div className="size-10 flex items-center justify-center transition-transform duration-200 group-hover:scale-110">
          <svg viewBox="0 0 100 120" className="w-full h-full object-contain drop-shadow-xs">
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
      );
    }

    // 3. Icon / Sticker
    return (
      <span
        style={{ color: item.color }}
        className={`transition-transform duration-200 group-hover:scale-110 select-none leading-none drop-shadow-2xs ${
          item.isWide ? "text-sm font-serif font-bold tracking-wider" : "text-3xl"
        }`}
      >
        {item.icon}
      </span>
    );
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
            width: item.width,
            height: item.height,
            svgContent: item.svgContent,
            svgType: item.svgType,
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
        className={`rounded-xl border text-center transition cursor-grab active:cursor-grabbing group shadow-2xs relative flex flex-col items-center justify-between active:scale-95 aspect-square p-1.5 ${
          isJustAdded
            ? "bg-emerald-50 border-emerald-400 ring-2 ring-emerald-300"
            : "border-stone-200/90 bg-[#FBFBFA] hover:bg-white hover:border-amber-400 hover:shadow-xs"
        }`}
        title={item.title}
      >
        <div className="w-full flex-1 flex items-center justify-center overflow-hidden">
          {renderStockThumbnail(item)}
        </div>
        <div className="w-full pt-1 border-t border-stone-100 flex flex-col items-center">
          <p className="text-[9.5px] font-semibold text-stone-700 leading-tight truncate max-w-full px-0.5">
            {item.title}
          </p>
          <span
            className={`text-[8px] mt-0.5 font-medium flex items-center gap-0.5 ${
              isJustAdded ? "text-emerald-700 font-bold" : "text-stone-400 group-hover:text-amber-700"
            }`}
          >
            {isJustAdded ? (
              <>
                <Check className="size-2" /> Đã thêm
              </>
            ) : (
              "+ Thêm"
            )}
          </span>
        </div>
      </button>
    );
  };

  const renderSection = (catId: StockCategoryId, title: string, maxItems = 6) => {
    const items = STOCK_CATALOG.filter((i) => i.cat === catId);
    if (items.length === 0) return null;

    return (
      <div key={catId} className="space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-stone-800 tracking-tight">
            {title}
          </h4>
          <button
            type="button"
            onClick={() => setActiveTab(catId)}
            className="text-[11px] font-medium text-stone-500 hover:text-amber-700 flex items-center transition cursor-pointer"
          >
            Xem thêm <ChevronRight className="size-3 ml-0.5" />
          </button>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {items.slice(0, maxItems).map(renderItemButton)}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* ── TOP CATEGORY PILLS BAR KHỚP 100% ẢNH MẪU NGAYCHUNGDOI ── */}
      <div className="flex flex-wrap items-center gap-1.5 pb-1">
        {PRIMARY_CATEGORY_IDS.map((catId) => {
          const cat = STOCK_CATEGORIES.find((c) => c.id === catId);
          if (!cat) return null;
          const isActive = activeTab === cat.id;

          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => {
                setActiveTab(cat.id);
                setIsMoreOpen(false);
              }}
              className={`px-3 py-1 rounded-md text-xs transition cursor-pointer border ${
                isActive
                  ? "bg-white border-stone-800 text-stone-900 font-bold shadow-2xs"
                  : "bg-white border-stone-200 text-stone-600 hover:border-stone-400 hover:text-stone-900"
              }`}
            >
              {cat.label}
            </button>
          );
        })}

        {/* Nút Xem thêm ▾ với dropdown menu */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsMoreOpen(!isMoreOpen)}
            className={`px-2.5 py-1 rounded-md text-xs transition cursor-pointer border flex items-center gap-1 ${
              MORE_CATEGORY_IDS.includes(activeTab) || isMoreOpen
                ? "bg-white border-stone-800 text-stone-900 font-bold shadow-2xs"
                : "bg-white border-stone-200 text-stone-600 hover:border-stone-400 hover:text-stone-900"
            }`}
          >
            <span>
              {MORE_CATEGORY_IDS.includes(activeTab)
                ? STOCK_CATEGORIES.find((c) => c.id === activeTab)?.label
                : "Xem thêm"}
            </span>
            <ChevronDown className="size-3 text-stone-500" />
          </button>

          {isMoreOpen && (
            <div className="absolute right-0 top-full mt-1.5 w-36 bg-white border border-stone-200 rounded-xl shadow-lg py-1 z-30 animate-in fade-in zoom-in-95 duration-100">
              {MORE_CATEGORY_IDS.map((catId) => {
                const cat = STOCK_CATEGORIES.find((c) => c.id === catId);
                if (!cat) return null;
                const isSelected = activeTab === cat.id;

                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      setActiveTab(cat.id);
                      setIsMoreOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs transition cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? "bg-amber-50 text-amber-900 font-bold"
                        : "text-stone-700 hover:bg-stone-50"
                    }`}
                  >
                    <span>{cat.label}</span>
                    {isSelected && <Check className="size-3 text-amber-700" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── CHẾ ĐỘ XEM "TẤT CẢ" (HIỂN THỊ CÁC NHÓM CÓ NÚT XEM THÊM) ── */}
      {activeTab === "all" ? (
        <div className="space-y-5 pt-1">
          {/* Nhóm 1: Khung viền (Frames) */}
          {renderSection("frames", "Khung viền")}

          {/* Nhóm 2: Đường phân cách (Dividers) */}
          {renderSection("dividers", "Đường phân cách")}

          {/* Nhóm 3: Yếu tố đám cưới */}
          {renderSection("wedding", "Yếu tố đám cưới")}

          {/* Nhóm 4: Chữ hỷ */}
          {renderSection("hy", "Chữ hỷ")}

          {/* Nhóm 5: Hoa cưới */}
          {renderSection("flower", "Hoa cưới")}

          {/* Nhóm 6: Trái tim */}
          {renderSection("heart", "Trái tim")}

          {/* Nhóm 7: Nhân vật */}
          {renderSection("character", "Nhân vật")}

          {/* Nhóm 8: Văn hóa Việt */}
          {renderSection("vietnam", "Văn hóa Việt")}
        </div>
      ) : (
        /* ── CHẾ ĐỘ XEM CHI TIẾT THEO DANH MỤC ĐƯỢC CHỌN ── */
        <div className="space-y-3 pt-1">
          <div className="flex items-center justify-between border-b border-stone-100 pb-2">
            <span className="text-xs font-bold text-stone-800 uppercase tracking-wide">
              {STOCK_CATEGORIES.find((c) => c.id === activeTab)?.label}
            </span>
            <button
              type="button"
              onClick={() => setActiveTab("all")}
              className="text-[11px] font-semibold text-amber-800 hover:underline cursor-pointer flex items-center gap-1"
            >
              ← Về tất cả
            </button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {STOCK_CATALOG.filter((i) => i.cat === activeTab).map(renderItemButton)}
          </div>
        </div>
      )}
    </div>
  );
}
