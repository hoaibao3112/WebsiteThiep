"use client";

import React, { useState } from "react";
import { Sparkles, Check, Plus, Calendar, Mail, Heart, Image as ImageIcon, Clock, Users, Gift, Quote } from "lucide-react";
import { useEditor } from "../EditorContext";

interface PresetItem {
  id: string;
  title: string;
  cat: "photo" | "info" | "timeline" | "invite" | "other";
  desc: string;
  previewType:
    | "envelope-pink"
    | "envelope-green"
    | "invitation"
    | "calendar"
    | "parents"
    | "arch"
    | "duo"
    | "timeline"
    | "qr"
    | "quote"
    | "carnation"
    | "wax-seal"
    | "mini-bouquet"
    | "gold-divider"
    | "song-hy-red"
    | "dress-code"
    | "venue-map"
    | "rings-vow"
    | "countdown"
    | "wedding-menu"
    | "thank-you"
    | "polaroid-washi"
    | "orchid-arch"
    | "envelope-songhy"
    | "le-thanh-hon";
}

const PRESET_CATALOG: PresetItem[] = [
  {
    id: "p-orchid-arch",
    title: "Khung vòm hoa lan hoàng gia",
    cat: "photo",
    desc: "Khung vòm nghệ thuật hoa lan trắng, dễ dàng thay ảnh cưới cá nhân",
    previewType: "orchid-arch",
  },
  {
    id: "p-envelope-songhy",
    title: "Phong bì kem sáp Song Hỷ",
    cat: "invite",
    desc: "Phong bì hé mở đính tem sáp Song Hỷ mạ vàng, chứa thiệp & ảnh",
    previewType: "envelope-songhy",
  },
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
    id: "p-song-hy-red",
    title: "Thiệp Song Hỷ Đỏ Á Đông",
    cat: "invite",
    desc: "Họa tiết Song Hỷ mạ vàng, truyền thống trang trọng",
    previewType: "song-hy-red",
  },
  {
    id: "p-wedding-typography",
    title: "Thư mời WEDDING typography",
    cat: "invite",
    desc: "Bố cục chữ thư pháp cổ điển sang trọng",
    previewType: "invitation",
  },
  {
    id: "p-le-thanh-hon",
    title: "Lễ Thành Hôn & Lễ Vu Quy",
    cat: "invite",
    desc: "Khung thông báo giờ lành rước dâu và khai tiệc hai họ",
    previewType: "le-thanh-hon",
  },
  {
    id: "p-dress-code",
    title: "Quy định trang phục (Dress Code)",
    cat: "info",
    desc: "Bảng gợi ý tông màu trang phục cho khách mời dự tiệc",
    previewType: "dress-code",
  },
  {
    id: "p-venue-map",
    title: "Địa điểm tiệc cưới & Chỉ đường",
    cat: "info",
    desc: "Sảnh tiệc, địa chỉ chi tiết kèm QR quét Google Maps",
    previewType: "venue-map",
  },
  {
    id: "p-wedding-menu",
    title: "Thực đơn bàn tiệc cưới cao cấp",
    cat: "info",
    desc: "Bảng thực đơn 5 món tao nhã thiết đãi quan khách",
    previewType: "wedding-menu",
  },
  {
    id: "p-parents-info",
    title: "Hôn phối hai họ Nhà Trai - Nhà Gái",
    cat: "info",
    desc: "Thông tin song thân hai họ trang trọng",
    previewType: "parents",
  },
  {
    id: "p-calendar-countdown",
    title: "Lịch ngày cưới khoanh tròn",
    cat: "timeline",
    desc: "Bảng đếm ngày khoanh đỏ ngày trọng đại",
    previewType: "calendar",
  },
  {
    id: "p-wedding-countdown",
    title: "Đếm ngược khoảnh khắc cưới",
    cat: "timeline",
    desc: "Đồng hồ đếm ngược Ngày - Giờ - Phút - Giây hạnh phúc",
    previewType: "countdown",
  },
  {
    id: "p-timeline-flow",
    title: "Lịch trình tiệc cưới chi tiết",
    cat: "timeline",
    desc: "Mốc thời gian đón khách, làm lễ, khai tiệc",
    previewType: "timeline",
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
    id: "p-polaroid-washi",
    title: "Polaroid dán băng Washi Vintage",
    cat: "photo",
    desc: "Khung ảnh cưới dán băng keo thủ công kẹp hoa baby",
    previewType: "polaroid-washi",
  },
  {
    id: "p-rings-vow",
    title: "Cặp nhẫn cưới & Lời hẹn ước",
    cat: "other",
    desc: "Nhẫn cưới vàng kim lấp lánh kèm lời thề trăm năm",
    previewType: "rings-vow",
  },
  {
    id: "p-thank-you-note",
    title: "Thư cảm ơn quan khách trân quý",
    cat: "other",
    desc: "Lời tri ân chân thành từ Cô dâu & Chú rể",
    previewType: "thank-you",
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
  {
    id: "p-carnation-bouquet",
    title: "Cành cẩm chướng nơ đỏ",
    cat: "other",
    desc: "Hoa cẩm chướng gắn nơ đỏ duyên dáng trang trí thiệp",
    previewType: "carnation",
  },
  {
    id: "p-wax-seal",
    title: "Con dấu sáp hồng niêm phong",
    cat: "other",
    desc: "Dấu sáp ML đính nắp phong bì hoàng gia",
    previewType: "wax-seal",
  },
  {
    id: "p-mini-bouquet",
    title: "Bó hoa cưới mini pastel",
    cat: "other",
    desc: "Bó hoa mini thắt ruy băng trang nhã",
    previewType: "mini-bouquet",
  },
  {
    id: "p-gold-divider",
    title: "Thanh chỉ vàng kim loại",
    cat: "other",
    desc: "Đường kẻ vàng sang trọng phân tách bố cục",
    previewType: "gold-divider",
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
      case "orchid-arch":
        return (
          <div className="w-full h-28 bg-[#FBF9F5] rounded-xl relative overflow-hidden flex items-center justify-center p-2 border border-amber-200/80 shadow-2xs">
            {/* Arch frame */}
            <div className="w-20 h-24 rounded-t-[40px] rounded-b-md border-2 border-[#D4AF37] overflow-hidden relative shadow-md bg-stone-100">
              <img
                src="/images/presets/arch-orchid-sample.jpg"
                alt="Orchid Arch"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = "https://images.unsplash.com/photo-1519741497674-611481863552?w=300&auto=format&fit=crop&q=80";
                }}
              />
              {/* Floral accent badges */}
              <div className="absolute top-0 left-0 size-6 bg-white/70 rounded-full blur-[1px] flex items-center justify-center text-[10px]">🌸</div>
              <div className="absolute bottom-0 right-0 size-6 bg-white/70 rounded-full blur-[1px] flex items-center justify-center text-[10px]">🌿</div>
            </div>
            <div className="absolute bottom-1 right-2 bg-amber-100 text-amber-900 text-[8px] font-medium px-1.5 py-0.5 rounded shadow-xs">
              Lồng ảnh
            </div>
          </div>
        );

      case "envelope-songhy":
        return (
          <div className="w-full h-28 bg-[#F7F4EE] rounded-xl relative overflow-hidden flex items-center justify-center p-2 border border-amber-300/60 shadow-2xs">
            {/* Open flap */}
            <div className="absolute top-1.5 w-32 h-14 bg-[#EDE7DA] [clip-path:polygon(50%_0%,0%_100%,100%_100%)] opacity-90 border-t border-amber-200" />
            {/* Card inside */}
            <div className="w-28 h-18 bg-[#FFFDF9] rounded shadow-md border border-[#D4AF37]/50 z-10 flex flex-col items-center justify-center p-1 translate-y-[-2px]">
              <span className="text-[7.5px] font-serif font-bold text-[#8C6D37] tracking-wider italic">Save Our Date</span>
              <div className="w-6 h-[0.5px] bg-[#D4AF37] my-0.5" />
              <span className="text-[6.5px] font-sans text-stone-600">THIỆP MỜI</span>
            </div>
            {/* Pocket */}
            <div className="absolute bottom-1 w-36 h-14 bg-[#F5EFE4] rounded-b-lg z-20 flex items-center justify-center shadow-inner [clip-path:polygon(0%_20%,50%_55%,100%_20%,100%_100%,0%_100%)] border-b border-stone-200" />
            {/* Gold Wax Seal 囍 */}
            <div className="absolute bottom-2 z-30 size-6 rounded-full bg-gradient-to-br from-[#E6C673] to-[#B38728] border border-amber-200 shadow-md flex items-center justify-center text-[9px] font-serif font-bold text-amber-950">
              囍
            </div>
          </div>
        );

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

      case "carnation":
        return (
          <div className="w-full h-28 bg-[#FFF9F9] rounded-xl relative overflow-hidden flex items-center justify-center p-2 border border-pink-200/80 shadow-2xs">
            <svg viewBox="0 0 120 180" className="w-16 h-24 drop-shadow-xs">
              <path d="M 60 160 Q 55 110 40 70 M 60 160 Q 65 120 75 80" stroke="#4D7C0F" strokeWidth="3" fill="none" strokeLinecap="round" />
              <path d="M 52 130 Q 35 125 38 115 Q 48 120 52 130 Z" fill="#65A30D" />
              <path d="M 62 110 Q 78 105 76 95 Q 66 100 62 110 Z" fill="#65A30D" />
              <g transform="translate(38, 55)">
                <ellipse cx="0" cy="10" rx="6" ry="8" fill="#4D7C0F" />
                <path d="M -18 -5 C -25 -15 -10 -25 0 -22 C 10 -25 25 -15 18 -5 C 22 8 8 16 0 14 C -8 16 -22 8 -18 -5 Z" fill="#F43F5E" opacity="0.9" />
                <path d="M -14 -8 C -18 -18 -5 -24 0 -20 C 5 -24 18 -18 14 -8 C 16 4 5 10 0 8 C -5 10 -16 4 -14 -8 Z" fill="#FB7185" />
                <path d="M -8 -10 C -12 -16 0 -20 0 -17 C 0 -20 12 -16 8 -10 C 8 0 2 5 0 4 C -2 5 -8 0 -8 -10 Z" fill="#FECDD3" />
              </g>
              <g transform="translate(76, 75) scale(0.85)">
                <ellipse cx="0" cy="10" rx="6" ry="8" fill="#4D7C0F" />
                <path d="M -18 -5 C -25 -15 -10 -25 0 -22 C 10 -25 25 -15 18 -5 C 22 8 8 16 0 14 C -8 16 -22 8 -18 -5 Z" fill="#E11D48" opacity="0.9" />
                <path d="M -14 -8 C -18 -18 -5 -24 0 -20 C 5 -24 18 -18 14 -8 C 16 4 5 10 0 8 C -5 10 -16 4 -14 -8 Z" fill="#FB7185" />
                <path d="M -8 -10 C -12 -16 0 -20 0 -17 C 0 -20 12 -16 8 -10 C 8 0 2 5 0 4 C -2 5 -8 0 -8 -10 Z" fill="#FFE4E6" />
              </g>
              <g transform="translate(58, 140)">
                <circle cx="0" cy="0" r="4" fill="#B91C1C" />
                <path d="M 0 0 C -15 -10 -20 8 0 3 Z" fill="#DC2626" />
                <path d="M 0 0 C 15 -10 20 8 0 3 Z" fill="#DC2626" />
                <path d="M -2 2 Q -8 18 -12 25" stroke="#DC2626" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                <path d="M 2 2 Q 8 18 14 24" stroke="#DC2626" strokeWidth="2.5" fill="none" strokeLinecap="round" />
              </g>
            </svg>
          </div>
        );

      case "wax-seal":
        return (
          <div className="w-full h-28 bg-[#FAF6F6] rounded-xl relative overflow-hidden flex items-center justify-center p-2 border border-pink-200/80 shadow-2xs">
            <svg viewBox="0 0 100 100" className="w-16 h-16 drop-shadow-sm">
              <path d="M 50 4 C 64 2 73 9 84 18 C 95 28 98 42 96 55 C 94 69 88 80 77 88 C 65 96 48 98 35 94 C 20 90 9 79 5 65 C 2 50 6 36 15 24 C 24 12 36 6 50 4 Z" fill="#F47291" />
              <circle cx="50" cy="51" r="32" fill="none" stroke="#E11D48" strokeWidth="1.5" strokeOpacity="0.3" />
              <circle cx="50" cy="51" r="28" fill="#FB7185" />
              <text x="50" y="58" textAnchor="middle" fill="#FFFFFF" fillOpacity="0.95" fontFamily="serif" fontStyle="italic" fontWeight="bold" fontSize="22">ML</text>
            </svg>
          </div>
        );

      case "mini-bouquet":
        return (
          <div className="w-full h-28 bg-[#FFF9FB] rounded-xl relative overflow-hidden flex items-center justify-center p-2 border border-pink-200/80 shadow-2xs">
            <svg viewBox="0 0 100 120" className="w-16 h-20 drop-shadow-xs">
              <path d="M 50 115 L 25 65 L 75 65 Z" fill="#FCE7F3" stroke="#F472B6" strokeWidth="1" />
              <path d="M 30 65 Q 50 78 70 65 L 50 115 Z" fill="#FDF2F8" />
              <circle cx="40" cy="50" r="14" fill="#F43F5E" />
              <circle cx="60" cy="48" r="13" fill="#FB7185" />
              <circle cx="50" cy="35" r="15" fill="#FDA4AF" />
              <circle cx="35" cy="36" r="10" fill="#C084FC" />
              <circle cx="65" cy="35" r="11" fill="#A855F7" />
              <circle cx="50" cy="52" r="8" fill="#FBBF24" />
              <ellipse cx="50" cy="85" rx="8" ry="4" fill="#EC4899" />
              <path d="M 45 87 Q 40 102 38 110" stroke="#EC4899" strokeWidth="2" fill="none" />
              <path d="M 55 87 Q 60 102 62 110" stroke="#EC4899" strokeWidth="2" fill="none" />
            </svg>
          </div>
        );

      case "gold-divider":
        return (
          <div className="w-full h-28 bg-[#FAF8F5] rounded-xl relative overflow-hidden flex flex-col items-center justify-center p-4 border border-stone-200 shadow-2xs">
            <div className="w-full h-[2px] bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent shadow-2xs" />
          </div>
        );

      case "song-hy-red":
        return (
          <div className="w-full h-28 bg-gradient-to-br from-[#9E1B28] to-[#78101C] rounded-xl relative overflow-hidden flex flex-col items-center justify-center p-2.5 border border-amber-400/50 shadow-2xs text-center text-amber-200">
            <div className="text-xl font-bold font-serif text-amber-300 drop-shadow-sm">囍</div>
            <span className="text-[8px] font-serif uppercase tracking-widest text-amber-200/90 font-bold mt-0.5">TRĂM NĂM HẠNH PHÚC</span>
            <div className="w-10 h-[1px] bg-amber-400/60 my-1" />
            <span className="text-[7px] text-amber-100/80 font-serif">LỄ THÀNH HÔN</span>
          </div>
        );

      case "dress-code":
        return (
          <div className="w-full h-28 bg-[#FAF9F5] rounded-xl relative overflow-hidden flex flex-col items-center justify-center p-2 border border-stone-200 shadow-2xs text-center">
            <span className="text-[8px] font-serif font-bold text-stone-800 uppercase tracking-wider">DRESS CODE</span>
            <span className="text-[6.5px] text-stone-500 mb-1.5">Tông màu trang phục dự tiệc</span>
            <div className="flex items-center gap-1.5">
              <span className="size-4 rounded-full bg-[#FFFFFF] border border-stone-300 shadow-2xs" title="Trắng" />
              <span className="size-4 rounded-full bg-[#F5E6D3] border border-stone-300 shadow-2xs" title="Beige" />
              <span className="size-4 rounded-full bg-[#FBCFE8] border border-pink-200 shadow-2xs" title="Hồng Pastel" />
              <span className="size-4 rounded-full bg-[#D1FAE5] border border-emerald-200 shadow-2xs" title="Mint" />
              <span className="size-4 rounded-full bg-[#78350F] border border-amber-900 shadow-2xs" title="Nâu đất" />
            </div>
          </div>
        );

      case "venue-map":
        return (
          <div className="w-full h-28 bg-[#FDFBF7] rounded-xl relative overflow-hidden flex items-center justify-center gap-2 p-2 border border-amber-200/80 shadow-2xs">
            <div className="flex-1 text-left">
              <span className="text-[6px] font-mono text-amber-800 bg-amber-100 px-1 py-0.5 rounded font-bold">TRUNG TÂM TIỆC CƯỚI</span>
              <span className="text-[8.5px] font-serif font-bold text-stone-800 block mt-1 truncate">White Palace Hall A</span>
              <span className="text-[6.5px] text-stone-500 block truncate">194 Hoàng Văn Thụ, TP.HCM</span>
            </div>
            <div className="size-14 bg-white border border-stone-200 rounded-lg p-1 flex flex-col items-center justify-center shrink-0 shadow-2xs">
              <div className="size-9 bg-stone-900 rounded-xs flex items-center justify-center text-white text-[7px] font-bold">MAP</div>
              <span className="text-[5.5px] text-stone-500 mt-0.5">CHỈ ĐƯỜNG</span>
            </div>
          </div>
        );

      case "wedding-menu":
        return (
          <div className="w-full h-28 bg-[#FCFAF6] rounded-xl relative overflow-hidden flex flex-col items-center justify-center p-2 border border-amber-200/80 shadow-2xs text-center">
            <span className="text-[8px] font-serif font-bold text-amber-900 uppercase tracking-widest">WEDDING MENU</span>
            <div className="w-6 h-[1px] bg-amber-300 my-0.5" />
            <div className="text-[6.5px] text-stone-600 font-serif space-y-0.5 leading-tight">
              <p>• Súp bào ngư vi cá</p>
              <p>• Bò Úc sốt tiêu đen</p>
              <p>• Cá chẽm hấp Hồng Kông</p>
              <p>• Chè hạt sen nhãn nhục</p>
            </div>
          </div>
        );

      case "countdown":
        return (
          <div className="w-full h-28 bg-gradient-to-b from-[#FFFDF9] to-[#FDF8EE] rounded-xl relative overflow-hidden flex flex-col items-center justify-center p-2 border border-amber-200 shadow-2xs text-center">
            <span className="text-[7.5px] font-serif uppercase tracking-widest text-amber-800 font-bold mb-1">CÙNG ĐẾM NGƯỢC</span>
            <div className="grid grid-cols-4 gap-1 text-center">
              <div className="bg-white border border-amber-100 rounded px-1 py-0.5 shadow-2xs">
                <span className="text-[10px] font-bold text-stone-800 font-mono block">28</span>
                <span className="text-[5.5px] text-stone-400">NGÀY</span>
              </div>
              <div className="bg-white border border-amber-100 rounded px-1 py-0.5 shadow-2xs">
                <span className="text-[10px] font-bold text-stone-800 font-mono block">14</span>
                <span className="text-[5.5px] text-stone-400">GIỜ</span>
              </div>
              <div className="bg-white border border-amber-100 rounded px-1 py-0.5 shadow-2xs">
                <span className="text-[10px] font-bold text-stone-800 font-mono block">35</span>
                <span className="text-[5.5px] text-stone-400">PHÚT</span>
              </div>
              <div className="bg-white border border-amber-100 rounded px-1 py-0.5 shadow-2xs">
                <span className="text-[10px] font-bold text-rose-600 font-mono block animate-pulse">59</span>
                <span className="text-[5.5px] text-stone-400">GIÂY</span>
              </div>
            </div>
          </div>
        );

      case "rings-vow":
        return (
          <div className="w-full h-28 bg-[#FAF7F2] rounded-xl relative overflow-hidden flex flex-col items-center justify-center p-2 border border-amber-200/80 shadow-2xs text-center">
            <div className="flex items-center justify-center gap-1 text-base text-amber-500 mb-0.5">
              💍✨
            </div>
            <span className="text-[8px] font-serif italic font-bold text-stone-800">Lời Thề Nguyện Trăm Năm</span>
            <p className="text-[6.5px] font-serif text-stone-500 italic mt-0.5 px-2 leading-tight">
              “Từ hôm nay, ta cùng nhau đi đến trọn cuộc đời...”
            </p>
          </div>
        );

      case "thank-you":
        return (
          <div className="w-full h-28 bg-[#FFFBF8] rounded-xl relative overflow-hidden flex flex-col items-center justify-center p-2.5 border border-pink-200/80 shadow-2xs text-center">
            <Heart className="size-3.5 text-rose-500 fill-rose-500/20 mb-1" />
            <span className="text-[8.5px] font-serif font-bold text-stone-800 uppercase tracking-wider">THANK YOU</span>
            <p className="text-[6.5px] text-stone-500 mt-0.5 px-1 leading-snug">
              Cảm ơn bạn đã đến chung vui và chúc phúc cùng chúng mình!
            </p>
          </div>
        );

      case "polaroid-washi":
        return (
          <div className="w-full h-28 bg-[#F7F5F0] rounded-xl relative overflow-hidden flex items-center justify-center p-2 border border-stone-200 shadow-2xs">
            <div className="w-18 bg-white p-1 pb-3 shadow-md rounded relative border border-stone-200 rotate-[-3deg]">
              {/* Băng washi tape pastel */}
              <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-8 h-2.5 bg-amber-200/80 shadow-2xs rotate-[-2deg] rounded-xs" />
              <div className="w-full h-12 bg-stone-100 rounded overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1519741497674-611481863552?w=150&auto=format&fit=crop&q=80"
                  alt="Polaroid"
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-[5.5px] font-serif text-center block text-stone-600 mt-1 font-semibold">Our Moment</span>
            </div>
          </div>
        );

      case "le-thanh-hon":
        return (
          <div className="w-full h-28 bg-[#FAF6F4] rounded-xl relative overflow-hidden flex flex-col items-center justify-center p-2 border border-rose-200 shadow-2xs text-center">
            <div className="text-[7px] font-serif font-bold text-rose-800 bg-rose-100/80 px-2 py-0.5 rounded-full uppercase tracking-wider">
              LỄ THÀNH HÔN
            </div>
            <div className="text-[8.5px] font-serif font-bold text-stone-800 mt-1">11:00 • 18.12.2026</div>
            <div className="text-[6.5px] text-stone-500 mt-0.5">Tư gia Nhà Trai / Khách sạn</div>
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

      {/* Filter Tabs matching Screenshot 1 */}
      <div className="space-y-1.5">
        <div className="flex gap-1.5">
          {[
            { id: "all", label: "Tất cả" },
            { id: "photo", label: "Ảnh" },
            { id: "info", label: "Thông tin" },
          ].map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setTab(c.id as any)}
              className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold text-center border transition cursor-pointer ${
                tab === c.id
                  ? "border-stone-900 bg-white text-stone-900 shadow-2xs font-bold"
                  : "border-stone-200 bg-white text-stone-600 hover:bg-stone-50"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
        <div className="flex gap-1.5">
          {[
            { id: "timeline", label: "Lịch trình" },
            { id: "invite", label: "Lời mời" },
            { id: "other", label: "Khác" },
          ].map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setTab(c.id as any)}
              className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold text-center border transition cursor-pointer ${
                tab === c.id
                  ? "border-stone-900 bg-white text-stone-900 shadow-2xs font-bold"
                  : "border-stone-200 bg-white text-stone-600 hover:bg-stone-50"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Presets with 2 Columns matching Screenshot 1 */}
      <div className="grid grid-cols-2 gap-2">
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
