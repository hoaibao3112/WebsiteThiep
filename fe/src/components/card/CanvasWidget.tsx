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
    default:
      return <p className="text-sm">{title || "Tiện ích"}</p>;
  }
}
