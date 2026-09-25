"use client";

import React from "react";
import type { CanvasElement } from "@/types/canvas.types";
import { readCanvasData } from "@/lib/editor/canvas-presentation";
import { CanvasWidget } from "./CanvasWidget";

import { Heart } from "lucide-react";
import { STOCK_CATALOG } from "@/config/stock-catalog";

export function ScaledPresetWrapper({
  baseW,
  baseH,
  w,
  h,
  children,
  className = "",
}: {
  baseW: number;
  baseH: number;
  w: number;
  h: number;
  children: React.ReactNode;
  className?: string;
}) {
  const scale = Math.min(w / baseW, h / baseH);
  return (
    <div className={`w-full h-full relative overflow-hidden flex items-center justify-center pointer-events-none select-none ${className}`}>
      <div
        style={{
          width: `${baseW}px`,
          height: `${baseH}px`,
          transform: `scale(${scale})`,
          transformOrigin: "center center",
          flexShrink: 0,
        }}
        className="flex items-center justify-center shrink-0"
      >
        {children}
      </div>
    </div>
  );
}

export function CanvasElementContent({ element: el, draft, guestName, onRsvp, onGift }: { element: CanvasElement; draft?: object; guestName?: string; onRsvp?: () => void; onGift?: () => void }) {
  const data = readCanvasData(draft);
  if (el.type === "widget") {
    if (el.widgetType === "map" && (el.title === "Địa chỉ dự tiệc" || el.id?.includes("venue"))) {
      const events = Array.isArray(data.events) ? data.events : [];
      const firstEvent = (events[0] as Record<string, unknown>) || {};
      const mapUrl = (el.widgetConfig?.url as string) || (firstEvent.mapUrl as string) || "https://maps.google.com";
      const isMarsala = (draft as Record<string, unknown>)?.templateSlug === "wedding-crimson-wine-marsala" || (draft as Record<string, unknown>)?.slug === "wedding-crimson-wine-marsala" || (draft as Record<string, unknown>)?.primaryColor === "#6B1724" || el.color === "#6B1724";
      const primaryColor = isMarsala ? "#6B1724" : (el.color || "#543A2C");
      const venueName = (firstEvent.venueName as string) || "TƯ GIA NHÀ TRAI";
      const address = (firstEvent.address as string) || (isMarsala ? "Khu Phố Xuân Thượng, Phường Quảng Vinh, Nam Sầm Sơn, Thanh Hóa" : "16 P. Phúc Minh, Phúc Diễn, Bắc Từ Liêm, TP. Hà Nội");
      return (
        <div className="w-full h-full px-4 py-3 flex flex-col items-center justify-center text-center select-none bg-transparent">
          <div className="inline-block border-b pb-1 mb-2" style={{ borderColor: `${primaryColor}66` }}>
            <span className="text-xs uppercase tracking-widest text-stone-600 font-medium">
              Địa chỉ dự tiệc
            </span>
          </div>
          <h3 className="font-serif text-lg font-bold uppercase tracking-wider mb-1" style={{ color: primaryColor }}>
            {venueName}
          </h3>
          <p className="text-xs text-stone-600 max-w-[280px] leading-relaxed mb-3">
            {address}
          </p>
          <a
            href={mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full text-white text-xs font-semibold shadow-sm transition-opacity hover:opacity-90 cursor-pointer pointer-events-auto"
            style={{ backgroundColor: primaryColor }}
          >
            Xem chỉ đường
          </a>
        </div>
      );
    }
    return (
      <ScaledPresetWrapper baseW={320} baseH={200} w={el.width} h={el.height}>
        <CanvasWidget element={el} draft={draft} guestName={guestName} onRsvp={onRsvp} onGift={onGift} />
      </ScaledPresetWrapper>
    );
  }
    if (el.type === "stock" || el.type === "sticker") {
      // 1. Chân nến cổ điển (w1)
      if (el.stockId === "w1" || el.content === "candelabra-vintage" || el.title?.includes("nến")) {
        return (
          <div className="w-full h-full flex items-center justify-center select-none pointer-events-none p-1">
            <svg viewBox="0 0 100 120" className="w-full h-full object-contain drop-shadow-md">
              <ellipse cx="50" cy="112" rx="20" ry="5" fill="#8BB8D4" />
              <rect x="47" y="55" width="6" height="57" rx="3" fill="#8BB8D4" />
              <circle cx="50" cy="85" r="5" fill="#75A6C5" />
              <path d="M 25 70 Q 25 90 50 90 Q 75 90 75 70" stroke="#8BB8D4" strokeWidth="5" fill="none" strokeLinecap="round" />
              <rect x="20" y="68" width="10" height="4" rx="1.5" fill="#75A6C5" />
              <rect x="45" y="52" width="10" height="4" rx="1.5" fill="#75A6C5" />
              <rect x="70" y="68" width="10" height="4" rx="1.5" fill="#75A6C5" />
              <rect x="22" y="44" width="6" height="25" rx="2" fill="#FEF9E7" stroke="#8BB8D4" strokeWidth="1" />
              <rect x="47" y="28" width="6" height="25" rx="2" fill="#FEF9E7" stroke="#8BB8D4" strokeWidth="1" />
              <rect x="72" y="44" width="6" height="25" rx="2" fill="#FEF9E7" stroke="#8BB8D4" strokeWidth="1" />
              <line x1="25" y1="44" x2="25" y2="40" stroke="#4A5568" strokeWidth="1.5" />
              <line x1="50" y1="28" x2="50" y2="24" stroke="#4A5568" strokeWidth="1.5" />
              <line x1="75" y1="44" x2="75" y2="40" stroke="#4A5568" strokeWidth="1.5" />
              <ellipse cx="25" cy="36" rx="3.5" ry="6.5" fill="#F59E0B" />
              <ellipse cx="25" cy="37" rx="1.5" ry="3.5" fill="#FEF08A" />
              <ellipse cx="50" cy="20" rx="4" ry="7.5" fill="#F59E0B" />
              <ellipse cx="50" cy="21" rx="2" ry="4" fill="#FEF08A" />
              <ellipse cx="75" cy="36" rx="3.5" ry="6.5" fill="#F59E0B" />
              <ellipse cx="75" cy="37" rx="1.5" ry="3.5" fill="#FEF08A" />
            </svg>
          </div>
        );
      }

      // 2. Vector SVG từ STOCK_CATALOG (Khung viền, Đường phân cách)
      const catalogItem = STOCK_CATALOG.find((item) => item.id === el.stockId);
      const rawSvg = el.svgContent || catalogItem?.svgContent;
      if (rawSvg) {
        const itemColor = el.color || catalogItem?.color || "#E11D48";
        const processedSvg = rawSvg.replace(
          /<svg\b([^>]*)>/i,
          (_match, attrs) => {
            const hasPreserve = /preserveAspectRatio/i.test(attrs);
            const extraAttrs = hasPreserve ? "" : ' preserveAspectRatio="none"';
            return `<svg${attrs}${extraAttrs} style="width:100%;height:100%;display:block;">`;
          }
        );
        return (
          <div
            className="w-full h-full flex items-center justify-center select-none pointer-events-none drop-shadow-xs [&>svg]:w-full [&>svg]:h-full [&>svg]:block [&>svg]:max-w-full [&>svg]:max-h-full"
            style={{ color: itemColor }}
            dangerouslySetInnerHTML={{ __html: processedSvg }}
          />
        );
      }

      const isImg = Boolean(
        el.imageUrl ||
          (typeof el.content === "string" &&
            (el.content.startsWith("http") ||
              el.content.startsWith("/images") ||
              el.content.startsWith("data:image")))
      );
      if (isImg) {
        return (
          <div className="w-full h-full flex items-center justify-center select-none pointer-events-none">
            <img
              src={el.imageUrl || el.content}
              alt={el.title || "Sticker"}
              className="w-full h-full object-contain filter drop-shadow-md select-none pointer-events-none"
            />
          </div>
        );
      }

      const contentLength = typeof el.content === "string" ? el.content.length : 1;
      const isMultiChar = contentLength > 2;
      const dynamicFontSize = isMultiChar
        ? Math.max(10, Math.min(Math.round(el.height * 0.65), Math.round((el.width * 0.9) / Math.max(contentLength * 0.6, 1))))
        : Math.max(12, Math.round(Math.min(el.width, el.height) * 0.78));

      const effectiveFontSize = el.fontSize || dynamicFontSize;

      return (
        <div className="w-full h-full flex items-center justify-center select-none pointer-events-none overflow-hidden">
          <span
            style={{
              fontSize: `${effectiveFontSize}px`,
              color: el.color || undefined,
              lineHeight: 1,
            }}
            className="filter drop-shadow-md select-none transform transition-transform text-center flex items-center justify-center leading-none"
          >
            {el.content}
          </span>
        </div>
      );
    }

    if (el.type === "shape") {
      const shapeColor = el.borderColor || el.color || "#BE944E";
      const shapeBg = el.backgroundColor || "transparent";
      const bWidth = el.borderWidth ?? 2;

      if (el.shapeType === "line") {
        return (
          <div className="w-full h-full flex items-center justify-center px-1 pointer-events-none select-none">
            <div
              className="w-full rounded-full"
              style={{
                height: `${Math.max(bWidth, 2)}px`,
                backgroundColor: shapeColor,
              }}
            />
          </div>
        );
      }
      if (el.shapeType === "square") {
        return (
          <div
            className="w-full h-full pointer-events-none select-none transition-colors"
            style={{
              borderWidth: `${bWidth}px`,
              borderStyle: "solid",
              borderColor: shapeColor,
              backgroundColor: shapeBg,
              borderRadius: el.borderRadius ? `${el.borderRadius}px` : "0px",
            }}
          />
        );
      }
      if (el.shapeType === "rect") {
        return (
          <div
            className="w-full h-full pointer-events-none select-none transition-colors"
            style={{
              borderWidth: `${bWidth}px`,
              borderStyle: "solid",
              borderColor: shapeColor,
              backgroundColor: shapeBg,
              borderRadius: el.borderRadius ? `${el.borderRadius}px` : "0px",
            }}
          />
        );
      }
      if (el.shapeType === "circle") {
        return (
          <div
            className="w-full h-full rounded-full pointer-events-none select-none transition-colors"
            style={{
              borderWidth: `${bWidth}px`,
              borderStyle: "solid",
              borderColor: shapeColor,
              backgroundColor: shapeBg,
            }}
          />
        );
      }
      if (el.shapeType === "triangle") {
        return (
          <div className="w-full h-full flex items-center justify-center pointer-events-none select-none">
            <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none">
              <polygon
                points="50,6 94,94 6,94"
                fill={shapeBg === "transparent" ? "none" : shapeBg}
                stroke={shapeColor}
                strokeWidth={bWidth}
                strokeLinejoin="round"
              />
            </svg>
          </div>
        );
      }
      if (el.shapeType === "corner") {
        return (
          <div className="w-full h-full flex items-center justify-center pointer-events-none select-none text-amber-700/80">
            <svg viewBox="0 0 100 100" className="w-full h-full fill-current">
              <path d="M10,10 L90,10 L90,25 L25,25 L25,90 L10,90 Z" opacity="0.85" />
              <circle cx="55" cy="55" r="8" opacity="0.6" />
            </svg>
          </div>
        );
      }
    }

    if (el.type === "preset") {
      // ═════════════════════════════════════════════════════════════════════════════
      // TEMPLATE 02: EDITORIAL MAGAZINE (CÔNG VINH & HẢI YẾN)
      // ═════════════════════════════════════════════════════════════════════════════

      // 02.1 Hero Cover Photo + Date + Romantic Quote + Coral Floral Motif
      if (el.presetId === "p-mag-hero") {
        const photos = Array.isArray(data.photos) ? data.photos : [];
        const coverPhoto: string = el.imageUrl || (typeof data.coverPhotoUrl === "string" ? data.coverPhotoUrl : "") || (typeof (photos[0] as { url?: string })?.url === "string" ? (photos[0] as { url?: string }).url! : "") || "/images/demo/templates/t02-magazine/cover.jpg";
        const quote = (typeof data.greeting === "string" && data.greeting ? data.greeting : "") || "“Chúng ta đã cùng nhau đi qua nhiều thăng trầm để nhận ra rằng được ở bên nhau là điều quý giá nhất\nHôm nay, trước sự chứng kiến của mọi người, từ khoảnh khắc này chúng ta nhẹ nhàng gọi nhau bằng hai tiếng Vợ - Chồng ”";
        const events = Array.isArray(data.events) ? data.events : [];
        const firstEvent = (events[0] as Record<string, unknown>) || null;
        let dateStr = "28.12.2026";
        if (firstEvent && firstEvent.eventDate) {
          const d = new Date(firstEvent.eventDate as string | number);
          if (!isNaN(d.getTime())) {
            const day = String(d.getDate()).padStart(2, "0");
            const m = String(d.getMonth() + 1).padStart(2, "0");
            const y = d.getFullYear();
            dateStr = `${day}.${m}.${y}`;
          }
        }

        return (
          <div className="w-full h-full relative overflow-hidden select-none bg-stone-100 flex flex-col justify-end">
            <img src={coverPhoto} alt="Cover Wedding" className="absolute inset-0 w-full h-full object-cover object-top" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent pointer-events-none" />

            {/* Bottom Content on Photo */}
            <div className="relative z-10 px-5 pb-6 text-center text-white flex flex-col items-center">
              <h2 className="text-3xl font-serif font-bold tracking-wider mb-3 drop-shadow-md">
                {dateStr}
              </h2>
              <p className="text-[12px] leading-relaxed italic text-white/95 font-sans font-light max-w-[340px] drop-shadow-sm whitespace-pre-line">
                {quote}
              </p>

              {/* Decorative Coral/Pink Outline Flower Motif at Bottom Center */}
              <div className="mt-4 -mb-3 transform translate-y-2">
                <svg width="34" height="34" viewBox="0 0 100 100" fill="none" className="drop-shadow-sm opacity-90">
                  <path d="M50 20 C42 10 28 10 28 26 C28 40 50 50 50 50 C50 50 72 40 72 26 C72 10 58 10 50 20 Z" stroke="#F472B6" strokeWidth="2.5" fill="#FDF2F8" fillOpacity="0.4" />
                  <path d="M20 50 C10 42 10 28 26 28 C40 28 50 50 50 50 C50 50 40 72 26 72 C10 72 10 58 20 50 Z" stroke="#F472B6" strokeWidth="2.5" fill="#FDF2F8" fillOpacity="0.4" />
                  <path d="M50 80 C58 90 72 90 72 74 C72 60 50 50 50 50 C50 50 28 60 28 74 C28 90 42 90 50 80 Z" stroke="#F472B6" strokeWidth="2.5" fill="#FDF2F8" fillOpacity="0.4" />
                  <path d="M80 50 C90 58 90 72 74 72 C60 72 50 50 50 50 C50 50 60 28 74 28 C90 28 90 42 80 50 Z" stroke="#F472B6" strokeWidth="2.5" fill="#FDF2F8" fillOpacity="0.4" />
                  <circle cx="50" cy="50" r="5" stroke="#F472B6" strokeWidth="2" fill="#F472B6" />
                </svg>
              </div>
            </div>
          </div>
        );
      }

      // 02.2 Signatures + Names + Subtitle
      if (el.presetId === "p-mag-signatures") {
        const groomName = (typeof data.groom.fullName === "string" ? data.groom.fullName : "") || "Phạm Công Vinh";
        const brideName = (typeof data.bride.fullName === "string" ? data.bride.fullName : "") || "Nguyễn Hải Yến";
        const groomShort = (typeof data.groom.shortName === "string" ? data.groom.shortName : "") || groomName.split(" ").slice(-1)[0] || "Vinh";
        const brideShort = (typeof data.bride.shortName === "string" ? data.bride.shortName : "") || brideName.split(" ").slice(-1)[0] || "Yên";
        const greeting = data.greeting || "Một hành trình mới của chúng mình bắt đầu từ hôm nay";

        return (
          <div className="w-full h-full px-5 py-4 flex flex-col justify-center items-center select-none bg-[#FAF8F5]">
            <div className="w-full grid grid-cols-2 gap-4 text-center items-end mb-3">
              {/* Bride Column */}
              <div className="flex flex-col items-center">
                <span className="font-cursive text-4xl text-stone-800 leading-none mb-1 transform -rotate-2">
                  {brideShort}
                </span>
                <span className="text-[15px] font-medium text-[#A66358] tracking-wide">
                  {brideName}
                </span>
              </div>

              {/* Groom Column */}
              <div className="flex flex-col items-center">
                <span className="font-cursive text-4xl text-stone-800 leading-none mb-1 transform rotate-2">
                  {groomShort}
                </span>
                <span className="text-[15px] font-medium text-[#A66358] tracking-wide">
                  {groomName}
                </span>
              </div>
            </div>

            <p className="text-xs text-stone-600 font-sans italic text-center max-w-[280px]">
              {greeting}
            </p>
          </div>
        );
      }

      // 02.3 Parents Zigzag
      if (el.presetId === "p-mag-parents-zigzag") {
        const brideAvatar: string = el.imageUrl || (typeof data.bride.avatarUrl === "string" ? data.bride.avatarUrl : "") || "/images/demo/templates/t02-magazine/bride.jpg";
        const groomAvatar: string = (typeof data.groom.avatarUrl === "string" ? data.groom.avatarUrl : "") || "/images/demo/templates/t02-magazine/groom.jpg";
        const brideName = (typeof data.bride.fullName === "string" ? data.bride.fullName : "") || "Nguyễn Hải Yến";
        const groomName = (typeof data.groom.fullName === "string" ? data.groom.fullName : "") || "Phạm Công Vinh";
        const brideRole = (typeof data.bride.birthOrder === "string" ? data.bride.birthOrder : "") || "Út nữ";
        const groomRole = (typeof data.groom.birthOrder === "string" ? data.groom.birthOrder : "") || "Trưởng nam";

        const brideParents = (data.bride.parents as Record<string, unknown>) || {};
        const brideFather = (typeof brideParents.fatherName === "string" ? brideParents.fatherName : "") || "Nguyễn Tiến Minh";
        const brideMother = (typeof brideParents.motherName === "string" ? brideParents.motherName : "") || "Hoàng Cẩm Vân";

        const groomParents = (data.groom.parents as Record<string, unknown>) || {};
        const groomFather = (typeof groomParents.fatherName === "string" ? groomParents.fatherName : "") || "Phạm Minh Toàn";
        const groomMother = (typeof groomParents.motherName === "string" ? groomParents.motherName : "") || "Lại Thị Tâm";

        return (
          <div className="w-full h-full px-4 py-3 flex flex-col justify-between select-none bg-[#FAF8F5] gap-3">
            {/* Row 1: Bride Photo Left | Nhà Gái Right */}
            <div className="flex items-center justify-between gap-3 h-[245px]">
              {/* Bride Portrait with thin frame */}
              <div className="w-[170px] h-full p-1 border border-[#543A2C]/60 bg-white shadow-xs shrink-0 overflow-hidden">
                <img src={brideAvatar} alt="Bride" className="w-full h-full object-cover" />
              </div>

              {/* Nhà Gái Info */}
              <div className="flex-1 flex flex-col items-center justify-center text-center px-1">
                <h4 className="font-serif text-[15px] font-bold text-[#543A2C] uppercase tracking-wider">
                  Nhà Gái
                </h4>
                <div className="w-24 border-b border-dotted border-stone-400 my-1.5" />
                <p className="text-[12px] text-stone-700 font-medium leading-tight">
                  Ông: {brideFather}
                </p>
                <p className="text-[12px] text-stone-700 font-medium leading-tight mt-0.5">
                  Bà: {brideMother}
                </p>
                <span className="text-[10px] text-stone-500 italic mt-1">
                  Hoàng Mai – Hà Nội
                </span>

                {/* Chibi Bride with Bouquet SVG */}
                <div className="my-1.5 size-12 flex items-center justify-center">
                  <svg viewBox="0 0 64 64" className="w-full h-full drop-shadow-xs">
                    <circle cx="32" cy="24" r="14" fill="#FDE2D2" />
                    {/* Hair */}
                    <path d="M18 24 C18 13 24 10 32 10 C40 10 46 13 46 24 C46 24 43 20 32 20 C21 20 18 24 18 24 Z" fill="#2B1A12" />
                    {/* Veil */}
                    <path d="M18 20 Q12 36 20 48 Q32 44 44 48 Q52 36 46 20" fill="#FFFFFF" fillOpacity="0.7" stroke="#E2E8F0" strokeWidth="1" />
                    {/* Eyes */}
                    <circle cx="28" cy="24" r="1.5" fill="#2B1A12" />
                    <circle cx="36" cy="24" r="1.5" fill="#2B1A12" />
                    {/* Blush */}
                    <circle cx="25" cy="27" r="2" fill="#F43F5E" fillOpacity="0.4" />
                    <circle cx="39" cy="27" r="2" fill="#F43F5E" fillOpacity="0.4" />
                    {/* Smile */}
                    <path d="M30 28 Q32 30 34 28" stroke="#E11D48" strokeWidth="1.2" fill="none" strokeLinecap="round" />
                    {/* Dress */}
                    <path d="M24 38 L40 38 L44 58 L20 58 Z" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1" />
                    {/* Bouquet */}
                    <circle cx="32" cy="46" r="5" fill="#F43F5E" />
                    <circle cx="29" cy="45" r="3" fill="#FB923C" />
                    <circle cx="35" cy="45" r="3" fill="#F472B6" />
                  </svg>
                </div>

                <p className="font-serif text-[13px] font-semibold text-[#543A2C]">
                  {brideRole}: <span className="font-bold text-[#8B3A2E]">{brideName}</span>
                </p>
              </div>
            </div>

            {/* Row 2: Nhà Trai Left | Groom Photo Right */}
            <div className="flex items-center justify-between gap-3 h-[245px]">
              {/* Nhà Trai Info */}
              <div className="flex-1 flex flex-col items-center justify-center text-center px-1">
                <h4 className="font-serif text-[15px] font-bold text-[#543A2C] uppercase tracking-wider">
                  Nhà Trai
                </h4>
                <div className="w-24 border-b border-dotted border-stone-400 my-1.5" />
                <p className="text-[12px] text-stone-700 font-medium leading-tight">
                  Ông: {groomFather}
                </p>
                <p className="text-[12px] text-stone-700 font-medium leading-tight mt-0.5">
                  Bà: {groomMother}
                </p>
                <span className="text-[10px] text-stone-500 italic mt-1">
                  Từ Liêm – Hà Nội
                </span>

                {/* Chibi Couple SVG */}
                <div className="my-1.5 size-12 flex items-center justify-center">
                  <svg viewBox="0 0 64 64" className="w-full h-full drop-shadow-xs">
                    {/* Groom Head */}
                    <circle cx="24" cy="22" r="10" fill="#FDE2D2" />
                    <path d="M14 20 C14 13 18 12 24 12 C30 12 34 13 34 20 Z" fill="#1C1917" />
                    <circle cx="22" cy="22" r="1" fill="#1C1917" />
                    <circle cx="26" cy="22" r="1" fill="#1C1917" />
                    {/* Groom Suit */}
                    <path d="M16 32 L32 32 L34 52 L14 52 Z" fill="#1C1917" />
                    <polygon points="24,32 22,38 26,38" fill="#FFFFFF" />
                    <rect x="23" y="34" width="2" height="2" fill="#E11D48" />

                    {/* Bride Head */}
                    <circle cx="40" cy="24" r="10" fill="#FDE2D2" />
                    <path d="M32 23 C32 14 36 13 40 13 C44 13 48 14 48 23 Z" fill="#451A03" />
                    <circle cx="38" cy="24" r="1" fill="#1C1917" />
                    <circle cx="42" cy="24" r="1" fill="#1C1917" />
                    <circle cx="37" cy="26" r="1.5" fill="#FB7185" fillOpacity="0.5" />
                    <circle cx="43" cy="26" r="1.5" fill="#FB7185" fillOpacity="0.5" />
                    {/* Bride Dress */}
                    <path d="M34 34 L46 34 L50 52 L30 52 Z" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1" />
                    {/* Heart over couple */}
                    <path d="M32 12 C30 9 26 10 26 12 C26 14 32 17 32 17 C32 17 38 14 38 12 C38 10 34 9 32 12 Z" fill="#F43F5E" />
                  </svg>
                </div>

                <p className="font-serif text-[13px] font-semibold text-[#543A2C]">
                  {groomRole}: <span className="font-bold text-[#8B3A2E]">{groomName}</span>
                </p>
              </div>

              {/* Groom Portrait with thin frame */}
              <div className="w-[170px] h-full p-1 border border-[#543A2C]/60 bg-white shadow-xs shrink-0 overflow-hidden">
                <img src={groomAvatar} alt="Groom" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        );
      }

      // 02.4 Ceremony Invitation + 3 Photos + Date + Timeline
      if (el.presetId === "p-mag-ceremony-invitation") {
        const groomShort = (typeof data.groom.shortName === "string" ? data.groom.shortName : "") || (typeof data.groom.fullName === "string" ? data.groom.fullName : "") || "Công Vinh";
        const brideShort = (typeof data.bride.shortName === "string" ? data.bride.shortName : "") || (typeof data.bride.fullName === "string" ? data.bride.fullName : "") || "Hải Yến";

        const photos = Array.isArray(data.photos) ? data.photos : [];
        const photo1: string = (typeof (photos[0] as { url?: string })?.url === "string" ? (photos[0] as { url?: string }).url! : "") || "/images/demo/templates/t02-magazine/gallery-1.jpg";
        const photo2: string = (typeof (photos[1] as { url?: string })?.url === "string" ? (photos[1] as { url?: string }).url! : "") || "/images/demo/templates/t02-magazine/gallery-2.jpg";
        const photo3: string = (typeof (photos[2] as { url?: string })?.url === "string" ? (photos[2] as { url?: string }).url! : "") || "/images/demo/templates/t02-magazine/gallery-3.jpg";

        const events = Array.isArray(data.events) ? data.events : [];
        const firstEvent = (events[0] as Record<string, unknown>) || null;
        let dayStr = "27";
        let monthStr = "Tháng 12";
        let yearStr = "Năm 2026";
        let timeStr = "11h00";
        let lunarStr = "(Tức ngày 10 tháng 11 năm Bính Ngọ)";
        let dayOfWeekStr = "Chủ Nhật";

        if (firstEvent && firstEvent.eventDate) {
          const d = new Date(firstEvent.eventDate as string | number);
          if (!isNaN(d.getTime())) {
            dayStr = String(d.getDate()).padStart(2, "0");
            monthStr = `Tháng ${d.getMonth() + 1}`;
            yearStr = `Năm ${d.getFullYear()}`;
            timeStr = `${String(d.getHours()).padStart(2, "0")}h${String(d.getMinutes()).padStart(2, "0")}`;
            const daysOfWeek = ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];
            dayOfWeekStr = daysOfWeek[d.getDay()];
          }
          if (typeof firstEvent.lunarDate === "string") {
            lunarStr = `(Tức ${firstEvent.lunarDate})`;
          }
        }

        return (
          <div className="w-full h-full px-4 py-4 flex flex-col justify-between items-center text-center select-none bg-[#FAF8F5]">
            {/* Dotted divider */}
            <div className="w-full border-b border-dotted border-stone-400 mb-3" />

            {/* Thiệp Mời Heading */}
            <div className="space-y-1 mb-3">
              <h2 className="font-cursive text-4xl text-[#543A2C] leading-none">
                Thiệp Mời
              </h2>
              <p className="text-xs text-stone-700 tracking-wider font-sans font-medium">
                Tham dự lễ cưới {groomShort} &amp; {brideShort}
              </p>
            </div>

            {/* 3 Photos side by side */}
            <div className="grid grid-cols-3 gap-2 w-full h-[155px] mb-4">
              <div className="h-full rounded-xs overflow-hidden shadow-xs border border-stone-200">
                <img src={photo1} alt="Wedding 1" className="w-full h-full object-cover" />
              </div>
              <div className="h-full rounded-xs overflow-hidden shadow-xs border border-stone-200">
                <img src={photo2} alt="Wedding 2" className="w-full h-full object-cover" />
              </div>
              <div className="h-full rounded-xs overflow-hidden shadow-xs border border-stone-200">
                <img src={photo3} alt="Wedding 3" className="w-full h-full object-cover" />
              </div>
            </div>

            {/* Invitation Text */}
            <div className="space-y-1 mb-4">
              <p className="text-[11px] font-semibold text-[#543A2C] uppercase tracking-[0.25em]">
                TRÂN TRỌNG KÍNH MỜI
              </p>
              <h3 className="font-serif text-lg font-bold text-[#8B5A3E] uppercase tracking-[0.3em]">
                QUÝ KHÁCH
              </h3>
              <p className="text-xs text-stone-600 max-w-[280px] mx-auto leading-relaxed">
                Đến dự Bữa Tiệc thân mật cùng Gia Đình chúng Tôi vào lúc
              </p>
            </div>

            {/* Grand Date Component */}
            <div className="w-full max-w-[290px] py-1 text-center">
              <div className="text-xs font-semibold text-stone-700 mb-1">
                {dayOfWeekStr}
              </div>
              <div className="flex items-center justify-center gap-4 py-0.5">
                <span className="text-sm font-serif font-medium text-stone-700 w-16 text-right">
                  {timeStr}
                </span>
                <span className="text-stone-400 font-light text-xl">|</span>
                <span className="text-5xl font-serif font-bold text-[#543A2C] leading-none px-1">
                  {dayStr}
                </span>
                <span className="text-stone-400 font-light text-xl">|</span>
                <span className="text-sm font-serif font-medium text-stone-700 w-16 text-left">
                  {yearStr}
                </span>
              </div>
              <div className="text-xs font-semibold text-stone-700 mt-1">
                {monthStr}
              </div>
              <div className="text-[11px] text-stone-500 italic mt-0.5">
                {lunarStr}
              </div>
            </div>

            {/* 2 Schedule milestones */}
            <div className="w-full grid grid-cols-2 gap-4 mt-3 pt-3 border-t border-stone-200/80">
              <div className="flex items-center justify-center gap-2">
                <span className="text-xl">🥂</span>
                <div className="text-left">
                  <div className="text-xs font-bold text-[#543A2C]">{timeStr}</div>
                  <div className="text-[11px] text-stone-600">Đón khách</div>
                </div>
              </div>
              <div className="flex items-center justify-center gap-2">
                <span className="text-xl">🍽️</span>
                <div className="text-left">
                  <div className="text-xs font-bold text-[#543A2C]">11h30</div>
                  <div className="text-[11px] text-stone-600">Khai Tiệc</div>
                </div>
              </div>
            </div>
          </div>
        );
      }

      // 02.5 Venue Preset (Alternative to Widget)
      if (el.presetId === "p-mag-venue") {
        const events = Array.isArray(data.events) ? data.events : [];
        const firstEvent = (events[0] as Record<string, unknown>) || {};
        const venueName = (firstEvent.venueName as string) || "TƯ GIA NHÀ TRAI";
        const address = (firstEvent.address as string) || "16 P. Phúc Minh, Phúc Diễn, Bắc Từ Liêm, TP. Hà Nội";
        const mapUrl = (firstEvent.mapUrl as string) || "https://maps.google.com";

        return (
          <div className="w-full h-full px-4 py-3 flex flex-col items-center justify-center text-center select-none bg-[#FAF8F5]">
            <div className="inline-block border-b border-[#543A2C]/60 pb-1 mb-2">
              <span className="text-xs uppercase tracking-widest text-stone-600 font-medium">
                Địa chỉ dự tiệc
              </span>
            </div>
            <h3 className="font-serif text-lg font-bold text-[#543A2C] uppercase tracking-wider mb-1">
              {venueName}
            </h3>
            <p className="text-xs text-stone-600 max-w-[280px] leading-relaxed mb-3">
              {address}
            </p>
            <a
              href={mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full bg-[#543A2C] text-white text-xs font-semibold shadow-sm hover:bg-[#3D291F] transition-colors cursor-pointer pointer-events-auto"
            >
              Chỉ đường
            </a>
          </div>
        );
      }

      // 02.6 Calendar & Countdown on Couple Photo
      if (el.presetId === "p-mag-calendar-countdown") {
        const photos = Array.isArray(data.photos) ? data.photos : [];
        const photo: string = el.imageUrl || (typeof (photos[3] as { url?: string })?.url === "string" ? (photos[3] as { url?: string }).url! : "") || "/images/demo/templates/t02-magazine/gallery-4.jpg";
        const events = Array.isArray(data.events) ? data.events : [];
        const firstEvent = (events[0] as Record<string, unknown>) || null;
        let targetDay = 27;
        if (firstEvent && firstEvent.eventDate) {
          const d = new Date(firstEvent.eventDate as string | number);
          if (!isNaN(d.getTime())) {
            targetDay = d.getDate();
          }
        }

        return (
          <div className="w-full h-full relative overflow-hidden select-none bg-stone-900 flex flex-col justify-end text-white">
            <img src={photo} alt="Calendar Background" className="absolute inset-0 w-full h-full object-cover object-center" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/55 to-transparent pointer-events-none" />

            <div className="relative z-10 px-5 pb-5 text-center flex flex-col items-center">
              {/* White Script "Wedding" */}
              <span className="font-cursive text-4xl text-white drop-shadow-md mb-2">
                Wedding
              </span>

              {/* December 31-day Calendar Grid */}
              <div className="w-full max-w-[280px] grid grid-cols-7 gap-y-1.5 gap-x-1 text-center text-xs font-sans text-white/80 my-2">
                {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => {
                  const isWeddingDay = d === targetDay;
                  return (
                    <div key={d} className="flex items-center justify-center h-6">
                      {isWeddingDay ? (
                        <div className="relative flex items-center justify-center">
                          <svg className="absolute size-7 text-rose-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                          </svg>
                          <span className="font-bold text-white text-xs z-10">{d}</span>
                        </div>
                      ) : (
                        <span className="font-light">{d}</span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Script "Chỉ còn...." */}
              <div className="w-full flex items-center justify-between mt-3 mb-2 px-2">
                <span className="font-cursive text-2xl text-white italic drop-shadow-sm">
                  Chỉ còn....
                </span>
              </div>

              {/* 4 White Countdown Square Boxes */}
              <div className="grid grid-cols-4 gap-2 w-full max-w-[310px]">
                {[
                  { num: "93", label: "ngày" },
                  { num: "13", label: "giờ" },
                  { num: "02", label: "phút" },
                  { num: "51", label: "giây" },
                ].map((item, idx) => (
                  <div key={idx} className="bg-white rounded-md py-2 px-1 text-center shadow-lg">
                    <span className="text-base font-bold text-stone-900 font-sans block leading-tight">
                      {item.num}
                    </span>
                    <span className="text-[10px] text-stone-500 font-medium block">
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      }

      // 02.7 RSVP Kraft Envelope & Overlaid White Card
      if (el.presetId === "p-mag-rsvp-envelope") {
        return (
          <div className="w-full h-full px-4 py-4 flex flex-col items-center justify-between select-none bg-[#FAF8F5] text-center">
            {/* Friendly message */}
            <div className="space-y-1.5 max-w-[320px] text-center mb-2">
              <p className="text-[11px] leading-relaxed text-stone-700 font-sans">
                Chúng mình rất mong sự hiện diện của bạn để cùng nhau chung vui, sẻ chia niềm hạnh phúc và lưu lại những khoảnh khắc đáng nhớ trong ngày cưới
              </p>
              <p className="text-[11px] leading-relaxed text-stone-600 font-sans italic">
                Đừng quên để lại xác nhận tham dự để chúng mình chuẩn bị chu đáo hơn!
              </p>
            </div>

            {/* Kraft Envelope Visual with Wax Seal and Overlaid RSVP Card */}
            <div className="relative w-[320px] h-[220px] mx-auto flex items-center justify-center">
              {/* Kraft Envelope Body */}
              <div className="absolute inset-0 bg-[#E8DFD5] rounded-xl shadow-md border border-[#D5C7B7] overflow-hidden">
                {/* Flap triangles */}
                <div className="absolute top-0 inset-x-0 h-16 bg-[#DDD1C3] [clip-path:polygon(0%_0%,100%_0%,50%_100%)] opacity-80" />
                {/* Envelope Seal Stamp */}
                <div className="absolute top-12 left-1/2 -translate-x-1/2 size-9 rounded-full bg-[#8B4513] shadow-md border border-[#A0522D] flex items-center justify-center text-amber-200/90 font-serif text-xs">
                  囍
                </div>
              </div>

              {/* White RSVP Card Overlaid */}
              <div className="absolute bottom-0 right-2 w-[220px] bg-white rounded-xl shadow-2xl border border-stone-100 p-3.5 text-center z-10 flex flex-col items-center">
                <span className="text-[10px] uppercase tracking-[0.25em] text-stone-400 font-semibold block mb-0.5">
                  R.S.V.P.
                </span>
                <h4 className="font-serif text-sm font-bold text-stone-800 mb-1">
                  Xác nhận tham dự
                </h4>
                <p className="text-[10px] text-stone-500 leading-tight mb-2.5">
                  Vui lòng xác nhận tham dự để chúng mình chuẩn bị lễ cưới được thuận lợi và trọn vẹn nhất.
                </p>
                <button
                  type="button"
                  onClick={onRsvp}
                  className="w-full py-1.5 px-3 rounded-full bg-[#543A2C] text-white text-xs font-medium shadow-sm hover:bg-[#3D291F] transition-colors flex items-center justify-center gap-1.5 cursor-pointer pointer-events-auto"
                >
                  <span>✍️</span> Gửi xác nhận
                </button>
              </div>
            </div>
          </div>
        );
      }

      // 02.8 Gift Section - Floating Hearts Envelope
      if (el.presetId === "p-mag-gift") {
        return (
          <div
            onClick={onGift}
            className="w-full h-full px-4 py-3 flex flex-col items-center justify-center select-none bg-[#FAF8F5] cursor-pointer hover:opacity-95 transition-opacity pointer-events-auto"
          >
            {/* Open Envelope with floating pink hearts */}
            <div className="relative size-24 mb-2 flex items-center justify-center">
              <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
                {/* Floating Hearts */}
                <path d="M50 25 C47 20 40 21 40 25 C40 30 50 35 50 35 C50 35 60 30 60 25 C60 21 53 20 50 25 Z" fill="#F472B6" />
                <path d="M38 18 C36 14 30 15 30 18 C30 22 38 26 38 26 C38 26 46 22 46 18 C46 15 40 14 38 18 Z" fill="#FB7185" />
                <path d="M60 16 C58 13 54 13 54 16 C54 20 60 23 60 23 C60 23 66 20 66 16 C66 13 62 13 60 16 Z" fill="#FDA4AF" />

                {/* Back flap */}
                <polygon points="15,40 50,22 85,40" fill="#E6DACD" />
                {/* Envelope Pocket */}
                <rect x="15" y="40" width="70" height="48" rx="4" fill="#F5EFEB" stroke="#D5C7B7" strokeWidth="1" />
                {/* Front folded flaps */}
                <polygon points="15,40 50,65 15,88" fill="#ECE2D7" />
                <polygon points="85,40 50,65 85,88" fill="#ECE2D7" />
                <polygon points="15,88 50,62 85,88" fill="#F0E8DF" stroke="#D5C7B7" strokeWidth="0.5" />
              </svg>
            </div>

            <span className="font-serif text-base font-semibold text-[#543A2C] tracking-wide flex items-center gap-1.5 hover:underline">
              Gửi quà mừng
            </span>
          </div>
        );
      }

      // 02.9 Album Ảnh Cưới (1 Big Landscape + 3 Vertical + 2 Vertical)
      if (el.presetId === "p-mag-album") {
        const photos = Array.isArray(data.photos) ? data.photos : [];
        const p1: string = (typeof (photos[4] as { url?: string })?.url === "string" ? (photos[4] as { url?: string }).url! : "") || "/images/demo/templates/t02-magazine/gallery-5.jpg"; // big landscape
        const p2: string = (typeof (photos[0] as { url?: string })?.url === "string" ? (photos[0] as { url?: string }).url! : "") || "/images/demo/templates/t02-magazine/gallery-1.jpg";
        const p3: string = (typeof (photos[1] as { url?: string })?.url === "string" ? (photos[1] as { url?: string }).url! : "") || "/images/demo/templates/t02-magazine/gallery-2.jpg";
        const p4: string = (typeof (photos[2] as { url?: string })?.url === "string" ? (photos[2] as { url?: string }).url! : "") || "/images/demo/templates/t02-magazine/gallery-3.jpg";
        const p5: string = (typeof (photos[3] as { url?: string })?.url === "string" ? (photos[3] as { url?: string }).url! : "") || "/images/demo/templates/t02-magazine/gallery-4.jpg";
        const p6: string = (typeof (photos[5] as { url?: string })?.url === "string" ? (photos[5] as { url?: string }).url! : "") || "/images/demo/templates/t02-magazine/gallery-6.jpg";

        return (
          <div className="w-full h-full px-4 py-4 flex flex-col justify-between select-none bg-[#FAF8F5]">
            {/* Header: ALBUM ẢNH CƯỚI with line */}
            <div className="flex items-center gap-3 mb-3">
              <h3 className="font-serif text-sm font-bold text-stone-800 uppercase tracking-widest shrink-0">
                ALBUM ẢNH CƯỚI
              </h3>
              <div className="flex-1 border-b border-stone-800" />
            </div>

            {/* Grid of photos: 1 wide + 3 vertical + 2 vertical */}
            <div className="flex flex-col gap-2 flex-1">
              {/* Top Landscape Photo */}
              <div className="w-full h-[220px] rounded-xs overflow-hidden shadow-xs border border-stone-200">
                <img src={p1} alt="Album 1" className="w-full h-full object-cover" />
              </div>

              {/* Middle 3 Vertical Photos */}
              <div className="grid grid-cols-3 gap-2 h-[220px]">
                <div className="h-full rounded-xs overflow-hidden shadow-xs border border-stone-200">
                  <img src={p2} alt="Album 2" className="w-full h-full object-cover" />
                </div>
                <div className="h-full rounded-xs overflow-hidden shadow-xs border border-stone-200">
                  <img src={p3} alt="Album 3" className="w-full h-full object-cover" />
                </div>
                <div className="h-full rounded-xs overflow-hidden shadow-xs border border-stone-200">
                  <img src={p4} alt="Album 4" className="w-full h-full object-cover" />
                </div>
              </div>

              {/* Bottom 2 Vertical Photos */}
              <div className="grid grid-cols-2 gap-2 h-[240px]">
                <div className="h-full rounded-xs overflow-hidden shadow-xs border border-stone-200">
                  <img src={p5} alt="Album 5" className="w-full h-full object-cover" />
                </div>
                <div className="h-full rounded-xs overflow-hidden shadow-xs border border-stone-200">
                  <img src={p6} alt="Album 6" className="w-full h-full object-cover" />
                </div>
              </div>
            </div>
          </div>
        );
      }

      // 02.10 Farewell: Full Photo + TRÂN TRỌNG & BIẾT ƠN !
      if (el.presetId === "p-mag-farewell") {
        const photos = Array.isArray(data.photos) ? data.photos : [];
        const photo: string = el.imageUrl || (typeof (photos[5] as { url?: string })?.url === "string" ? (photos[5] as { url?: string }).url! : "") || (typeof data.coverPhotoUrl === "string" ? data.coverPhotoUrl : "") || "/images/demo/templates/t02-magazine/gallery-6.jpg";

        return (
          <div className="w-full h-full relative overflow-hidden select-none bg-stone-900 flex flex-col justify-end text-white">
            <img src={photo} alt="Farewell Photo" className="absolute inset-0 w-full h-full object-cover object-top" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent pointer-events-none" />

            <div className="relative z-10 px-6 pb-12 text-center flex flex-col items-center">
              <h2 className="font-serif text-2xl font-bold tracking-[0.2em] leading-snug drop-shadow-md">
                TRÂN TRỌNG
              </h2>
              <span className="font-serif text-xl font-light text-white/80 my-0.5">
                &amp;
              </span>
              <h2 className="font-serif text-2xl font-bold tracking-[0.2em] leading-snug drop-shadow-md">
                BIẾT ƠN !
              </h2>
            </div>
          </div>
        );
      }

      // ═════════════════════════════════════════════════════════════════════════════
      // TEMPLATE 04: QUÝ TỘC ĐỎ RƯỢU MARSALA & CỔNG VÒM (NGUYỄN MINH & BÙI PHƯƠNG)
      // ═════════════════════════════════════════════════════════════════════════════

      // 04.1 Hero Cover Photo + Top Left "Save the date" + Polaroid Duo Cards
      if (el.presetId === "p-marsala-hero") {
        const photos = Array.isArray(data.photos) ? data.photos : [];
        const coverPhoto: string = el.imageUrl || (typeof data.coverPhotoUrl === "string" ? data.coverPhotoUrl : "") || (typeof (photos[0] as { url?: string })?.url === "string" ? (photos[0] as { url?: string }).url! : "") || "/images/demo/templates/t04-marsala/cover.jpg";
        const groomPhoto = (typeof data.groom?.avatarUrl === "string" ? data.groom.avatarUrl : "") || "/images/demo/templates/t04-marsala/groom.jpg";
        const bridePhoto = (typeof data.bride?.avatarUrl === "string" ? data.bride.avatarUrl : "") || "/images/demo/templates/t04-marsala/bride.jpg";
        const groomName = (typeof data.groom?.fullName === "string" ? data.groom.fullName : "") || "Nguyễn Minh";
        const brideName = (typeof data.bride?.fullName === "string" ? data.bride.fullName : "") || "Bùi Phương";

        const events = Array.isArray(data.events) ? data.events : [];
        const firstEvent = (events[0] as Record<string, unknown>) || null;
        let dateStr = "20.12.2026";
        if (firstEvent && firstEvent.eventDate) {
          const d = new Date(firstEvent.eventDate as string | number);
          if (!isNaN(d.getTime())) {
            const day = String(d.getDate()).padStart(2, "0");
            const m = String(d.getMonth() + 1).padStart(2, "0");
            const y = d.getFullYear();
            dateStr = `${day}.${m}.${y}`;
          }
        }

        return (
          <div className="w-full h-full relative overflow-hidden select-none bg-stone-900 flex flex-col justify-between">
            <img src={coverPhoto} alt="Cover Marsala" className="absolute inset-0 w-full h-full object-cover object-top" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/40 pointer-events-none" />

            {/* Top Left: Save the date + Date */}
            <div className="relative z-10 pt-6 pl-5 text-left">
              <span className="font-cursive text-3xl text-white drop-shadow-md block leading-none">
                Save the date
              </span>
              <span className="text-xs font-mono font-bold tracking-widest text-rose-300 drop-shadow mt-1 block">
                {dateStr}
              </span>
            </div>

            {/* Bottom: 2 Framed Polaroid-style Cards for Groom & Bride */}
            <div className="relative z-10 px-4 pb-6 w-full">
              <div className="grid grid-cols-2 gap-3.5 max-w-[340px] mx-auto">
                {/* Groom Card */}
                <div className="bg-white p-2 rounded-xl shadow-2xl border border-white/90 flex flex-col items-center text-center transform -rotate-1 hover:rotate-0 transition-transform duration-300">
                  <div className="w-full aspect-[4/5] rounded-lg overflow-hidden bg-stone-100 mb-2">
                    <img src={groomPhoto} alt={groomName} className="w-full h-full object-cover" />
                  </div>
                  <span className="text-[10px] font-serif font-bold text-[#6B1724] tracking-widest uppercase block">
                    GROOM
                  </span>
                  <span className="text-[8px] text-amber-600/80 tracking-widest -mt-0.5 mb-0.5 block">
                    ••• ✦ •••
                  </span>
                  <span className="font-cursive text-xl text-stone-900 leading-tight block">
                    {groomName}
                  </span>
                </div>

                {/* Bride Card */}
                <div className="bg-white p-2 rounded-xl shadow-2xl border border-white/90 flex flex-col items-center text-center transform rotate-1 hover:rotate-0 transition-transform duration-300">
                  <div className="w-full aspect-[4/5] rounded-lg overflow-hidden bg-stone-100 mb-2">
                    <img src={bridePhoto} alt={brideName} className="w-full h-full object-cover" />
                  </div>
                  <span className="text-[10px] font-serif font-bold text-[#6B1724] tracking-widest uppercase block">
                    BRIDE
                  </span>
                  <span className="text-[8px] text-amber-600/80 tracking-widest -mt-0.5 mb-0.5 block">
                    ••• ✦ •••
                  </span>
                  <span className="font-cursive text-xl text-stone-900 leading-tight block">
                    {brideName}
                  </span>
                </div>
              </div>
            </div>
          </div>
        );
      }

      // 04.2 Greeting & Arch Photo with Frosted Glass Calendar Overlay
      if (el.presetId === "p-marsala-arch-calendar") {
        const photos = Array.isArray(data.photos) ? data.photos : [];
        const archPhoto = (typeof (photos[1] as { url?: string })?.url === "string" ? (photos[1] as { url?: string }).url! : "") || (typeof (photos[0] as { url?: string })?.url === "string" ? (photos[0] as { url?: string }).url! : "") || "/images/demo/templates/t04-marsala/gallery-1.jpg";
        const events = Array.isArray(data.events) ? data.events : [];
        const firstEvent = (events[0] as Record<string, unknown>) || null;
        let targetDay = 20;
        let yearNum = 2026;
        if (firstEvent && firstEvent.eventDate) {
          const d = new Date(firstEvent.eventDate as string | number);
          if (!isNaN(d.getTime())) {
            targetDay = d.getDate();
            yearNum = d.getFullYear();
          }
        }

        return (
          <div className="w-full h-full px-4 pt-6 pb-4 flex flex-col items-center justify-between select-none bg-[#FAF8F6]">
            {/* Header Invitation */}
            <div className="text-center space-y-1">
              <span className="text-[11px] font-serif uppercase tracking-[0.3em] text-stone-600 block">
                TRÂN TRỌNG KÍNH MỜI
              </span>
              <h2 className="font-cursive text-4xl text-[#7B1824] my-0.5 drop-shadow-xs">
                Quý Khách
              </h2>
              <p className="text-xs text-stone-600 font-sans tracking-wide">
                Dự Tiệc mừng Lễ Thành Hôn của chúng mình
              </p>
            </div>

            {/* Arch Container */}
            <div className="relative flex flex-col items-center mt-3">
              <span className="text-[11px] font-serif uppercase tracking-[0.35em] text-[#6B1724] font-semibold text-center mb-2.5">
                WELCOME TO OUR WEDDING
              </span>

              {/* Arch Photo Frame */}
              <div className="w-[300px] h-[430px] rounded-t-[150px] rounded-b-2xl overflow-hidden relative shadow-2xl border-4 border-white">
                <img src={archPhoto} alt="Wedding Arch" className="w-full h-full object-cover object-center" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

                {/* Circular Glassmorphism Calendar */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-[210px] h-[210px] rounded-full bg-black/45 backdrop-blur-md border border-white/40 text-white p-3 flex flex-col items-center justify-center shadow-2xl">
                  <span className="text-xs font-mono font-bold tracking-widest text-rose-200 mb-1">
                    {yearNum}
                  </span>
                  {/* Days of week */}
                  <div className="w-full grid grid-cols-7 gap-1 text-[8.5px] font-mono text-center text-white/80 mb-1">
                    {["T2", "T3", "T4", "T5", "T6", "T7", "CN"].map((dw) => (
                      <span key={dw}>{dw}</span>
                    ))}
                  </div>
                  {/* Calendar 31 days (Dec 2026 starts on Tuesday -> 1 blank) */}
                  <div className="w-full grid grid-cols-7 gap-1 text-[9px] font-mono text-center text-white">
                    <span /> {/* Tuesday start */}
                    {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => {
                      const isTarget = d === targetDay;
                      return (
                        <div key={d} className="flex items-center justify-center h-4.5">
                          {isTarget ? (
                            <span className="relative flex items-center justify-center size-5 rounded-full bg-[#9E1B2A] text-white font-bold text-[9px] shadow ring-1 ring-white">
                              {d}
                            </span>
                          ) : (
                            <span className="opacity-80">{d}</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      }

      // 04.3 Two Crimson Wine Invitation Cards (Nhà Trai & Nhà Gái)
      if (el.presetId === "p-marsala-invitation-cards") {
        const events = Array.isArray(data.events) ? data.events : [];
        const ev1 = (events[0] as Record<string, unknown>) || {};
        const ev2 = (events[1] as Record<string, unknown>) || {};

        const ev1Name = (ev1.eventName as string) || "TIỆC CƯỚI NHÀ TRAI";
        const ev1Venue = (ev1.venueName as string) || "TẠI KHU PHỐ XUÂN THƯỢNG";
        const ev1Address = (ev1.address as string) || "Quảng Vinh, Nam Sầm Sơn, Thanh Hóa";
        const ev1Lunar = (ev1.lunarDate as string) || "Tức ngày 06 tháng 11 năm Bính Ngọ";
        const ev1MapUrl = (ev1.mapUrl as string) || "https://maps.google.com";

        const ev2Name = (ev2.eventName as string) || "TIỆC CƯỚI NHÀ GÁI";
        const ev2Venue = (ev2.venueName as string) || "TẠI TƯ GIA NHÀ GÁI";
        const ev2Address = (ev2.address as string) || "Xóm 9, Ngũ Phúc, Tống Trân, Hưng Yên";
        const ev2Lunar = (ev2.lunarDate as string) || "Tức ngày 05 tháng 11 năm Bính Ngọ";
        const ev2MapUrl = (ev2.mapUrl as string) || "https://maps.google.com";

        return (
          <div className="w-full h-full px-4 py-4 flex flex-col justify-between select-none bg-[#FAF8F6]">
            {/* Title */}
            <div className="text-center mb-1">
              <h3 className="font-serif text-lg font-bold text-[#6B1724] uppercase tracking-wider">
                THƯ MỜI TIỆC CƯỚI
              </h3>
              <div className="flex items-center justify-center gap-2 text-stone-400 mt-0.5">
                <span className="w-8 h-px bg-stone-300" />
                <span className="text-[10px] text-[#C9A45C]">❖</span>
                <span className="w-8 h-px bg-stone-300" />
              </div>
            </div>

            {/* Card 1: Nhà Trai */}
            <div className="w-full rounded-2xl bg-[#5E121E] text-white p-4 shadow-xl border border-rose-950/50 text-center relative overflow-hidden">
              <div className="border border-amber-200/25 rounded-xl py-3 px-2 flex flex-col items-center">
                <span className="font-serif text-sm font-bold tracking-widest text-amber-100 uppercase">
                  {ev1Name}
                </span>
                <span className="text-[11px] tracking-widest text-rose-200 mt-0.5 uppercase">
                  CHỦ NHẬT — 16 : 00
                </span>
                <span className="font-serif text-3xl font-bold text-white tracking-wide my-1">
                  20.12.2026
                </span>
                <span className="text-[10px] italic text-rose-200/90 font-light">
                  {ev1Lunar}
                </span>
                <span className="text-xs font-bold tracking-wide text-amber-100 mt-2 uppercase">
                  {ev1Venue}
                </span>
                <span className="text-[11px] text-rose-100/90 mt-0.5 max-w-[280px] line-clamp-1">
                  {ev1Address}
                </span>
                <a
                  href={ev1MapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2.5 px-5 py-1.5 rounded-full bg-white text-[#5E121E] text-xs font-bold shadow-md hover:bg-rose-50 transition-colors pointer-events-auto"
                >
                  Xem chỉ đường
                </a>
              </div>
            </div>

            {/* Card 2: Nhà Gái */}
            <div className="w-full rounded-2xl bg-[#5E121E] text-white p-4 shadow-xl border border-rose-950/50 text-center relative overflow-hidden">
              <div className="border border-amber-200/25 rounded-xl py-3 px-2 flex flex-col items-center">
                <span className="font-serif text-sm font-bold tracking-widest text-amber-100 uppercase">
                  {ev2Name}
                </span>
                <span className="text-[11px] tracking-widest text-rose-200 mt-0.5 uppercase">
                  THỨ BẢY — 18 : 00
                </span>
                <span className="font-serif text-3xl font-bold text-white tracking-wide my-1">
                  19.12.2026
                </span>
                <span className="text-[10px] italic text-rose-200/90 font-light">
                  {ev2Lunar}
                </span>
                <span className="text-xs font-bold tracking-wide text-amber-100 mt-2 uppercase">
                  {ev2Venue}
                </span>
                <span className="text-[11px] text-rose-100/90 mt-0.5 max-w-[280px] line-clamp-1">
                  {ev2Address}
                </span>
                <a
                  href={ev2MapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2.5 px-5 py-1.5 rounded-full bg-white text-[#5E121E] text-xs font-bold shadow-md hover:bg-rose-50 transition-colors pointer-events-auto"
                >
                  Xem chỉ đường
                </a>
              </div>
            </div>
          </div>
        );
      }

      // 04.4 Lễ Thành Hôn (Nhà Trai) + Split Photo & Address + Wine Red Countdown
      if (el.presetId === "p-marsala-ceremony-groom") {
        const photos = Array.isArray(data.photos) ? data.photos : [];
        const photoUrl = (typeof (photos[2] as { url?: string })?.url === "string" ? (photos[2] as { url?: string }).url! : "") || "/images/demo/templates/t04-marsala/gallery-2.jpg";
        const events = Array.isArray(data.events) ? data.events : [];
        const ev = (events[0] as Record<string, unknown>) || {};
        const venueName = (ev.venueName as string) || "TƯ GIA NHÀ TRAI";
        const address = (ev.address as string) || "Quảng Vinh, Nam Sầm Sơn\nThanh Hóa";
        const mapUrl = (ev.mapUrl as string) || "https://maps.google.com";

        return (
          <div className="w-full h-full px-5 py-5 flex flex-col justify-between select-none bg-[#FAF8F6]">
            {/* Header */}
            <div className="text-center space-y-0.5">
              <span className="font-cursive text-3xl text-[#7B1824] block drop-shadow-xs">
                We got married
              </span>
              <h3 className="font-serif text-2xl font-bold text-[#6B1724] uppercase tracking-wider">
                LỄ THÀNH HÔN
              </h3>
              <span className="text-xs uppercase tracking-widest text-stone-600 font-medium block pt-1">
                CHỦ NHẬT
              </span>
              {/* Date Box: THÁNG 12 | 20 | NĂM 2026 */}
              <div className="flex items-center justify-center gap-3 my-2">
                <span className="border-y border-stone-400/60 py-1 px-3 text-xs font-serif font-medium text-stone-700 tracking-wider">
                  THÁNG 12
                </span>
                <span className="font-serif text-4xl font-bold text-[#6B1724] px-1">
                  20
                </span>
                <span className="border-y border-stone-400/60 py-1 px-3 text-xs font-serif font-medium text-stone-700 tracking-wider">
                  NĂM 2026
                </span>
              </div>
              <span className="text-sm font-mono font-semibold text-stone-800 block">
                16 : 00
              </span>
              <span className="text-[11px] italic text-stone-500 block">
                Nhằm ngày 06 tháng 11 năm Bính Ngọ
              </span>
            </div>

            {/* Split Content: Photo Left, Address Right */}
            <div className="grid grid-cols-2 gap-3.5 items-center my-2">
              <div className="w-full h-[220px] rounded-xl overflow-hidden shadow-lg border-2 border-white">
                <img src={photoUrl} alt="Lễ Thành Hôn" className="w-full h-full object-cover object-top" />
              </div>
              <div className="flex flex-col justify-center items-start text-left pl-1">
                <span className="font-serif text-sm font-bold text-[#6B1724] tracking-[0.25em] uppercase">
                  ADDRESS
                </span>
                <span className="font-bold text-xs text-stone-900 mt-1 uppercase">
                  {venueName}
                </span>
                <span className="text-[11px] text-stone-600 leading-snug mt-1 whitespace-pre-line">
                  {address}
                </span>
                {/* Mini Google Maps Card */}
                <a
                  href={mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 w-full border border-stone-300 rounded-lg p-2 bg-white shadow-sm flex items-center justify-between pointer-events-auto hover:border-rose-400 transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm">📍</span>
                    <span className="text-[11px] font-medium text-stone-700 font-sans">Bản đồ</span>
                  </div>
                  <span className="text-[10px] font-bold text-[#6B1724]">Maps ↗</span>
                </a>
              </div>
            </div>

            {/* 4 Wine Red Countdown Boxes */}
            <div className="grid grid-cols-4 gap-2.5 max-w-[320px] mx-auto w-full pt-1">
              {[
                { num: "85", label: "ngày" },
                { num: "19", label: "giờ" },
                { num: "22", label: "phút" },
                { num: "43", label: "giây" },
              ].map((box, idx) => (
                <div key={idx} className="bg-[#6B1724] text-white rounded-xl py-2 px-1 text-center shadow-lg border border-rose-950/40">
                  <span className="text-lg font-bold font-mono block leading-none">{box.num}</span>
                  <span className="text-[9.5px] uppercase opacity-90 block mt-1 tracking-wider font-sans">{box.label}</span>
                </div>
              ))}
            </div>
          </div>
        );
      }

      // 04.5 Lễ Vu Quy (Nhà Gái) + Mirrored Split + Poem
      if (el.presetId === "p-marsala-ceremony-bride") {
        const photos = Array.isArray(data.photos) ? data.photos : [];
        const photoUrl = (typeof (photos[3] as { url?: string })?.url === "string" ? (photos[3] as { url?: string }).url! : "") || "/images/demo/templates/t04-marsala/gallery-3.jpg";
        const events = Array.isArray(data.events) ? data.events : [];
        const ev = (events[1] as Record<string, unknown>) || {};
        const venueName = (ev.venueName as string) || "TƯ GIA NHÀ GÁI";
        const address = (ev.address as string) || "Tam Đa, Tống Trân\nHưng Yên";
        const mapUrl = (ev.mapUrl as string) || "https://maps.google.com";

        return (
          <div className="w-full h-full px-5 py-5 flex flex-col justify-between select-none bg-[#FAF8F6]">
            {/* Header */}
            <div className="text-center space-y-0.5">
              <h3 className="font-serif text-2xl font-bold text-[#6B1724] uppercase tracking-wider">
                LỄ VU QUY
              </h3>
              <span className="text-xs uppercase tracking-widest text-stone-600 font-medium block pt-1">
                CHỦ NHẬT
              </span>
              {/* Date Box: THÁNG 12 | 20 | NĂM 2026 */}
              <div className="flex items-center justify-center gap-3 my-2">
                <span className="border-y border-stone-400/60 py-1 px-3 text-xs font-serif font-medium text-stone-700 tracking-wider">
                  THÁNG 12
                </span>
                <span className="font-serif text-4xl font-bold text-[#6B1724] px-1">
                  20
                </span>
                <span className="border-y border-stone-400/60 py-1 px-3 text-xs font-serif font-medium text-stone-700 tracking-wider">
                  NĂM 2026
                </span>
              </div>
              <span className="text-sm font-mono font-semibold text-stone-800 block">
                10 : 00
              </span>
              <span className="text-[11px] italic text-stone-500 block">
                Nhằm ngày 06 tháng 11 năm Bính Ngọ
              </span>
            </div>

            {/* Mirrored Split Content: Address Left, Photo Right */}
            <div className="grid grid-cols-2 gap-3.5 items-center my-2">
              <div className="flex flex-col justify-center items-start text-left pr-1">
                <span className="font-serif text-sm font-bold text-[#6B1724] tracking-[0.25em] uppercase">
                  ADDRESS
                </span>
                <span className="font-bold text-xs text-stone-900 mt-1 uppercase">
                  {venueName}
                </span>
                <span className="text-[11px] text-stone-600 leading-snug mt-1 whitespace-pre-line">
                  {address}
                </span>
                <a
                  href={mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 w-full border border-stone-300 rounded-lg p-2 bg-white shadow-sm flex items-center justify-between pointer-events-auto hover:border-rose-400 transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm">📍</span>
                    <span className="text-[11px] font-medium text-stone-700 font-sans">Bản đồ</span>
                  </div>
                  <span className="text-[10px] font-bold text-[#6B1724]">Maps ↗</span>
                </a>
              </div>
              <div className="w-full h-[220px] rounded-xl overflow-hidden shadow-lg border-2 border-white">
                <img src={photoUrl} alt="Lễ Vu Quy" className="w-full h-full object-cover object-top" />
              </div>
            </div>

            {/* 4 Wine Red Countdown Boxes */}
            <div className="grid grid-cols-4 gap-2.5 max-w-[320px] mx-auto w-full pt-1">
              {[
                { num: "85", label: "ngày" },
                { num: "13", label: "giờ" },
                { num: "22", label: "phút" },
                { num: "43", label: "giây" },
              ].map((box, idx) => (
                <div key={idx} className="bg-[#6B1724] text-white rounded-xl py-2 px-1 text-center shadow-lg border border-rose-950/40">
                  <span className="text-lg font-bold font-mono block leading-none">{box.num}</span>
                  <span className="text-[9.5px] uppercase opacity-90 block mt-1 tracking-wider font-sans">{box.label}</span>
                </div>
              ))}
            </div>

            {/* Poetic Couplet */}
            <div className="text-center pt-3">
              <p className="font-cursive text-xl text-stone-700 leading-relaxed italic">
                “Hôn duyên nên nghĩa vợ chồng<br />
                Trăm năm giữ trọn tấm lòng cùng nhau”
              </p>
            </div>
          </div>
        );
      }

      // 04.6 Overlapping Photo Collage with Soft Warm Tone
      if (el.presetId === "p-marsala-photo-collage") {
        const photos = Array.isArray(data.photos) ? data.photos : [];
        const photo1 = (typeof (photos[4] as { url?: string })?.url === "string" ? (photos[4] as { url?: string }).url! : "") || "/images/demo/templates/t04-marsala/gallery-4.jpg";
        const photo2 = (typeof (photos[5] as { url?: string })?.url === "string" ? (photos[5] as { url?: string }).url! : "") || "/images/demo/templates/t04-marsala/gallery-5.jpg";

        return (
          <div className="w-full h-full px-4 py-6 flex items-center justify-center select-none bg-[#EFE8E3] rounded-3xl relative overflow-hidden shadow-inner">
            <div className="relative w-full max-w-[340px] h-[460px] flex flex-col items-center justify-center">
              {/* Top Photo */}
              <div className="w-[280px] h-[220px] rounded-2xl overflow-hidden shadow-xl border-4 border-white transform translate-x-3 z-10 hover:scale-102 transition-transform duration-300">
                <img src={photo1} alt="Wedding Couple Moment" className="w-full h-full object-cover" />
              </div>

              {/* Bottom Overlapping Photo */}
              <div className="w-[270px] h-[220px] rounded-2xl overflow-hidden shadow-2xl border-4 border-white transform -translate-x-3 -mt-10 z-20 hover:scale-102 transition-transform duration-300">
                <img src={photo2} alt="Wedding Couple Smile" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        );
      }

      // 04.7 RSVP Xác nhận tham dự
      if (el.presetId === "p-marsala-rsvp") {
        return (
          <div className="w-full h-full px-5 py-6 flex flex-col items-center justify-center text-center select-none bg-white">
            <span className="text-[11px] font-mono tracking-[0.35em] text-[#6B1724] font-bold uppercase block mb-1">
              R . S . V . P .
            </span>
            <h3 className="font-serif text-2xl font-bold text-stone-900 mb-4">
              Xác nhận tham dự
            </h3>
            <button
              type="button"
              onClick={onRsvp}
              className="px-8 py-3 rounded-full bg-[#6B1724] hover:bg-[#58121D] text-white font-semibold text-xs tracking-wider uppercase shadow-xl flex items-center gap-2 transition-transform active:scale-95 cursor-pointer pointer-events-auto"
            >
              <span>✍️</span>
              <span>Gửi xác nhận</span>
            </button>
          </div>
        );
      }

      // 04.8 Hộp Quà Trái Tim & Mừng Cưới
      if (el.presetId === "p-marsala-gift") {
        return (
          <div className="w-full h-full px-5 py-6 flex flex-col items-center justify-center text-center select-none bg-white border-t border-stone-100">
            {/* 3D Heart Gift Box */}
            <div
              onClick={onGift}
              className="group cursor-pointer pointer-events-auto flex flex-col items-center transition-transform hover:scale-105 active:scale-95 duration-300"
            >
              <div className="relative w-28 h-20 flex items-center justify-center">
                {/* 3D Box Body */}
                <div className="w-24 h-14 bg-gradient-to-br from-[#FF4D6D] via-[#E63956] to-[#C9184A] rounded-2xl shadow-xl flex items-center justify-center relative overflow-hidden border border-rose-300/40">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                  <span className="text-white text-xs font-serif font-bold tracking-wider">GIFT BOX</span>
                </div>
                {/* Heart Box Lid Ajar */}
                <div className="absolute -top-3 right-0 size-12 bg-gradient-to-tr from-[#FF758F] to-[#FF4D6D] rounded-full flex items-center justify-center shadow-lg border-2 border-white transform rotate-12 group-hover:-translate-y-1 transition-transform">
                  <svg className="size-7 text-white drop-shadow-sm" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                  </svg>
                </div>
              </div>

              <span className="font-serif font-bold text-base text-[#6B1724] tracking-wide mt-3 block group-hover:text-[#8E2838] transition-colors">
                Gửi quà tới cô dâu chú rể
              </span>
              <span className="text-[11px] text-stone-500 font-sans mt-0.5 block">
                Chạm để xem thông tin mừng cưới
              </span>
            </div>
          </div>
        );
      }

      // 04.9 Farewell Cover Photo + Artistic THANKS Typography
      if (el.presetId === "p-marsala-farewell") {
        const photos = Array.isArray(data.photos) ? data.photos : [];
        const farewellPhoto = (typeof (photos[0] as { url?: string })?.url === "string" ? (photos[0] as { url?: string }).url! : "") || (typeof data.coverPhotoUrl === "string" ? data.coverPhotoUrl : "") || "/images/demo/templates/t04-marsala/cover.jpg";
        const groomName = (typeof data.groom?.fullName === "string" ? data.groom.fullName : "") || "Nguyễn Minh";
        const brideName = (typeof data.bride?.fullName === "string" ? data.bride.fullName : "") || "Bùi Phương";

        return (
          <div className="w-full h-full relative overflow-hidden select-none bg-stone-900 flex flex-col justify-end">
            <img src={farewellPhoto} alt="Farewell Thanks" className="absolute inset-0 w-full h-full object-cover object-top" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent pointer-events-none" />

            <div className="relative z-10 px-5 pb-8 text-center flex flex-col items-center">
              {/* Artistic THANKS typography */}
              <h2 className="font-serif text-5xl font-extrabold tracking-[0.25em] text-[#C9A45C] drop-shadow-lg mb-2">
                THANKS
              </h2>
              <p className="font-cursive text-2xl text-white drop-shadow-md mb-1">
                {groomName} &amp; {brideName}
              </p>
              <span className="text-[11px] font-sans tracking-widest text-stone-300 uppercase">
                Forever &amp; Always
              </span>
            </div>
          </div>
        );
      }

      // 1. Phong bì terracotta mở có thiệp & ảnh cưới
      if (el.presetId === "p-envelope-sweet" || el.presetId === "p-envelope-pink" || el.presetId === "p1") {
        const photoUrl = el.imageUrl || data.coverPhotoUrl || "/images/demo/templates/t03-sweet-pink/cover.jpg";
        const groomShort = (typeof data.groom.shortName === "string" ? data.groom.shortName : "") || (typeof data.groom.fullName === "string" ? data.groom.fullName : "") || "Quốc Huy";
        const brideShort = (typeof data.bride.shortName === "string" ? data.bride.shortName : "") || (typeof data.bride.fullName === "string" ? data.bride.fullName : "") || "Mai Anh";

        return (
          <div className="w-full h-full pt-4 pb-2 px-3 text-center flex flex-col items-center justify-between select-none relative bg-transparent">
            {/* Header text */}
            <div className="space-y-1">
              <span className="text-[11px] uppercase tracking-[0.35em] text-[#8B2E20]/80 font-medium block">
                WEDDING INVITATION
              </span>
              <h2 className="text-2xl font-serif text-[#8B2E20] uppercase tracking-wider font-bold">
                THIỆP MỜI CƯỚI
              </h2>
              <div className="text-3xl text-[#8B2E20] font-script flex items-center justify-center gap-2 pt-0.5 drop-shadow-xs">
                <span>{brideShort}</span>
                <span className="text-2xl font-sans font-light text-rose-400">&amp;</span>
                <span>{groomShort}</span>
              </div>
            </div>

            {/* Envelope container with 3D floating hearts */}
            <div className="relative w-[320px] h-[240px] my-auto flex items-center justify-center overflow-visible">
              {/* 3 Floating 3D Red Hearts */}
              <div className="absolute -top-3 left-12 z-30 transform -rotate-12 transition-transform hover:scale-110 drop-shadow-md">
                <svg width="28" height="28" viewBox="0 0 24 24">
                  <defs>
                    <radialGradient id="heartGrad1" cx="35%" cy="35%" r="65%">
                      <stop offset="0%" stopColor="#FF5C75" />
                      <stop offset="60%" stopColor="#E11D48" />
                      <stop offset="100%" stopColor="#9F1239" />
                    </radialGradient>
                  </defs>
                  <path fill="url(#heartGrad1)" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                  <ellipse cx="8.5" cy="7.5" rx="2.5" ry="1.2" fill="#ffffff" opacity="0.45" transform="rotate(-30 8.5 7.5)"/>
                </svg>
              </div>
              <div className="absolute -top-7 left-1/2 -translate-x-1/2 z-30 drop-shadow-lg">
                <svg width="38" height="38" viewBox="0 0 24 24">
                  <defs>
                    <radialGradient id="heartGrad2" cx="35%" cy="35%" r="65%">
                      <stop offset="0%" stopColor="#FF6B81" />
                      <stop offset="60%" stopColor="#BE123C" />
                      <stop offset="100%" stopColor="#881337" />
                    </radialGradient>
                  </defs>
                  <path fill="url(#heartGrad2)" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                  <ellipse cx="8.5" cy="7.5" rx="3" ry="1.5" fill="#ffffff" opacity="0.5" transform="rotate(-30 8.5 7.5)"/>
                </svg>
              </div>
              <div className="absolute -top-3 right-12 z-30 transform rotate-12 transition-transform hover:scale-110 drop-shadow-md">
                <svg width="30" height="30" viewBox="0 0 24 24">
                  <defs>
                    <radialGradient id="heartGrad3" cx="35%" cy="35%" r="65%">
                      <stop offset="0%" stopColor="#FF5C75" />
                      <stop offset="60%" stopColor="#E11D48" />
                      <stop offset="100%" stopColor="#9F1239" />
                    </radialGradient>
                  </defs>
                  <path fill="url(#heartGrad3)" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                  <ellipse cx="8.5" cy="7.5" rx="2.5" ry="1.2" fill="#ffffff" opacity="0.45" transform="rotate(-30 8.5 7.5)"/>
                </svg>
              </div>

              {/* Open Flap Behind */}
              <div className="absolute -top-6 w-[88%] h-24 bg-gradient-to-b from-[#7A1D16] to-[#9B2C1D] shadow-sm [clip-path:polygon(50%_0%,0%_100%,100%_100%)] rounded-t-sm" />

              {/* Sliding Photo Card inside */}
              <div className="w-[84%] h-[84%] -top-4 absolute bg-white rounded-2xl shadow-xl border border-pink-100 overflow-hidden flex flex-col items-center p-1.5 z-10 transition-transform hover:-translate-y-2 duration-300">
                <div className="w-full flex-1 bg-stone-100 rounded-xl overflow-hidden relative">
                  <img src={photoUrl} alt="Wedding Photo" className="w-full h-full object-cover" />
                </div>
              </div>

              {/* Red Envelope Front Pocket */}
              <div className="absolute inset-x-0 bottom-0 h-[66%] bg-gradient-to-tr from-[#8B2217] via-[#9E2B1E] to-[#B33524] rounded-b-3xl z-20 shadow-xl [clip-path:polygon(0%_22%,50%_66%,100%_22%,100%_100%,0%_100%)] border-t border-rose-300/40" />

              {/* Gold Wax Seal in Center */}
              <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-30 size-12 rounded-full bg-gradient-to-br from-[#E2B774] via-[#BE944E] to-[#7D531E] border-2 border-amber-200/90 shadow-2xl flex items-center justify-center text-sm font-serif font-bold text-amber-50 ring-2 ring-amber-900/30">
                囍
              </div>
            </div>

            {/* Bottom Calligraphy & Ground Shadow */}
            <div className="pt-1">
              <span className="font-cursive text-xl text-[#8B2E20]/85 block drop-shadow-xs">
                Chạm để mở thiệp
              </span>
              <div className="w-44 h-3 mx-auto bg-black/10 rounded-full blur-[4px] mt-0.5" />
            </div>
          </div>
        );
      }

      // 1b. Hero Cover Photo + Countdown + Lời ngỏ
      if (el.presetId === "p-hero-sweet") {
        const coverPhoto = el.imageUrl || data.coverPhotoUrl || "/images/demo/templates/t03-sweet-pink/cover.jpg";
        const greeting = data.greeting || "Gửi đến gia đình và bạn bè thân mến\nCảm ơn bạn đã dành thời gian quý báu để cùng chúng mình chung vui trong ngày đặc biệt này. Chúng mình vô cùng biết ơn vì luôn có sự đồng hành và ủng hộ của bạn, và thật vinh hạnh khi được chia sẻ niềm hạnh phúc của chúng mình cùng bạn.\nTrân trọng kính mời bạn đến dự Lễ cưới của chúng mình";

        return (
          <div className="w-full h-full relative rounded-3xl overflow-hidden shadow-xl bg-stone-100 select-none">
            <img src={coverPhoto} alt="Cover" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />

            {/* Translucent bottom invitation panel */}
            <div className="absolute bottom-3 left-3 right-3 p-4 rounded-2xl bg-white/90 backdrop-blur-md shadow-2xl border border-white/80 text-center space-y-2.5">
              {/* 4 Terracotta Countdown Boxes */}
              <div className="grid grid-cols-4 gap-2 max-w-[290px] mx-auto">
                {[
                  { num: "90", unit: "ngày" },
                  { num: "02", unit: "giờ" },
                  { num: "20", unit: "phút" },
                  { num: "40", unit: "giây" },
                ].map((box, idx) => (
                  <div key={idx} className="bg-gradient-to-b from-[#A53424] to-[#882519] text-white rounded-xl py-2 px-1 shadow-md text-center border-t border-rose-300/30">
                    <span className="text-lg font-bold font-mono block leading-none">{box.num}</span>
                    <span className="text-[9.5px] uppercase opacity-95 block mt-1 tracking-wider font-sans">{box.unit}</span>
                  </div>
                ))}
              </div>

              <span className="text-[11px] uppercase font-mono tracking-[0.3em] text-[#B84A39] font-bold block pt-1">
                I N V I T A T I O N
              </span>
              <p className="text-[11px] text-stone-700 leading-relaxed font-serif italic max-w-xs mx-auto line-clamp-5">
                {greeting}
              </p>
            </div>
          </div>
        );
      }

      // 1c. Lễ Thành Hôn + Hai Họ + Big Date (24 Tháng 12 Năm 2026)
      if (el.presetId === "p-ceremony-parents-date") {
        const groom = (typeof data.groom.fullName === "string" ? data.groom.fullName : "") || "Phạm Quốc Huy";
        const bride = (typeof data.bride.fullName === "string" ? data.bride.fullName : "") || "Nguyễn Mai Anh";
        const groomParents = (data.groom.parents as Record<string, string>) || {};
        const brideParents = (data.bride.parents as Record<string, string>) || {};

        return (
          <div className="w-full h-full p-4 flex flex-col justify-between select-none text-left bg-transparent">
            {/* Lễ Thành Hôn Header */}
            <div className="flex items-start gap-4 pt-1">
              <div className="w-1 bg-[#8B2E20] h-28 rounded-full shrink-0 mt-1 shadow-xs" />
              <div className="space-y-0.5 flex-1">
                <span className="font-cursive text-2xl text-[#8B2E20] block">Lễ Thành Hôn</span>
                <h3 className="text-3xl font-script text-[#8B2E20] leading-tight pt-1">
                  {groom}
                </h3>
                <span className="text-xl font-sans font-light text-rose-400 block pl-4">&amp;</span>
                <h3 className="text-3xl font-script text-[#8B2E20] leading-tight">
                  {bride}
                </h3>
              </div>
            </div>

            {/* Hai Họ */}
            <div className="grid grid-cols-2 gap-4 text-xs text-stone-700 pt-3 border-t border-[#8B2E20]/20">
              <div className="space-y-1">
                <span className="font-serif font-bold text-[#8B2E20] block uppercase tracking-wider text-xs">Nhà Trai</span>
                <p className="text-xs font-medium text-stone-800">{groomParents.fatherName ? `Ông: ${groomParents.fatherName}` : "Ông: Phạm Quang Hải"}</p>
                <p className="text-xs font-medium text-stone-800">{groomParents.motherName ? `Bà: ${groomParents.motherName}` : "Bà: Định Thị Mai"}</p>
                <span className="text-[11px] text-stone-500 italic block">TP. Hà Nội</span>
              </div>
              <div className="space-y-1">
                <span className="font-serif font-bold text-[#8B2E20] block uppercase tracking-wider text-xs">Nhà Gái</span>
                <p className="text-xs font-medium text-stone-800">{brideParents.fatherName ? `Ông: ${brideParents.fatherName}` : "Ông: Nguyễn Tiến Minh"}</p>
                <p className="text-xs font-medium text-stone-800">{brideParents.motherName ? `Bà: ${brideParents.motherName}` : "Bà: Lê Thị Hải Yến"}</p>
                <span className="text-[11px] text-stone-500 italic block">TP. Điện Biên</span>
              </div>
            </div>

            {/* Big Date Display */}
            <div className="pt-2 text-center">
              <span className="text-xs font-serif font-bold text-[#8B2E20] uppercase tracking-[0.2em] block">
                TIỆC MỪNG LỄ THÀNH HÔN
              </span>
              <span className="text-xs font-serif text-stone-600 tracking-wider block mt-0.5">
                VÀO LÚC 10:30 THỨ NĂM
              </span>
              <div className="flex items-center justify-center gap-3 my-2 px-1">
                <div className="h-[1px] flex-1 bg-stone-300" />
                <span className="text-sm font-serif font-bold text-stone-800 tracking-wider">THÁNG 12</span>
                <span className="text-5xl font-serif font-bold text-[#8B2E20] px-2 leading-none">24</span>
                <span className="text-sm font-serif font-bold text-stone-800 tracking-wider">NĂM 2026</span>
                <div className="h-[1px] flex-1 bg-stone-300" />
              </div>
              <span className="font-cursive text-sm text-stone-500 block">
                (Tức ngày 17 tháng 11 năm Bính Ngọ)
              </span>
            </div>
          </div>
        );
      }

      // 1d. Địa Điểm Tổ Chức Trống Đồng Palace & Bản Đồ
      if (el.presetId === "p-location-map-sweet") {
        const events = data.events;
        const mainEvent = events[0] || {};
        const venue = (mainEvent.venueName as string) || "TRỐNG ĐỒNG PALACE";
        const address = (mainEvent.address as string) || "(18A Lý Văn Phúc, P. Ô Chợ Dừa, Tp Hà Nội)";
        const mapUrl = (mainEvent.mapUrl as string) || "https://maps.google.com/?q=Trong+Dong+Palace+18A+Ly+Van+Phuc";

        return (
          <div className="w-full h-full p-4 flex flex-col justify-between text-center select-none bg-transparent">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-[#B84A39]">
                ĐỊA ĐIỂM TỔ CHỨC
              </span>
              <h4 className="text-xl font-serif font-bold text-[#8B2E20] mt-1 tracking-wider">
                {venue}
              </h4>
              <p className="text-xs text-stone-600 mt-1 font-serif italic">
                {address}
              </p>
            </div>

            {/* Map Preview Card */}
            <div className="w-full rounded-2xl overflow-hidden border border-[#F5E5E0] bg-white p-2 shadow-md mt-2">
              <div className="aspect-[16/9] w-full rounded-xl overflow-hidden bg-stone-100 relative">
                <iframe
                  title="Google Maps"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3724.116484391295!2d105.8288!3d21.028!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135ab764f69f2e7%3A0xb30fb7247a3e5c94!2zVHLhu5FuZyDEkOG7k25nIFBhbGFjZSAtIEhvw6BuZyBD4bqndQ!5e0!3m2!1svi!2s!4v1620000000000"
                  className="w-full h-full border-0 pointer-events-none"
                  loading="lazy"
                />
              </div>
              <a
                href={mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 py-2 bg-[#FFF9F8] rounded-xl border border-rose-200 text-xs font-bold text-[#8B2E20] flex items-center justify-center gap-2 hover:bg-rose-50 transition pointer-events-auto cursor-pointer"
              >
                <span>📍 Mở trong Google Maps</span>
              </a>
            </div>
          </div>
        );
      }

      // 1e. Sweet Wedding / Marry Me? / Yes! I Do
      if (el.presetId === "p-sweet-marry-me") {
        const photoTop = "/images/demo/templates/t03-sweet-pink/gallery-1.jpg";
        const photoBottom = "/images/demo/templates/t03-sweet-pink/bride.jpg";

        return (
          <div className="w-full h-full p-4 relative select-none overflow-hidden bg-transparent">
            {/* Top motif */}
            <div className="flex items-center gap-2 mb-2">
              <div className="size-4 rounded-full bg-[#E8C5BC] flex items-center justify-center text-[8px] text-[#8B2E20]">✦</div>
              <span className="text-[10px] uppercase font-serif tracking-[0.3em] text-[#8B2E20] font-bold">
                S W E E T · W E D D I N G
              </span>
            </div>

            {/* Asymmetric dusty rose block on right */}
            <div className="absolute right-0 top-10 bottom-4 w-[50%] bg-[#E8C5BC] rounded-l-3xl shadow-inner -z-0 flex flex-col justify-end p-4 text-right">
              <div className="space-y-1">
                <span className="text-xl font-serif font-bold text-white tracking-[0.25em] block drop-shadow-sm">
                  Y E S !
                </span>
                <span className="text-xl font-serif font-bold text-white tracking-[0.25em] block drop-shadow-sm">
                  I D O
                </span>
                <span className="text-rose-600 text-xl inline-block mt-1 animate-pulse">❤️</span>
              </div>
            </div>

            {/* Content left: Marry Me? */}
            <div className="relative z-10 pt-2">
              <h3 className="text-2xl font-serif font-bold text-[#8B2E20] tracking-[0.25em] leading-tight">
                M A R R Y<br />M E ?
              </h3>
            </div>

            {/* Overlapping photos */}
            <div className="relative z-10 mt-1 h-[250px]">
              {/* Photo 1: Couple top right */}
              <div className="absolute right-2 top-0 w-[55%] aspect-[4/3] rounded-2xl overflow-hidden shadow-lg border-2 border-white">
                <img src={photoTop} alt="Marry Me" className="w-full h-full object-cover" />
              </div>
              {/* Photo 2: Bride bottom left overlapping */}
              <div className="absolute left-2 bottom-0 w-[50%] aspect-[3/4] rounded-2xl overflow-hidden shadow-xl border-2 border-white">
                <img src={photoBottom} alt="Bride" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        );
      }

      // 1f. About Us: Cô Dâu
      if (el.presetId === "p-about-bride") {
        const bride = (typeof data.bride.fullName === "string" ? data.bride.fullName : "") || "Nguyễn Mai Anh";
        const brideAvatar = (typeof data.bride.avatarUrl === "string" ? data.bride.avatarUrl : "") || "/images/demo/templates/t03-sweet-pink/bride.jpg";
        const couplePhoto = "/images/demo/templates/t03-sweet-pink/gallery-7.jpg";

        return (
          <div className="w-full h-full p-4 flex flex-col justify-between select-none bg-transparent">
            <div className="flex items-center gap-2">
              <div className="size-4 rounded-full bg-[#E8C5BC] flex items-center justify-center text-[8px] text-[#8B2E20]">✦</div>
              <span className="font-cursive text-xl text-[#8B2E20]">About us</span>
            </div>

            <div className="grid grid-cols-2 gap-3 items-center my-auto">
              <div className="p-4 rounded-2xl border-2 border-[#8B2E20] bg-white/70 backdrop-blur-xs text-center space-y-1 shadow-sm">
                <h4 className="font-script text-2xl text-[#8B2E20] font-normal leading-tight">{bride}</h4>
                <p className="text-xs text-stone-600 font-mono mt-1">12/05/2000</p>
                <p className="text-xs text-stone-700 font-serif italic">TP. Điện Biên</p>
              </div>
              <div className="aspect-[3/4] rounded-2xl overflow-hidden shadow-md border-2 border-white bg-stone-100">
                <img src={brideAvatar} alt="Bride" className="w-full h-full object-cover" />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex-1 aspect-[16/7] rounded-2xl overflow-hidden border border-[#8B2E20]/40 shadow-sm">
                <img src={couplePhoto} alt="Couple" className="w-full h-full object-cover" />
              </div>
              <span className="font-cursive text-lg text-rose-400 tracking-widest [writing-mode:vertical-lr] rotate-180">
                Bride
              </span>
            </div>
          </div>
        );
      }

      // 1g. About Us: Chú Rể
      if (el.presetId === "p-about-groom") {
        const groom = (typeof data.groom.fullName === "string" ? data.groom.fullName : "") || "Phạm Quốc Huy";
        const groomAvatar = (typeof data.groom.avatarUrl === "string" ? data.groom.avatarUrl : "") || "/images/demo/templates/t03-sweet-pink/groom.jpg";
        const couplePhoto = "/images/demo/templates/t03-sweet-pink/gallery-8.jpg";

        return (
          <div className="w-full h-full p-4 flex flex-col justify-between select-none bg-transparent">
            <div className="flex items-center gap-2">
              <div className="size-4 rounded-full bg-[#E8C5BC] flex items-center justify-center text-[8px] text-[#8B2E20]">✦</div>
              <span className="font-cursive text-xl text-[#8B2E20]">About us</span>
            </div>

            <div className="grid grid-cols-2 gap-3 items-center my-auto">
              <div className="aspect-[3/4] rounded-2xl overflow-hidden shadow-md border-2 border-white bg-stone-100">
                <img src={groomAvatar} alt="Groom" className="w-full h-full object-cover" />
              </div>
              <div className="p-4 rounded-2xl border-2 border-[#8B2E20] bg-white/70 backdrop-blur-xs text-center space-y-1 shadow-sm">
                <h4 className="font-script text-2xl text-[#8B2E20] font-normal leading-tight">{groom}</h4>
                <p className="text-xs text-stone-600 font-mono mt-1">05/08/1995</p>
                <p className="text-xs text-stone-700 font-serif italic">TP. Hà Nội</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="font-cursive text-lg text-rose-400 tracking-widest [writing-mode:vertical-lr] rotate-180">
                Groom
              </span>
              <div className="flex-1 aspect-[16/7] rounded-2xl overflow-hidden border border-[#8B2E20]/40 shadow-sm">
                <img src={couplePhoto} alt="Couple" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        );
      }

      // 1h. Save the Date (Calendar Grid)
      if (el.presetId === "p-calendar-heart-photo") {
        const photo = el.imageUrl || data.coverPhotoUrl || "/images/demo/templates/t03-sweet-pink/cover.jpg";
        return (
          <div className="w-full h-full p-4 flex flex-col justify-between select-none bg-transparent">
            <div className="flex items-center justify-between pb-1">
              <div className="flex items-center gap-2">
                <div className="size-4 rounded-full bg-[#E8C5BC] flex items-center justify-center text-[8px] text-[#8B2E20]">✦</div>
                <span className="font-serif font-bold text-lg text-[#8B2E20]">Save the date</span>
              </div>
              <span className="text-[10px] font-mono font-bold bg-[#BA3E2C] text-white px-2.5 py-0.5 rounded-sm">2026 / Dec</span>
            </div>

            <div className="relative flex-1 rounded-2xl overflow-hidden shadow-lg border-2 border-[#8B2E20]/30 mt-1">
              <img src={photo} alt="Save the date" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/15 pointer-events-none" />

              {/* Overlaid calendar grid */}
              <div className="absolute bottom-3 right-3 p-3 rounded-2xl bg-white/90 backdrop-blur-md border border-rose-200 text-xs font-mono text-stone-800 shadow-xl max-w-[210px]">
                <div className="grid grid-cols-7 gap-1.5 text-[9px] font-bold text-stone-500 pb-1.5 text-center border-b border-stone-200">
                  <span>S</span><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span>
                </div>
                <div className="grid grid-cols-7 gap-1.5 text-center pt-1.5 text-[10px]">
                  <span className="opacity-0">.</span><span className="opacity-0">.</span>
                  <span>1</span><span>2</span><span>3</span><span>4</span><span>5</span>
                  <span>6</span><span>7</span><span>8</span><span>9</span><span>10</span><span>11</span><span>12</span>
                  <span>13</span><span>14</span><span>15</span><span>16</span><span>17</span><span>18</span><span>19</span>
                  <span>20</span><span>21</span><span>22</span><span>23</span>
                  <span className="relative font-bold text-rose-600 flex items-center justify-center">
                    <svg className="absolute -inset-1 w-6 h-6 text-rose-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                    </svg>
                    24
                  </span>
                  <span>25</span><span>26</span>
                  <span>27</span><span>28</span><span>29</span><span>30</span><span>31</span>
                </div>
              </div>
            </div>
          </div>
        );
      }

      // 1i. Lịch trình sự kiện (Timeline)
      if (el.presetId === "p-timeline-sweet") {
        return (
          <div className="w-full h-full p-4 relative flex flex-col justify-between select-none bg-transparent">
            <span className="text-[11px] uppercase font-mono tracking-[0.25em] text-[#B84A39] text-center font-bold">
              LỊCH TRÌNH HÔN LỄ
            </span>

            <div className="relative pl-10 space-y-5 my-auto max-w-[320px] mx-auto w-full">
              <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-rose-300" />

              <div className="relative flex items-center gap-3 text-sm">
                <span className="absolute -left-[31px] size-4 rounded-full bg-rose-500 border-2 border-white flex items-center justify-center text-[7px] text-white">❤️</span>
                <span className="text-lg">🚗</span>
                <span className="font-serif font-bold text-[#8B2E20] text-base">08:00</span>
                <span className="text-stone-700 font-medium">: Lễ Rước Dâu</span>
              </div>

              <div className="relative flex items-center gap-3 text-sm">
                <span className="absolute -left-[31px] size-4 rounded-full bg-rose-500 border-2 border-white flex items-center justify-center text-[7px] text-white">❤️</span>
                <span className="text-lg">🎀</span>
                <span className="font-serif font-bold text-[#8B2E20] text-base">09:30</span>
                <span className="text-stone-700 font-medium">: Chụp hình lưu niệm</span>
              </div>

              <div className="relative flex items-center gap-3 text-sm">
                <span className="absolute -left-[31px] size-4 rounded-full bg-rose-500 border-2 border-white flex items-center justify-center text-[7px] text-white">❤️</span>
                <span className="text-lg">🥂</span>
                <span className="font-serif font-bold text-[#8B2E20] text-base">10:30</span>
                <span className="text-stone-700 font-medium">: Khai tiệc</span>
              </div>
            </div>

            <span className="text-[9px] text-stone-400 font-sans tracking-widest text-right block pr-2">
              Made with Ngày chung đôi
            </span>
          </div>
        );
      }

      // 1j. Editorial 3-photo stacked gallery
      if (el.presetId === "p-gallery-editorial-stack") {
        const photos = [
          "/images/demo/templates/t03-sweet-pink/gallery-1.jpg",
          "/images/demo/templates/t03-sweet-pink/gallery-2.jpg",
          "/images/demo/templates/t03-sweet-pink/gallery-3.jpg",
        ];

        return (
          <div className="w-full h-full p-4 flex flex-col justify-between select-none bg-transparent">
            {/* Header banner */}
            <div className="bg-[#BA3E2C] text-white py-1 text-center rounded-sm">
              <span className="text-xs uppercase font-mono tracking-[0.3em] font-bold">
                I N V I T A T I O N
              </span>
            </div>

            {/* 3 Photos with vertical cursive labels */}
            <div className="relative flex items-center justify-center gap-2 my-2">
              <span className="font-script text-xl text-stone-400 tracking-wider [writing-mode:vertical-lr] rotate-180 shrink-0">
                I love you forever
              </span>
              <div className="flex-1 space-y-2">
                {photos.map((p, i) => (
                  <div key={i} className="aspect-[16/7] rounded-xl overflow-hidden shadow-md border-2 border-white">
                    <img src={p} alt={`Gallery ${i}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
              <span className="font-script text-xl text-stone-400 tracking-wider [writing-mode:vertical-lr] shrink-0">
                Nice to meet you
              </span>
            </div>

            {/* Memo */}
            <p className="text-xs text-stone-600 italic font-serif text-center leading-relaxed px-3">
              Mình rất muốn được chụp chung với bạn những tấm hình kỷ niệm vì vậy hãy đến sớm hơn một chút bạn yêu nhé! Đám cưới của chúng mình sẽ trọn vẹn hơn khi có thêm lời chúc phúc và sự hiện diện của các bạn.
            </p>
          </div>
        );
      }

      // 1k. RSVP Arch Card
      if (el.presetId === "p-rsvp-arch") {
        return (
          <div className="w-full h-full px-4 flex items-center justify-center select-none">
            <div className="w-full h-full rounded-t-[140px] rounded-b-3xl bg-[#E8C5BC] p-6 shadow-md border border-rose-200/80 flex flex-col items-center justify-center text-center space-y-2.5">
              <span className="text-[10px] uppercase font-mono tracking-[0.3em] text-[#8B2E20] font-bold">
                R. S. V. P.
              </span>
              <h3 className="text-lg font-serif font-bold text-[#8B2E20]">
                Xác nhận tham dự
              </h3>
              <p className="text-xs text-stone-700 leading-relaxed font-serif max-w-[270px]">
                Vui lòng xác nhận tham dự để chúng mình chuẩn bị lễ cưới được thuận lợi và trọn vẹn nhất.
              </p>
              <button
                type="button"
                onClick={onRsvp}
                className="mt-2 px-6 py-2.5 bg-white text-[#8B2E20] rounded-full text-xs font-semibold shadow-md border border-rose-200 pointer-events-auto cursor-pointer flex items-center gap-2 hover:bg-rose-50 transition active:scale-95"
              >
                <span>✍️</span> Gửi xác nhận
              </button>
            </div>
          </div>
        );
      }

      // 1l. Gửi Quà Mừng (2 Thẻ QR Cô Dâu & Chú Rể)
      if (el.presetId === "p-dual-gift-qr") {
        const groom = (typeof data.groom.fullName === "string" ? data.groom.fullName : "") || "Phạm Quốc Huy";
        const bride = (typeof data.bride.fullName === "string" ? data.bride.fullName : "") || "Nguyễn Mai Anh";
        const groomAvatar = (typeof data.groom.avatarUrl === "string" ? data.groom.avatarUrl : "") || "/images/demo/templates/t03-sweet-pink/groom.jpg";
        const brideAvatar = (typeof data.bride.avatarUrl === "string" ? data.bride.avatarUrl : "") || "/images/demo/templates/t03-sweet-pink/bride.jpg";

        return (
          <div className="w-full h-full p-4 flex flex-col justify-between select-none text-center bg-transparent">
            <span className="text-lg uppercase font-serif tracking-[0.25em] font-bold text-[#B84A39]">
              GỬI QUÀ MỪNG
            </span>

            <div className="space-y-4 my-auto">
              {/* Thẻ Cô Dâu */}
              <div
                onClick={onGift}
                className="flex items-center gap-3 p-3 rounded-2xl bg-white border border-rose-100 shadow-md cursor-pointer hover:shadow-lg transition pointer-events-auto"
              >
                <div className="size-16 rounded-full overflow-hidden border-2 border-rose-300 p-0.5 shrink-0 bg-[#FFF0E6]">
                  <img src={brideAvatar} alt="Bride" className="w-full h-full object-cover rounded-full" />
                </div>
                <div className="flex-1 text-left">
                  <span className="text-xs text-stone-400 block">Cô dâu</span>
                  <h5 className="text-sm font-bold text-[#8B2E20]">{bride}</h5>
                  <p className="text-xs font-mono text-stone-600">MB Bank : 012345678</p>
                </div>
                <div className="size-16 bg-white p-1 rounded-xl border border-stone-200 shrink-0">
                  <img src="https://api.vietqr.io/image/970422-012345678-compact2.jpg?amount=0&addInfo=MungCuoi" alt="QR" className="w-full h-full object-contain" />
                </div>
              </div>

              {/* Thẻ Chú Rể */}
              <div
                onClick={onGift}
                className="flex items-center gap-3 p-3 rounded-2xl bg-white border border-rose-100 shadow-md cursor-pointer hover:shadow-lg transition pointer-events-auto"
              >
                <div className="size-16 bg-white p-1 rounded-xl border border-stone-200 shrink-0">
                  <img src="https://api.vietqr.io/image/970422-012345678-compact2.jpg?amount=0&addInfo=MungCuoi" alt="QR" className="w-full h-full object-contain" />
                </div>
                <div className="flex-1 text-left">
                  <span className="text-xs text-stone-400 block">Chú rể</span>
                  <h5 className="text-sm font-bold text-[#8B2E20]">{groom}</h5>
                  <p className="text-xs font-mono text-stone-600">MB Bank : 012345678</p>
                </div>
                <div className="size-16 rounded-full overflow-hidden border-2 border-rose-300 p-0.5 shrink-0 bg-[#FFF0E6]">
                  <img src={groomAvatar} alt="Groom" className="w-full h-full object-cover rounded-full" />
                </div>
              </div>
            </div>
          </div>
        );
      }

      // 1m. Lời Cảm Ơn & Chibi Uyên Ương
      if (el.presetId === "p-thank-you-chibi") {
        return (
          <div className="w-full h-full p-4 flex flex-col items-center justify-center text-center space-y-2 select-none pointer-events-none bg-transparent">
            <div className="size-24 relative flex items-center justify-center">
              <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
                {/* Chibi cô dâu váy trắng xoè */}
                <circle cx="38" cy="36" r="11" fill="#FFF0E6" stroke="#BA3E2C" strokeWidth="1" />
                <path d="M28 32 Q38 22 48 32 Q43 27 38 27 Q33 27 28 32 Z" fill="#3E2B22" />
                <circle cx="35" cy="36" r="1.2" fill="#3E2B22" />
                <circle cx="41" cy="36" r="1.2" fill="#3E2B22" />
                <path d="M36 40 Q38 42 40 40" stroke="#D9534F" strokeWidth="0.8" fill="none" strokeLinecap="round" />
                <path d="M30 47 Q38 45 46 47 L52 75 Q38 82 24 75 Z" fill="#FFF" stroke="#E6BCB5" strokeWidth="1" />
                {/* Chibi chú rể áo vest đen */}
                <circle cx="62" cy="34" r="11" fill="#FFE5D4" stroke="#4A2E24" strokeWidth="1" />
                <path d="M52 30 Q62 20 72 30 Q67 25 62 25 Q57 25 52 30 Z" fill="#2B1810" />
                <circle cx="59" cy="34" r="1.2" fill="#2B1810" />
                <circle cx="65" cy="34" r="1.2" fill="#2B1810" />
                <path d="M60 38 Q62 40 64 38" stroke="#D9534F" strokeWidth="0.8" fill="none" strokeLinecap="round" />
                <path d="M54 45 Q62 43 70 45 L73 72 L51 72 Z" fill="#3E2B22" stroke="#2B1810" strokeWidth="1" />
                <polygon points="62,45 59,52 65,52" fill="#FFF" />
                {/* Hai bàn tay nắm nhau */}
                <path d="M44 50 Q50 52 54 50" stroke="#FFE5D4" strokeWidth="2.5" strokeLinecap="round" />
                {/* Trái tim hồng trên đầu */}
                <path d="M50 20 C46 14 38 17 41 24 C44 30 50 34 50 34 C50 34 56 30 59 24 C62 17 54 14 50 20 Z" fill="#E88D98" />
              </svg>
            </div>
            <h5 className="font-script text-5xl text-[#8B2E20] font-normal leading-tight">
              Thank you
            </h5>
            <p className="text-[10px] text-stone-500 font-sans tracking-[0.25em] uppercase font-medium">
              FOR SHARING OUR HAPPINESS
            </p>
          </div>
        );
      }

      // 2. We got married - Phong bì sáp xanh
      if (el.presetId === "p-envelope-green") {
        const photoUrl = el.imageUrl || data.coverPhotoUrl || "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=600&auto=format&fit=crop&q=80";
        return (
          <ScaledPresetWrapper baseW={300} baseH={250} w={el.width} h={el.height}>
            <div className="w-full h-full relative overflow-visible flex items-center justify-center pointer-events-none select-none">
              <div className="absolute -top-6 w-[84%] h-22 bg-[#2D3E31] shadow-xs [clip-path:polygon(50%_0%,0%_100%,100%_100%)] rounded-t-sm" />
              <div className="w-[78%] h-[80%] -top-3 absolute bg-[#FDFBF7] rounded-lg shadow-lg border border-stone-200 overflow-hidden flex flex-col items-center p-2 z-10 text-center">
                <span className="text-[10px] font-serif italic text-stone-700">We got married</span>
                <div className="w-full flex-1 bg-stone-100 rounded overflow-hidden my-1">
                  <img src={photoUrl} alt="Photo" className="w-full h-full object-cover" />
                </div>
              </div>
              <div className="absolute inset-x-0 bottom-0 h-[68%] bg-[#3E5343] rounded-b-2xl z-20 shadow-md [clip-path:polygon(0%_25%,50%_65%,100%_25%,100%_100%,0%_100%)]" />
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 size-9 rounded-full bg-[#BE944E] border-2 border-amber-200 shadow-lg flex items-center justify-center text-xs font-bold text-amber-950">
                💍
              </div>
            </div>
          </ScaledPresetWrapper>
        );
      }

      // 3. Thư mời WEDDING typography
      if (el.presetId === "p-wedding-typography") {
        const groom = (typeof data.groom.fullName === "string" ? data.groom.fullName : "") || "Văn Anh";
        const bride = (typeof data.bride.fullName === "string" ? data.bride.fullName : "") || "Minh Thơ";
        return (
          <ScaledPresetWrapper baseW={310} baseH={290} w={el.width} h={el.height}>
            <div className="w-full h-full p-5 bg-[#FCFBF8] rounded-2xl border border-amber-200/80 shadow-md flex flex-col items-center justify-between text-center pointer-events-none select-none">
              <div className="w-full flex items-center justify-center gap-2">
                <div className="h-[1px] flex-1 bg-amber-300/70" />
                <span className="text-[11px] font-serif tracking-[0.25em] text-amber-800 uppercase font-bold">WEDDING</span>
                <div className="h-[1px] flex-1 bg-amber-300/70" />
              </div>
              <div className="my-auto py-2">
                <h3 className="font-serif text-lg font-bold text-stone-800 leading-tight">
                  {groom} <span className="text-amber-600 font-normal font-sans">&</span> {bride}
                </h3>
                <p className="text-[10px] font-serif uppercase tracking-widest text-amber-900/80 mt-1">THƯ MỜI TIỆC CƯỚI</p>
              </div>
              <div className="w-full pt-2 border-t border-amber-100 flex items-center justify-between text-[9px] text-stone-500 font-mono">
                <span>HÔN LỄ TRANG TRỌNG</span>
                <span>2026</span>
              </div>
            </div>
          </ScaledPresetWrapper>
        );
      }

      // 4. Lịch ngày cưới khoanh tròn
      if (el.presetId === "p-calendar-countdown") {
        return (
          <ScaledPresetWrapper baseW={300} baseH={270} w={el.width} h={el.height}>
            <div className="w-full h-full p-4 bg-white/95 backdrop-blur-xs rounded-2xl border border-stone-200 shadow-md flex flex-col items-center justify-between pointer-events-none select-none">
              <div className="text-center w-full pb-1 border-b border-stone-100">
                <span className="text-[10px] font-serif tracking-widest uppercase text-stone-500 block font-semibold">WELCOME TO OUR WEDDING</span>
                <span className="text-[11px] font-serif font-bold text-stone-800">Tháng 12 / 2026</span>
              </div>
              <div className="w-full my-auto">
                <div className="grid grid-cols-7 gap-1 text-[9px] font-mono text-stone-400 text-center font-bold pb-1">
                  <span>T2</span><span>T3</span><span>T4</span><span>T5</span><span>T6</span><span>T7</span><span className="text-rose-400">CN</span>
                </div>
                <div className="grid grid-cols-7 gap-1 text-[9px] font-mono text-stone-700 text-center">
                  <span className="text-stone-300">30</span><span>1</span><span>2</span><span>3</span><span>4</span><span>5</span><span className="text-rose-500">6</span>
                  <span>7</span><span>8</span><span>9</span><span>10</span><span>11</span><span className="relative font-bold text-rose-600"><span className="absolute -inset-1 rounded-full border-2 border-rose-500 bg-rose-50 -z-10 animate-pulse" />12</span><span className="text-rose-500">13</span>
                  <span>14</span><span>15</span><span>16</span><span>17</span><span>18</span><span>19</span><span className="text-rose-500">20</span>
                  <span>21</span><span>22</span><span>23</span><span>24</span><span>25</span><span>26</span><span className="text-rose-500">27</span>
                </div>
              </div>
              <span className="text-[9px] font-serif italic text-amber-700 font-medium">Hẹn gặp bạn vào ngày hạnh phúc nhất!</span>
            </div>
          </ScaledPresetWrapper>
        );
      }

      // 5. Hôn phối hai họ
      if (el.presetId === "p-parents-info" || el.presetId === "p4") {
        return (
          <ScaledPresetWrapper baseW={320} baseH={180} w={el.width} h={el.height}>
            <div className="w-full h-full p-3.5 bg-white/95 backdrop-blur-xs rounded-2xl border border-stone-200 shadow-md flex flex-col justify-between pointer-events-none select-none text-center">
              <div className="text-[11px] font-bold text-amber-900 tracking-wider font-serif uppercase border-b border-stone-100 pb-1">
                Hôn Phối Hai Họ
              </div>
              <div className="grid grid-cols-2 gap-2 text-[10px] pt-1">
                <div className="border-r border-stone-100 pr-2">
                  <p className="font-bold text-stone-800 font-serif text-[10px]">NHÀ TRAI</p>
                  <p className="text-stone-500 text-[9px] mt-0.5">Ông: Nguyễn Văn A</p>
                  <p className="text-stone-500 text-[9px]">Bà: Trần Thị B</p>
                </div>
                <div className="pl-1">
                  <p className="font-bold text-stone-800 font-serif text-[10px]">NHÀ GÁI</p>
                  <p className="text-stone-500 text-[9px] mt-0.5">Ông: Lê Văn C</p>
                  <p className="text-stone-500 text-[9px]">Bà: Phạm Thị D</p>
                </div>
              </div>
            </div>
          </ScaledPresetWrapper>
        );
      }

      // 6. Khung ảnh vòm
      if (el.presetId === "p-arch-portrait" || el.presetId === "p1-arch") {
        return (
          <ScaledPresetWrapper baseW={280} baseH={360} w={el.width} h={el.height}>
            <div className="w-full h-full rounded-t-[140px] rounded-b-2xl border-4 border-[#BE944E] overflow-hidden shadow-md bg-stone-100 relative pointer-events-none select-none">
              <img
                src={el.content || el.imageUrl || "/images/demo/couple-cover.png"}
                alt="Cổng vòm"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src =
                    "https://images.unsplash.com/photo-1519741497674-611481863552?w=500&auto=format&fit=crop&q=80";
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent flex items-end justify-center pb-3">
                <span className="text-white text-xs font-serif tracking-widest drop-shadow uppercase">HOÀNG GIA Á ĐÔNG</span>
              </div>
            </div>
          </ScaledPresetWrapper>
        );
      }

      // 7. Groom & Bride Duo
      if (el.presetId === "p-groom-bride-duo") {
        const groom = (typeof data.groom.fullName === "string" ? data.groom.fullName : "") || "Chú Rể";
        const bride = (typeof data.bride.fullName === "string" ? data.bride.fullName : "") || "Cô Dâu";
        return (
          <ScaledPresetWrapper baseW={320} baseH={220} w={el.width} h={el.height}>
            <div className="w-full h-full p-3 bg-white/95 rounded-2xl border border-stone-200 shadow-md flex items-center justify-around gap-2 pointer-events-none select-none">
              <div className="flex-1 flex flex-col items-center">
                <div className="w-full h-32 rounded-t-full rounded-b-md overflow-hidden bg-stone-100 border border-stone-200 shadow-xs">
                  <img
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80"
                    alt="Groom"
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="text-[9px] font-serif font-bold text-stone-800 uppercase tracking-wider mt-1.5">GROOM</span>
                <span className="text-[8px] text-stone-500 truncate max-w-[100px]">{groom}</span>
              </div>
              <div className="flex-1 flex flex-col items-center">
                <div className="w-full h-32 rounded-t-full rounded-b-md overflow-hidden bg-stone-100 border border-stone-200 shadow-xs">
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80"
                    alt="Bride"
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="text-[9px] font-serif font-bold text-pink-700 uppercase tracking-wider mt-1.5">BRIDE</span>
                <span className="text-[8px] text-stone-500 truncate max-w-[100px]">{bride}</span>
              </div>
            </div>
          </ScaledPresetWrapper>
        );
      }

      // 8. Lịch trình tiệc cưới
      if (el.presetId === "p-timeline-flow" || el.presetId === "p3") {
        return (
          <ScaledPresetWrapper baseW={320} baseH={200} w={el.width} h={el.height}>
            <div className="w-full h-full p-3.5 bg-white/95 backdrop-blur-xs rounded-2xl border border-[#D4AF37]/50 shadow-md flex flex-col justify-between pointer-events-none select-none text-left">
              <div className="flex items-center justify-between border-b border-amber-100 pb-1.5">
                <span className="text-[11px] font-bold text-amber-900 tracking-wider font-serif uppercase">
                  Lịch Trình Hôn Lễ
                </span>
                <span className="text-[9px] text-stone-400 font-sans">WEDDING TIMELINE</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[10px] text-stone-700 mt-1">
                <div className="flex items-center gap-1.5 p-1 bg-amber-50/50 rounded-lg">
                  <span className="font-bold text-amber-800 text-[10px] bg-amber-100/80 px-1 py-0.5 rounded">17:30</span>
                  <span className="font-medium text-stone-700">Đón Khách</span>
                </div>
                <div className="flex items-center gap-1.5 p-1 bg-amber-50/50 rounded-lg">
                  <span className="font-bold text-amber-800 text-[10px] bg-amber-100/80 px-1 py-0.5 rounded">18:00</span>
                  <span className="font-medium text-stone-700">Làm Lễ</span>
                </div>
                <div className="flex items-center gap-1.5 p-1 bg-amber-50/50 rounded-lg">
                  <span className="font-bold text-amber-800 text-[10px] bg-amber-100/80 px-1 py-0.5 rounded">18:30</span>
                  <span className="font-medium text-stone-700">Khai Tiệc</span>
                </div>
                <div className="flex items-center gap-1.5 p-1 bg-amber-50/50 rounded-lg">
                  <span className="font-bold text-amber-800 text-[10px] bg-amber-100/80 px-1 py-0.5 rounded">19:30</span>
                  <span className="font-medium text-stone-700">Chụp Hình</span>
                </div>
              </div>
            </div>
          </ScaledPresetWrapper>
        );
      }

      // 9. Hộp mừng cưới & QR
      if (el.presetId === "p-banking-qr") {
        return (
          <ScaledPresetWrapper baseW={320} baseH={160} w={el.width} h={el.height}>
            <div className="w-full h-full p-4 bg-[#FFFDF9] rounded-2xl border border-amber-300/80 shadow-md flex items-center justify-around gap-3 pointer-events-none select-none">
              <div className="size-24 bg-white border border-stone-300 rounded-xl p-1.5 shadow-xs flex flex-col items-center justify-center shrink-0">
                <img
                  src="https://api.vietqr.io/image/970422-0988888888-compact2.jpg?amount=0&addInfo=MungCuoi"
                  alt="QR"
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = "/images/demo/qr-demo.png";
                  }}
                />
              </div>
              <div className="flex-1 text-left space-y-1">
                <span className="text-[8px] font-mono font-bold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded">MỪNG CƯỚI ONLINE</span>
                <h4 className="text-xs font-serif font-bold text-stone-900 leading-tight">Gửi Lời Chúc & Hồng Bao</h4>
                <p className="text-[9px] text-stone-500 leading-tight">Quý khách có thể mừng cưới từ xa qua mã QR tiện ích.</p>
              </div>
            </div>
          </ScaledPresetWrapper>
        );
      }

      // 10. Polaroids 3 tấm
      if (el.presetId === "p2") {
        return (
          <ScaledPresetWrapper baseW={320} baseH={160} w={el.width} h={el.height}>
            <div className="w-full h-full flex items-center justify-center gap-1.5 p-2 pointer-events-none select-none">
              <div className="w-24 bg-white p-1.5 pb-4 shadow-md rounded -rotate-6 border border-stone-200">
                <div className="w-full h-20 bg-stone-200 rounded overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=300&auto=format&fit=crop&q=80"
                    alt="p1"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="text-[8px] text-center font-serif text-stone-600 mt-1 font-semibold">Tình Đầu</div>
              </div>
              <div className="w-24 bg-white p-1.5 pb-4 shadow-lg rounded z-10 border border-stone-200">
                <div className="w-full h-20 bg-stone-200 rounded overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1519741497674-611481863552?w=300&auto=format&fit=crop&q=80"
                    alt="p2"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="text-[8px] text-center font-serif text-amber-700 mt-1 font-bold">Hẹn Ước</div>
              </div>
              <div className="w-24 bg-white p-1.5 pb-4 shadow-md rounded rotate-6 border border-stone-200">
                <div className="w-full h-20 bg-stone-200 rounded overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=300&auto=format&fit=crop&q=80"
                    alt="p3"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="text-[8px] text-center font-serif text-stone-600 mt-1 font-semibold">Trọn Đời</div>
              </div>
            </div>
          </ScaledPresetWrapper>
        );
      }

      // 11. Cành cẩm chướng nơ đỏ
      if (el.presetId === "p-carnation-bouquet" || el.content === "carnation") {
        return (
          <div className="w-full h-full flex items-center justify-center pointer-events-none select-none">
            <svg viewBox="0 0 120 180" className="w-full h-full drop-shadow-md">
              <path d="M 60 160 Q 55 110 40 70 M 60 160 Q 65 120 75 80" stroke="#4D7C0F" strokeWidth="3.5" fill="none" strokeLinecap="round" />
              <path d="M 52 130 Q 35 125 38 115 Q 48 120 52 130 Z" fill="#65A30D" />
              <path d="M 62 110 Q 78 105 76 95 Q 66 100 62 110 Z" fill="#65A30D" />
              <g transform="translate(38, 55)">
                <ellipse cx="0" cy="10" rx="7" ry="9" fill="#4D7C0F" />
                <path d="M -22 -5 C -30 -18 -12 -30 0 -26 C 12 -30 30 -18 22 -5 C 26 10 10 20 0 18 C -10 20 -26 10 -22 -5 Z" fill="#F43F5E" opacity="0.95" />
                <path d="M -16 -10 C -22 -22 -6 -28 0 -24 C 6 -28 22 -22 16 -10 C 20 5 6 12 0 10 C -6 12 -20 5 -16 -10 Z" fill="#FB7185" />
                <path d="M -10 -12 C -15 -18 0 -24 0 -20 C 0 -24 15 -18 10 -12 C 10 0 3 6 0 5 C -3 6 -10 0 -10 -12 Z" fill="#FECDD3" />
              </g>
              <g transform="translate(76, 75) scale(0.85)">
                <ellipse cx="0" cy="10" rx="7" ry="9" fill="#4D7C0F" />
                <path d="M -22 -5 C -30 -18 -12 -30 0 -26 C 12 -30 30 -18 22 -5 C 26 10 10 20 0 18 C -10 20 -26 10 -22 -5 Z" fill="#E11D48" opacity="0.95" />
                <path d="M -16 -10 C -22 -22 -6 -28 0 -24 C 6 -28 22 -22 16 -10 C 20 5 6 12 0 10 C -6 12 -20 5 -16 -10 Z" fill="#FB7185" />
                <path d="M -10 -12 C -15 -18 0 -24 0 -20 C 0 -24 15 -18 10 -12 C 10 0 3 6 0 5 C -3 6 -10 0 -10 -12 Z" fill="#FFE4E6" />
              </g>
              <g transform="translate(58, 140)">
                <circle cx="0" cy="0" r="5" fill="#B91C1C" />
                <path d="M 0 0 C -18 -12 -24 10 0 4 Z" fill="#DC2626" />
                <path d="M 0 0 C 18 -12 24 10 0 4 Z" fill="#DC2626" />
                <path d="M -3 3 Q -10 22 -14 30" stroke="#DC2626" strokeWidth="3" fill="none" strokeLinecap="round" />
                <path d="M 3 3 Q 10 22 16 30" stroke="#DC2626" strokeWidth="3" fill="none" strokeLinecap="round" />
              </g>
            </svg>
          </div>
        );
      }

      // 12. Con dấu sáp hồng niêm phong thiệp
      if (el.presetId === "p-wax-seal" || el.content === "wax-seal") {
        return (
          <div className="w-full h-full flex items-center justify-center pointer-events-none select-none">
            <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
              <path d="M 50 4 C 64 2 73 9 84 18 C 95 28 98 42 96 55 C 94 69 88 80 77 88 C 65 96 48 98 35 94 C 20 90 9 79 5 65 C 2 50 6 36 15 24 C 24 12 36 6 50 4 Z" fill="#F47291" />
              <circle cx="50" cy="51" r="32" fill="none" stroke="#E11D48" strokeWidth="2" strokeOpacity="0.3" />
              <circle cx="50" cy="51" r="28" fill="#FB7185" />
              <text x="50" y="58" textAnchor="middle" fill="#FFFFFF" fillOpacity="0.95" fontFamily="serif" fontStyle="italic" fontWeight="bold" fontSize="22">ML</text>
            </svg>
          </div>
        );
      }

      // 13. Bó hoa cưới mini pastel
      if (el.presetId === "p-mini-bouquet" || el.content === "mini-bouquet") {
        return (
          <div className="w-full h-full flex items-center justify-center pointer-events-none select-none">
            <svg viewBox="0 0 100 120" className="w-full h-full drop-shadow-sm">
              <path d="M 50 115 L 25 65 L 75 65 Z" fill="#FCE7F3" stroke="#F472B6" strokeWidth="1" />
              <path d="M 30 65 Q 50 78 70 65 L 50 115 Z" fill="#FDF2F8" />
              <circle cx="40" cy="50" r="14" fill="#F43F5E" />
              <circle cx="60" cy="48" r="13" fill="#FB7185" />
              <circle cx="50" cy="35" r="15" fill="#FDA4AF" />
              <circle cx="35" cy="36" r="10" fill="#C084FC" />
              <circle cx="65" cy="35" r="11" fill="#A855F7" />
              <circle cx="50" cy="52" r="8" fill="#FBBF24" />
              <ellipse cx="50" cy="85" rx="8" ry="4" fill="#EC4899" />
              <path d="M 45 87 Q 40 102 38 110" stroke="#EC4899" strokeWidth="2.5" fill="none" />
              <path d="M 55 87 Q 60 102 62 110" stroke="#EC4899" strokeWidth="2.5" fill="none" />
            </svg>
          </div>
        );
      }

      // 14. Thanh chỉ vàng kim loại
      if (el.presetId === "p-gold-divider" || el.content === "gold-divider") {
        return (
          <div className="w-full h-full flex items-center justify-center pointer-events-none select-none">
            <div className="w-full h-[2px] bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent shadow-xs" />
          </div>
        );
      }

      // 15. Thiệp Song Hỷ Đỏ Á Đông (p-song-hy-red)
      if (el.presetId === "p-song-hy-red" || el.content === "song-hy-red") {
        const groom = (typeof data.groom.fullName === "string" ? data.groom.fullName : "") || "Văn Anh";
        const bride = (typeof data.bride.fullName === "string" ? data.bride.fullName : "") || "Minh Thơ";
        return (
          <ScaledPresetWrapper baseW={310} baseH={290} w={el.width} h={el.height}>
            <div className="w-full h-full p-5 bg-gradient-to-br from-[#9B1C26] via-[#851620] to-[#690F17] rounded-3xl border-2 border-[#D4AF37]/80 shadow-xl flex flex-col items-center justify-between text-center pointer-events-none select-none text-[#FDF0D5] relative overflow-hidden">
              {/* Pattern hoa văn góc hoàng gia */}
              <div className="absolute top-2 left-2 size-8 border-t-2 border-l-2 border-[#D4AF37]/50 rounded-tl-lg" />
              <div className="absolute top-2 right-2 size-8 border-t-2 border-r-2 border-[#D4AF37]/50 rounded-tr-lg" />
              <div className="absolute bottom-2 left-2 size-8 border-b-2 border-l-2 border-[#D4AF37]/50 rounded-bl-lg" />
              <div className="absolute bottom-2 right-2 size-8 border-b-2 border-r-2 border-[#D4AF37]/50 rounded-br-lg" />

              <div className="flex items-center gap-2 w-full justify-center pt-1">
                <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-[#D4AF37]/80" />
                <span className="text-[10px] font-serif uppercase tracking-[0.3em] text-[#F3E5AB] font-bold">LỄ THÀNH HÔN</span>
                <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-[#D4AF37]/80" />
              </div>

              <div className="my-auto flex flex-col items-center">
                <div className="text-4xl font-bold font-serif text-[#FFD700] drop-shadow-[0_2px_10px_rgba(212,175,55,0.5)] leading-none mb-2">
                  囍
                </div>
                <h3 className="font-serif text-lg font-bold text-white tracking-wide">
                  {groom} <span className="text-[#FFD700] font-sans font-light">&</span> {bride}
                </h3>
                <p className="text-[10px] font-serif uppercase tracking-widest text-[#F3E5AB]/90 mt-1">
                  TRĂM NĂM TÌNH VIÊN MÃN
                </p>
              </div>

              <div className="w-full pt-2 border-t border-[#D4AF37]/30 flex items-center justify-between text-[9px] text-[#FDF0D5]/80 font-serif">
                <span>DUYÊN NỢ BA SINH</span>
                <span>HẠNH PHÚC TRỌN ĐỜI</span>
              </div>
            </div>
          </ScaledPresetWrapper>
        );
      }

      // 16. Quy định trang phục Dress Code (p-dress-code)
      if (el.presetId === "p-dress-code" || el.content === "dress-code") {
        return (
          <ScaledPresetWrapper baseW={300} baseH={160} w={el.width} h={el.height}>
            <div className="w-full h-full p-4 bg-white/95 backdrop-blur-xs rounded-2xl border border-stone-200 shadow-md flex flex-col items-center justify-between pointer-events-none select-none text-center">
              <div>
                <span className="text-[11px] font-serif font-bold text-stone-900 tracking-wider uppercase block">
                  DRESS CODE TIỆC CƯỚI
                </span>
                <span className="text-[9px] text-stone-500 block mt-0.5">
                  Khuyến khích trang phục theo bảng màu để khung hình trọn vẹn nhất
                </span>
              </div>

              <div className="flex items-center justify-center gap-3 my-auto pt-1">
                <div className="flex flex-col items-center gap-1">
                  <span className="size-7 rounded-full bg-[#FFFFFF] border-2 border-stone-300 shadow-sm" />
                  <span className="text-[8px] text-stone-600 font-medium">Trắng</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <span className="size-7 rounded-full bg-[#F5E6D3] border-2 border-stone-300 shadow-sm" />
                  <span className="text-[8px] text-stone-600 font-medium">Kem Be</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <span className="size-7 rounded-full bg-[#FCE7F3] border-2 border-pink-200 shadow-sm" />
                  <span className="text-[8px] text-stone-600 font-medium">Pastel</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <span className="size-7 rounded-full bg-[#D1FAE5] border-2 border-emerald-200 shadow-sm" />
                  <span className="text-[8px] text-stone-600 font-medium">Xanh Mint</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <span className="size-7 rounded-full bg-[#5C3D2E] border-2 border-amber-950 shadow-sm" />
                  <span className="text-[8px] text-stone-600 font-medium">Nâu ấm</span>
                </div>
              </div>

              <span className="text-[8.5px] font-serif italic text-amber-800">Cảm ơn quý khách đã đồng điệu cùng chúng mình!</span>
            </div>
          </ScaledPresetWrapper>
        );
      }

      // 17. Địa điểm sảnh tiệc & Bản đồ chỉ đường (p-venue-map)
      if (el.presetId === "p-venue-map" || el.content === "venue-map") {
        return (
          <ScaledPresetWrapper baseW={320} baseH={170} w={el.width} h={el.height}>
            <div className="w-full h-full p-4 bg-[#FFFDF9] rounded-2xl border border-amber-200/90 shadow-md flex items-center justify-between gap-3 pointer-events-none select-none text-left">
              <div className="flex-1 space-y-1">
                <span className="text-[8px] font-mono font-bold text-amber-900 bg-amber-100/90 px-1.5 py-0.5 rounded">
                  ĐỊA ĐIỂM TỔ CHỨC
                </span>
                <h4 className="text-xs font-serif font-bold text-stone-900 leading-tight">
                  White Palace Convention Center
                </h4>
                <p className="text-[9.5px] font-medium text-amber-800">Sảnh Grand Hall • Tầng 2</p>
                <p className="text-[8.5px] text-stone-500 leading-tight">
                  194 Hoàng Văn Thụ, Phường 9, Quận Phú Nhuận, TP. Hồ Chí Minh
                </p>
              </div>

              <div className="size-22 bg-white border border-stone-200 rounded-xl p-1.5 shadow-xs flex flex-col items-center justify-center shrink-0 text-center">
                <img
                  src="https://api.vietqr.io/image/970422-0988888888-compact2.jpg?amount=0&addInfo=ChiDuong"
                  alt="QR Map"
                  className="w-14 h-14 object-contain"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = "/images/demo/qr-demo.png";
                  }}
                />
                <span className="text-[7.5px] text-stone-600 font-semibold mt-1">QUÉT MỞ MAPS</span>
              </div>
            </div>
          </ScaledPresetWrapper>
        );
      }

      // 18. Thực đơn tiệc cưới (p-wedding-menu)
      if (el.presetId === "p-wedding-menu" || el.content === "wedding-menu") {
        return (
          <ScaledPresetWrapper baseW={310} baseH={260} w={el.width} h={el.height}>
            <div className="w-full h-full p-4 bg-[#FCFBF8] rounded-2xl border border-amber-200 shadow-md flex flex-col items-center justify-between text-center pointer-events-none select-none">
              <div className="border-b border-amber-200/80 w-full pb-1">
                <span className="text-[10px] font-serif font-bold text-amber-900 tracking-[0.2em] uppercase block">
                  THỰC ĐƠN TIỆC CƯỚI
                </span>
                <span className="text-[8px] font-mono text-stone-400">WEDDING BANQUET MENU</span>
              </div>

              <div className="my-auto space-y-1.5 text-stone-700 font-serif text-[10px] py-1">
                <p className="font-semibold text-amber-950">1. Súp Bào Ngư Hải Sâm Vi Cá</p>
                <p>2. Gỏi Củ Hủ Dừa Tôm Thịt Bánh Phồng</p>
                <p>3. Thăn Bò Úc Sốt Tiêu Đen Kèm Bánh Mì</p>
                <p>4. Cá Chẽm Hấp Tàu Xì Hồng Kông</p>
                <p>5. Lẩu Hải Sản Nấm Thảo Mộc</p>
                <p className="font-medium text-pink-700">6. Chè Hạt Sen Nhãn Nhục Tuyết Nhĩ</p>
              </div>

              <div className="w-full pt-1 border-t border-amber-100 text-[8px] font-serif italic text-stone-500">
                Chúc quý khách một bữa tiệc ngon miệng và ấm cúng!
              </div>
            </div>
          </ScaledPresetWrapper>
        );
      }

      // 19. Đếm ngược khoảnh khắc hạnh phúc (p-wedding-countdown)
      if (el.presetId === "p-wedding-countdown" || el.content === "countdown") {
        return (
          <ScaledPresetWrapper baseW={300} baseH={160} w={el.width} h={el.height}>
            <div className="w-full h-full p-4 bg-gradient-to-b from-[#FFFDF9] to-[#FDF8EE] rounded-2xl border border-amber-200/90 shadow-md flex flex-col items-center justify-between pointer-events-none select-none text-center">
              <div>
                <span className="text-[10.5px] font-serif font-bold text-amber-900 uppercase tracking-widest block">
                  CÙNG ĐẾM NGƯỢC THỜI GIAN
                </span>
                <span className="text-[8.5px] text-stone-500">Đến khoảnh khắc hai ta chung một nhà</span>
              </div>

              <div className="grid grid-cols-4 gap-2 w-full px-2 my-auto">
                <div className="bg-white border border-amber-100 rounded-xl py-2 px-1 shadow-xs flex flex-col items-center">
                  <span className="text-base font-bold text-stone-800 font-mono leading-none">28</span>
                  <span className="text-[7px] text-stone-400 mt-1 font-semibold">NGÀY</span>
                </div>
                <div className="bg-white border border-amber-100 rounded-xl py-2 px-1 shadow-xs flex flex-col items-center">
                  <span className="text-base font-bold text-stone-800 font-mono leading-none">14</span>
                  <span className="text-[7px] text-stone-400 mt-1 font-semibold">GIỜ</span>
                </div>
                <div className="bg-white border border-amber-100 rounded-xl py-2 px-1 shadow-xs flex flex-col items-center">
                  <span className="text-base font-bold text-stone-800 font-mono leading-none">35</span>
                  <span className="text-[7px] text-stone-400 mt-1 font-semibold">PHÚT</span>
                </div>
                <div className="bg-white border border-amber-100 rounded-xl py-2 px-1 shadow-xs flex flex-col items-center">
                  <span className="text-base font-bold text-rose-600 font-mono leading-none animate-pulse">59</span>
                  <span className="text-[7px] text-stone-400 mt-1 font-semibold">GIÂY</span>
                </div>
              </div>

              <span className="text-[8px] font-serif italic text-amber-800">Hẹn gặp bạn trong khoảnh khắc thiêng liêng nhất!</span>
            </div>
          </ScaledPresetWrapper>
        );
      }

      // 20. Cặp nhẫn cưới & Lời hẹn ước (p-rings-vow)
      if (el.presetId === "p-rings-vow" || el.content === "rings-vow") {
        return (
          <ScaledPresetWrapper baseW={300} baseH={170} w={el.width} h={el.height}>
            <div className="w-full h-full p-4 bg-[#FAF7F2] rounded-2xl border border-amber-200/80 shadow-md flex flex-col items-center justify-between text-center pointer-events-none select-none">
              <div className="text-2xl drop-shadow-sm">💍✨💍</div>
              <div className="my-auto">
                <span className="text-xs font-serif font-bold text-stone-900 block">Lời Thề Nguyện Trăm Năm</span>
                <p className="text-[10px] font-serif italic text-stone-700 leading-relaxed mt-1 px-1">
                  “Từ hôm nay, ta cùng nhau đi đến trọn cuộc đời. Dù giông bão hay nắng ấm, tay vẫn nắm chặt tay.”
                </p>
              </div>
              <span className="text-[8px] font-mono tracking-widest text-amber-800/80 uppercase">FOREVER & ALWAYS</span>
            </div>
          </ScaledPresetWrapper>
        );
      }

      // 21. Thư cảm ơn khách mời (p-thank-you-note)
      if (el.presetId === "p-thank-you-note" || el.content === "thank-you") {
        return (
          <ScaledPresetWrapper baseW={300} baseH={160} w={el.width} h={el.height}>
            <div className="w-full h-full p-4 bg-[#FFFBF8] rounded-2xl border border-pink-200/80 shadow-md flex flex-col items-center justify-between text-center pointer-events-none select-none">
              <div className="size-7 rounded-full bg-pink-100 flex items-center justify-center text-rose-500 mb-0.5">
                <Heart className="size-4 fill-rose-500" />
              </div>
              <div className="my-auto">
                <span className="text-xs font-serif font-bold text-stone-900 uppercase tracking-wider block">
                  THANK YOU FOR COMING
                </span>
                <p className="text-[9.5px] text-stone-600 leading-relaxed mt-1 px-1">
                  Sự hiện diện và lời chúc phúc của quý khách là món quà quý giá nhất đối với chúng mình trong ngày trọng đại.
                </p>
              </div>
              <span className="text-[8.5px] font-serif italic text-pink-700 font-medium">With Love • Dâu & Rể</span>
            </div>
          </ScaledPresetWrapper>
        );
      }

      // 22. Polaroid dán băng Washi (p-polaroid-washi)
      if (el.presetId === "p-polaroid-washi" || el.content === "polaroid-washi") {
        const photoUrl = el.imageUrl || (draft as any)?.coverPhotoUrl || "https://images.unsplash.com/photo-1519741497674-611481863552?w=500&auto=format&fit=crop&q=80";
        return (
          <ScaledPresetWrapper baseW={270} baseH={290} w={el.width} h={el.height}>
            <div className="w-full h-full flex items-center justify-center pointer-events-none select-none">
              <div className="w-[88%] bg-white p-2.5 pb-6 shadow-xl rounded-md relative border border-stone-200 -rotate-2">
                {/* Băng washi tape pastel mờ dán phía trên */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-20 h-5 bg-[#FDE68A]/85 backdrop-blur-2xs shadow-xs rotate-[-2deg] rounded-xs border-t border-b border-amber-300/40 z-20" />
                <div className="w-full h-44 bg-stone-100 rounded overflow-hidden">
                  <img
                    src={photoUrl}
                    alt="Polaroid Memory"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="pt-2 text-center">
                  <span className="text-[10px] font-serif font-bold text-stone-800 tracking-wider block">Khoảnh Khắc Hạnh Phúc</span>
                  <span className="text-[8px] font-mono text-stone-400">Sweet Memories</span>
                </div>
              </div>
            </div>
          </ScaledPresetWrapper>
        );
      }

      // 23. Lễ Thành Hôn / Vu Quy (p-le-thanh-hon)
      if (el.presetId === "p-le-thanh-hon" || el.content === "le-thanh-hon") {
        return (
          <ScaledPresetWrapper baseW={310} baseH={180} w={el.width} h={el.height}>
            <div className="w-full h-full p-4 bg-[#FAF6F4] rounded-2xl border border-rose-200 shadow-md flex flex-col items-center justify-between text-center pointer-events-none select-none">
              <div className="inline-block bg-rose-100/90 text-rose-800 text-[10px] font-serif font-bold px-3 py-0.5 rounded-full uppercase tracking-wider">
                LỄ THÀNH HÔN & NHẬP TIỆC
              </div>
              <div className="my-auto space-y-0.5">
                <span className="text-base font-serif font-bold text-stone-900 block">11:00 • 18 Tháng 12, 2026</span>
                <span className="text-[9.5px] text-stone-600 block">(Nhằm ngày 10 tháng 11 năm Bính Ngọ)</span>
                <span className="text-[9px] text-rose-800 font-medium block mt-1">Tại: Tư Gia Nhà Trai / Khách Sạn Melia</span>
              </div>
              <div className="w-full pt-1 border-t border-rose-100 text-[8.5px] font-serif italic text-stone-500">
                Hân hạnh được đón tiếp quý khách!
              </div>
            </div>
          </ScaledPresetWrapper>
        );
      }

      // Default: Quote
      return (
        <ScaledPresetWrapper baseW={300} baseH={140} w={el.width} h={el.height}>
          <div className="w-full h-full p-3.5 bg-gradient-to-br from-amber-50/90 to-stone-50/90 backdrop-blur-xs rounded-2xl border border-amber-200/80 shadow-md flex flex-col items-center justify-center pointer-events-none select-none text-center">
            <span className="text-amber-600 text-lg leading-none font-serif">“</span>
            <p className="text-[11px] font-serif italic text-stone-800 font-medium px-2 leading-relaxed">
              Trăm năm tình viên mãn, bạc đầu nghĩa phu thê.
            </p>
            <p className="text-[9px] text-amber-800/80 mt-1 font-sans">
              Sự hiện diện của quý khách là niềm vinh hạnh cho chúng tôi.
            </p>
          </div>
        </ScaledPresetWrapper>
      );
    }

    if (el.type === "image") {
      return (
        <div className="w-full h-full rounded-[inherit] overflow-hidden pointer-events-none select-none">
          <img
            src={el.imageUrl || el.content}
            alt={el.title || "Ảnh"}
            className="w-full h-full object-cover"
          />
        </div>
      );
    }

    return <span className="w-full">{el.content}</span>;
}
