"use client";

import React, { useState } from "react";
import type { CanvasElement } from "@/types/canvas.types";
import { readCanvasData } from "@/lib/editor/canvas-presentation";
import { CanvasWidget } from "./CanvasWidget";

import { Heart, Copy, Check, QrCode } from "lucide-react";
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

function WeddingGiftLuxuryCard({
  el,
  data,
  onGift,
}: {
  el: CanvasElement;
  data: any;
  onGift?: () => void;
}) {
  const [copiedAccount, setCopiedAccount] = useState<string | null>(null);

  const custom = el.customData || {};
  const groomName = custom.groomName || (typeof data.groom?.fullName === "string" ? data.groom.fullName : "") || "Minh Khôi";
  const groomBank = custom.groomBank || (typeof data.bankingPrimary?.bankCode === "string" ? data.bankingPrimary.bankCode : "") || "Vietcombank";
  const groomAccount = custom.groomAccount || (typeof data.bankingPrimary?.accountNumber === "string" ? data.bankingPrimary.accountNumber : "") || "0123 456 789";

  const brideName = custom.brideName || (typeof data.bride?.fullName === "string" ? data.bride.fullName : "") || "Ngọc Hân";
  const brideBank = custom.brideBank || (typeof data.bankingSecondary?.bankCode === "string" ? data.bankingSecondary.bankCode : "") || "Techcombank";
  const brideAccount = custom.brideAccount || (typeof data.bankingSecondary?.accountNumber === "string" ? data.bankingSecondary.accountNumber : "") || "9876 543 210";

  const title = custom.title || "MỪNG CƯỚI";
  const subtitle = custom.subtitle || "Thay cho những lời chúc tốt đẹp";
  const message = custom.message || "Sự hiện diện và lời chúc của bạn là món quà quý giá nhất với chúng mình. Nếu muốn gửi thêm chút yêu thương, bạn có thể mừng cưới qua số tài khoản bên dưới ạ.";

  const cleanBank = groomBank.replace(/[^a-zA-Z0-9]/g, "");
  const cleanAcc = groomAccount.replace(/[^a-zA-Z0-9]/g, "");
  const defaultVietQr = cleanBank && cleanAcc
    ? `https://img.vietqr.io/image/${cleanBank}-${cleanAcc}-compact2.png?accountName=${encodeURIComponent(groomName)}`
    : "https://api.vietqr.io/image/970422-012345678-compact2.jpg?amount=0&addInfo=MungCuoi";

  const qrImageUrl = custom.qrUrl || el.imageUrl || defaultVietQr;

  const handleCopy = (acc: string, type: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      navigator.clipboard.writeText(acc.replace(/\s/g, ""));
      setCopiedAccount(type);
      setTimeout(() => setCopiedAccount(null), 2000);
    } catch {}
  };

  return (
    <ScaledPresetWrapper baseW={340} baseH={550} w={el.width} h={el.height}>
      <div className="w-full h-full relative overflow-visible flex flex-col items-center justify-between p-3 select-none text-center">
        {/* Top Header */}
        <div className="w-full space-y-1 mb-1">
          <span className="text-[#A27B38] text-xs block leading-none">♡</span>
          <span className="text-[9px] font-serif uppercase tracking-[0.3em] text-[#8C6D37] font-semibold block">
            WEDDING GIFT
          </span>
          <h2 className="text-2xl font-serif font-bold text-[#4A3225] uppercase tracking-wider leading-tight">
            {title}
          </h2>
          <p className="font-script text-lg text-[#8C6D37] leading-none pt-0.5">
            {subtitle}
          </p>
          <p className="text-[9.5px] text-stone-600 font-serif leading-relaxed max-w-[285px] mx-auto pt-1">
            {message}
          </p>
        </div>

        {/* Luxury Rounded White Card */}
        <div className="w-[310px] bg-[#FFFDF9] rounded-[24px] border border-amber-200/90 shadow-xl p-4 flex flex-col items-center relative space-y-3">
          {/* Pill Badge: QUÉT MÃ QR */}
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#FAF5EC] border border-amber-200 text-[#8C6D37] text-[9px] font-bold tracking-widest uppercase shadow-2xs">
            QUÉT MÃ QR
          </div>

          {/* QR Code Container with Gold Brackets */}
          <div className="relative p-2.5 bg-white rounded-2xl shadow-sm border border-stone-200/80">
            <div className="absolute top-1 left-1 size-3 border-t-2 border-l-2 border-[#D4AF37] rounded-tl-sm pointer-events-none" />
            <div className="absolute top-1 right-1 size-3 border-t-2 border-r-2 border-[#D4AF37] rounded-tr-sm pointer-events-none" />
            <div className="absolute bottom-1 left-1 size-3 border-b-2 border-l-2 border-[#D4AF37] rounded-bl-sm pointer-events-none" />
            <div className="absolute bottom-1 right-1 size-3 border-b-2 border-r-2 border-[#D4AF37] rounded-br-sm pointer-events-none" />

            <div className="size-36 relative flex items-center justify-center overflow-hidden rounded-lg bg-white">
              <img
                src={qrImageUrl}
                alt="QR Mừng Cưới"
                className="w-full h-full object-contain"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = "/images/vietqr-admin.png";
                }}
              />
              <div className="absolute inset-0 m-auto size-6 rounded-md bg-white shadow-md border border-pink-200 flex items-center justify-center">
                <span className="text-xs">💖</span>
              </div>
            </div>
          </div>

          {/* Section: CHÚ RỂ */}
          <div className="w-full text-left space-y-1">
            <div className="flex items-center gap-1.5 pl-1">
              <span className="text-sm">🤵</span>
              <div>
                <span className="text-[8px] font-sans uppercase tracking-wider text-stone-400 block font-medium">CHÚ RỂ</span>
                <span className="text-xs font-serif font-bold text-[#4A3225] block leading-tight">{groomName}</span>
              </div>
            </div>

            <div className="w-full bg-[#FAF7F2] rounded-xl border border-stone-200/90 px-3 py-1.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="size-5 rounded-full bg-emerald-600 flex items-center justify-center text-[7px] text-white font-bold shrink-0">
                  {groomBank.slice(0, 3).toUpperCase()}
                </div>
                <div>
                  <span className="text-[9px] font-sans text-stone-500 block leading-tight">{groomBank}</span>
                  <span className="text-xs font-mono font-bold text-stone-800 tracking-wide block">{groomAccount}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={(e) => handleCopy(groomAccount, "groom", e)}
                className="p-1.5 hover:bg-stone-200/60 rounded-lg text-stone-600 hover:text-stone-900 transition pointer-events-auto cursor-pointer"
                title="Sao chép số tài khoản"
              >
                {copiedAccount === "groom" ? (
                  <span className="text-[9px] font-bold text-emerald-600 flex items-center gap-0.5">
                    <Check className="size-3" /> Đã chép
                  </span>
                ) : (
                  <Copy className="size-3.5 text-stone-500" />
                )}
              </button>
            </div>
          </div>

          {/* Delicate Divider */}
          <div className="w-full flex items-center justify-center gap-2 py-0.5">
            <div className="h-[1px] flex-1 bg-amber-200/60" />
            <span className="text-[#A27B38] text-[10px]">♡</span>
            <div className="h-[1px] flex-1 bg-amber-200/60" />
          </div>

          {/* Section: CÔ DÂU */}
          <div className="w-full text-left space-y-1">
            <div className="flex items-center gap-1.5 pl-1">
              <span className="text-sm">👰</span>
              <div>
                <span className="text-[8px] font-sans uppercase tracking-wider text-stone-400 block font-medium">CÔ DÂU</span>
                <span className="text-xs font-serif font-bold text-[#4A3225] block leading-tight">{brideName}</span>
              </div>
            </div>

            <div className="w-full bg-[#FAF7F2] rounded-xl border border-stone-200/90 px-3 py-1.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="size-5 rounded-full bg-rose-600 flex items-center justify-center text-[7px] text-white font-bold shrink-0">
                  {brideBank.slice(0, 3).toUpperCase()}
                </div>
                <div>
                  <span className="text-[9px] font-sans text-stone-500 block leading-tight">{brideBank}</span>
                  <span className="text-xs font-mono font-bold text-stone-800 tracking-wide block">{brideAccount}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={(e) => handleCopy(brideAccount, "bride", e)}
                className="p-1.5 hover:bg-stone-200/60 rounded-lg text-stone-600 hover:text-stone-900 transition pointer-events-auto cursor-pointer"
                title="Sao chép số tài khoản"
              >
                {copiedAccount === "bride" ? (
                  <span className="text-[9px] font-bold text-emerald-600 flex items-center gap-0.5">
                    <Check className="size-3" /> Đã chép
                  </span>
                ) : (
                  <Copy className="size-3.5 text-stone-500" />
                )}
              </button>
            </div>
          </div>

          {/* Footer Calligraphy */}
          <div className="pt-1 text-center">
            <span className="font-script text-xl text-[#8C6D37] block leading-none">Thank you</span>
            <span className="text-[#A27B38] text-[9px] block pt-0.5">♡</span>
          </div>
        </div>
      </div>
    </ScaledPresetWrapper>
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
      const isForest = (draft as Record<string, unknown>)?.templateSlug === "wedding-forest-green-botanical" || (draft as Record<string, unknown>)?.slug === "wedding-forest-green-botanical" || (draft as Record<string, unknown>)?.primaryColor === "#364733" || el.color === "#364733";
      const isLotus = (draft as Record<string, unknown>)?.templateSlug === "wedding-pure-lotus-heritage" || (draft as Record<string, unknown>)?.slug === "wedding-pure-lotus-heritage" || (draft as Record<string, unknown>)?.primaryColor === "#2E5136" || el.color === "#2E5136";
      const primaryColor = isLotus ? "#2E5136" : isForest ? "#364733" : isMarsala ? "#6B1724" : (el.color || "#543A2C");
      const venueName = (firstEvent.venueName as string) || (isLotus ? "Khách sạn CINELOVE" : isForest ? "TƯ GIA NHÀ GÁI" : "TƯ GIA NHÀ TRAI");
      const address = (firstEvent.address as string) || (isLotus ? "Hà Nội" : isForest ? "Xóm 5 , Xã Phú Cát, Quốc Oai, Hà Nội" : isMarsala ? "Khu Phố Xuân Thượng, Phường Quảng Vinh, Nam Sầm Sơn, Thanh Hóa" : "16 P. Phúc Minh, Phúc Diễn, Bắc Từ Liêm, TP. Hà Nội");
      const buttonLabel = isLotus ? "CHỈ ĐƯỜNG" : "Xem chỉ đường";
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
            className="inline-flex items-center gap-1.5 px-6 py-2 rounded-full text-white text-xs font-semibold shadow-sm transition-opacity hover:opacity-90 cursor-pointer pointer-events-auto"
            style={{ backgroundColor: primaryColor }}
          >
            {buttonLabel}
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
      if (el.shapeType === "arch") {
        return (
          <div
            className="w-full h-full pointer-events-none select-none transition-colors"
            style={{
              borderWidth: `${bWidth}px`,
              borderStyle: "solid",
              borderColor: shapeColor,
              backgroundColor: shapeBg,
              borderTopLeftRadius: "999px",
              borderTopRightRadius: "999px",
              borderBottomLeftRadius: el.borderRadius ? `${el.borderRadius}px` : "0px",
              borderBottomRightRadius: el.borderRadius ? `${el.borderRadius}px` : "0px",
            }}
          />
        );
      }
      if (el.shapeType === "heart") {
        return (
          <div className="w-full h-full flex items-center justify-center pointer-events-none select-none">
            <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none">
              <path
                d="M 50,30 C 50,15 35,5 20,5 C 8,5 0,15 0,28 C 0,52 35,76 50,95 C 65,76 100,52 100,28 C 100,15 92,5 80,5 C 65,5 50,15 50,30 Z"
                fill={shapeBg === "transparent" ? "none" : shapeBg}
                stroke={shapeColor}
                strokeWidth={bWidth}
                strokeLinejoin="round"
              />
            </svg>
          </div>
        );
      }
      if (el.shapeType === "star") {
        return (
          <div className="w-full h-full flex items-center justify-center pointer-events-none select-none">
            <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none">
              <path
                d="M 50,0 Q 50,50 100,50 Q 50,50 50,100 Q 50,50 0,50 Q 50,50 50,0 Z"
                fill={shapeBg === "transparent" ? "none" : shapeBg}
                stroke={shapeColor}
                strokeWidth={bWidth}
                strokeLinejoin="round"
              />
            </svg>
          </div>
        );
      }
      if (el.shapeType === "diamond") {
        return (
          <div className="w-full h-full flex items-center justify-center pointer-events-none select-none">
            <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none">
              <polygon
                points="50,4 96,50 50,96 4,50"
                fill={shapeBg === "transparent" ? "none" : shapeBg}
                stroke={shapeColor}
                strokeWidth={bWidth}
                strokeLinejoin="round"
              />
            </svg>
          </div>
        );
      }
      if (el.shapeType === "hexagon") {
        return (
          <div className="w-full h-full flex items-center justify-center pointer-events-none select-none">
            <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none">
              <polygon
                points="26,6 74,6 96,50 74,94 26,94 4,50"
                fill={shapeBg === "transparent" ? "none" : shapeBg}
                stroke={shapeColor}
                strokeWidth={bWidth}
                strokeLinejoin="round"
              />
            </svg>
          </div>
        );
      }
      if (el.shapeType === "oval") {
        return (
          <div
            className="w-full h-full pointer-events-none select-none transition-colors"
            style={{
              borderWidth: `${bWidth}px`,
              borderStyle: "solid",
              borderColor: shapeColor,
              backgroundColor: shapeBg,
              borderRadius: "50%",
            }}
          />
        );
      }
      if (el.shapeType === "ribbon") {
        return (
          <div className="w-full h-full flex items-center justify-center pointer-events-none select-none">
            <svg viewBox="0 0 200 60" className="w-full h-full" preserveAspectRatio="none">
              <path
                d="M 20,10 L 180,10 L 165,30 L 180,50 L 20,50 L 35,30 Z"
                fill={shapeBg === "transparent" ? "none" : shapeBg}
                stroke={shapeColor}
                strokeWidth={bWidth}
                strokeLinejoin="round"
              />
            </svg>
          </div>
        );
      }
      if (el.shapeType === "wavy-line") {
        return (
          <div className="w-full h-full flex items-center justify-center pointer-events-none select-none">
            <svg viewBox="0 0 200 20" className="w-full h-full" preserveAspectRatio="none">
              <path
                d="M 0,10 Q 25,0 50,10 T 100,10 T 150,10 T 200,10"
                fill="none"
                stroke={shapeColor}
                strokeWidth={Math.max(bWidth, 2)}
                strokeLinecap="round"
              />
            </svg>
          </div>
        );
      }
      if (el.shapeType === "dashed-line") {
        return (
          <div className="w-full h-full flex items-center justify-center pointer-events-none select-none px-1">
            <div
              className="w-full"
              style={{
                borderTopWidth: `${Math.max(bWidth, 2)}px`,
                borderTopStyle: "dashed",
                borderTopColor: shapeColor,
              }}
            />
          </div>
        );
      }
      if (el.shapeType === "flourish-line") {
        return (
          <div className="w-full h-full flex items-center justify-center pointer-events-none select-none">
            <svg viewBox="0 0 240 24" className="w-full h-full" preserveAspectRatio="none">
              <path
                d="M 10,12 C 30,5 40,19 60,12 L 100,12 M 140,12 L 180,12 C 200,19 210,5 230,12"
                fill="none"
                stroke={shapeColor}
                strokeWidth={Math.max(bWidth, 1.8)}
                strokeLinecap="round"
              />
              <circle cx="120" cy="12" r="4" fill={shapeColor} />
              <circle cx="108" cy="12" r="2" fill={shapeColor} />
              <circle cx="132" cy="12" r="2" fill={shapeColor} />
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
      // ── Date helpers (shared across all preset templates) ──
      const DAYS_VN = ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];
      const parseEventDate = (ev: Record<string, unknown> | null): Date | null => {
        if (!ev?.eventDate) return null;
        const d = new Date(ev.eventDate as string | number);
        return isNaN(d.getTime()) ? null : d;
      };
      const fmtDateDot = (d: Date) => `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}.${d.getFullYear()}`;
      const fmtDay = (d: Date) => String(d.getDate()).padStart(2, "0");
      const fmtMonth = (d: Date) => `Tháng ${d.getMonth() + 1}`;
      const fmtYear = (d: Date) => `Năm ${d.getFullYear()}`;
      const fmtTime = (d: Date) => `${String(d.getHours()).padStart(2, "0")}h${String(d.getMinutes()).padStart(2, "0")}`;
      const fmtTimeColon = (d: Date) => `${String(d.getHours()).padStart(2, "0")} : ${String(d.getMinutes()).padStart(2, "0")}`;
      const fmtDayOfWeek = (d: Date) => DAYS_VN[d.getDay()];
      const getMonthDaysAndOffset = (d: Date) => {
        const year = d.getFullYear();
        const month = d.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const firstDayOffset = (new Date(year, month, 1).getDay() + 6) % 7; // Mon=0
        return { daysInMonth, firstDayOffset };
      };
      const calcCountdown = (targetDate: Date | null) => {
        if (!targetDate) return { days: "00", hours: "00", minutes: "00", seconds: "00" };
        const now = new Date();
        const diff = Math.max(0, targetDate.getTime() - now.getTime());
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / (1000 * 60)) % 60);
        const seconds = Math.floor((diff / 1000) % 60);
        return {
          days: String(days).padStart(2, "0"),
          hours: String(hours).padStart(2, "0"),
          minutes: String(minutes).padStart(2, "0"),
          seconds: String(seconds).padStart(2, "0"),
        };
      };
      const getParentsAddress = (parentsObj: Record<string, unknown> | undefined, personObj: Record<string, unknown> | undefined, fallback: string) => {
        if (typeof parentsObj?.address === "string" && parentsObj.address.trim()) return parentsObj.address;
        if (typeof personObj?.address === "string" && personObj.address.trim()) return personObj.address;
        return fallback;
      };
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
        const evDate = parseEventDate(firstEvent);
        const dateStr = evDate ? fmtDateDot(evDate) : "28.12.2026";

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
        const brideAddr = getParentsAddress(brideParents, data.bride, "Hoàng Mai – Hà Nội");

        const groomParents = (data.groom.parents as Record<string, unknown>) || {};
        const groomFather = (typeof groomParents.fatherName === "string" ? groomParents.fatherName : "") || "Phạm Minh Toàn";
        const groomMother = (typeof groomParents.motherName === "string" ? groomParents.motherName : "") || "Lại Thị Tâm";
        const groomAddr = getParentsAddress(groomParents, data.groom, "Từ Liêm – Hà Nội");

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
                  {brideAddr}
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
                  {groomAddr}
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
        const evDate = parseEventDate(firstEvent);

        const dayStr = evDate ? fmtDay(evDate) : "27";
        const monthStr = evDate ? fmtMonth(evDate) : "Tháng 12";
        const yearStr = evDate ? fmtYear(evDate) : "Năm 2026";
        const timeStr = evDate ? fmtTime(evDate) : "11h00";
        const dayOfWeekStr = evDate ? fmtDayOfWeek(evDate) : "Chủ Nhật";
        const lunarStr = typeof firstEvent?.lunarDate === "string" && firstEvent.lunarDate ? `(Tức ${firstEvent.lunarDate})` : "(Tức ngày 10 tháng 11 năm Bính Ngọ)";
        const feastTime = evDate ? `${String(new Date(evDate.getTime() + 30 * 60000).getHours()).padStart(2, "0")}h${String(new Date(evDate.getTime() + 30 * 60000).getMinutes()).padStart(2, "0")}` : "11h30";

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
                  <div className="text-xs font-bold text-[#543A2C]">{feastTime}</div>
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
        const evDate = parseEventDate(firstEvent);
        const targetDay = evDate ? evDate.getDate() : 27;
        const calMeta = evDate ? getMonthDaysAndOffset(evDate) : { daysInMonth: 31, firstDayOffset: 1 };
        const cd = calcCountdown(evDate);

        return (
          <div className="w-full h-full relative overflow-hidden select-none bg-stone-900 flex flex-col justify-end text-white">
            <img src={photo} alt="Calendar Background" className="absolute inset-0 w-full h-full object-cover object-center" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/55 to-transparent pointer-events-none" />

            <div className="relative z-10 px-5 pb-5 text-center flex flex-col items-center">
              {/* White Script "Wedding" */}
              <span className="font-cursive text-4xl text-white drop-shadow-md mb-2">
                Wedding
              </span>

              {/* Dynamic Calendar Grid */}
              <div className="w-full max-w-[280px] grid grid-cols-7 gap-y-1.5 gap-x-1 text-center text-xs font-sans text-white/80 my-2">
                {Array.from({ length: calMeta.firstDayOffset }).map((_, i) => (
                  <span key={`blank-${i}`} />
                ))}
                {Array.from({ length: calMeta.daysInMonth }, (_, i) => i + 1).map((d) => {
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
                  { num: cd.days, label: "ngày" },
                  { num: cd.hours, label: "giờ" },
                  { num: cd.minutes, label: "phút" },
                  { num: cd.seconds, label: "giây" },
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
        const evDate = parseEventDate(firstEvent);
        const dateStr = evDate ? fmtDateDot(evDate) : "20.12.2026";

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
        const evDate = parseEventDate(firstEvent);
        const targetDay = evDate ? evDate.getDate() : 20;
        const yearNum = evDate ? evDate.getFullYear() : 2026;
        const calMeta = evDate ? getMonthDaysAndOffset(evDate) : { daysInMonth: 31, firstDayOffset: 1 };

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
                  {/* Dynamic Calendar Grid */}
                  <div className="w-full grid grid-cols-7 gap-1 text-[9px] font-mono text-center text-white">
                    {Array.from({ length: calMeta.firstDayOffset }).map((_, i) => (
                      <span key={`blank-${i}`} />
                    ))}
                    {Array.from({ length: calMeta.daysInMonth }, (_, i) => i + 1).map((d) => {
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

        const d1 = parseEventDate(ev1);
        const d2 = parseEventDate(ev2);
        const ev1TimeStr = d1 ? `${fmtDayOfWeek(d1).toUpperCase()} — ${fmtTimeColon(d1)}` : "CHỦ NHẬT — 16 : 00";
        const ev1DateStr = d1 ? fmtDateDot(d1) : "20.12.2026";
        const ev2TimeStr = d2 ? `${fmtDayOfWeek(d2).toUpperCase()} — ${fmtTimeColon(d2)}` : "THỨ BẢY — 18 : 00";
        const ev2DateStr = d2 ? fmtDateDot(d2) : "19.12.2026";

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
                  {ev1TimeStr}
                </span>
                <span className="font-serif text-3xl font-bold text-white tracking-wide my-1">
                  {ev1DateStr}
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
                  {ev2TimeStr}
                </span>
                <span className="font-serif text-3xl font-bold text-white tracking-wide my-1">
                  {ev2DateStr}
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

        const d1 = parseEventDate(ev);
        const dow1 = d1 ? fmtDayOfWeek(d1).toUpperCase() : "CHỦ NHẬT";
        const month1 = d1 ? `THÁNG ${d1.getMonth() + 1}` : "THÁNG 12";
        const day1 = d1 ? fmtDay(d1) : "20";
        const year1 = d1 ? `NĂM ${d1.getFullYear()}` : "NĂM 2026";
        const time1 = d1 ? fmtTimeColon(d1) : "16 : 00";
        const lunar1 = typeof ev.lunarDate === "string" && ev.lunarDate ? `Nhằm ${ev.lunarDate}` : "Nhằm ngày 06 tháng 11 năm Bính Ngọ";
        const cd1 = calcCountdown(d1);

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
                {dow1}
              </span>
              {/* Date Box: THÁNG 12 | 20 | NĂM 2026 */}
              <div className="flex items-center justify-center gap-3 my-2">
                <span className="border-y border-stone-400/60 py-1 px-3 text-xs font-serif font-medium text-stone-700 tracking-wider">
                  {month1}
                </span>
                <span className="font-serif text-4xl font-bold text-[#6B1724] px-1">
                  {day1}
                </span>
                <span className="border-y border-stone-400/60 py-1 px-3 text-xs font-serif font-medium text-stone-700 tracking-wider">
                  {year1}
                </span>
              </div>
              <span className="text-sm font-mono font-semibold text-stone-800 block">
                {time1}
              </span>
              <span className="text-[11px] italic text-stone-500 block">
                {lunar1}
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
                { num: cd1.days, label: "ngày" },
                { num: cd1.hours, label: "giờ" },
                { num: cd1.minutes, label: "phút" },
                { num: cd1.seconds, label: "giây" },
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

        const d2 = parseEventDate(ev);
        const dow2 = d2 ? fmtDayOfWeek(d2).toUpperCase() : "CHỦ NHẬT";
        const month2 = d2 ? `THÁNG ${d2.getMonth() + 1}` : "THÁNG 12";
        const day2 = d2 ? fmtDay(d2) : "20";
        const year2 = d2 ? `NĂM ${d2.getFullYear()}` : "NĂM 2026";
        const time2 = d2 ? fmtTimeColon(d2) : "10 : 00";
        const lunar2 = typeof ev.lunarDate === "string" && ev.lunarDate ? `Nhằm ${ev.lunarDate}` : "Nhằm ngày 06 tháng 11 năm Bính Ngọ";
        const cd2 = calcCountdown(d2);

        return (
          <div className="w-full h-full px-5 py-5 flex flex-col justify-between select-none bg-[#FAF8F6]">
            {/* Header */}
            <div className="text-center space-y-0.5">
              <h3 className="font-serif text-2xl font-bold text-[#6B1724] uppercase tracking-wider">
                LỄ VU QUY
              </h3>
              <span className="text-xs uppercase tracking-widest text-stone-600 font-medium block pt-1">
                {dow2}
              </span>
              {/* Date Box: THÁNG 12 | 20 | NĂM 2026 */}
              <div className="flex items-center justify-center gap-3 my-2">
                <span className="border-y border-stone-400/60 py-1 px-3 text-xs font-serif font-medium text-stone-700 tracking-wider">
                  {month2}
                </span>
                <span className="font-serif text-4xl font-bold text-[#6B1724] px-1">
                  {day2}
                </span>
                <span className="border-y border-stone-400/60 py-1 px-3 text-xs font-serif font-medium text-stone-700 tracking-wider">
                  {year2}
                </span>
              </div>
              <span className="text-sm font-mono font-semibold text-stone-800 block">
                {time2}
              </span>
              <span className="text-[11px] italic text-stone-500 block">
                {lunar2}
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
                { num: cd2.days, label: "ngày" },
                { num: cd2.hours, label: "giờ" },
                { num: cd2.minutes, label: "phút" },
                { num: cd2.seconds, label: "giây" },
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

      // ═════════════════════════════════════════════════════════════════════════════
      // TEMPLATE 05: RUSTIC XANH RÊU THIÊN NHIÊN & HOA DẠI (TUẤN MINH & MAI LAN)
      // ═════════════════════════════════════════════════════════════════════════════

      // 05.1 Envelope Rustic Opening + Sliding Polaroid Couple + Monogram Wax Seal + Wildflowers
      if (el.presetId === "p-forest-envelope") {
        const photos = Array.isArray(data.photos) ? data.photos : [];
        const photo1: string = (typeof (photos[0] as { url?: string })?.url === "string" ? (photos[0] as { url?: string }).url! : "") || "/images/demo/templates/t05-forest/gallery-1.jpg";
        const photo2: string = (typeof (photos[1] as { url?: string })?.url === "string" ? (photos[1] as { url?: string }).url! : "") || "/images/demo/templates/t05-forest/gallery-2.jpg";
        const groomName = (typeof data.groom?.fullName === "string" ? data.groom.fullName : "") || "Tuấn Minh";
        const brideName = (typeof data.bride?.fullName === "string" ? data.bride.fullName : "") || "Mai Lan";
        const events = Array.isArray(data.events) ? data.events : [];
        const firstEvent = (events[0] as Record<string, unknown>) || null;
        const evDate = parseEventDate(firstEvent);
        const dateStr = evDate ? fmtDateDot(evDate) : "02.08.2026";

        const groomInitial = (groomName || "M").trim().charAt(0).toUpperCase();
        const brideInitial = (brideName || "L").trim().charAt(0).toUpperCase();
        const sealText = `${brideInitial}·${groomInitial}`;

        return (
          <div className="w-full h-full relative overflow-hidden select-none bg-[#FAFBF8] flex flex-col items-center justify-between pt-5 pb-4 px-3">
            {/* Top header: We got married */}
            <div className="text-center">
              <span className="font-serif italic text-3xl text-[#465E42] drop-shadow-xs font-normal">
                We got married
              </span>
            </div>

            {/* Realistic Rustic Green Envelope with Photos & Wildflowers */}
            <div className="relative w-[320px] h-[370px] my-auto flex items-center justify-center">
              {/* Wildflower Sprigs on the left */}
              <div className="absolute -top-3 -left-2 z-10 pointer-events-none transform -rotate-12">
                <svg width="60" height="90" viewBox="0 0 60 90" fill="none">
                  <path d="M30 85 C30 50 15 30 10 15" stroke="#688461" strokeWidth="2" strokeLinecap="round" />
                  <path d="M30 65 C40 45 45 35 48 20" stroke="#7E9A77" strokeWidth="1.5" strokeLinecap="round" />
                  {/* Daisy 1 */}
                  <circle cx="10" cy="15" r="4" fill="#F4D03F" />
                  <circle cx="10" cy="9" r="3.5" fill="#FFFFFF" opacity="0.95" />
                  <circle cx="15" cy="12" r="3.5" fill="#FFFFFF" opacity="0.95" />
                  <circle cx="14" cy="18" r="3.5" fill="#FFFFFF" opacity="0.95" />
                  <circle cx="8" cy="20" r="3.5" fill="#FFFFFF" opacity="0.95" />
                  <circle cx="5" cy="14" r="3.5" fill="#FFFFFF" opacity="0.95" />
                  {/* Daisy 2 */}
                  <circle cx="48" cy="20" r="3" fill="#F4D03F" />
                  <circle cx="48" cy="15" r="2.5" fill="#FFFFFF" opacity="0.95" />
                  <circle cx="52" cy="18" r="2.5" fill="#FFFFFF" opacity="0.95" />
                  <circle cx="50" cy="23" r="2.5" fill="#FFFFFF" opacity="0.95" />
                  <circle cx="45" cy="22" r="2.5" fill="#FFFFFF" opacity="0.95" />
                  <circle cx="44" cy="17" r="2.5" fill="#FFFFFF" opacity="0.95" />
                </svg>
              </div>

              {/* Envelope Back Plate (Forest Green) */}
              <div className="absolute inset-x-2 bottom-4 h-[240px] bg-[#31422E] rounded-b-xl shadow-xl" />

              {/* Envelope Inside Lining (Cream / Soft Sage) */}
              <div className="absolute inset-x-4 bottom-6 h-[220px] bg-[#EAE8DD] rounded-t-sm" />

              {/* 2 Photos Sliding Up from Envelope */}
              <div className="absolute -top-4 left-6 z-20 transform -rotate-6 transition-transform hover:rotate-0 drop-shadow-xl">
                <div className="bg-white p-1.5 pb-3 rounded-lg shadow-lg w-[130px] border border-white">
                  <div className="w-full aspect-[3/4] rounded overflow-hidden bg-stone-100">
                    <img src={photo1} alt="Couple 1" className="w-full h-full object-cover" />
                  </div>
                </div>
              </div>

              <div className="absolute -top-1 right-6 z-20 transform rotate-8 transition-transform hover:rotate-0 drop-shadow-xl">
                <div className="bg-white p-1.5 pb-3 rounded-lg shadow-lg w-[130px] border border-white">
                  <div className="w-full aspect-[3/4] rounded overflow-hidden bg-stone-100">
                    <img src={photo2} alt="Couple 2" className="w-full h-full object-cover" />
                  </div>
                </div>
              </div>

              {/* Center Invitation Letter Card (Parchment peek) */}
              <div className="absolute top-20 inset-x-9 z-25 bg-[#FAF8F2] border border-[#DDD5C5] rounded-t-md p-3 text-center shadow-sm">
                <span className="font-serif text-[9px] uppercase tracking-[0.25em] text-[#556950] font-bold block">
                  CELEBRATE WITH US
                </span>
                <span className="font-serif italic text-[8px] text-stone-500 block mt-0.5">
                  LOVE &amp; JOY
                </span>
              </div>

              {/* Envelope Front Lower Fold (V-Shape Forest Green) */}
              <div className="absolute inset-x-2 bottom-4 h-[170px] z-30 pointer-events-none">
                <svg viewBox="0 0 304 170" className="w-full h-full filter drop-shadow-[0_-3px_5px_rgba(0,0,0,0.18)]" preserveAspectRatio="none">
                  {/* Left & Right Fold */}
                  <polygon points="0,0 152,110 0,170" fill="#2E3F2B" />
                  <polygon points="304,0 152,110 304,170" fill="#2A3A27" />
                  {/* Bottom Triangular Fold */}
                  <polygon points="0,170 152,85 304,170" fill="#364A32" />
                </svg>
              </div>

              {/* Olive Green 3D Wax Seal with Dynamic Monogram */}
              <div className="absolute bottom-[80px] left-1/2 -translate-x-1/2 z-40 drop-shadow-xl pointer-events-none">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#4A6146] via-[#354832] to-[#243322] border-2 border-[#D4AF37]/70 flex items-center justify-center shadow-inner relative">
                  <div className="w-10 h-10 rounded-full border border-dashed border-[#D4AF37]/60 flex items-center justify-center">
                    <span className="font-serif font-bold text-sm tracking-widest text-[#F2E5C4] drop-shadow-sm">
                      {sealText}
                    </span>
                  </div>
                </div>
              </div>

              {/* Bouquet pinned at bottom right of envelope */}
              <div className="absolute -bottom-1 -right-3 z-40 pointer-events-none transform rotate-12">
                <svg width="85" height="85" viewBox="0 0 100 100" fill="none">
                  {/* Flower spray */}
                  <circle cx="50" cy="50" r="14" fill="#698A62" opacity="0.85" />
                  {/* Blossom 1 Pink/Coral */}
                  <circle cx="42" cy="40" r="10" fill="#E8927C" />
                  <circle cx="42" cy="40" r="4" fill="#FFF275" />
                  {/* Blossom 2 Blue/Lavender */}
                  <circle cx="60" cy="42" r="9" fill="#7EA5D9" />
                  <circle cx="60" cy="42" r="3.5" fill="#FFFFFF" />
                  {/* Blossom 3 Daisy */}
                  <circle cx="48" cy="60" r="8" fill="#F7DC6F" />
                  <circle cx="48" cy="60" r="3" fill="#D68910" />
                  {/* Leaf accents */}
                  <ellipse cx="28" cy="48" rx="7" ry="3" fill="#4B6F44" transform="rotate(-30 28 48)" />
                  <ellipse cx="68" cy="58" rx="8" ry="4" fill="#4B6F44" transform="rotate(35 68 58)" />
                  <ellipse cx="40" cy="70" rx="9" ry="3.5" fill="#3D5A37" transform="rotate(75 40 70)" />
                  {/* Stems & Ribbon */}
                  <path d="M42 68 L35 88" stroke="#314E2C" strokeWidth="2.5" strokeLinecap="round" />
                  <path d="M50 70 L52 90" stroke="#314E2C" strokeWidth="2" strokeLinecap="round" />
                  <path d="M40 72 C46 76 46 76 52 72" stroke="#E29578" strokeWidth="3" strokeLinecap="round" />
                </svg>
              </div>
            </div>

            {/* Below Envelope: Cursive Calligraphy Names & Date */}
            <div className="text-center mt-1">
              <h2 className="font-serif italic text-3xl font-medium tracking-wide text-[#1E5652] drop-shadow-xs">
                {groomName} &amp; {brideName}
              </h2>
              <p className="font-sans text-xs font-semibold tracking-[0.3em] text-[#1E5652]/90 mt-1 uppercase">
                {dateStr}
              </p>
            </div>
          </div>
        );
      }

      // 05.2 Polaroid "My Love" Photo + Dark Olive Calendar with Heart on Day 2
      if (el.presetId === "p-forest-polaroid-calendar") {
        const photos = Array.isArray(data.photos) ? data.photos : [];
        const polaroidPhoto = (typeof (photos[2] as { url?: string })?.url === "string" ? (photos[2] as { url?: string }).url! : "") || (typeof (photos[0] as { url?: string })?.url === "string" ? (photos[0] as { url?: string }).url! : "") || "/images/demo/templates/t05-forest/gallery-3.jpg";
        const events = Array.isArray(data.events) ? data.events : [];
        const firstEvent = (events[0] as Record<string, unknown>) || null;
        const evDate = parseEventDate(firstEvent);
        const eventDay = evDate ? evDate.getDate() : 2;
        const monthStr = evDate ? `Tháng ${String(evDate.getMonth() + 1).padStart(2, "0")}.${evDate.getFullYear()}` : "Tháng 08.2026";
        const calMeta = evDate ? getMonthDaysAndOffset(evDate) : { daysInMonth: 31, firstDayOffset: 5 };
        const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

        return (
          <div className="w-full h-full px-3 py-2 flex items-center justify-center select-none bg-transparent">
            <div className="w-full h-full bg-[#364733] rounded-2xl p-4 shadow-xl flex items-center justify-between gap-3 text-white">
              {/* Left Column: Polaroid Photo Frame with "My Love" */}
              <div className="w-[46%] flex flex-col items-center">
                <div className="bg-white p-2 pb-3 rounded-lg shadow-xl w-full border border-white/90 transform -rotate-1 hover:rotate-0 transition-transform">
                  <div className="w-full aspect-[3/4] rounded overflow-hidden bg-stone-100 mb-2">
                    <img src={polaroidPhoto} alt="My Love" className="w-full h-full object-cover" />
                  </div>
                  <span className="font-serif italic text-base font-medium text-stone-800 text-center block leading-none">
                    My Love
                  </span>
                </div>
              </div>

              {/* Right Column: Month Header + Calendar Grid */}
              <div className="w-[52%] flex flex-col justify-center">
                <div className="text-right pr-1 mb-2">
                  <span className="font-serif text-sm font-semibold tracking-wider text-[#F2EBD9]">
                    {monthStr}
                  </span>
                </div>

                {/* Weekday headers */}
                <div className="grid grid-cols-7 text-center gap-0.5 mb-1 text-[9px] font-semibold text-stone-300">
                  {weekdays.map((w) => (
                    <span key={w}>{w}</span>
                  ))}
                </div>

                {/* Days Grid */}
                <div className="grid grid-cols-7 text-center gap-y-1 gap-x-0.5 text-[10px]">
                  {Array.from({ length: calMeta.firstDayOffset }).map((_, i) => (
                    <span key={`blank-${i}`} />
                  ))}
                  {Array.from({ length: calMeta.daysInMonth }, (_, i) => i + 1).map((d) => {
                    const isSelected = d === eventDay;
                    return (
                      <div key={d} className="flex items-center justify-center">
                        {isSelected ? (
                          <div className="relative inline-flex items-center justify-center w-6 h-6">
                            {/* Cute red/pink heart badge */}
                            <svg className="absolute inset-0 w-full h-full text-rose-400 drop-shadow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="rgba(225, 29, 72, 0.25)" />
                            </svg>
                            <span className="relative z-10 text-[10px] font-bold text-rose-200">
                              {d}
                            </span>
                          </div>
                        ) : (
                          <span className="text-stone-200/90 font-medium py-0.5">
                            {d}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        );
      }

      // 05.3 Clean Ivory Invitation Typography + Bouquet Ampersand
      if (el.presetId === "p-forest-invitation") {
        const groomName = (typeof data.groom?.fullName === "string" ? data.groom.fullName : "") || "Tuấn Minh";
        const brideName = (typeof data.bride?.fullName === "string" ? data.bride.fullName : "") || "Mai Lan";

        return (
          <div className="w-full h-full px-4 py-6 flex flex-col items-center justify-center text-center select-none bg-[#FAFBF8]">
            <span className="text-[11px] uppercase tracking-[0.25em] text-[#556950] font-bold mb-2">
              TRÂN TRỌNG KÍNH MỜI
            </span>
            <h2 className="font-serif italic text-4xl text-[#1E5652] tracking-wide my-1 drop-shadow-xs">
              Quý Khách
            </h2>
            <p className="text-[11px] uppercase font-bold tracking-[0.16em] text-[#344730] mt-2 mb-4">
              THAM DỰ TIỆC MỪNG LỄ THÀNH HÔN CỦA
            </p>

            {/* Couple names with artistic floral ampersand */}
            <div className="flex items-center justify-center gap-3">
              <span className="font-serif text-2xl font-bold text-[#1E5652] tracking-wide">
                {brideName}
              </span>
              <div className="relative inline-flex items-center justify-center">
                <span className="font-serif italic text-3xl font-light text-[#556950]">
                  &amp;
                </span>
                {/* Tiny flower bouquet next to ampersand */}
                <div className="absolute -top-3 -right-3 pointer-events-none">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="10" r="4" fill="#F4D03F" />
                    <circle cx="8" cy="8" r="3" fill="#E8927C" />
                    <circle cx="15" cy="7" r="3" fill="#90CDF4" />
                    <path d="M11 14 L9 20" stroke="#4B6F44" strokeWidth="1.5" strokeLinecap="round" />
                    <path d="M13 14 L15 19" stroke="#4B6F44" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </div>
              </div>
              <span className="font-serif text-2xl font-bold text-[#1E5652] tracking-wide">
                {groomName}
              </span>
            </div>
          </div>
        );
      }

      // 05.4 Facing Photos with Center Vertical Love Poem Strip
      if (el.presetId === "p-forest-facing-photos") {
        const photos = Array.isArray(data.photos) ? data.photos : [];
        const bridePhoto = (typeof (photos[3] as { url?: string })?.url === "string" ? (photos[3] as { url?: string }).url! : "") || (typeof data.bride?.avatarUrl === "string" ? data.bride.avatarUrl : "") || "/images/demo/templates/t05-forest/gallery-4.jpg";
        const groomPhoto = (typeof (photos[4] as { url?: string })?.url === "string" ? (photos[4] as { url?: string }).url! : "") || (typeof data.groom?.avatarUrl === "string" ? data.groom.avatarUrl : "") || "/images/demo/templates/t05-forest/gallery-5.jpg";

        return (
          <div className="w-full h-full px-3 py-2 flex items-center justify-between gap-2 select-none bg-[#FAFBF8]">
            {/* Left Vertical Photo: Bride in Nature with Veil Fade */}
            <div className="w-[41%] h-full rounded-xl overflow-hidden shadow-md relative bg-stone-100">
              <img src={bridePhoto} alt="Bride" className="w-full h-full object-cover" />
              <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-white/70 via-white/20 to-transparent pointer-events-none" />
            </div>

            {/* Center Dark Green Column with Vertical Poem */}
            <div className="w-[18%] h-full bg-[#364733] rounded-xl shadow-inner flex flex-col items-center justify-center p-2 text-white">
              <div className="flex flex-col items-center justify-center gap-2">
                <span className="[writing-mode:vertical-rl] tracking-widest text-[#F2EBD9] text-[10px] font-serif leading-tight">
                  Em là bình yên anh muốn giữ
                </span>
                <span className="text-base text-rose-300 drop-shadow">
                  💕
                </span>
                <span className="[writing-mode:vertical-rl] tracking-widest text-[#F2EBD9] text-[10px] font-serif leading-tight">
                  Anh là hạnh phúc em muốn trao
                </span>
              </div>
            </div>

            {/* Right Vertical Photo: Groom in Tux with Baby's Breath */}
            <div className="w-[41%] h-full rounded-xl overflow-hidden shadow-md relative bg-stone-100">
              <img src={groomPhoto} alt="Groom" className="w-full h-full object-cover" />
            </div>
          </div>
        );
      }

      // 05.5 Parents Dignified 2-Column + Center Song Hỷ Crest
      if (el.presetId === "p-forest-parents") {
        const brideParents = (data.bride?.parents as Record<string, unknown> | undefined) || {};
        const groomParents = (data.groom?.parents as Record<string, unknown> | undefined) || {};
        const brideFather = (typeof brideParents.fatherName === "string" ? brideParents.fatherName : "") || "Nguyễn Trí Thanh";
        const brideMother = (typeof brideParents.motherName === "string" ? brideParents.motherName : "") || "Lê Thị Hải";
        const groomFather = (typeof groomParents.fatherName === "string" ? groomParents.fatherName : "") || "Nguyễn Văn Tư";
        const groomMother = (typeof groomParents.motherName === "string" ? groomParents.motherName : "") || "Lê Thị Mai";

        return (
          <div className="w-full h-full px-5 py-3 flex flex-col justify-between items-center select-none bg-[#FAFBF8] relative">
            <div className="w-full grid grid-cols-2 gap-4 text-center">
              {/* Nhà Gái */}
              <div>
                <span className="font-serif font-bold text-xs uppercase tracking-widest text-[#2B3E27] block mb-1">
                  NHÀ GÁI
                </span>
                <span className="text-[11px] font-sans uppercase tracking-wider text-stone-600 block leading-tight">
                  ÔNG {brideFather}
                </span>
                <span className="text-[11px] font-sans uppercase tracking-wider text-stone-600 block leading-tight mt-0.5">
                  BÀ {brideMother}
                </span>
              </div>

              {/* Nhà Trai */}
              <div>
                <span className="font-serif font-bold text-xs uppercase tracking-widest text-[#2B3E27] block mb-1">
                  NHÀ TRAI
                </span>
                <span className="text-[11px] font-sans uppercase tracking-wider text-stone-600 block leading-tight">
                  ÔNG {groomFather}
                </span>
                <span className="text-[11px] font-sans uppercase tracking-wider text-stone-600 block leading-tight mt-0.5">
                  BÀ {groomMother}
                </span>
              </div>
            </div>

            {/* Traditional Song Hỷ Crest at Bottom Center */}
            <div className="mt-2 flex items-center justify-center">
              <div className="w-8 h-8 rounded-full border border-rose-400/80 bg-rose-50 flex items-center justify-center shadow-xs">
                <span className="text-rose-600 text-sm font-bold">
                  囍
                </span>
              </div>
            </div>
          </div>
        );
      }

      // 05.6 Unified Dark Olive Events Card + Double Ceremony + Map Links + 4-Box Countdown
      if (el.presetId === "p-forest-events-card") {
        const events = Array.isArray(data.events) ? data.events : [];
        const ev1 = (events[0] as Record<string, unknown>) || null;
        const ev2 = (events[1] as Record<string, unknown>) || null;

        const title1 = (ev1?.eventName as string) || "DỰ BỮA CƠM THÂN MẬT";
        const title2 = (ev2?.eventName as string) || "THAM DỰ HÔN LỄ";

        const venue1 = (ev1?.venueName as string) || "TẠI TƯ GIA NHÀ GÁI";
        const addr1 = (ev1?.address as string) || "Xóm 5 , Xã Phú Cát, Quốc Oai, Hà Nội";
        const mapUrl1 = (ev1?.mapUrl as string) || "https://maps.google.com";

        const venue2 = (ev2?.venueName as string) || "TẠI TƯ GIA NHÀ TRAI";
        const addr2 = (ev2?.address as string) || "Hoàng Mai, Hà Nội";
        const mapUrl2 = (ev2?.mapUrl as string) || "https://maps.google.com";

        const d1 = parseEventDate(ev1);
        const ev1Time = d1 ? `${fmtTimeColon(d1)} , ${fmtDayOfWeek(d1).toUpperCase()}` : "10 : 30 , CHỦ NHẬT";
        const ev1Date = d1 ? `${fmtDay(d1)} . ${String(d1.getMonth() + 1).padStart(2, "0")} . ${d1.getFullYear()}` : "02 . 08 . 2026";
        const ev1Lunar = typeof ev1?.lunarDate === "string" && ev1.lunarDate ? `Tức ${ev1.lunarDate}` : "Tức Ngày 20 Tháng 07 Năm Bính Ngọ";

        const d2 = parseEventDate(ev2);
        const ev2Time = d2 ? `${fmtTimeColon(d2)} , ${fmtDayOfWeek(d2).toUpperCase()}` : "12 : 30 , CHỦ NHẬT";
        const ev2Date = d2 ? `${fmtDay(d2)} . ${String(d2.getMonth() + 1).padStart(2, "0")} . ${d2.getFullYear()}` : "02 . 08 . 2026";
        const ev2Lunar = typeof ev2?.lunarDate === "string" && ev2.lunarDate ? `Tức ${ev2.lunarDate}` : "Tức Ngày 20 Tháng 07 Năm Bính Ngọ";

        const cd = calcCountdown(d1 || d2);

        return (
          <div className="w-full h-full px-3 py-2 flex flex-col justify-between select-none bg-transparent">
            {/* Dark Green Event Card */}
            <div className="w-full bg-[#364733] rounded-2xl p-5 text-white text-center shadow-xl relative overflow-hidden">
              {/* Event 1 (Nhà Gái) */}
              <div className="flex flex-col items-center">
                <h3 className="font-serif font-bold text-sm tracking-widest text-[#F2EBD9] uppercase mb-1">
                  {title1}
                </h3>
                <span className="text-[10px] text-stone-300 uppercase tracking-widest font-medium">
                  VÀO HỒI
                </span>
                <span className="font-sans font-bold text-base tracking-wider text-white mt-0.5">
                  {ev1Time}
                </span>
                <span className="font-serif text-2xl font-bold tracking-widest text-[#F2EBD9] my-1">
                  {ev1Date}
                </span>
                <span className="italic text-[11px] text-stone-300">
                  {ev1Lunar}
                </span>
                <h4 className="font-serif font-bold text-base uppercase tracking-wider text-white mt-2">
                  {venue1}
                </h4>
                <p className="text-xs text-stone-200 mt-0.5 mb-3 max-w-[280px]">
                  {addr1}
                </p>
                <a
                  href={mapUrl1}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block bg-white text-[#364733] font-bold text-[10px] tracking-wider uppercase px-6 py-2 rounded-full shadow-md hover:bg-stone-100 transition-colors pointer-events-auto cursor-pointer"
                >
                  XEM CHỈ ĐƯỜNG
                </a>
              </div>

              {/* Horizontal Separator */}
              <div className="w-full border-t border-white/20 my-5" />

              {/* Event 2 (Nhà Trai) */}
              <div className="flex flex-col items-center">
                <h3 className="font-serif font-bold text-sm tracking-widest text-[#F2EBD9] uppercase mb-1">
                  {title2}
                </h3>
                <span className="text-[10px] text-stone-300 uppercase tracking-widest font-medium">
                  VÀO HỒI
                </span>
                <span className="font-sans font-bold text-base tracking-wider text-white mt-0.5">
                  {ev2Time}
                </span>
                <span className="font-serif text-2xl font-bold tracking-widest text-[#F2EBD9] my-1">
                  {ev2Date}
                </span>
                <span className="italic text-[11px] text-stone-300">
                  {ev2Lunar}
                </span>
                <h4 className="font-serif font-bold text-base uppercase tracking-wider text-white mt-2">
                  {venue2}
                </h4>
                <p className="text-xs text-stone-200 mt-0.5 mb-3 max-w-[280px]">
                  {addr2}
                </p>
                <a
                  href={mapUrl2}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block bg-white text-[#364733] font-bold text-[10px] tracking-wider uppercase px-6 py-2 rounded-full shadow-md hover:bg-stone-100 transition-colors pointer-events-auto cursor-pointer"
                >
                  XEM CHỈ ĐƯỜNG
                </a>
              </div>

              {/* Bottom Heartfelt Message & Flower bouquet */}
              <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-center gap-2">
                <div className="w-8 h-8 shrink-0">
                  <svg viewBox="0 0 32 32" className="w-full h-full" fill="none">
                    <circle cx="16" cy="14" r="5" fill="#F4D03F" />
                    <circle cx="11" cy="12" r="4" fill="#90CDF4" />
                    <circle cx="21" cy="12" r="4" fill="#E8927C" />
                    <path d="M15 19 L13 28" stroke="#718096" strokeWidth="1.5" strokeLinecap="round" />
                    <path d="M17 19 L19 28" stroke="#718096" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </div>
                <p className="text-[11px] italic text-stone-200 text-left leading-snug">
                  Sự hiện diện của Quý Khách<br />Là niềm vinh hạnh cho gia đình chúng tôi
                </p>
              </div>
            </div>

            {/* Countdown Timer with 4 Dark Olive Square Boxes */}
            <div className="mt-3 grid grid-cols-4 gap-2.5 max-w-[320px] mx-auto w-full">
              {[
                { label: "ngày", val: cd.days },
                { label: "giờ", val: cd.hours },
                { label: "phút", val: cd.minutes },
                { label: "giây", val: cd.seconds },
              ].map((item) => (
                <div key={item.label} className="bg-[#364733] rounded-lg p-2 text-center text-white shadow-md">
                  <span className="font-serif text-lg font-bold block leading-none">
                    {item.val}
                  </span>
                  <span className="text-[9px] uppercase tracking-wider text-stone-300 font-medium block mt-1">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        );
      }

      // 05.7 Photo Grid: Triptych Row 1 + Wide Landscape Row 2 + Triptych Row 3
      if (el.presetId === "p-forest-gallery-grid") {
        const photos = Array.isArray(data.photos) ? data.photos : [];
        const p1 = (typeof (photos[0] as { url?: string })?.url === "string" ? (photos[0] as { url?: string }).url! : "") || "/images/demo/templates/t05-forest/gallery-1.jpg";
        const p2 = (typeof (photos[1] as { url?: string })?.url === "string" ? (photos[1] as { url?: string }).url! : "") || "/images/demo/templates/t05-forest/gallery-2.jpg";
        const p3 = (typeof (photos[2] as { url?: string })?.url === "string" ? (photos[2] as { url?: string }).url! : "") || "/images/demo/templates/t05-forest/gallery-3.jpg";
        const pLandscape = (typeof (photos[5] as { url?: string })?.url === "string" ? (photos[5] as { url?: string }).url! : "") || "/images/demo/templates/t05-forest/gallery-6.jpg";
        const p4 = (typeof (photos[6] as { url?: string })?.url === "string" ? (photos[6] as { url?: string }).url! : "") || "/images/demo/templates/t05-forest/gallery-7.jpg";
        const p5 = (typeof (photos[7] as { url?: string })?.url === "string" ? (photos[7] as { url?: string }).url! : "") || "/images/demo/templates/t05-forest/gallery-8.jpg";
        const p6 = (typeof data.coverPhotoUrl === "string" ? data.coverPhotoUrl : "") || "/images/demo/templates/t05-forest/cover.jpg";

        return (
          <div className="w-full h-full px-3 py-2 flex flex-col justify-between gap-2.5 select-none bg-[#FAFBF8]">
            {/* Row 1: 3 vertical photos side by side */}
            <div className="grid grid-cols-3 gap-2 h-[240px]">
              <div className="rounded-xl overflow-hidden shadow-sm bg-stone-100">
                <img src={p1} alt="T05-1" className="w-full h-full object-cover" />
              </div>
              <div className="rounded-xl overflow-hidden shadow-sm bg-stone-100">
                <img src={p2} alt="T05-2" className="w-full h-full object-cover" />
              </div>
              <div className="rounded-xl overflow-hidden shadow-sm bg-stone-100">
                <img src={p3} alt="T05-3" className="w-full h-full object-cover" />
              </div>
            </div>

            {/* Row 2: Wide horizontal landscape photo with veil */}
            <div className="w-full h-[250px] rounded-xl overflow-hidden shadow-md bg-stone-100">
              <img src={pLandscape} alt="T05-Landscape" className="w-full h-full object-cover object-center" />
            </div>

            {/* Row 3: 3 vertical photos side by side */}
            <div className="grid grid-cols-3 gap-2 h-[240px]">
              <div className="rounded-xl overflow-hidden shadow-sm bg-stone-100">
                <img src={p4} alt="T05-4" className="w-full h-full object-cover" />
              </div>
              <div className="rounded-xl overflow-hidden shadow-sm bg-stone-100">
                <img src={p5} alt="T05-5" className="w-full h-full object-cover" />
              </div>
              <div className="rounded-xl overflow-hidden shadow-sm bg-stone-100">
                <img src={p6} alt="T05-6" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        );
      }

      // 05.8 Dedicated RSVP Card with Feather Pen Action Button
      if (el.presetId === "p-forest-rsvp") {
        return (
          <div className="w-full h-full px-4 py-3 flex flex-col items-center justify-center text-center select-none bg-[#FAFBF8]">
            <p className="text-xs text-stone-600 mb-2 leading-relaxed max-w-[300px]">
              Vui lòng điền xác nhận để chúng mình đón tiếp và chuẩn bị được chu đáo hơn. Trân trọng!
            </p>
            <span className="font-serif text-[10px] uppercase tracking-[0.3em] text-[#556950] font-bold block mb-1">
              R.S.V.P.
            </span>
            <h3 className="font-serif text-xl font-bold text-[#2B3E27] tracking-wider mb-2">
              Xác nhận tham dự
            </h3>
            <p className="text-[11px] text-stone-500 mb-4 max-w-[280px] leading-relaxed">
              Vui lòng xác nhận tham dự để chúng mình chuẩn bị lễ cưới được thuận lợi và trọn vẹn nhất.
            </p>
            <button
              onClick={() => onRsvp && onRsvp()}
              type="button"
              className="inline-flex items-center gap-2 bg-[#364733] text-white font-sans font-bold text-xs tracking-wider px-7 py-2.5 rounded-full shadow-md hover:bg-[#2A3927] transition-all hover:scale-105 cursor-pointer pointer-events-auto"
            >
              <span>✍️</span>
              <span>Gửi xác nhận</span>
            </button>
          </div>
        );
      }

      // 05.9 Dedicated Gift Card with Smartphone + Heart Icon
      if (el.presetId === "p-forest-gift") {
        return (
          <div className="w-full h-full px-4 py-2 flex items-center justify-center select-none bg-[#FAFBF8]">
            <div
              onClick={() => onGift && onGift()}
              className="w-full bg-[#364733] rounded-2xl p-5 shadow-xl flex flex-col items-center justify-center text-center cursor-pointer pointer-events-auto hover:bg-[#2F3F2C] transition-all group"
            >
              {/* Smartphone Frame with Glowing Heart Envelope */}
              <div className="w-12 h-16 rounded-xl border-2 border-white/60 bg-stone-900/60 p-1 flex flex-col items-center justify-center shadow-md mb-2 group-hover:scale-110 transition-transform">
                <div className="w-8 h-8 rounded-lg bg-rose-100 flex items-center justify-center">
                  <span className="text-rose-500 text-base">💖</span>
                </div>
                <div className="w-2 h-1 bg-white/40 rounded-full mt-1" />
              </div>

              <h4 className="font-serif font-bold text-lg text-white tracking-wider">
                Gửi Quà Mừng
              </h4>
              <span className="text-[11px] text-stone-300 font-sans mt-0.5 block">
                Chạm để xem tài khoản mừng cưới
              </span>
            </div>
          </div>
        );
      }

      // 05.10 Farewell Misty Pine Forest + "Lời Cảm Ơn" Typography
      if (el.presetId === "p-forest-farewell") {
        const coverPhoto = (typeof data.coverPhotoUrl === "string" ? data.coverPhotoUrl : "") || "/images/demo/templates/t05-forest/cover.jpg";

        return (
          <div className="w-full h-full relative overflow-hidden select-none bg-stone-900 flex flex-col justify-end">
            <img src={coverPhoto} alt="Farewell Forest" className="absolute inset-0 w-full h-full object-cover object-center" />
            <div className="absolute inset-0 bg-gradient-to-t from-white/95 via-white/80 to-transparent pointer-events-none" />

            <div className="relative z-10 px-6 pb-8 text-center flex flex-col items-center text-stone-800">
              <h2 className="font-serif italic text-3xl font-medium tracking-wide text-[#233520] mb-3 drop-shadow-xs">
                Lời Cảm Ơn
              </h2>
              <p className="text-xs text-stone-700 leading-relaxed max-w-[310px] font-sans">
                Trân trọng cảm ơn Quý Khách đã dành thời gian đến chung vui và chúc phúc cho chúng tôi. Sự hiện diện của Quý vị là niềm vinh hạnh và hạnh phúc lớn lao của gia đình chúng tôi.
              </p>
            </div>

            {/* Vertical Watermark */}
            <div className="absolute right-2 bottom-8 z-10 pointer-events-none">
              <span className="[writing-mode:vertical-rl] text-[9px] uppercase tracking-widest text-stone-400 font-medium">
                Made with Ngày chung đôi
              </span>
            </div>
          </div>
        );
      }

      // ═════════════════════════════════════════════════════════════════════════════
      // TEMPLATE 06: HOA SEN THANH KHIẾT BÁO HỶ THUẦN VIỆT (MINH HẰNG & ĐỨC HIỂN)
      // ═════════════════════════════════════════════════════════════════════════════

      // 06.1 Hero Watercolor Lotus + Floating Petals + "THIỆP BÁO HỶ" Typography
      if (el.presetId === "p-lotus-hero") {
        const groomShort = (typeof data.groom?.shortName === "string" ? data.groom.shortName : "") || (typeof data.groom?.fullName === "string" ? data.groom.fullName : "") || "Đức Hiển";
        const brideShort = (typeof data.bride?.shortName === "string" ? data.bride.shortName : "") || (typeof data.bride?.fullName === "string" ? data.bride.fullName : "") || "Minh Hằng";
        const events = Array.isArray(data.events) ? data.events : [];
        const firstEvent = (events[0] as Record<string, unknown>) || null;
        const evDate = parseEventDate(firstEvent);
        const dateStr = evDate ? fmtDateDot(evDate) : "29.11.2026";

        return (
          <div className="w-full h-full relative overflow-hidden select-none bg-gradient-to-b from-[#FAFDF9] via-[#FFFFFF] to-[#F5FAF4] flex flex-col justify-between pt-8 pb-10 px-4">
            {/* Top-Left Watercolor Lotus Leaf Illustration */}
            <div className="absolute top-0 left-0 w-36 h-28 pointer-events-none opacity-90">
              <svg viewBox="0 0 140 110" className="w-full h-full" fill="none">
                <defs>
                  <radialGradient id="lotusLeafGrad" cx="30%" cy="30%" r="70%">
                    <stop offset="0%" stopColor="#7DAE84" />
                    <stop offset="50%" stopColor="#4A7553" />
                    <stop offset="100%" stopColor="#2E5136" />
                  </radialGradient>
                </defs>
                <path d="M-10 -10 C30 -5 70 15 90 40 C110 65 100 95 70 100 C40 105 10 90 -5 65 Z" fill="url(#lotusLeafGrad)" opacity="0.85" />
                {/* Leaf veins */}
                <path d="M0 0 C40 35 60 55 80 80" stroke="#9FD4A7" strokeWidth="1.2" opacity="0.6" strokeLinecap="round" />
                <path d="M35 25 C55 20 75 30 85 45" stroke="#9FD4A7" strokeWidth="0.8" opacity="0.5" strokeLinecap="round" />
                <path d="M50 45 C45 65 55 75 70 85" stroke="#9FD4A7" strokeWidth="0.8" opacity="0.5" strokeLinecap="round" />
              </svg>
            </div>

            {/* Drifting Pink Lotus Petals */}
            <div className="absolute top-16 left-12 transform -rotate-12 pointer-events-none opacity-75">
              <svg width="22" height="14" viewBox="0 0 22 14" fill="none">
                <path d="M0 7 C5 0 17 0 22 7 C17 14 5 14 0 7 Z" fill="#F3A6B4" opacity="0.9" />
              </svg>
            </div>
            <div className="absolute top-10 right-14 transform rotate-24 pointer-events-none opacity-60">
              <svg width="18" height="12" viewBox="0 0 18 12" fill="none">
                <path d="M0 6 C4 0 14 0 18 6 C14 12 4 12 0 6 Z" fill="#E88295" opacity="0.85" />
              </svg>
            </div>
            <div className="absolute top-72 left-8 transform rotate-45 pointer-events-none opacity-70">
              <svg width="20" height="13" viewBox="0 0 20 13" fill="none">
                <path d="M0 6.5 C4 0 16 0 20 6.5 C16 13 4 13 0 6.5 Z" fill="#F3A6B4" opacity="0.8" />
              </svg>
            </div>
            <div className="absolute top-84 right-6 transform -rotate-18 pointer-events-none opacity-65">
              <svg width="24" height="15" viewBox="0 0 24 15" fill="none">
                <path d="M0 7.5 C6 0 18 0 24 7.5 C18 15 6 15 0 7.5 Z" fill="#E88295" opacity="0.85" />
              </svg>
            </div>

            {/* Center Typography: THIỆP BÁO HỶ */}
            <div className="relative z-10 text-center mt-8">
              <h1 className="font-serif text-3xl md:text-4xl font-normal tracking-[0.25em] text-[#223624] uppercase drop-shadow-xs">
                THIỆP BÁO HỶ
              </h1>
              <div className="w-16 h-[1px] bg-[#C9A45C]/60 mx-auto mt-3 mb-4" />
              <p className="font-serif italic text-3xl text-[#1E5652] tracking-wide my-1">
                {brideShort} &amp; {groomShort}
              </p>
              <p className="font-serif text-sm tracking-[0.25em] text-stone-600 uppercase mt-3">
                {dateStr}
              </p>
            </div>

            {/* Bottom-Right Watercolor Lotus Flowers & Leaves Spray */}
            <div className="relative z-10 flex justify-end pr-2 pointer-events-none">
              <div className="w-56 h-48 relative">
                <svg viewBox="0 0 200 170" className="w-full h-full" fill="none">
                  {/* Lotus Leaf Base */}
                  <ellipse cx="140" cy="130" rx="55" ry="30" fill="#4B7754" opacity="0.85" />
                  <ellipse cx="80" cy="140" rx="45" ry="22" fill="#6B9C75" opacity="0.8" />
                  {/* Stems */}
                  <path d="M120 135 C115 110 110 80 108 55" stroke="#3D6345" strokeWidth="3" strokeLinecap="round" />
                  <path d="M150 135 C152 115 158 95 162 70" stroke="#3D6345" strokeWidth="2.5" strokeLinecap="round" />
                  {/* Big Pink Lotus Bloom */}
                  <g transform="translate(65, 30)">
                    {/* Outer Petals */}
                    <path d="M45 45 C20 30 15 10 35 0 C45 15 50 35 45 45 Z" fill="#F8B4C2" />
                    <path d="M45 45 C70 30 75 10 55 0 C45 15 40 35 45 45 Z" fill="#F8B4C2" />
                    <path d="M45 45 C30 20 35 -5 45 -10 C55 -5 60 20 45 45 Z" fill="#E88295" />
                    {/* Inner Golden Stamen */}
                    <ellipse cx="45" cy="15" rx="7" ry="5" fill="#F4D03F" opacity="0.9" />
                  </g>
                  {/* Small Lotus Bud */}
                  <g transform="translate(145, 45)">
                    <path d="M15 30 C5 20 8 5 15 0 C22 5 25 20 15 30 Z" fill="#EA95A7" />
                  </g>
                </svg>
              </div>
            </div>
          </div>
        );
      }

      // 06.2 Announcement Card with Green Border + Red Song Hỷ Crest + Gold Lotus Line-art
      if (el.presetId === "p-lotus-announcement") {
        const brideParents = (data.bride?.parents as Record<string, unknown> | undefined) || {};
        const groomParents = (data.groom?.parents as Record<string, unknown> | undefined) || {};
        const brideFather = (typeof brideParents.fatherName === "string" ? brideParents.fatherName : "") || "Lê Văn Đức";
        const brideMother = (typeof brideParents.motherName === "string" ? brideParents.motherName : "") || "Lê Thị Hạnh";
        const rawBrideAddr = (data.bride as Record<string, unknown>)?.address;
        const brideAddress: string = typeof rawBrideAddr === "string" && rawBrideAddr.trim() ? rawBrideAddr : "Phố Huế, Hà Nội";

        const groomFather = (typeof groomParents.fatherName === "string" ? groomParents.fatherName : "") || "Trần Văn Đạt";
        const groomMother = (typeof groomParents.motherName === "string" ? groomParents.motherName : "") || "Lê Như Hà";
        const rawGroomAddr = (data.groom as Record<string, unknown>)?.address;
        const groomAddress: string = typeof rawGroomAddr === "string" && rawGroomAddr.trim() ? rawGroomAddr : "Tam Trinh, Hà Nội";

        const groomFull = (typeof data.groom?.fullName === "string" ? data.groom.fullName : "") || "Trần Đức Hiển";
        const brideFull = (typeof data.bride?.fullName === "string" ? data.bride.fullName : "") || "Nguyễn Minh Hằng";

        return (
          <div className="w-full h-full px-3 py-2 flex items-center justify-center select-none bg-transparent">
            {/* Rounded Rect with Green Border & Gold Lotus Watermarks */}
            <div className="w-full h-full rounded-3xl border border-[#2E5136]/70 bg-white/95 p-5 shadow-lg flex flex-col justify-between items-center text-center relative overflow-hidden">
              {/* Gold Lotus Corner Line-Art at Bottom-Left & Bottom-Right */}
              <div className="absolute -bottom-2 -left-2 pointer-events-none opacity-40">
                <svg width="70" height="70" viewBox="0 0 60 60" fill="none">
                  <path d="M5 55 C15 35 35 15 55 5" stroke="#C9A45C" strokeWidth="1" />
                  <path d="M20 45 C15 30 25 20 30 15 C35 20 45 30 40 45 Z" stroke="#C9A45C" strokeWidth="0.8" fill="#C9A45C" fillOpacity="0.08" />
                  <path d="M12 48 C8 38 15 28 20 25 C22 30 22 40 18 48 Z" stroke="#C9A45C" strokeWidth="0.6" />
                </svg>
              </div>
              <div className="absolute -bottom-2 -right-2 pointer-events-none opacity-40 transform scale-x-[-1]">
                <svg width="70" height="70" viewBox="0 0 60 60" fill="none">
                  <path d="M5 55 C15 35 35 15 55 5" stroke="#C9A45C" strokeWidth="1" />
                  <path d="M20 45 C15 30 25 20 30 15 C35 20 45 30 40 45 Z" stroke="#C9A45C" strokeWidth="0.8" fill="#C9A45C" fillOpacity="0.08" />
                  <path d="M12 48 C8 38 15 28 20 25 C22 30 22 40 18 48 Z" stroke="#C9A45C" strokeWidth="0.6" />
                </svg>
              </div>

              {/* 3-Column Header: NHÀ TRAI | Red Song Hỷ | NHÀ GÁI */}
              <div className="w-full grid grid-cols-3 items-center">
                {/* Nhà Trai */}
                <div className="text-center">
                  <span className="font-serif font-bold text-xs uppercase tracking-widest text-[#243521] block mb-1">
                    NHÀ TRAI
                  </span>
                  <span className="text-[10px] font-sans uppercase font-bold text-stone-700 block leading-tight">
                    ÔNG: {groomFather}
                  </span>
                  <span className="text-[10px] font-sans uppercase font-bold text-stone-700 block leading-tight mt-0.5">
                    BÀ: {groomMother}
                  </span>
                  <span className="text-[9px] text-stone-500 block mt-1">
                    {groomAddress}
                  </span>
                </div>

                {/* Central Red Song Hỷ Medallion */}
                <div className="flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full border-2 border-[#B71C1C] flex items-center justify-center bg-rose-50/60 shadow-xs">
                    <span className="text-[#B71C1C] text-2xl font-serif font-black leading-none select-none">
                      囍
                    </span>
                  </div>
                </div>

                {/* Nhà Gái */}
                <div className="text-center">
                  <span className="font-serif font-bold text-xs uppercase tracking-widest text-[#243521] block mb-1">
                    NHÀ GÁI
                  </span>
                  <span className="text-[10px] font-sans uppercase font-bold text-stone-700 block leading-tight">
                    ÔNG: {brideFather}
                  </span>
                  <span className="text-[10px] font-sans uppercase font-bold text-stone-700 block leading-tight mt-0.5">
                    BÀ: {brideMother}
                  </span>
                  <span className="text-[9px] text-stone-500 block mt-1">
                    {brideAddress}
                  </span>
                </div>
              </div>

              {/* Centered Sentence */}
              <div className="my-2">
                <p className="font-serif italic text-xs text-stone-600 tracking-wide">
                  Trân Trọng Báo Tin Lễ Thành Hôn Của
                </p>
              </div>

              {/* Couple Full Names in Flowing Cursive Script */}
              <div className="mb-2">
                <h3 className="font-serif italic text-2xl text-[#1E5652] tracking-wide">
                  {brideFull}
                </h3>
                <span className="font-serif text-xl text-[#C9A45C] block my-0.5 font-light">
                  &amp;
                </span>
                <h3 className="font-serif italic text-2xl text-[#1E5652] tracking-wide">
                  {groomFull}
                </h3>
              </div>
            </div>
          </div>
        );
      }

      // 06.3 Romantic Couple Photo Banner + "THƯ MỜI THAM DỰ TIỆC CƯỚI"
      if (el.presetId === "p-lotus-invitation-header") {
        const photos = Array.isArray(data.photos) ? data.photos : [];
        const photoUrl = (typeof (photos[0] as { url?: string })?.url === "string" ? (photos[0] as { url?: string }).url! : "") || (typeof data.coverPhotoUrl === "string" ? data.coverPhotoUrl : "") || "/images/demo/templates/t06-lotus/gallery-1.jpg";

        return (
          <div className="w-full h-full flex flex-col justify-between select-none bg-[#FCFDFB]">
            {/* Full-width couple banner with bottom gradient fade */}
            <div className="w-full h-[260px] relative overflow-hidden bg-stone-100">
              <img src={photoUrl} alt="Invitation Banner" className="w-full h-full object-cover object-center" />
              <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#FCFDFB] via-[#FCFDFB]/60 to-transparent pointer-events-none" />
            </div>

            {/* Invitation Section Heading */}
            <div className="text-center pb-3">
              <h2 className="font-serif text-sm font-bold tracking-[0.25em] text-[#2E4731] uppercase">
                THƯ MỜI THAM DỰ TIỆC CƯỚI
              </h2>
            </div>
          </div>
        );
      }

      // 06.4 Dual Ceremonies (Lễ Thành Hôn & Tiệc Vu Quy) with Gold Lotus Divider
      if (el.presetId === "p-lotus-ceremonies") {
        const events = Array.isArray(data.events) ? data.events : [];
        const ev1 = (events[0] as Record<string, unknown>) || null;
        const ev2 = (events[1] as Record<string, unknown>) || null;

        const formatEvTime = (dateInput?: unknown, fallbackTime = "15:00 - Chủ Nhật") => {
          if (!dateInput) return fallbackTime;
          const d = new Date(dateInput as string | number);
          if (isNaN(d.getTime())) return fallbackTime;
          const hh = String(d.getHours()).padStart(2, "0");
          const mm = String(d.getMinutes()).padStart(2, "0");
          const days = ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];
          return `${hh}:${mm} - ${days[d.getDay()] || "Chủ Nhật"}`;
        };

        const formatEvDate = (dateInput?: unknown, fallbackDate = "29.11.2026") => {
          if (!dateInput) return fallbackDate;
          const d = new Date(dateInput as string | number);
          if (isNaN(d.getTime())) return fallbackDate;
          const dd = String(d.getDate()).padStart(2, "0");
          const mm = String(d.getMonth() + 1).padStart(2, "0");
          const yy = d.getFullYear();
          return `${dd}.${mm}.${yy}`;
        };

        const title1 = (ev1?.eventName as string) || "LỄ THÀNH HÔN";
        const time1 = formatEvTime(ev1?.eventDate, "15:00 - Chủ Nhật");
        const date1 = formatEvDate(ev1?.eventDate, "29.11.2026");
        const lunar1 = (typeof ev1?.lunarDate === "string" && ev1.lunarDate.trim()) ? (ev1.lunarDate.startsWith("(") ? ev1.lunarDate : `(${ev1.lunarDate})`) : "(Tức Ngày 15 Tháng 10 Năm Bính Ngọ)";
        const venue1 = (ev1?.venueName as string) || "Tại Tư Gia Nhà Gái";

        const title2 = (ev2?.eventName as string) || "TIỆC MỪNG LỄ VU QUY";
        const time2 = formatEvTime(ev2?.eventDate, "16:00 - Chủ Nhật");
        const date2 = formatEvDate(ev2?.eventDate, "29.11.2026");
        const lunar2 = (typeof ev2?.lunarDate === "string" && ev2.lunarDate.trim()) ? (ev2.lunarDate.startsWith("(") ? ev2.lunarDate : `(${ev2.lunarDate})`) : "(Tức Ngày 15 Tháng 10 Năm Bính Ngọ)";
        const venue2 = (ev2?.venueName as string) || "khách sạn CINELOVE";

        return (
          <div className="w-full h-full px-4 py-3 flex flex-col items-center justify-between text-center select-none bg-[#FCFDFB] relative">
            {/* Drifting Petals Accent */}
            <div className="absolute top-4 left-4 pointer-events-none opacity-60">
              <svg width="20" height="12" viewBox="0 0 20 12" fill="none">
                <path d="M0 6 C4 0 16 0 20 6 C16 12 4 12 0 6 Z" fill="#F3A6B4" />
              </svg>
            </div>

            {/* Event 1: LỄ THÀNH HÔN */}
            <div className="flex flex-col items-center">
              <h3 className="font-serif font-black text-xl tracking-wider text-[#1C2C1D] uppercase">
                {title1}
              </h3>
              <span className="font-sans text-xs font-semibold text-stone-700 tracking-wide mt-1">
                {time1}
              </span>
              <span className="font-serif text-2xl font-bold tracking-widest text-[#1C2C1D] my-1">
                {date1}
              </span>
              <span className="text-[11px] italic text-stone-500">
                {lunar1}
              </span>
              <p className="font-serif font-bold text-sm text-[#2E4731] mt-1.5">
                {venue1}
              </p>
            </div>

            {/* Gold Lotus Divider */}
            <div className="flex items-center justify-center gap-3 my-2 w-full max-w-[260px]">
              <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-[#C9A45C]" />
              <div className="w-6 h-6 flex items-center justify-center text-[#C9A45C]">
                <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="12" cy="12" r="3" fill="#C9A45C" />
                  <path d="M12 4 C10 8 10 10 12 12 C14 10 14 8 12 4 Z" />
                  <path d="M12 20 C10 16 10 14 12 12 C14 14 14 16 12 20 Z" />
                  <path d="M4 12 C8 10 10 10 12 12 C10 14 8 14 4 12 Z" />
                  <path d="M20 12 C16 10 14 10 12 12 C14 14 16 14 20 12 Z" />
                </svg>
              </div>
              <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-[#C9A45C]" />
            </div>

            {/* Event 2: TIỆC MỪNG LỄ VU QUY */}
            <div className="flex flex-col items-center">
              <h3 className="font-serif font-black text-xl tracking-wider text-[#1C2C1D] uppercase">
                {title2}
              </h3>
              <span className="font-sans text-xs font-semibold text-stone-700 tracking-wide mt-1">
                {time2}
              </span>
              <span className="font-serif text-2xl font-bold tracking-widest text-[#1C2C1D] my-1">
                {date2}
              </span>
              <span className="text-[11px] italic text-stone-500">
                {lunar2}
              </span>
              <p className="font-serif font-bold text-sm text-[#2E4731] mt-1.5 uppercase">
                {venue2}
              </p>
            </div>
          </div>
        );
      }

      // 06.5 Minimalist Lotus Calendar with Dark Olive Bar & Heart Badge on Selected Day
      if (el.presetId === "p-lotus-calendar") {
        const events = Array.isArray(data.events) ? data.events : [];
        const firstEvent = (events[0] as Record<string, unknown>) || null;
        let eventDate = new Date("2026-11-29T15:00:00Z");
        if (firstEvent && firstEvent.eventDate) {
          const d = new Date(firstEvent.eventDate as string | number);
          if (!isNaN(d.getTime())) eventDate = d;
        }

        const eventYear = eventDate.getFullYear();
        const eventMonth = eventDate.getMonth() + 1;
        const eventDay = eventDate.getDate();

        // Calculate calendar grid (T2..CN = Mon..Sun)
        const daysInMonth = new Date(eventYear, eventMonth, 0).getDate();
        const firstDayOfWeek = new Date(eventYear, eventMonth - 1, 1).getDay(); // 0 is Sun, 1 is Mon
        const leadingBlanks = (firstDayOfWeek + 6) % 7;

        const calendarDays: (number | null)[] = [];
        for (let i = 0; i < leadingBlanks; i++) calendarDays.push(null);
        for (let d = 1; d <= daysInMonth; d++) calendarDays.push(d);

        return (
          <div className="w-full h-full px-4 py-2 flex items-center justify-center select-none bg-transparent">
            {/* White card with subtle border and lotus decoration */}
            <div className="w-full h-full rounded-2xl border border-[#2E5136]/50 bg-white p-5 shadow-md flex flex-col justify-between relative overflow-hidden">
              {/* Header: Month ......... Year */}
              <div className="flex items-center justify-between px-2 mb-2">
                <span className="font-serif text-2xl font-bold text-stone-800">
                  {String(eventMonth).padStart(2, "0")}
                </span>
                <span className="font-serif text-xl font-bold text-stone-800">
                  {eventYear}
                </span>
              </div>

              {/* Dark Olive Weekday Bar: T2 T3 T4 T5 T6 T7 CN */}
              <div className="bg-[#4E6144] rounded-lg py-1.5 px-1 grid grid-cols-7 text-center text-white text-[10px] font-bold tracking-wider mb-2">
                <span>T2</span>
                <span>T3</span>
                <span>T4</span>
                <span>T5</span>
                <span>T6</span>
                <span>T7</span>
                <span>CN</span>
              </div>

              {/* Days Grid */}
              <div className="grid grid-cols-7 text-center gap-y-1.5 text-xs text-stone-700">
                {calendarDays.map((d, idx) => {
                  if (d === null) return <span key={`empty-${idx}`} />;
                  const isSelected = d === eventDay;
                  return (
                    <div key={d} className="flex items-center justify-center">
                      {isSelected ? (
                        <div className="relative inline-flex items-center justify-center w-7 h-7">
                          {/* Heart Outline Badge */}
                          <svg className="absolute inset-0 w-full h-full text-stone-800 drop-shadow-xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                          </svg>
                          <span className="relative z-10 text-[10px] font-bold text-stone-900">
                            {d}
                          </span>
                        </div>
                      ) : (
                        <span className="text-stone-700 font-medium py-0.5">
                          {d}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Subtle Lotus Spray at Right Border */}
              <div className="absolute -right-3 -bottom-2 pointer-events-none opacity-45">
                <svg width="60" height="60" viewBox="0 0 50 50" fill="none">
                  <path d="M25 45 C20 30 15 20 25 5 C35 20 30 30 25 45 Z" fill="#E88295" />
                  <path d="M25 45 C35 35 45 25 48 15 C45 28 35 38 25 45 Z" fill="#F3A6B4" />
                </svg>
              </div>
            </div>
          </div>
        );
      }

      // 06.6 Dedicated RSVP Card with Green Border + Feather Pen Button
      if (el.presetId === "p-lotus-rsvp") {
        return (
          <div className="w-full h-full px-3 py-2 flex items-center justify-center select-none bg-transparent">
            <div className="w-full h-full rounded-3xl border border-[#2E5136]/70 bg-white/95 p-5 shadow-lg flex flex-col items-center justify-between text-center relative overflow-hidden">
              {/* Corner Watermarks */}
              <div className="absolute top-2 left-2 pointer-events-none opacity-30">
                <svg width="45" height="45" viewBox="0 0 45 45" fill="none">
                  <path d="M5 40 C10 20 25 10 40 5" stroke="#C9A45C" strokeWidth="1" />
                </svg>
              </div>

              <h3 className="font-serif font-bold text-base tracking-[0.25em] text-[#2E4731] uppercase">
                XÁC NHẬN THAM DỰ
              </h3>
              <span className="font-serif text-[10px] uppercase tracking-[0.3em] text-[#2E4731]/80 font-semibold block">
                R.S.V.P.
              </span>
              <h4 className="font-serif font-bold text-lg text-[#1C2C1D]">
                Xác nhận tham dự
              </h4>
              <p className="text-[11px] text-stone-600 max-w-[280px] leading-relaxed">
                Vui lòng xác nhận tham dự để chúng mình chuẩn bị lễ cưới được thuận lợi và trọn vẹn nhất.
              </p>
              <button
                onClick={() => onRsvp && onRsvp()}
                type="button"
                className="inline-flex items-center gap-2 bg-[#4E6144] text-white font-sans font-bold text-xs tracking-wider px-7 py-2.5 rounded-full shadow-md hover:bg-[#3D4F35] transition-all hover:scale-105 cursor-pointer pointer-events-auto mt-1"
              >
                <span>✍️</span>
                <span>Gửi xác nhận</span>
              </button>
            </div>
          </div>
        );
      }

      // 06.7 Giant Traditional Red Song Hỷ Crest for Gift Section
      if (el.presetId === "p-lotus-gift") {
        return (
          <div className="w-full h-full px-4 py-3 flex flex-col items-center justify-center text-center select-none bg-[#FCFDFB]">
            <h3 className="font-serif font-bold text-base tracking-[0.25em] text-[#2E4731] uppercase mb-3">
              GỬI QUÀ MỪNG
            </h3>
            {/* Giant Red Song Hỷ Crest (Clicking opens Gift Modal) */}
            <div
              onClick={() => onGift && onGift()}
              className="cursor-pointer pointer-events-auto transform hover:scale-105 transition-transform drop-shadow-md group flex flex-col items-center"
            >
              <div className="w-28 h-28 rounded-full border-4 border-[#B71C1C] flex items-center justify-center bg-rose-50/70 shadow-lg group-hover:border-rose-700">
                <span className="text-[#B71C1C] text-6xl font-serif font-black leading-none select-none">
                  囍
                </span>
              </div>
              <span className="text-[11px] text-stone-500 font-sans mt-2 block tracking-wider">
                Chạm vào chữ Hỷ để mừng cưới
              </span>
            </div>
          </div>
        );
      }

      // 06.8 Album Ảnh Cưới with 5-Photo Editorial Collage & Watercolor Lotus
      if (el.presetId === "p-lotus-album") {
        const photos = Array.isArray(data.photos) ? data.photos : [];
        const p1 = (typeof (photos[0] as { url?: string })?.url === "string" ? (photos[0] as { url?: string }).url! : "") || "/images/demo/templates/t06-lotus/gallery-1.jpg";
        const p2 = (typeof (photos[1] as { url?: string })?.url === "string" ? (photos[1] as { url?: string }).url! : "") || "/images/demo/templates/t06-lotus/gallery-2.jpg";
        const p3 = (typeof (photos[2] as { url?: string })?.url === "string" ? (photos[2] as { url?: string }).url! : "") || "/images/demo/templates/t06-lotus/gallery-3.jpg";
        const p4 = (typeof (photos[3] as { url?: string })?.url === "string" ? (photos[3] as { url?: string }).url! : "") || "/images/demo/templates/t06-lotus/gallery-4.jpg";
        const p5 = (typeof (photos[4] as { url?: string })?.url === "string" ? (photos[4] as { url?: string }).url! : "") || "/images/demo/templates/t06-lotus/gallery-5.jpg";

        return (
          <div className="w-full h-full px-3 py-4 flex flex-col justify-between select-none bg-[#FCFDFB] relative">
            {/* Header: Album Ảnh cưới */}
            <div className="text-center mb-3">
              <span className="font-serif italic text-3xl font-normal text-stone-900 block leading-tight">
                Album
              </span>
              <span className="font-serif text-sm tracking-widest text-[#2E4731] block">
                Ảnh cưới
              </span>
            </div>

            {/* Collage Layout matching reference */}
            <div className="relative w-full h-[620px]">
              {/* Photo 1: Top-Left small vertical (couple by tree) */}
              <div className="absolute top-0 left-4 w-[110px] h-[150px] rounded-xl overflow-hidden shadow-md bg-stone-100 z-10">
                <img src={p1} alt="Album 1" className="w-full h-full object-cover" />
              </div>

              {/* Photo 2: Center large featured portrait (sunglasses/romantic) */}
              <div className="absolute top-12 left-1/2 -translate-x-1/2 w-[180px] h-[240px] rounded-xl overflow-hidden shadow-xl bg-stone-100 z-20 border-2 border-white">
                <img src={p2} alt="Album 2" className="w-full h-full object-cover" />
              </div>

              {/* Photo 3: Left flanking photo */}
              <div className="absolute top-44 left-1 w-[80px] h-[120px] rounded-lg overflow-hidden shadow-sm bg-stone-100 z-10">
                <img src={p3} alt="Album 3" className="w-full h-full object-cover" />
              </div>

              {/* Photo 4: Right flanking photo */}
              <div className="absolute top-44 right-1 w-[80px] h-[120px] rounded-lg overflow-hidden shadow-sm bg-stone-100 z-10">
                <img src={p4} alt="Album 4" className="w-full h-full object-cover" />
              </div>

              {/* Bottom Row: 2 side-by-side vertical photos */}
              <div className="absolute bottom-2 inset-x-8 grid grid-cols-2 gap-3 h-[180px] z-10">
                <div className="rounded-xl overflow-hidden shadow-md bg-stone-100">
                  <img src={p5} alt="Album 5" className="w-full h-full object-cover" />
                </div>
                <div className="rounded-xl overflow-hidden shadow-md bg-stone-100">
                  <img src={p1} alt="Album 6" className="w-full h-full object-cover" />
                </div>
              </div>

              {/* Delicate Lotus Watercolor Accent on right */}
              <div className="absolute right-0 top-6 pointer-events-none opacity-60">
                <svg width="70" height="90" viewBox="0 0 70 90" fill="none">
                  <path d="M35 80 C40 50 50 30 55 10" stroke="#4A7553" strokeWidth="2" strokeLinecap="round" />
                  <path d="M55 20 C45 10 50 0 55 -5 C60 0 65 10 55 20 Z" fill="#E88295" />
                </svg>
              </div>
            </div>
          </div>
        );
      }

      // 06.9 Farewell: "HÂN HẠNH ĐƯỢC ĐÓN TIẾP!" + Lotus Pond Gold & Emerald
      if (el.presetId === "p-lotus-farewell") {
        const groomShort = (typeof data.groom?.shortName === "string" ? data.groom.shortName : "") || (typeof data.groom?.fullName === "string" ? data.groom.fullName : "") || "Đức Hiển";
        const brideShort = (typeof data.bride?.shortName === "string" ? data.bride.shortName : "") || (typeof data.bride?.fullName === "string" ? data.bride.fullName : "") || "Minh Hằng";

        return (
          <div className="w-full h-full relative overflow-hidden select-none bg-gradient-to-b from-[#FCFDFB] via-[#FFFFFF] to-[#EAF2EA] flex flex-col justify-between pt-6 pb-6 px-4">
            {/* Top Pink Lotus Bud */}
            <div className="flex items-center justify-center mb-1">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <path d="M16 4 C12 12 12 18 16 26 C20 18 20 12 16 4 Z" fill="#E88295" />
                <path d="M16 26 C14 28 14 30 16 31 C18 30 18 28 16 26 Z" fill="#4A7553" />
              </svg>
            </div>

            {/* Heading: HÂN HẠNH ĐƯỢC ĐÓN TIẾP! */}
            <div className="text-center relative z-10">
              <h2 className="font-serif font-black text-xl tracking-[0.2em] text-[#243B27] uppercase">
                HÂN HẠNH ĐƯỢC ĐÓN TIẾP!
              </h2>
              <p className="font-serif italic text-3xl text-[#1E5652] tracking-wide mt-2">
                {brideShort} &amp; {groomShort}
              </p>
            </div>

            {/* Bottom Magnificent Lotus Pond Illustration (Green leaves & Gold line-art) */}
            <div className="relative w-full h-[320px] pointer-events-none mt-auto">
              <svg viewBox="0 0 360 300" className="w-full h-full" fill="none">
                {/* Emerald Green Lotus Leaves */}
                <ellipse cx="60" cy="240" rx="70" ry="35" fill="#3B6344" opacity="0.85" />
                <ellipse cx="280" cy="230" rx="75" ry="38" fill="#2E5136" opacity="0.9" />
                <ellipse cx="180" cy="270" rx="90" ry="40" fill="#4B7754" opacity="0.8" />
                {/* Gold Leaf Veins */}
                <path d="M60 240 C30 220 15 235 0 250" stroke="#C9A45C" strokeWidth="1" opacity="0.7" />
                <path d="M60 240 C80 220 100 225 120 235" stroke="#C9A45C" strokeWidth="1" opacity="0.7" />
                <path d="M280 230 C250 210 235 220 220 235" stroke="#C9A45C" strokeWidth="1" opacity="0.7" />
                <path d="M280 230 C310 210 330 220 350 240" stroke="#C9A45C" strokeWidth="1" opacity="0.7" />
                {/* Gold Lotus Blossoms Line-Art */}
                <g transform="translate(140, 160)">
                  <path d="M40 80 C20 50 15 20 40 0 C65 20 60 50 40 80 Z" stroke="#C9A45C" strokeWidth="1.2" fill="#FFF9E6" fillOpacity="0.4" />
                  <path d="M40 80 C10 65 0 35 15 15 C30 35 35 60 40 80 Z" stroke="#C9A45C" strokeWidth="1" fill="#FFF9E6" fillOpacity="0.2" />
                  <path d="M40 80 C70 65 80 35 65 15 C50 35 45 60 40 80 Z" stroke="#C9A45C" strokeWidth="1" fill="#FFF9E6" fillOpacity="0.2" />
                </g>
              </svg>
            </div>

            {/* Vertical Watermark */}
            <div className="absolute right-2 bottom-8 z-10 pointer-events-none">
              <span className="[writing-mode:vertical-rl] text-[9px] uppercase tracking-widest text-stone-400 font-medium">
                Made with Ngày chung đôi
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
        const events = Array.isArray(data.events) ? data.events : [];
        const evDate = parseEventDate((events[0] as Record<string, unknown>) || null);
        const cd = calcCountdown(evDate);

        return (
          <div className="w-full h-full relative rounded-3xl overflow-hidden shadow-xl bg-stone-100 select-none">
            <img src={coverPhoto} alt="Cover" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />

            {/* Translucent bottom invitation panel */}
            <div className="absolute bottom-3 left-3 right-3 p-4 rounded-2xl bg-white/90 backdrop-blur-md shadow-2xl border border-white/80 text-center space-y-2.5">
              {/* 4 Terracotta Countdown Boxes */}
              <div className="grid grid-cols-4 gap-2 max-w-[290px] mx-auto">
                {[
                  { num: cd.days, unit: "ngày" },
                  { num: cd.hours, unit: "giờ" },
                  { num: cd.minutes, unit: "phút" },
                  { num: cd.seconds, unit: "giây" },
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
        const groomAddr = getParentsAddress(groomParents, data.groom, "TP. Hà Nội");
        const brideAddr = getParentsAddress(brideParents, data.bride, "TP. Điện Biên");

        const events = Array.isArray(data.events) ? data.events : [];
        const ev = (events[0] as Record<string, unknown>) || null;
        const evDate = parseEventDate(ev);
        const timeStr = evDate ? fmtTimeColon(evDate) : "10:30";
        const dowStr = evDate ? fmtDayOfWeek(evDate).toUpperCase() : "THỨ NĂM";
        const monthStr = evDate ? `THÁNG ${evDate.getMonth() + 1}` : "THÁNG 12";
        const dayStr = evDate ? fmtDay(evDate) : "24";
        const yearStr = evDate ? `NĂM ${evDate.getFullYear()}` : "NĂM 2026";
        const lunarStr = typeof ev?.lunarDate === "string" && ev.lunarDate ? `(Tức ${ev.lunarDate})` : "(Tức ngày 17 tháng 11 năm Bính Ngọ)";

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
                <span className="text-[11px] text-stone-500 italic block">{groomAddr}</span>
              </div>
              <div className="space-y-1">
                <span className="font-serif font-bold text-[#8B2E20] block uppercase tracking-wider text-xs">Nhà Gái</span>
                <p className="text-xs font-medium text-stone-800">{brideParents.fatherName ? `Ông: ${brideParents.fatherName}` : "Ông: Nguyễn Tiến Minh"}</p>
                <p className="text-xs font-medium text-stone-800">{brideParents.motherName ? `Bà: ${brideParents.motherName}` : "Bà: Lê Thị Hải Yến"}</p>
                <span className="text-[11px] text-stone-500 italic block">{brideAddr}</span>
              </div>
            </div>

            {/* Big Date Display */}
            <div className="pt-2 text-center">
              <span className="text-xs font-serif font-bold text-[#8B2E20] uppercase tracking-[0.2em] block">
                TIỆC MỪNG LỄ THÀNH HÔN
              </span>
              <span className="text-xs font-serif text-stone-600 tracking-wider block mt-0.5">
                VÀO LÚC {timeStr} {dowStr}
              </span>
              <div className="flex items-center justify-center gap-3 my-2 px-1">
                <div className="h-[1px] flex-1 bg-stone-300" />
                <span className="text-sm font-serif font-bold text-stone-800 tracking-wider">{monthStr}</span>
                <span className="text-5xl font-serif font-bold text-[#8B2E20] px-2 leading-none">{dayStr}</span>
                <span className="text-sm font-serif font-bold text-stone-800 tracking-wider">{yearStr}</span>
                <div className="h-[1px] flex-1 bg-stone-300" />
              </div>
              <span className="font-cursive text-sm text-stone-500 block">
                {lunarStr}
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
        const events = Array.isArray(data.events) ? data.events : [];
        const evDate = parseEventDate((events[0] as Record<string, unknown>) || null);
        const targetDay = evDate ? evDate.getDate() : 24;
        const year = evDate ? evDate.getFullYear() : 2026;
        const month = evDate ? evDate.getMonth() : 11;
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const firstDayOffsetSun = new Date(year, month, 1).getDay();
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const headerBadge = `${year} / ${monthNames[month]}`;

        return (
          <div className="w-full h-full p-4 flex flex-col justify-between select-none bg-transparent">
            <div className="flex items-center justify-between pb-1">
              <div className="flex items-center gap-2">
                <div className="size-4 rounded-full bg-[#E8C5BC] flex items-center justify-center text-[8px] text-[#8B2E20]">✦</div>
                <span className="font-serif font-bold text-lg text-[#8B2E20]">Save the date</span>
              </div>
              <span className="text-[10px] font-mono font-bold bg-[#BA3E2C] text-white px-2.5 py-0.5 rounded-sm">{headerBadge}</span>
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
                  {Array.from({ length: firstDayOffsetSun }).map((_, i) => (
                    <span key={`blank-${i}`} className="opacity-0">.</span>
                  ))}
                  {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((d) => {
                    const isSelected = d === targetDay;
                    return isSelected ? (
                      <span key={d} className="relative font-bold text-rose-600 flex items-center justify-center">
                        <svg className="absolute -inset-1 w-6 h-6 text-rose-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                        </svg>
                        {d}
                      </span>
                    ) : (
                      <span key={d}>{d}</span>
                    );
                  })}
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

      // 00. Bảng Mừng Cưới & Mã QR Song Hỷ (Wedding Gift & QR Card)
      if (el.presetId === "p-wedding-gift-luxury" || el.content === "wedding-gift-luxury") {
        return <WeddingGiftLuxuryCard el={el} data={data} onGift={onGift} />;
      }

      // 0a. Khung vòm hoa lan hoàng gia (Orchid Arch Photo Frame)
      if (el.presetId === "p-orchid-arch" || el.content === "orchid-arch") {
        const photoUrl = el.imageUrl || data.coverPhotoUrl || "/images/presets/arch-orchid-sample.jpg";
        return (
          <ScaledPresetWrapper baseW={320} baseH={420} w={el.width} h={el.height}>
            <div className="w-full h-full relative p-3 flex items-center justify-center pointer-events-none select-none">
              {/* Outer Luxury Arch Frame */}
              <div className="relative w-[280px] h-[390px] rounded-t-[140px] rounded-b-2xl p-[5px] bg-gradient-to-b from-[#F2DFAC] via-[#D4AF37] to-[#AA7E22] shadow-2xl">
                {/* Inner Arch with double gold line */}
                <div className="w-full h-full rounded-t-[136px] rounded-b-[12px] bg-[#FAF8F5] p-[4px] relative overflow-hidden flex flex-col items-center">
                  {/* Photo inside the Arch */}
                  <div className="w-full h-full rounded-t-[132px] rounded-b-[8px] overflow-hidden bg-stone-100 relative">
                    <img
                      src={photoUrl}
                      alt="Wedding Arch Photo"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = "https://images.unsplash.com/photo-1519741497674-611481863552?w=600&auto=format&fit=crop&q=80";
                      }}
                    />
                    {/* Subtle soft gradient overlay at bottom for elegance */}
                    <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-stone-900/30 to-transparent pointer-events-none" />
                  </div>

                  {/* Inner subtle gold border outline */}
                  <div className="absolute inset-1 rounded-t-[133px] rounded-b-[9px] border border-amber-300/40 pointer-events-none" />
                </div>

                {/* ── TOP-LEFT ORCHID & BABY'S BREATH BOUQUET ── */}
                <div className="absolute -top-4 -left-4 w-32 h-36 pointer-events-none z-30 drop-shadow-md">
                  <svg viewBox="0 0 120 140" fill="none" className="w-full h-full">
                    <defs>
                      <radialGradient id="orchidCenter" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="#FFF4D0" />
                        <stop offset="60%" stopColor="#FFE082" />
                        <stop offset="100%" stopColor="#D4AF37" />
                      </radialGradient>
                    </defs>
                    
                    {/* Stems & leafy vines */}
                    <path d="M 20 20 Q 50 15 85 45 Q 95 65 80 95" stroke="#7A8B6E" strokeWidth="2.5" strokeLinecap="round" />
                    <path d="M 15 40 Q 40 35 60 70" stroke="#8E9F80" strokeWidth="1.8" strokeLinecap="round" />
                    
                    {/* Flower 1 (Large Orchid at top curve) */}
                    <g transform="translate(42, 28) rotate(-15)">
                      <circle cx="-14" cy="-3" r="13" fill="#FFFFFF" stroke="#EAE6DC" strokeWidth="0.8" />
                      <circle cx="14" cy="-3" r="13" fill="#FFFFFF" stroke="#EAE6DC" strokeWidth="0.8" />
                      <circle cx="0" cy="-14" r="13" fill="#FFFFFF" stroke="#EAE6DC" strokeWidth="0.8" />
                      <path d="M -7 4 C -6 12 6 12 7 4 C 5 1 -5 1 -7 4 Z" fill="url(#orchidCenter)" stroke="#C59B27" strokeWidth="0.8" />
                      <circle cx="0" cy="5" r="2.5" fill="#C59B27" />
                      <circle cx="-2" cy="7" r="1" fill="#B71C1C" />
                      <circle cx="2" cy="7" r="1" fill="#B71C1C" />
                    </g>

                    {/* Flower 2 (Medium Orchid hanging down) */}
                    <g transform="translate(20, 68) rotate(25)">
                      <circle cx="-10" cy="-2" r="10" fill="#FFFFFF" stroke="#EAE6DC" strokeWidth="0.6" />
                      <circle cx="10" cy="-2" r="10" fill="#FFFFFF" stroke="#EAE6DC" strokeWidth="0.6" />
                      <circle cx="0" cy="-10" r="10" fill="#FFFFFF" stroke="#EAE6DC" strokeWidth="0.6" />
                      <path d="M -5 3 C -4 9 4 9 5 3 Z" fill="url(#orchidCenter)" stroke="#C59B27" strokeWidth="0.6" />
                      <circle cx="0" cy="4" r="1.8" fill="#C59B27" />
                    </g>

                    {/* Baby's breath little white dots */}
                    <circle cx="78" cy="18" r="2.5" fill="#FFFFFF" stroke="#E2DAC9" strokeWidth="0.5" />
                    <circle cx="86" cy="24" r="2.2" fill="#FFFFFF" stroke="#E2DAC9" strokeWidth="0.5" />
                    <circle cx="72" cy="32" r="2" fill="#FFFFFF" stroke="#E2DAC9" strokeWidth="0.5" />
                    <circle cx="95" cy="48" r="2.6" fill="#FFFFFF" stroke="#E2DAC9" strokeWidth="0.5" />
                    <circle cx="102" cy="58" r="2.2" fill="#FFFFFF" stroke="#E2DAC9" strokeWidth="0.5" />
                    <circle cx="88" cy="72" r="2.5" fill="#FFFFFF" stroke="#E2DAC9" strokeWidth="0.5" />
                    <circle cx="28" cy="100" r="2.3" fill="#FFFFFF" stroke="#E2DAC9" strokeWidth="0.5" />
                    <circle cx="15" cy="85" r="2" fill="#FFFFFF" stroke="#E2DAC9" strokeWidth="0.5" />
                    <ellipse cx="98" cy="38" rx="2.5" ry="4" fill="#A8BA97" stroke="#7A8B6E" strokeWidth="0.5" transform="rotate(35 98 38)" />
                    <ellipse cx="105" cy="70" rx="2" ry="3.5" fill="#A8BA97" stroke="#7A8B6E" strokeWidth="0.5" transform="rotate(45 105 70)" />
                  </svg>
                </div>

                {/* ── BOTTOM-RIGHT ORCHID & BABY'S BREATH BOUQUET ── */}
                <div className="absolute -bottom-4 -right-4 w-32 h-36 pointer-events-none z-30 drop-shadow-md">
                  <svg viewBox="0 0 120 140" fill="none" className="w-full h-full">
                    <g transform="translate(60, 70) rotate(180) translate(-60, -70)">
                      <path d="M 20 20 Q 50 15 85 45 Q 95 65 80 95" stroke="#7A8B6E" strokeWidth="2.5" strokeLinecap="round" />
                      <g transform="translate(45, 35) rotate(-20)">
                        <circle cx="-13" cy="-3" r="12" fill="#FFFFFF" stroke="#EAE6DC" strokeWidth="0.8" />
                        <circle cx="13" cy="-3" r="12" fill="#FFFFFF" stroke="#EAE6DC" strokeWidth="0.8" />
                        <circle cx="0" cy="-13" r="12" fill="#FFFFFF" stroke="#EAE6DC" strokeWidth="0.8" />
                        <path d="M -6 4 C -5 11 5 11 6 4 Z" fill="url(#orchidCenter)" stroke="#C59B27" strokeWidth="0.8" />
                        <circle cx="0" cy="5" r="2.2" fill="#C59B27" />
                        <circle cx="-1.5" cy="7" r="0.8" fill="#B71C1C" />
                        <circle cx="1.5" cy="7" r="0.8" fill="#B71C1C" />
                      </g>
                      <g transform="translate(75, 75) rotate(15)">
                        <circle cx="-9" cy="-2" r="9" fill="#FFFFFF" stroke="#EAE6DC" strokeWidth="0.6" />
                        <circle cx="9" cy="-2" r="9" fill="#FFFFFF" stroke="#EAE6DC" strokeWidth="0.6" />
                        <circle cx="0" cy="-9" r="9" fill="#FFFFFF" stroke="#EAE6DC" strokeWidth="0.6" />
                        <path d="M -4 3 C -3 8 3 8 4 3 Z" fill="url(#orchidCenter)" stroke="#C59B27" strokeWidth="0.6" />
                      </g>
                      <circle cx="20" cy="40" r="2.5" fill="#FFFFFF" stroke="#E2DAC9" strokeWidth="0.5" />
                      <circle cx="32" cy="25" r="2.2" fill="#FFFFFF" stroke="#E2DAC9" strokeWidth="0.5" />
                      <circle cx="85" cy="45" r="2.4" fill="#FFFFFF" stroke="#E2DAC9" strokeWidth="0.5" />
                      <circle cx="95" cy="95" r="2.3" fill="#FFFFFF" stroke="#E2DAC9" strokeWidth="0.5" />
                      <ellipse cx="25" cy="55" rx="2.5" ry="4" fill="#A8BA97" stroke="#7A8B6E" strokeWidth="0.5" transform="rotate(-30 25 55)" />
                    </g>
                  </svg>
                </div>
              </div>
            </div>
          </ScaledPresetWrapper>
        );
      }

      // 0b. Phong bì kem sáp Song Hỷ (Luxury Wax Seal Envelope)
      if (el.presetId === "p-envelope-songhy" || el.content === "envelope-songhy") {
        const photoUrl = el.imageUrl || data.coverPhotoUrl;
        const hasCustomPhoto = Boolean(photoUrl && photoUrl !== "/images/presets/envelope-songhy-luxury.jpg");
        const groom = (typeof data.groom.shortName === "string" ? data.groom.shortName : "") || (typeof data.groom.fullName === "string" ? data.groom.fullName : "") || "Minh Khôi";
        const bride = (typeof data.bride.shortName === "string" ? data.bride.shortName : "") || (typeof data.bride.fullName === "string" ? data.bride.fullName : "") || "Ngọc Hân";
        const events = Array.isArray(data.events) ? data.events : [];
        const evDate = parseEventDate((events[0] as Record<string, unknown>) || null);
        const dateStr = evDate ? `${evDate.getDate()} • ${evDate.getMonth() + 1} • ${evDate.getFullYear()}` : "28 • 12 • 2026";

        return (
          <ScaledPresetWrapper baseW={330} baseH={380} w={el.width} h={el.height}>
            <div className="w-full h-full relative overflow-visible flex items-center justify-center pointer-events-none select-none p-3">
              {/* Scattered soft blush rose petals */}
              <div className="absolute top-2 left-3 size-7 rounded-full bg-gradient-to-br from-[#FAD2D8] to-[#F1A7B5] opacity-75 blur-[0.5px] rotate-[-25deg] [clip-path:polygon(50%_0%,100%_50%,50%_100%,0%_50%)]" />
              <div className="absolute bottom-2 left-6 size-8 rounded-full bg-gradient-to-tr from-[#FCD9DF] to-[#EFA0AF] opacity-80 rotate-[35deg] [clip-path:polygon(30%_0%,100%_30%,70%_100%,0%_70%)]" />
              <div className="absolute bottom-4 right-5 size-7 rounded-full bg-gradient-to-br from-[#FAD2D8] to-[#EAA0B0] opacity-75 rotate-[-45deg]" />

              {/* Envelope Body */}
              <div className="relative w-[300px] h-[340px] flex items-center justify-center">
                {/* Back flap opened triangle */}
                <div className="absolute top-0 inset-x-3 h-32 bg-[#F3EFE7] border-t border-l border-r border-[#E6DEC8] rounded-t-xl [clip-path:polygon(50%_0%,0%_100%,100%_100%)] shadow-sm">
                  {/* Floral pattern liner inside flap */}
                  <div className="w-full h-full opacity-35 bg-[radial-gradient(#D4AF37_1px,transparent_1px)] [background-size:12px_12px]" />
                </div>

                {/* Sliding Invitation Card */}
                <div className="absolute -top-3 w-[256px] h-[250px] bg-[#FFFDF9] rounded-xl shadow-xl border border-[#D4AF37]/60 overflow-hidden flex flex-col items-center justify-between p-3.5 z-10">
                  {/* Gold double corner border */}
                  <div className="absolute inset-1.5 border border-[#D4AF37]/30 rounded-lg pointer-events-none">
                    <div className="absolute top-1 left-1 size-2 border-t-2 border-l-2 border-[#D4AF37]" />
                    <div className="absolute top-1 right-1 size-2 border-t-2 border-r-2 border-[#D4AF37]" />
                    <div className="absolute bottom-1 left-1 size-2 border-b-2 border-l-2 border-[#D4AF37]" />
                    <div className="absolute bottom-1 right-1 size-2 border-b-2 border-r-2 border-[#D4AF37]" />
                  </div>

                  {hasCustomPhoto ? (
                    <div className="w-full h-full rounded-lg overflow-hidden relative">
                      <img src={photoUrl} alt="Invitation Card" className="w-full h-full object-cover" />
                      <div className="absolute inset-x-0 bottom-0 py-1.5 bg-white/90 backdrop-blur-xs text-center border-t border-amber-200">
                        <span className="text-[10px] font-serif font-bold text-[#8C6D37] tracking-wider block">SAVE OUR DATE</span>
                        <span className="text-[8px] font-sans text-stone-600 block">{bride} & {groom}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-center py-2 space-y-1">
                      <span className="text-[9px] font-serif tracking-[0.25em] text-[#8C6D37] uppercase font-semibold">
                        WEDDING INVITATION
                      </span>
                      <h3 className="text-xl font-serif font-bold text-[#6D4C1D] uppercase tracking-wider">
                        Save Our Date
                      </h3>
                      <div className="w-12 h-[1px] bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent my-1" />
                      <div className="text-base font-serif font-medium text-[#7D5620] italic">
                        {bride} <span className="font-sans text-amber-500">&</span> {groom}
                      </div>
                      <span className="text-[9px] font-mono text-stone-500 tracking-widest pt-1 block">
                        {dateStr}
                      </span>
                      <span className="text-[8px] font-serif italic text-stone-400 block pt-1">
                        Chạm để mở thiệp
                      </span>
                    </div>
                  )}
                </div>

                {/* Envelope Front Pocket (Lower Triangular Fold) */}
                <div className="absolute bottom-0 inset-x-0 h-[210px] bg-gradient-to-b from-[#FAF7F2] to-[#EFE9DD] rounded-b-2xl z-20 shadow-md border-b border-x border-[#E0D7C3] [clip-path:polygon(0%_24%,50%_62%,100%_24%,100%_100%,0%_100%)] flex items-center justify-center" />

                {/* Golden Wax Seal with Double Happiness 囍 */}
                <div className="absolute bottom-14 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center">
                  <div className="size-14 rounded-full bg-gradient-to-br from-[#F5D88E] via-[#D4AF37] to-[#8C6212] p-1 shadow-2xl flex items-center justify-center border border-[#FFE8A3]">
                    <div className="w-full h-full rounded-full border-2 border-[#FFEBB3]/70 flex items-center justify-center bg-gradient-to-br from-[#D4AF37] to-[#A37B1E] shadow-inner">
                      <span className="text-white text-2xl font-serif font-black leading-none drop-shadow-[0_1.5px_1px_rgba(0,0,0,0.6)] select-none">
                        囍
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </ScaledPresetWrapper>
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
        const events = Array.isArray(data.events) ? data.events : [];
        const evDate = parseEventDate((events[0] as Record<string, unknown>) || null);
        const year = evDate ? evDate.getFullYear() : 2026;

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
                <span>{year}</span>
              </div>
            </div>
          </ScaledPresetWrapper>
        );
      }

      // 4. Lịch ngày cưới khoanh tròn
      if (el.presetId === "p-calendar-countdown") {
        const events = Array.isArray(data.events) ? data.events : [];
        const evDate = parseEventDate((events[0] as Record<string, unknown>) || null);
        const targetDay = evDate ? evDate.getDate() : 12;
        const month = evDate ? evDate.getMonth() + 1 : 12;
        const year = evDate ? evDate.getFullYear() : 2026;
        const calMeta = evDate ? getMonthDaysAndOffset(evDate) : { daysInMonth: 31, firstDayOffset: 1 };

        return (
          <ScaledPresetWrapper baseW={300} baseH={270} w={el.width} h={el.height}>
            <div className="w-full h-full p-4 bg-white/95 backdrop-blur-xs rounded-2xl border border-stone-200 shadow-md flex flex-col items-center justify-between pointer-events-none select-none">
              <div className="text-center w-full pb-1 border-b border-stone-100">
                <span className="text-[10px] font-serif tracking-widest uppercase text-stone-500 block font-semibold">WELCOME TO OUR WEDDING</span>
                <span className="text-[11px] font-serif font-bold text-stone-800">Tháng {month} / {year}</span>
              </div>
              <div className="w-full my-auto">
                <div className="grid grid-cols-7 gap-1 text-[9px] font-mono text-stone-400 text-center font-bold pb-1">
                  <span>T2</span><span>T3</span><span>T4</span><span>T5</span><span>T6</span><span>T7</span><span className="text-rose-400">CN</span>
                </div>
                <div className="grid grid-cols-7 gap-1 text-[9px] font-mono text-stone-700 text-center">
                  {Array.from({ length: calMeta.firstDayOffset }).map((_, i) => (
                    <span key={`blank-${i}`} />
                  ))}
                  {Array.from({ length: calMeta.daysInMonth }, (_, i) => i + 1).map((d) => {
                    const isTarget = d === targetDay;
                    return isTarget ? (
                      <span key={d} className="relative font-bold text-rose-600">
                        <span className="absolute -inset-1 rounded-full border-2 border-rose-500 bg-rose-50 -z-10 animate-pulse" />
                        {d}
                      </span>
                    ) : (
                      <span key={d} className={d % 7 === 0 ? "text-rose-500" : ""}>{d}</span>
                    );
                  })}
                </div>
              </div>
              <span className="text-[9px] font-serif italic text-amber-700 font-medium">Hẹn gặp bạn vào ngày hạnh phúc nhất!</span>
            </div>
          </ScaledPresetWrapper>
        );
      }

      // 5. Hôn phối hai họ
      if (el.presetId === "p-parents-info" || el.presetId === "p4") {
        const groomParents = (data.groom?.parents as Record<string, unknown>) || {};
        const brideParents = (data.bride?.parents as Record<string, unknown>) || {};
        const gFather = (typeof groomParents.fatherName === "string" && groomParents.fatherName ? groomParents.fatherName : "") || "Nguyễn Văn A";
        const gMother = (typeof groomParents.motherName === "string" && groomParents.motherName ? groomParents.motherName : "") || "Trần Thị B";
        const bFather = (typeof brideParents.fatherName === "string" && brideParents.fatherName ? brideParents.fatherName : "") || "Lê Văn C";
        const bMother = (typeof brideParents.motherName === "string" && brideParents.motherName ? brideParents.motherName : "") || "Phạm Thị D";

        return (
          <ScaledPresetWrapper baseW={320} baseH={180} w={el.width} h={el.height}>
            <div className="w-full h-full p-3.5 bg-white/95 backdrop-blur-xs rounded-2xl border border-stone-200 shadow-md flex flex-col justify-between pointer-events-none select-none text-center">
              <div className="text-[11px] font-bold text-amber-900 tracking-wider font-serif uppercase border-b border-stone-100 pb-1">
                Hôn Phối Hai Họ
              </div>
              <div className="grid grid-cols-2 gap-2 text-[10px] pt-1">
                <div className="border-r border-stone-100 pr-2">
                  <p className="font-bold text-stone-800 font-serif text-[10px]">NHÀ TRAI</p>
                  <p className="text-stone-500 text-[9px] mt-0.5">Ông: {gFather}</p>
                  <p className="text-stone-500 text-[9px]">Bà: {gMother}</p>
                </div>
                <div className="pl-1">
                  <p className="font-bold text-stone-800 font-serif text-[10px]">NHÀ GÁI</p>
                  <p className="text-stone-500 text-[9px] mt-0.5">Ông: {bFather}</p>
                  <p className="text-stone-500 text-[9px]">Bà: {bMother}</p>
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
        const events = Array.isArray(data.events) ? data.events : [];
        const firstEvent = (events[0] as Record<string, unknown>) || null;
        const evDate = parseEventDate(firstEvent);
        const timeStr = evDate ? `${fmtTime(evDate)} • ${evDate.getDate()} Tháng ${evDate.getMonth() + 1}, ${evDate.getFullYear()}` : "11:00 • 18 Tháng 12, 2026";
        const lunarStr = typeof firstEvent?.lunarDate === "string" && firstEvent.lunarDate ? `(Nhằm ${firstEvent.lunarDate})` : "(Nhằm ngày 10 tháng 11 năm Bính Ngọ)";
        const venueStr = typeof firstEvent?.venueName === "string" && firstEvent.venueName ? `Tại: ${firstEvent.venueName}` : "Tại: Tư Gia Nhà Trai / Khách Sạn Melia";

        return (
          <ScaledPresetWrapper baseW={310} baseH={180} w={el.width} h={el.height}>
            <div className="w-full h-full p-4 bg-[#FAF6F4] rounded-2xl border border-rose-200 shadow-md flex flex-col items-center justify-between text-center pointer-events-none select-none">
              <div className="inline-block bg-rose-100/90 text-rose-800 text-[10px] font-serif font-bold px-3 py-0.5 rounded-full uppercase tracking-wider">
                LỄ THÀNH HÔN & NHẬP TIỆC
              </div>
              <div className="my-auto space-y-0.5">
                <span className="text-base font-serif font-bold text-stone-900 block">{timeStr}</span>
                <span className="text-[9.5px] text-stone-600 block">{lunarStr}</span>
                <span className="text-[9px] text-rose-800 font-medium block mt-1">{venueStr}</span>
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
