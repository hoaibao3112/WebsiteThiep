"use client";

import React, { useEffect, useState } from "react";
import { CalendarDays, Gift, Heart, Mail, MapPin, Phone, UserCheck, Video, ChevronLeft, ChevronRight, Play, GalleryHorizontalEnd } from "lucide-react";
import type { CanvasElement } from "@/types/canvas.types";
import { readRecord, safeCanvasLink } from "@/lib/editor/canvas-presentation";
import { ContactWidget } from "./widgets/ContactWidget";
import { ReminderWidget } from "./widgets/ReminderWidget";
import { RsvpWidget } from "./widgets/RsvpWidget";
import { CustomFormWidget } from "./widgets/CustomFormWidget";
import { GuestSignatureWidget } from "./widgets/GuestSignatureWidget";

interface Props {
  element: CanvasElement;
  draft?: object;
  guestName?: string;
  onRsvp?: () => void;
  onGift?: () => void;
}

export function CanvasWidget({ element, draft, guestName, onRsvp, onGift }: Props) {
  const config = element.widgetConfig ?? {};
  const root = readRecord(draft);
  const cardId = (root.id as string) || (root.cardId as string) || "";
  const isEditor = Boolean((root as any).isEditor);
  const events = Array.isArray(root.events) ? root.events : [];
  const firstEvent = readRecord(events[0]);
  const dateInput = config.eventDate || firstEvent.eventDate;
  const eventTime = typeof dateInput === "string" || dateInput instanceof Date ? new Date(dateInput).getTime() : NaN;
  const [now, setNow] = useState<number | null>(null);
  const [opened, setOpened] = useState(false);
  useEffect(() => {
    if (element.widgetType !== "countdown") return;
    setNow(Date.now());
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [element.widgetType]);
  const title = config.title || element.title;
  const buttonClass = "inline-flex min-h-9 items-center justify-center gap-2 rounded-full bg-stone-900 px-4 py-2 text-sm text-white focus-visible:outline-2 focus-visible:outline-offset-2";
  const heading = config.showTitle !== false && title ? <h3 className="text-base font-semibold">{title}</h3> : null;
  const text = config.description ? <p className="text-xs leading-5">{config.description}</p> : null;
  switch (element.widgetType) {
    case "countdown": {
      const remaining = Number.isFinite(eventTime) && now !== null ? Math.max(0, Math.floor((eventTime - now) / 1000)) : 0;
      const values = [Math.floor(remaining / 86400), Math.floor(remaining / 3600) % 24, Math.floor(remaining / 60) % 60, remaining % 60];
      const isEnded = Number.isFinite(eventTime) && remaining === 0 && now !== null;
      if (isEnded && config.endMessage) {
        return (
          <div className="flex size-full flex-col items-center justify-center gap-2 p-3 text-center bg-amber-50/80 rounded-2xl border border-amber-200">
            {heading}
            <p className="text-sm font-bold text-amber-900">{config.endMessage}</p>
          </div>
        );
      }
      return (
        <div className="flex size-full flex-col items-center justify-center gap-2 p-2">
          {heading}
          <div className="grid w-full grid-cols-4 gap-1.5">
            {values.map((value, index) => (
              <div key={index} className="rounded-xl bg-stone-900/90 py-2 px-1 text-center text-white shadow-xs">
                <p className="text-lg font-bold tabular-nums leading-none">{Number.isFinite(eventTime) ? String(value).padStart(2, "0") : "—"}</p>
                <p className="text-[10px] text-stone-300 mt-0.5">{["ngày", "giờ", "phút", "giây"][index]}</p>
              </div>
            ))}
          </div>
          {!Number.isFinite(eventTime) && <p className="text-xs text-stone-400">Chọn ngày tổ chức trong thuộc tính</p>}
        </div>
      );
    }
    case "calendar":
      return (
        <div className="flex size-full flex-col items-center justify-center gap-2 p-3 text-center bg-white/90 rounded-2xl border border-stone-200/80 shadow-xs">
          {heading}
          <div className="flex items-center gap-2 text-amber-900">
            <CalendarDays className="size-6" />
            <span className="text-base font-bold">
              {Number.isFinite(eventTime) ? new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "long", year: "numeric", timeZone: "Asia/Ho_Chi_Minh" }).format(eventTime) : "Chọn ngày tổ chức"}
            </span>
          </div>
          {config.lunarDate && (
            <p className="text-xs text-stone-500 italic">{config.lunarDate}</p>
          )}
          {text}
        </div>
      );
    case "rsvp":
      if (onRsvp) {
        return (
          <div className="flex size-full flex-col items-center justify-center gap-3">
            {heading}
            {text}
            <button type="button" className={buttonClass} onClick={onRsvp}>
              {config.buttonLabel || "Xác nhận tham dự"}
            </button>
          </div>
        );
      }
      return <RsvpWidget config={config} cardId={cardId} guestName={guestName} isEditor={isEditor} />;
    case "gift":
      return <div className="flex size-full flex-col items-center justify-center gap-3">{heading}<Gift className="size-8" />{text}<button type="button" className={buttonClass} onClick={onGift}>{config.buttonLabel || "Mở hộp mừng cưới"}</button></div>;
    case "guest-name":
      return <div className="flex size-full flex-col items-center justify-center gap-2">{heading}<p className="text-xl italic">{guestName || config.description || "Quý khách"}</p></div>;
    case "map": {
      const url = safeCanvasLink(config.url || (typeof firstEvent.mapUrl === "string" ? firstEvent.mapUrl : undefined));
      return <div className="flex size-full flex-col items-center justify-center gap-3 rounded-xl bg-stone-100 p-3">{heading}<MapPin className="size-8" /><p className="text-sm">{config.description || String(firstEvent.address || "Địa điểm tổ chức")}</p>{url ? <a href={url} target="_blank" rel="noopener noreferrer" className={buttonClass}>{config.buttonLabel || "Xem chỉ đường"}</a> : <p className="text-xs">Chưa có liên kết bản đồ</p>}</div>;
    }
    case "contact":
      return <ContactWidget config={config} heading={heading} />;
    case "reminder":
      return <ReminderWidget config={config} cardId={cardId} elementId={element.id} defaultEventDate={typeof firstEvent.eventDate === "string" ? firstEvent.eventDate : undefined} />;
    case "custom-form":
      return <CustomFormWidget config={config} cardId={cardId} elementId={element.id} isEditor={isEditor} />;
    case "guest-signature":
      return <GuestSignatureWidget config={config} cardId={cardId} elementId={element.id} isEditor={isEditor} />;
    case "album": {
      const photos = Array.isArray(root.photos) ? root.photos.map(readRecord).filter(photo => typeof photo.url === "string") : [];
      return <div className="flex size-full flex-col gap-2">{heading}<div className="grid min-h-0 flex-1 grid-cols-2 gap-2 overflow-auto">{photos.map((photo, index) => <img key={index} src={String(photo.url)} alt={typeof photo.caption === "string" ? photo.caption : `Ảnh cưới ${index + 1}`} className="size-full min-h-0 object-cover" loading="lazy" />)}</div>{photos.length === 0 && <p className="text-xs">Thêm ảnh vào album thiệp</p>}</div>;
    }
    case "envelope":
      return <button type="button" onClick={() => setOpened(value => !value)} aria-expanded={opened} className="relative flex size-full flex-col items-center justify-center gap-3 overflow-hidden rounded-lg bg-[#8b2638] p-5 text-white shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2">{opened ? <><Heart className="size-8" />{heading}<p className="text-sm">{config.description || "Trân trọng kính mời quý khách đến chung vui cùng gia đình."}</p></> : <><Mail className="size-16" /><p className="text-sm">{config.buttonLabel || "Mở thiệp mời"}</p></>}</button>;
    case "timeline": {
      const eventsList = Array.isArray(config.timelineEvents) && config.timelineEvents.length > 0
        ? config.timelineEvents
        : [
            { time: "09:30", label: "Đón tiếp khách quý" },
            { time: "11:00", label: "Lễ thành hôn & Cắt bánh" },
            { time: "11:30", label: "Khai tiệc mừng" },
            { time: "13:00", label: "Chụp ảnh kỉ niệm" },
          ];
      const tTitle = config.timelineTitle || config.title || "Lịch Trình Tiệc Cưới";
      return (
        <div className="flex size-full flex-col items-center justify-center p-3.5 text-stone-800 bg-white/90 rounded-2xl border border-stone-200/80 shadow-xs">
          {heading || <h3 className="text-xs font-bold uppercase tracking-wider text-amber-900 mb-2">{tTitle}</h3>}
          <div className="w-full space-y-2">
            {eventsList.map((item: any, idx: number) => (
              <div key={item.id || idx} className="flex items-center gap-2.5 text-xs">
                <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-semibold text-[11px] shrink-0 font-mono">
                  {item.time}
                </span>
                <div className="h-px flex-1 bg-stone-200" />
                <span className="font-medium text-stone-700 truncate">{item.label}</span>
              </div>
            ))}
          </div>
          {text}
        </div>
      );
    }
    case "dress-code": {
      const dressColors = Array.isArray(config.dressCodeColors) && config.dressCodeColors.length > 0
        ? config.dressCodeColors
        : [
            { name: "Trắng", hex: "#FFFFFF", border: "#D1D5DB" },
            { name: "Be sữa", hex: "#F5EBE1" },
            { name: "Hồng phấn", hex: "#FCE7EC" },
            { name: "Xanh Sage", hex: "#87A987" },
          ];
      const dTitle = config.dressCodeTitle || config.title || "Gợi Ý Trang Phục";
      const dDesc = config.dressCodeDescription || config.description || "Tone màu trang phục gợi ý để những bức ảnh kỷ niệm cùng cô dâu & chú rể thật hài hòa";
      return (
        <div className="flex size-full flex-col items-center justify-center p-3.5 text-center text-stone-800 bg-white/90 rounded-2xl border border-stone-200/80 shadow-xs">
          {heading || <h3 className="text-xs font-bold uppercase tracking-wider text-amber-900 mb-1">{dTitle}</h3>}
          <p className="text-[10px] text-stone-500 mb-2 max-w-[240px] line-clamp-2">
            {dDesc}
          </p>
          <div className="flex items-center gap-3">
            {dressColors.map((c: any, idx: number) => (
              <div key={c.id || idx} className="flex flex-col items-center gap-1">
                <span
                  className="size-7 rounded-full shadow-xs border"
                  style={{ backgroundColor: c.hex, borderColor: c.border || "rgba(0,0,0,0.1)" }}
                />
                <span className="text-[10px] text-stone-600 font-medium">{c.name}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    case "love-story": {
      const milestones = Array.isArray(config.loveStoryMilestones) && config.loveStoryMilestones.length > 0
        ? config.loveStoryMilestones
        : [
            { year: "2020", title: "Lần đầu gặp" },
            { year: "2022", title: "Nhận lời yêu" },
            { year: "2025", title: "Lời cầu hôn" },
            { year: "2026", title: "Chung đôi" },
          ];
      const lTitle = config.loveStoryTitle || config.title || "Câu Chuyện Tình Yêu";
      return (
        <div className="flex size-full flex-col items-center justify-center p-3 text-center text-stone-800 bg-white/90 rounded-2xl border border-stone-200/80 shadow-xs">
          {heading || <h3 className="text-xs font-serif font-bold text-rose-950 mb-2">{lTitle}</h3>}
          <div className="grid grid-cols-4 gap-1.5 w-full">
            {milestones.map((m: any, idx: number) => (
              <div key={m.id || idx} className="flex flex-col items-center text-center p-1.5 rounded-lg bg-stone-50 border border-stone-100">
                <span className="text-xs font-bold text-amber-800">{m.year}</span>
                <span className="text-[9px] text-stone-600 line-clamp-1 mt-0.5">{m.title}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    case "menu": {
      const courses = Array.isArray(config.menuCourses) && config.menuCourses.length > 0
        ? config.menuCourses
        : [
            { type: "Khai vị", dish: "Súp Hải Sản & Gỏi Ngó Sen Tôm Thịt" },
            { type: "Món chính", dish: "Gà Hấp Lá Chanh, Bò Sốt Tiêu Đen, Cá Hấp Hồng Kông" },
            { type: "Tráng miệng", dish: "Chè Hạt Sen Long Nhãn & Trái Cây Tươi" },
          ];
      const mTitle = config.menuTitle || config.title || "Thực Đơn Tiệc Cưới";
      return (
        <div className="flex size-full flex-col items-center justify-center p-3 text-center text-stone-800 bg-white/90 rounded-2xl border border-stone-200/80 shadow-xs">
          {heading || <h3 className="text-xs font-bold uppercase tracking-widest text-amber-900 mb-1.5">{mTitle}</h3>}
          <div className="w-full space-y-1 text-left text-xs">
            {courses.map((item: any, idx: number) => (
              <div key={item.id || idx} className="border-b border-stone-100 pb-1">
                <span className="text-[9px] font-bold text-amber-800 uppercase block">{item.type}</span>
                <span className="text-[10px] text-stone-700 block truncate">{item.dish}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    case "procession-route": {
      const bTitle = config.brideTitle || "LỄ VU QUY";
      const bDate = config.brideDate || "Vào Thứ Hai - 09h00";
      const bMonth = config.brideMonth || "Tháng 02";
      const bDay = config.brideDay || "21";
      const bYear = config.brideYear || "2026";
      const bLunar = config.brideLunarDate || "Tức Ngày 16 tháng 12 năm Ất Tỵ";
      const bVenue = config.brideVenue || "tại tư gia nhà gái";
      const bMap = safeCanvasLink(config.brideMapUrl || "https://maps.google.com");
      const bBtn = config.brideButtonText || "Chỉ đường";

      const gTitle = config.groomTitle || "LỄ THÀNH HÔN";
      const gDate = config.groomDate || "Vào Thứ Hai - 14h00";
      const gMonth = config.groomMonth || "Tháng 02";
      const gDay = config.groomDay || "21";
      const gYear = config.groomYear || "2026";
      const gLunar = config.groomLunarDate || "Tức Ngày 16 tháng 12 năm Ất Tỵ";
      const gVenue = config.groomVenue || "TẠI TƯ GIA NHÀ TRAI";
      const gMap = safeCanvasLink(config.groomMapUrl || "https://maps.google.com");
      const gBtn = config.groomButtonText || "Chỉ đường";

      return (
        <div className="flex size-full flex-col justify-between p-4 bg-[#FCFAF7]/95 rounded-2xl border border-amber-900/10 shadow-sm text-stone-800 select-none overflow-hidden text-center">
          {/* ── NHÀ GÁI / LỄ VU QUY ── */}
          <div className="space-y-1">
            <h4 className="font-serif font-bold text-base tracking-wider text-[#7A121D] uppercase">{bTitle}</h4>
            <p className="font-serif text-xs text-stone-600">{bDate}</p>
            <div className="flex items-center justify-center gap-2 font-serif text-[#7A121D] py-0.5">
              <span className="text-xs uppercase tracking-wider">{bMonth}</span>
              <span className="text-2xl font-bold px-1.5 border-x border-[#7A121D]/30 leading-none">{bDay}</span>
              <span className="text-xs uppercase tracking-wider">{bYear}</span>
            </div>
            <p className="text-[10px] italic text-stone-500">{bLunar}</p>
            <div className="flex items-center justify-end gap-1.5 pr-2 pt-0.5">
              <div className="text-right">
                <span className="text-[10px] font-serif font-bold text-[#A26D38] block leading-tight">{bVenue}</span>
                {bMap && (
                  <a href={bMap} target="_blank" rel="noopener noreferrer" className="inline-block mt-0.5 px-2.5 py-0.5 rounded bg-[#4A151B] text-white text-[9px] font-bold uppercase tracking-wider hover:opacity-90">
                    {bBtn}
                  </a>
                )}
              </div>
              <span className="text-base text-amber-700">🏡</span>
            </div>
          </div>

          {/* ── CON ĐƯỜNG UỐN LƯỢN & XE HOA ── */}
          <div className="relative w-full h-24 my-1 flex items-center justify-center">
            {/* SVG Con đường uốn lượn */}
            <svg viewBox="0 0 300 80" className="w-full h-full absolute inset-0" fill="none">
              <path d="M 30 75 C 60 75, 70 35, 140 35 C 210 35, 230 15, 270 15" stroke="#EAD7B7" strokeWidth="18" strokeLinecap="round" />
              <path d="M 30 75 C 60 75, 70 35, 140 35 C 210 35, 230 15, 270 15" stroke="#C49A58" strokeWidth="1" strokeDasharray="4 3" opacity="0.7" />
            </svg>
            {/* Xe hoa pastel rước dâu */}
            <div className="relative z-10 w-20 h-20 -mt-2">
              <img src="/images/decor/vintage-wedding-car.png" alt="Xe hoa" className="w-full h-full object-contain drop-shadow-md" />
            </div>
            {/* Trái tim hoa decor nhỏ */}
            <span className="absolute top-2 left-16 text-rose-300 text-xs">♡</span>
            <span className="absolute bottom-2 right-16 text-rose-300 text-xs">🌸</span>
          </div>

          {/* ── NHÀ TRAI / LỄ THÀNH HÔN ── */}
          <div className="space-y-1">
            <div className="flex items-center justify-start gap-1.5 pl-2 pb-0.5">
              <span className="text-base text-amber-700">🏰</span>
              <div className="text-left">
                <span className="text-[10px] font-serif font-bold text-[#A26D38] block leading-tight">{gVenue}</span>
                {gMap && (
                  <a href={gMap} target="_blank" rel="noopener noreferrer" className="inline-block mt-0.5 px-2.5 py-0.5 rounded bg-[#4A151B] text-white text-[9px] font-bold uppercase tracking-wider hover:opacity-90">
                    {gBtn}
                  </a>
                )}
              </div>
            </div>
            <h4 className="font-serif font-bold text-base tracking-wider text-[#7A121D] uppercase">{gTitle}</h4>
            <p className="font-serif text-xs text-stone-600">{gDate}</p>
            <div className="flex items-center justify-center gap-2 font-serif text-[#7A121D] py-0.5">
              <span className="text-xs uppercase tracking-wider">{gMonth}</span>
              <span className="text-2xl font-bold px-1.5 border-x border-[#7A121D]/30 leading-none">{gDay}</span>
              <span className="text-xs uppercase tracking-wider">{gYear}</span>
            </div>
            <p className="text-[10px] italic text-stone-500">{gLunar}</p>
          </div>
        </div>
      );
    }
    case "lace-vow-card": {
      const couple = config.title || "Mạnh Đức & Lan Nhi";
      const wDate = config.eventDate || "29.12.2026";
      const vows = (config.vowQuote || "Một lời hẹn ước\nMột hành trình mới\nMột mái nhà chung\nMột đời bên nhau").split("\n");
      const frameImg = config.frameStyle === "gold-arch" 
        ? "/images/decor/lace-frame-gold-arch.png"
        : config.frameStyle === "scalloped"
        ? "/images/decor/scalloped-paper-frame.png"
        : config.frameStyle === "lotus"
        ? "/images/decor/lotus-heritage-frame.png"
        : config.frameStyle === "rose-cottage"
        ? "/images/decor/rose-cottage-frame.png"
        : "/images/decor/lace-frame-royal.png";

      return (
        <div className="relative size-full flex items-center justify-center p-3 select-none overflow-hidden">
          {/* Nền khung ren mỹ thuật */}
          <img src={frameImg} alt="Khung ren" className="absolute inset-0 size-full object-contain drop-shadow-md pointer-events-none" />

          {/* Nội dung chữ trên nền giấy */}
          <div className="relative z-10 max-w-[70%] text-center px-2 py-4 flex flex-col items-center justify-center space-y-2">
            <h3 className="font-script text-2xl sm:text-3xl text-[#7A121D] leading-tight drop-shadow-2xs">
              {couple}
            </h3>
            <p className="font-serif text-sm tracking-widest text-[#7A121D] font-medium">
              {wDate}
            </p>
            <div className="pt-2 space-y-1 font-serif text-xs italic text-[#4A3225] leading-relaxed">
              {vows.map((line, idx) => (
                <p key={idx} className="line-clamp-1">{line}</p>
              ))}
            </div>
          </div>
        </div>
      );
    }
    case "swan-ceremony": {
      const mainTitle = config.title || "LỄ THÀNH HÔN";
      const timeDesc = config.description || "ĐƯỢC TỔ CHỨC VÀO LÚC 09:30, THỨ BẢY";
      const cMonth = config.ceremonyMonth || "THÁNG 12";
      const cDay = config.ceremonyDay || "29";
      const cYear = config.ceremonyYear || "NĂM 2026";
      const venue = config.groomVenue || "TẠI TƯ GIA NHÀ TRAI";
      const addr = config.groomAddress || "174 Đường Trần Văn Kiểu, Phường 10, TP Hồ Chí Minh";
      const lunar = config.groomLunarDate || "(Tức ngày 18 tháng 10 năm Bính Ngọ)";
      const mapLink = safeCanvasLink(config.url || "https://maps.google.com");
      const btnText = config.buttonLabel || "XEM CHỈ ĐƯỜNG";

      const decorImg = config.decorIcon === "car"
        ? "/images/decor/vintage-wedding-car.png"
        : config.decorIcon === "cake"
        ? "/images/decor/wedding-cake-3tier.png"
        : config.decorIcon === "wreath"
        ? "/images/decor/baby-breath-wreath.png"
        : config.decorIcon === "none"
        ? null
        : "/images/decor/twin-swans-heart.png";

      return (
        <div className="flex size-full flex-col items-center justify-between p-4 bg-[#FCFAF7]/95 rounded-2xl border border-amber-900/10 shadow-sm text-stone-800 select-none overflow-hidden text-center">
          {/* Biểu tượng trang trí trên đầu */}
          {decorImg && (
            <div className="w-20 h-16 shrink-0 pt-1">
              <img src={decorImg} alt="Biểu tượng trang trí" className="size-full object-contain drop-shadow-xs" />
            </div>
          )}

          {/* Tiêu đề & Giờ tổ chức */}
          <div className="space-y-1 w-full pt-1">
            <h3 className="font-serif font-bold text-base sm:text-lg tracking-wider text-[#7A121D] uppercase">
              {mainTitle}
            </h3>
            <p className="font-serif text-[11px] text-[#7A121D] tracking-wide uppercase">
              {timeDesc}
            </p>
          </div>

          {/* Ô số ngày tháng kiểu khung ngang */}
          <div className="flex items-center justify-center gap-3 font-serif py-1 w-full max-w-[260px] border-y border-stone-200">
            <div className="border-b-2 border-[#7A121D] pb-0.5">
              <span className="text-xs uppercase tracking-wider text-[#7A121D] font-bold">{cMonth}</span>
            </div>
            <span className="text-3xl font-bold text-[#7A121D] leading-none">{cDay}</span>
            <div className="border-b-2 border-[#7A121D] pb-0.5">
              <span className="text-xs uppercase tracking-wider text-[#7A121D] font-bold">{cYear}</span>
            </div>
          </div>
          <p className="text-[10px] italic text-stone-500">{lunar}</p>

          {/* Địa điểm & nút chỉ đường */}
          <div className="space-y-1.5 w-full pt-1">
            <h5 className="font-serif font-bold text-xs uppercase text-[#7A121D] tracking-wider">{venue}</h5>
            <p className="text-[10px] text-stone-600 max-w-[260px] mx-auto leading-relaxed">{addr}</p>
            {mapLink && (
              <div className="pt-1">
                <a
                  href={mapLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block px-5 py-1.5 rounded-full bg-[#7A121D] hover:bg-[#5E0E16] text-white text-[10px] font-bold uppercase tracking-widest shadow-sm transition active:scale-95 cursor-pointer"
                >
                  {btnText}
                </a>
              </div>
            )}
          </div>
        </div>
      );
    }
    case "embed-video":
      return <EmbedVideoWidget config={config} heading={heading} />;
    case "carousel":
      return <CarouselWidget config={config} heading={heading} />;
    case "background-video":
      return <BackgroundVideoWidget config={config} />;
    default:
      return <p className="text-sm">{title || "Tiện ích"}</p>;
  }
}

function CarouselWidget({ config, heading }: { config: any; heading: React.ReactNode }) {
  const slides = Array.isArray(config.slides) && config.slides.length > 0
    ? config.slides
    : [
        { id: "1", imageUrl: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&q=80", caption: "Khoảnh khắc đáng nhớ" }
      ];
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (config.autoPlay === false || slides.length <= 1) return;
    const interval = (config.autoPlayInterval || 4) * 1000;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, interval);
    return () => clearInterval(timer);
  }, [config.autoPlay, config.autoPlayInterval, slides.length]);

  const activeSlide = slides[current] || slides[0];

  return (
    <div className="relative size-full flex flex-col items-center justify-center overflow-hidden rounded-2xl bg-stone-900/5 shadow-xs select-none">
      {heading && <div className="absolute top-2 left-3 z-20">{heading}</div>}
      <div className="relative size-full overflow-hidden">
        <img
          src={activeSlide.imageUrl}
          alt={activeSlide.caption || "Ảnh cưới"}
          className="size-full object-cover transition-opacity duration-500"
        />
        {activeSlide.caption && (
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent p-2.5 pt-6 text-center text-xs text-white">
            {activeSlide.caption}
          </div>
        )}
      </div>
      {slides.length > 1 && config.showArrows !== false && (
        <>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setCurrent((prev) => (prev - 1 + slides.length) % slides.length); }}
            className="absolute left-2 top-1/2 -translate-y-1/2 size-7 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 z-20 cursor-pointer"
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setCurrent((prev) => (prev + 1) % slides.length); }}
            className="absolute right-2 top-1/2 -translate-y-1/2 size-7 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 z-20 cursor-pointer"
          >
            <ChevronRight className="size-4" />
          </button>
        </>
      )}
      {slides.length > 1 && config.showDots !== false && (
        <div className="absolute bottom-1.5 inset-x-0 flex justify-center gap-1.5 z-20">
          {slides.map((_: any, idx: number) => (
            <span
              key={idx}
              className={`size-1.5 rounded-full transition-all ${idx === current ? "bg-white w-4" : "bg-white/50"}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function EmbedVideoWidget({ config, heading }: { config: any; heading: React.ReactNode }) {
  const videoUrl = config.videoUrl || "";
  const videoSource = config.videoSource || "youtube";
  const videoId = config.videoId || "";

  let embedSrc = "";
  let ytId = "";
  if (videoSource === "youtube") {
    ytId = videoId || (videoUrl.match(/(?:youtu\.be\/|(?:watch\?.*v=|shorts\/|embed\/))([a-zA-Z0-9_-]{11})/)?.[1]) || "";
    if (ytId) {
      embedSrc = `https://www.youtube-nocookie.com/embed/${ytId}?rel=0&modestbranding=1&autoplay=1${config.muted ? "&mute=1" : ""}${config.loop ? `&loop=1&playlist=${ytId}` : ""}`;
    }
  } else if (videoSource === "vimeo") {
    const id = videoId || (videoUrl.match(/vimeo\.com\/(\d+)/)?.[1]);
    if (id) {
      embedSrc = `https://player.vimeo.com/video/${id}?badge=0&autoplay=1${config.muted ? "&muted=1" : ""}`;
    }
  }

  // Determine thumbnail
  const thumbUrl = config.thumbnailUrl || (ytId ? `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg` : "");
  const [isPlaying, setIsPlaying] = useState(Boolean(config.autoPlay));

  if (!videoUrl && !embedSrc) {
    return (
      <div className="flex size-full flex-col items-center justify-center gap-2 text-stone-400 p-4 text-center bg-stone-900 rounded-2xl">
        <div className="size-12 rounded-full bg-white/10 flex items-center justify-center text-white">
          <Video className="size-6" />
        </div>
        <span className="text-xs text-stone-300 font-medium">{config.title || "Nhúng Video"}</span>
        <span className="text-[10px] text-stone-400">Dán link YouTube trong bảng thuộc tính để hiển thị ảnh bìa</span>
      </div>
    );
  }

  // When not playing, show thumbnail with play button
  if (!isPlaying && (thumbUrl || embedSrc)) {
    return (
      <div
        className="relative size-full flex items-center justify-center overflow-hidden rounded-2xl bg-stone-950 group cursor-pointer shadow-xs select-none"
        onClick={() => setIsPlaying(true)}
      >
        {thumbUrl ? (
          <img
            src={thumbUrl}
            alt={config.title || "Ảnh bìa video YouTube"}
            className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="size-full bg-gradient-to-br from-stone-900 via-stone-800 to-black" />
        )}
        <div className="absolute inset-0 bg-black/30 transition-opacity group-hover:bg-black/20" />

        {/* YouTube style Red Play Button */}
        <div className="absolute flex size-14 items-center justify-center rounded-2xl bg-[#FF0000] text-white shadow-2xl transition-all duration-300 group-hover:scale-115 group-hover:shadow-red-500/40">
          <Play className="size-7 fill-white ml-0.5" />
        </div>

        {heading && <div className="absolute top-2 left-3 z-10">{heading}</div>}

        {config.caption && (
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-2.5 pt-6 text-center text-xs text-white">
            {config.caption}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative size-full flex flex-col items-center justify-center overflow-hidden rounded-2xl bg-stone-900 shadow-xs">
      {heading && <div className="absolute top-2 left-3 z-10">{heading}</div>}
      {embedSrc ? (
        <iframe
          src={embedSrc}
          title={config.title || "Video kỷ niệm"}
          className="size-full border-0 rounded-2xl"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      ) : videoUrl && (videoSource === "direct-url" || videoSource === "upload") ? (
        <video
          src={videoUrl}
          controls={config.showControls !== false}
          autoPlay
          muted={Boolean(config.muted ?? true)}
          loop={Boolean(config.loop)}
          playsInline
          className="size-full object-cover rounded-2xl"
        />
      ) : null}
      {config.caption && (
        <div className="absolute inset-x-0 bottom-0 bg-black/60 p-2 text-center text-xs text-white line-clamp-1">
          {config.caption}
        </div>
      )}
    </div>
  );
}

function BackgroundVideoWidget({ config }: { config: any }) {
  const isEnabled = config.enabled !== false;
  return (
    <div className="relative size-full flex flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-amber-600/30 bg-gradient-to-br from-stone-900 via-stone-800 to-amber-950 p-4 text-center text-white shadow-xs">
      <div className="size-10 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400 mb-2">
        <Video className="size-5" />
      </div>
      <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300 mb-1">
        Video Nền {config.displayMode === "fullscreen" ? "Toàn Trang" : "Hero Section"}
      </h4>
      <p className="text-[10px] text-stone-300 line-clamp-2 max-w-[240px]">
        {config.videoUrl ? `Đã gắn: ${config.videoUrl.slice(0, 40)}...` : "Chưa gắn video nền. Tùy chỉnh URL trong bảng thuộc tính."}
      </p>
      <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-amber-400/20 px-2 py-0.5 text-[9px] font-medium text-amber-300">
        ● {isEnabled ? "Đang bật" : "Đang tắt"} | Độ mờ: {Math.round((config.opacity ?? 0.6) * 100)}%
      </span>
    </div>
  );
}
