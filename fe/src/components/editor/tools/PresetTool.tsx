"use client";

import React, { useState } from "react";
import { Sparkles, Check, Plus, Calendar, Mail, Heart, Image as ImageIcon, Clock, Users, Gift, Quote } from "lucide-react";
import { useEditor } from "../EditorContext";

interface PresetItem {
  id: string;
  title: string;
  cat: "photo" | "info" | "timeline" | "invite" | "other";
  desc: string;
  previewType: "envelope-pink" | "envelope-green" | "invitation" | "calendar" | "parents" | "arch" | "duo" | "timeline" | "qr" | "quote";
}

const PRESET_CATALOG: PresetItem[] = [
  {
    id: "p-envelope-pink",
    title: "Phong bì hồng mở kèm thiệp",
    cat: "photo",
    desc: "Hiệu ứng phong bì hồng hé mở ảnh cưới lãng mạn",
    previewType: "envelope-pink",
  },
  {
    id: "p-envelope-green",
    title: "We got married - Phong bì sáp",
    cat: "invite",
    desc: "Phong bì xanh olive đính tem sáp hoàng gia",
    previewType: "envelope-green",
  },
  {
    id: "p-wedding-typography",
    title: "Thư mời WEDDING typography",
    cat: "invite",
    desc: "Bố cục chữ thư pháp cổ điển sang trọng",
    previewType: "invitation",
  },
  {
    id: "p-calendar-countdown",
    title: "Lịch ngày cưới khoanh tròn",
    cat: "timeline",
    desc: "Bảng đếm ngày khoanh đỏ ngày trọng đại",
    previewType: "calendar",
  },
  {
    id: "p-parents-info",
    title: "Hôn phối hai họ Nhà Trai - Nhà Gái",
    cat: "info",
    desc: "Thông tin song thân hai họ trang trọng",
    previewType: "parents",
  },
  {
    id: "p-arch-portrait",
    title: "Khung ảnh đôi vòm cong hoàng gia",
    cat: "photo",
    desc: "Cổng vòm cong Á Đông viền kim loại ánh vàng",
    previewType: "arch",
  },
  {
    id: "p-groom-bride-duo",
    title: "Groom & Bride - Chân dung đôi",
    cat: "photo",
    desc: "Cặp ảnh song sinh chú rể và cô dâu",
    previewType: "duo",
  },
  {
    id: "p-timeline-flow",
    title: "Lịch trình tiệc cưới chi tiết",
    cat: "timeline",
    desc: "Mốc thời gian đón khách, làm lễ, khai tiệc",
    previewType: "timeline",
  },
  {
    id: "p-banking-qr",
    title: "Hộp quà & Mã QR mừng cưới",
    cat: "other",
    desc: "Mã VietQR chuyển khoản tiện lợi cho khách",
    previewType: "qr",
  },
  {
    id: "p-love-quote",
    title: "Khối lời ngỏ trăm năm",
    cat: "other",
    desc: "Câu đối trích dẫn lời yêu thương ý nghĩa",
    previewType: "quote",
  },
];

export function PresetTool() {
  const [tab, setTab] = useState<"all" | "photo" | "info" | "timeline" | "invite" | "other">("all");
  const [recentlyAddedId, setRecentlyAddedId] = useState<string | null>(null);
  const { addPresetElement } = useEditor();

  const filtered = PRESET_CATALOG.filter((p) => tab === "all" || p.cat === tab);

  const handleAdd = (item: PresetItem) => {
    addPresetElement({ id: item.id, title: item.title, cat: item.cat });
    setRecentlyAddedId(item.id);
    setTimeout(() => {
      setRecentlyAddedId((curr) => (curr === item.id ? null : curr));
    }, 1200);
  };

  const renderVisualPreview = (type: PresetItem["previewType"]) => {
    switch (type) {
      case "envelope-pink":
        return (
          <div className="w-full h-28 bg-gradient-to-b from-[#FDE8EC] to-[#FCE2E7] rounded-xl relative overflow-hidden flex items-center justify-center p-2 border border-pink-200 shadow-2xs">
            {/* Open Flap Behind */}
            <div className="absolute top-2 w-32 h-16 bg-[#F4A7B5] [clip-path:polygon(50%_0%,0%_100%,100%_100%)] opacity-80" />
            {/* Card Sliding Out */}
            <div className="w-24 h-16 bg-white rounded-md shadow-sm border border-stone-200 z-10 overflow-hidden flex flex-col items-center justify-center p-1 translate-y-[-4px]">
              <div className="w-full h-8 bg-stone-100 rounded overflow-hidden mb-1">
                <img
                  src="https://images.unsplash.com/photo-1519741497674-611481863552?w=200&auto=format&fit=crop&q=80"
                  alt="Couple"
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-[7px] font-serif text-pink-700 font-bold uppercase tracking-wider">Save The Date</span>
            </div>
            {/* Envelope Bottom Pocket */}
            <div className="absolute bottom-1 w-36 h-14 bg-[#F294A6] rounded-b-lg z-20 flex items-center justify-center shadow-inner [clip-path:polygon(0%_20%,50%_55%,100%_20%,100%_100%,0%_100%)]" />
            {/* Wax Seal */}
            <div className="absolute bottom-2 z-30 size-5 rounded-full bg-[#E56F84] border border-pink-300 shadow-md flex items-center justify-center text-[7px] font-serif font-bold text-white">
              ML
            </div>
          </div>
        );

      case "envelope-green":
        return (
          <div className="w-full h-28 bg-[#E9EFE9] rounded-xl relative overflow-hidden flex items-center justify-center p-2 border border-stone-300 shadow-2xs">
            <div className="w-28 h-18 bg-[#3E5343] rounded-lg shadow-md relative overflow-hidden flex flex-col items-center justify-center text-white p-2">
              <span className="text-[7px] font-serif italic text-amber-200">We got married</span>
              <div className="size-4 rounded-full bg-[#BE944E] border border-amber-300 shadow mt-1 flex items-center justify-center text-[6px] font-bold">
                💍
              </div>
            </div>
          </div>
        );

      case "invitation":
        return (
          <div className="w-full h-28 bg-[#FCFBF8] rounded-xl relative overflow-hidden flex flex-col items-center justify-center p-2 border border-amber-200/80 shadow-2xs text-center">
            <span className="text-[8px] font-serif tracking-[0.2em] text-amber-800 uppercase font-bold">WEDDING</span>
            <div className="w-8 h-[1px] bg-amber-400 my-1" />
            <span className="text-[10px] font-serif text-stone-800 font-bold">Văn Anh & Minh Thơ</span>
            <span className="text-[7px] text-stone-500 font-mono mt-0.5">18.12.2026</span>
            <span className="text-[6px] text-stone-400 mt-1">TRÂN TRỌNG KÍNH MỜI</span>
          </div>
        );

      case "calendar":
        return (
          <div className="w-full h-28 bg-white rounded-xl relative overflow-hidden flex flex-col items-center justify-center p-2 border border-stone-200 shadow-2xs">
            <span className="text-[7px] font-serif uppercase tracking-widest text-stone-500 mb-1">WELCOME TO OUR WEDDING</span>
            <div className="grid grid-cols-7 gap-1 text-[7px] font-mono text-stone-600 text-center">
              <span>S</span><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span>
              <span>1</span><span>2</span><span>3</span><span>4</span><span>5</span><span>6</span><span>7</span>
              <span>8</span><span>9</span><span>10</span><span>11</span><span className="relative font-bold text-rose-600"><span className="absolute -inset-0.5 rounded-full border border-rose-500 bg-rose-50 -z-10" />12</span><span>13</span><span>14</span>
            </div>
          </div>
        );

      case "parents":
        return (
          <div className="w-full h-28 bg-[#FAFAF8] rounded-xl relative overflow-hidden flex flex-col justify-center p-2 border border-stone-200 shadow-2xs">
            <div className="text-[8px] font-serif font-bold text-amber-900 text-center uppercase tracking-wider pb-1 border-b border-stone-200">Hôn Phối Hai Họ</div>
            <div className="grid grid-cols-2 gap-2 text-[7px] pt-1">
              <div className="border-r border-stone-200 pr-1 text-center">
                <span className="font-bold text-stone-800 block">NHÀ TRAI</span>
                <span className="text-stone-500 block">Nguyễn Văn A</span>
                <span className="text-stone-500 block">Trần Thị B</span>
              </div>
              <div className="pl-1 text-center">
                <span className="font-bold text-stone-800 block">NHÀ GÁI</span>
                <span className="text-stone-500 block">Lê Văn C</span>
                <span className="text-stone-500 block">Phạm Thị D</span>
              </div>
            </div>
          </div>
        );

      case "arch":
        return (
          <div className="w-full h-28 bg-stone-100 rounded-xl relative overflow-hidden flex items-center justify-center p-2 border border-amber-300 shadow-2xs">
            <div className="w-20 h-24 rounded-t-full rounded-b-md border-2 border-amber-600 overflow-hidden shadow relative">
              <img
                src="https://images.unsplash.com/photo-1519741497674-611481863552?w=200&auto=format&fit=crop&q=80"
                alt="Arch"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end justify-center pb-1">
                <span className="text-[6px] text-white font-serif tracking-widest uppercase">LOVE</span>
              </div>
            </div>
          </div>
        );

      case "duo":
        return (
          <div className="w-full h-28 bg-[#FAF8F5] rounded-xl relative overflow-hidden flex items-center justify-center gap-2 p-2 border border-stone-200 shadow-2xs">
            <div className="w-14 h-22 bg-white rounded p-1 shadow-sm border border-stone-200 flex flex-col items-center">
              <div className="w-full h-14 bg-stone-100 rounded overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
                  alt="Groom"
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-[6px] font-serif font-bold text-stone-700 mt-1 uppercase">GROOM</span>
            </div>
            <div className="w-14 h-22 bg-white rounded p-1 shadow-sm border border-stone-200 flex flex-col items-center">
              <div className="w-full h-14 bg-stone-100 rounded overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
                  alt="Bride"
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-[6px] font-serif font-bold text-pink-700 mt-1 uppercase">BRIDE</span>
            </div>
          </div>
        );

      case "timeline":
        return (
          <div className="w-full h-28 bg-white rounded-xl relative overflow-hidden flex flex-col justify-center p-2.5 border border-stone-200 shadow-2xs">
            <span className="text-[8px] font-serif font-bold text-amber-900 uppercase tracking-wider mb-1 text-center">Lịch Trình Hôn Lễ</span>
            <div className="grid grid-cols-3 gap-1 text-[7px] text-center">
              <div className="bg-amber-50 p-1 rounded">
                <span className="font-bold text-amber-800 block">17:30</span>
                <span className="text-stone-600">Đón khách</span>
              </div>
              <div className="bg-amber-50 p-1 rounded">
                <span className="font-bold text-amber-800 block">18:00</span>
                <span className="text-stone-600">Làm lễ</span>
              </div>
              <div className="bg-amber-50 p-1 rounded">
                <span className="font-bold text-amber-800 block">18:30</span>
                <span className="text-stone-600">Khai tiệc</span>
              </div>
            </div>
          </div>
        );

      case "qr":
        return (
          <div className="w-full h-28 bg-[#FFFBF0] rounded-xl relative overflow-hidden flex items-center justify-center gap-3 p-2 border border-amber-300 shadow-2xs">
            <div className="size-16 bg-white border border-stone-300 rounded-lg p-1 shadow-xs flex flex-col items-center justify-center">
              <div className="size-11 bg-stone-900 rounded-sm flex items-center justify-center text-white text-[8px]">QR</div>
              <span className="text-[6px] text-stone-500 font-mono mt-0.5">VIETQR</span>
            </div>
            <div className="text-left">
              <span className="text-[9px] font-serif font-bold text-stone-800 block">Mừng Cưới</span>
              <span className="text-[7px] text-stone-500 block">Gửi lời chúc & hồng bao</span>
              <span className="text-[7px] font-mono text-amber-700 font-semibold block mt-0.5">MB BANK</span>
            </div>
          </div>
        );

      case "quote":
      default:
        return (
          <div className="w-full h-28 bg-gradient-to-br from-amber-50/90 to-stone-50/90 rounded-xl relative overflow-hidden flex flex-col items-center justify-center p-3 border border-amber-200/80 shadow-2xs text-center">
            <Quote className="size-4 text-amber-600/70 mb-1" />
            <p className="text-[8px] font-serif italic text-stone-800 font-medium leading-relaxed">
              Trăm năm tình viên mãn, bạc đầu nghĩa phu thê.
            </p>
          </div>
        );
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-bold text-stone-900 mb-0.5">
          Thiết kế sẵn
        </h3>
        <p className="text-[11px] text-stone-500 leading-snug">
          Các thành phần thiết kế sẵn giúp bạn xây dựng trang nhanh hơn. Nhấn hoặc kéo thả vào khung thiết kế để sử dụng.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1 p-1 bg-stone-100 rounded-xl overflow-x-auto scrollbar-none">
        {[
          { id: "all", label: "Tất cả" },
          { id: "photo", label: "Ảnh" },
          { id: "info", label: "Thông tin" },
          { id: "timeline", label: "Lịch trình" },
          { id: "invite", label: "Lời mời" },
          { id: "other", label: "Khác" },
        ].map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setTab(c.id as any)}
            className={`px-3 py-1.5 rounded-lg text-xs whitespace-nowrap transition cursor-pointer ${
              tab === c.id
                ? "bg-white text-stone-900 shadow-2xs font-bold"
                : "text-stone-500 hover:text-stone-800 font-medium"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Grid of Presets with Rich Previews */}
      <div className="grid grid-cols-1 gap-3">
        {filtered.map((item) => {
          const isJustAdded = recentlyAddedId === item.id;
          return (
            <div
              key={item.id}
              draggable={true}
              onDragStart={(e) => {
                const payload = {
                  type: "preset",
                  id: item.id,
                  title: item.title,
                  cat: item.cat,
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
              className={`group p-2.5 rounded-2xl border transition-all cursor-grab active:cursor-grabbing shadow-2xs hover:shadow-md relative bg-white ${
                isJustAdded
                  ? "bg-emerald-50/50 border-emerald-400 ring-2 ring-emerald-300"
                  : "border-stone-200 hover:border-amber-300"
              }`}
            >
              {/* Visual Card Preview */}
              <div className="mb-2">
                {renderVisualPreview(item.previewType)}
              </div>

              {/* Title & Action */}
              <div className="flex items-center justify-between gap-1 px-1">
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-stone-800 truncate group-hover:text-amber-800 transition-colors">
                    {item.title}
                  </h4>
                  <p className="text-[10px] text-stone-400 truncate">{item.desc}</p>
                </div>
                <button
                  type="button"
                  className={`size-6 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                    isJustAdded
                      ? "bg-emerald-600 text-white"
                      : "bg-stone-100 text-stone-600 group-hover:bg-amber-600 group-hover:text-white"
                  }`}
                  title="Thêm vào thiệp"
                >
                  {isJustAdded ? <Check className="size-3.5" /> : <Plus className="size-3.5" />}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
