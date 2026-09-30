"use client";

import React, { useEffect, useState } from "react";
import { CalendarDays, Gift, Heart, Mail, MapPin, Phone, UserCheck } from "lucide-react";
import type { CanvasElement } from "@/types/canvas.types";
import { readRecord, safeCanvasLink } from "@/lib/editor/canvas-presentation";

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
      return <div className="flex size-full flex-col items-center justify-center gap-3">{heading}<div className="grid w-full grid-cols-4 gap-2">{values.map((value, index) => <div key={index} className="rounded-lg bg-stone-900 px-1 py-3 text-white"><p className="text-xl tabular-nums">{Number.isFinite(eventTime) ? String(value).padStart(2, "0") : "—"}</p><p className="text-xs">{["ngày", "giờ", "phút", "giây"][index]}</p></div>)}</div>{!Number.isFinite(eventTime) && <p className="text-xs">Chọn ngày tổ chức trong thuộc tính</p>}</div>;
    }
    case "calendar":
      return <div className="flex size-full flex-col items-center justify-center gap-3">{heading}<CalendarDays className="size-7" /><p className="text-xl">{Number.isFinite(eventTime) ? new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "long", year: "numeric", timeZone: "Asia/Ho_Chi_Minh" }).format(eventTime) : "Chọn ngày tổ chức"}</p>{text}</div>;
    case "rsvp":
      return <div className="flex size-full flex-col items-center justify-center gap-3 text-center">{heading}{text}<button type="button" className={buttonClass} onClick={onRsvp}><UserCheck className="size-4" />{config.buttonLabel || "Gửi xác nhận"}</button></div>;
    case "gift":
      return <div className="flex size-full flex-col items-center justify-center gap-3">{heading}<Gift className="size-8" />{text}<button type="button" className={buttonClass} onClick={onGift}>{config.buttonLabel || "Mở hộp mừng cưới"}</button></div>;
    case "guest-name":
      return <div className="flex size-full flex-col items-center justify-center gap-2">{heading}<p className="text-xl italic">{guestName || config.description || "Quý khách"}</p></div>;
    case "map": {
      const url = safeCanvasLink(config.url || (typeof firstEvent.mapUrl === "string" ? firstEvent.mapUrl : undefined));
      return <div className="flex size-full flex-col items-center justify-center gap-3 rounded-xl bg-stone-100 p-3">{heading}<MapPin className="size-8" /><p className="text-sm">{config.description || String(firstEvent.address || "Địa điểm tổ chức")}</p>{url ? <a href={url} target="_blank" rel="noopener noreferrer" className={buttonClass}>{config.buttonLabel || "Xem chỉ đường"}</a> : <p className="text-xs">Chưa có liên kết bản đồ</p>}</div>;
    }
    case "contact": {
      const phone = (config.phone || "").replace(/[\s()-]/g, "");
      const url = safeCanvasLink(`tel:${phone}`);
      return <div className="flex size-full flex-col items-center justify-center gap-3">{heading}<Phone className="size-6" />{text}{url ? <a href={url} className={buttonClass}>{config.buttonLabel || config.phone}</a> : <p className="text-xs">Chưa có số liên hệ</p>}</div>;
    }
    case "album": {
      const photos = Array.isArray(root.photos) ? root.photos.map(readRecord).filter(photo => typeof photo.url === "string") : [];
      return <div className="flex size-full flex-col gap-2">{heading}<div className="grid min-h-0 flex-1 grid-cols-2 gap-2 overflow-auto">{photos.map((photo, index) => <img key={index} src={String(photo.url)} alt={typeof photo.caption === "string" ? photo.caption : `Ảnh cưới ${index + 1}`} className="size-full min-h-0 object-cover" loading="lazy" />)}</div>{photos.length === 0 && <p className="text-xs">Thêm ảnh vào album thiệp</p>}</div>;
    }
    case "envelope":
      return <button type="button" onClick={() => setOpened(value => !value)} aria-expanded={opened} className="relative flex size-full flex-col items-center justify-center gap-3 overflow-hidden rounded-lg bg-[#8b2638] p-5 text-white shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2">{opened ? <><Heart className="size-8" />{heading}<p className="text-sm">{config.description || "Trân trọng kính mời quý khách đến chung vui cùng gia đình."}</p></> : <><Mail className="size-16" /><p className="text-sm">{config.buttonLabel || "Mở thiệp mời"}</p></>}</button>;
    case "timeline": {
      const eventsList = [
        { time: "09:30", label: "Đón tiếp khách quý" },
        { time: "11:00", label: "Lễ thành hôn & Cắt bánh" },
        { time: "11:30", label: "Khai tiệc mừng" },
        { time: "13:00", label: "Chụp ảnh kỉ niệm" },
      ];
      return (
        <div className="flex size-full flex-col items-center justify-center p-3.5 text-stone-800 bg-white/90 rounded-2xl border border-stone-200/80 shadow-xs">
          {heading || <h3 className="text-xs font-bold uppercase tracking-wider text-amber-900 mb-2">Lịch Trình Tiệc Cưới</h3>}
          <div className="w-full space-y-2">
            {eventsList.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2.5 text-xs">
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
      const dressColors = [
        { name: "Trắng", hex: "#FFFFFF", border: "#D1D5DB" },
        { name: "Be sữa", hex: "#F5EBE1" },
        { name: "Hồng phấn", hex: "#FCE7EC" },
        { name: "Xanh Sage", hex: "#87A987" },
      ];
      return (
        <div className="flex size-full flex-col items-center justify-center p-3.5 text-center text-stone-800 bg-white/90 rounded-2xl border border-stone-200/80 shadow-xs">
          {heading || <h3 className="text-xs font-bold uppercase tracking-wider text-amber-900 mb-1">Gợi Ý Trang Phục</h3>}
          <p className="text-[10px] text-stone-500 mb-2 max-w-[240px] line-clamp-2">
            {config.description || "Tone màu trang phục gợi ý để những bức ảnh kỷ niệm cùng cô dâu & chú rể thật hài hòa"}
          </p>
          <div className="flex items-center gap-3">
            {dressColors.map((c, idx) => (
              <div key={idx} className="flex flex-col items-center gap-1">
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
      const milestones = [
        { year: "2020", title: "Lần đầu gặp" },
        { year: "2022", title: "Nhận lời yêu" },
        { year: "2025", title: "Lời cầu hôn" },
        { year: "2026", title: "Chung đôi" },
      ];
      return (
        <div className="flex size-full flex-col items-center justify-center p-3 text-center text-stone-800 bg-white/90 rounded-2xl border border-stone-200/80 shadow-xs">
          {heading || <h3 className="text-xs font-serif font-bold text-rose-950 mb-2">Câu Chuyện Tình Yêu</h3>}
          <div className="grid grid-cols-4 gap-1.5 w-full">
            {milestones.map((m, idx) => (
              <div key={idx} className="flex flex-col items-center text-center p-1.5 rounded-lg bg-stone-50 border border-stone-100">
                <span className="text-xs font-bold text-amber-800">{m.year}</span>
                <span className="text-[9px] text-stone-600 line-clamp-1 mt-0.5">{m.title}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    case "menu": {
      const courses = [
        { type: "Khai vị", dish: "Súp Hải Sản & Gỏi Ngó Sen Tôm Thịt" },
        { type: "Món chính", dish: "Gà Hấp Lá Chanh, Bò Sốt Tiêu Đen, Cá Hấp Hồng Kông" },
        { type: "Tráng miệng", dish: "Chè Hạt Sen Long Nhãn & Trái Cây Tươi" },
      ];
      return (
        <div className="flex size-full flex-col items-center justify-center p-3 text-center text-stone-800 bg-white/90 rounded-2xl border border-stone-200/80 shadow-xs">
          {heading || <h3 className="text-xs font-bold uppercase tracking-widest text-amber-900 mb-1.5">Thực Đơn Tiệc Cưới</h3>}
          <div className="w-full space-y-1 text-left text-xs">
            {courses.map((item, idx) => (
              <div key={idx} className="border-b border-stone-100 pb-1">
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
      const bLunar = config.brideLunarDate || "Tức Ngày 16 tháng 12 năm Ất Tỵ";
      const bVenue = config.brideVenue || "tại tư gia nhà gái";
      const bMap = safeCanvasLink(config.brideMapUrl || "https://maps.google.com");

      const gTitle = config.groomTitle || "LỄ THÀNH HÔN";
      const gDate = config.groomDate || "Vào Thứ Hai - 14h00";
      const gLunar = config.groomLunarDate || "Tức Ngày 16 tháng 12 năm Ất Tỵ";
      const gVenue = config.groomVenue || "TẠI TƯ GIA NHÀ TRAI";
      const gMap = safeCanvasLink(config.groomMapUrl || "https://maps.google.com");

      return (
        <div className="flex size-full flex-col justify-between p-4 bg-[#FCFAF7]/95 rounded-2xl border border-amber-900/10 shadow-sm text-stone-800 select-none overflow-hidden text-center">
          {/* ── NHÀ GÁI / LỄ VU QUY ── */}
          <div className="space-y-1">
            <h4 className="font-serif font-bold text-base tracking-wider text-[#7A121D] uppercase">{bTitle}</h4>
            <p className="font-serif text-xs text-stone-600">{bDate}</p>
            <div className="flex items-center justify-center gap-2 font-serif text-[#7A121D] py-0.5">
              <span className="text-xs uppercase tracking-wider">Tháng 02</span>
              <span className="text-2xl font-bold px-1.5 border-x border-[#7A121D]/30 leading-none">21</span>
              <span className="text-xs uppercase tracking-wider">2026</span>
            </div>
            <p className="text-[10px] italic text-stone-500">{bLunar}</p>
            <div className="flex items-center justify-end gap-1.5 pr-2 pt-0.5">
              <div className="text-right">
                <span className="text-[10px] font-serif font-bold text-[#A26D38] block leading-tight">{bVenue}</span>
                {bMap && (
                  <a href={bMap} target="_blank" rel="noopener noreferrer" className="inline-block mt-0.5 px-2.5 py-0.5 rounded bg-[#4A151B] text-white text-[9px] font-bold uppercase tracking-wider hover:opacity-90">
                    Chỉ đường
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
                    Chỉ đường
                  </a>
                )}
              </div>
            </div>
            <h4 className="font-serif font-bold text-base tracking-wider text-[#7A121D] uppercase">{gTitle}</h4>
            <p className="font-serif text-xs text-stone-600">{gDate}</p>
            <div className="flex items-center justify-center gap-2 font-serif text-[#7A121D] py-0.5">
              <span className="text-xs uppercase tracking-wider">Tháng 02</span>
              <span className="text-2xl font-bold px-1.5 border-x border-[#7A121D]/30 leading-none">21</span>
              <span className="text-xs uppercase tracking-wider">2026</span>
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
              <span className="text-xs uppercase tracking-wider text-[#7A121D] font-bold">THÁNG 12</span>
            </div>
            <span className="text-3xl font-bold text-[#7A121D] leading-none">29</span>
            <div className="border-b-2 border-[#7A121D] pb-0.5">
              <span className="text-xs uppercase tracking-wider text-[#7A121D] font-bold">NĂM 2026</span>
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
    default:
      return <p className="text-sm">{title || "Tiện ích"}</p>;
  }
}
