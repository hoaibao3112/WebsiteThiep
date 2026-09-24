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
      // 1. Phong bì hồng mở có thiệp & ảnh cưới (như trong ảnh mẫu ngaychungdoi)
      if (el.presetId === "p-envelope-pink" || el.presetId === "p1") {
        const photoUrl = el.imageUrl || data.coverPhotoUrl || "https://images.unsplash.com/photo-1519741497674-611481863552?w=600&auto=format&fit=crop&q=80";
        return (
          <ScaledPresetWrapper baseW={300} baseH={250} w={el.width} h={el.height}>
            <div className="w-full h-full relative overflow-visible flex items-center justify-center pointer-events-none select-none">
              {/* Open Flap Behind (chóp nắp phong bì mở ngược lên) */}
              <div className="absolute -top-7 w-[84%] h-24 bg-[#EFA0AF] shadow-xs [clip-path:polygon(50%_0%,0%_100%,100%_100%)] rounded-t-sm" />
              
              {/* Sliding Photo Card inside */}
              <div className="w-[78%] h-[82%] -top-4 absolute bg-white rounded-lg shadow-lg border border-pink-100 overflow-hidden flex flex-col items-center p-1.5 z-10">
                <div className="w-full flex-1 bg-stone-100 rounded overflow-hidden relative">
                  <img
                    src={photoUrl}
                    alt="Wedding Photo"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="pt-1 text-center">
                  <span className="text-[10px] font-serif tracking-[0.2em] font-bold text-pink-700 uppercase block">Save The Date</span>
                  <span className="text-[8px] font-mono text-stone-500 block truncate max-w-[200px]">
                    {(typeof data.groom.fullName === "string" ? data.groom.fullName : "") ? `${(typeof data.groom.fullName === "string" ? data.groom.fullName : "")} & ${(typeof data.bride.fullName === "string" ? data.bride.fullName : "")}` : "Văn Anh & Minh Thơ"}
                  </span>
                </div>
              </div>

              {/* Pink Envelope Front Pocket */}
              <div className="absolute inset-x-0 bottom-0 h-[68%] bg-[#F294A6] rounded-b-2xl z-20 shadow-md [clip-path:polygon(0%_25%,50%_65%,100%_25%,100%_100%,0%_100%)] border-t border-pink-200/50" />
              <div className="absolute inset-x-0 bottom-0 h-[68%] rounded-b-2xl z-20 pointer-events-none border-b-2 border-pink-400/40" />

              {/* Pink Monogram Wax Seal */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 size-9 rounded-full bg-gradient-to-br from-[#F48197] to-[#DF5C75] border-2 border-pink-200 shadow-lg flex items-center justify-center text-[10px] font-serif font-bold text-white tracking-widest drop-shadow-sm">
                ML
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
