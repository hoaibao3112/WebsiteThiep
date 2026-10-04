"use client";

import React, { useState } from "react";
import { CalendarPlus, Check, ExternalLink, Calendar, MapPin, Download } from "lucide-react";
import type { CanvasWidgetConfig } from "@/types/canvas.types";

interface Props {
  config: CanvasWidgetConfig;
  cardId?: string;
  elementId?: string;
  defaultEventDate?: string;
}

export function ReminderWidget({ config, cardId, elementId, defaultEventDate }: Props) {
  const [copied, setCopied] = useState(false);
  const title = config.reminderTitle || config.title || "Thêm Vào Lịch Hẹn";
  const desc = config.reminderDescription || config.description;
  const eventTitle = config.reminderEventTitle || "Lễ Cưới Trọng Đại";
  const eventDesc = config.reminderEventDescription || "Trân trọng kính mời quý khách đến dự tiệc cưới.";
  const eventLocation = config.reminderEventLocation || "";
  const eventDate = config.reminderEventDate || defaultEventDate || "2026-12-29T11:00:00+07:00";
  const durationMinutes = config.reminderDurationMinutes || 240;
  const style = config.reminderStyle || "card";
  const buttonColor = config.reminderButtonColor || "#D4AF37";

  const showGoogle = config.reminderShowGoogle !== false;
  const showApple = config.reminderShowApple !== false;
  const showOutlook = config.reminderShowOutlook !== false;

  // Format dates for Google Calendar URL (YYYYMMDDTHHmmssZ)
  const getGoogleCalendarUrl = () => {
    try {
      const start = new Date(eventDate);
      if (isNaN(start.getTime())) return "#";
      const end = new Date(start.getTime() + durationMinutes * 60 * 1000);
      const toIso = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
      const dates = `${toIso(start)}/${toIso(end)}`;
      const params = new URLSearchParams({
        action: "TEMPLATE",
        text: eventTitle,
        dates,
        details: eventDesc,
        location: eventLocation,
      });
      return `https://calendar.google.com/calendar/render?${params.toString()}`;
    } catch {
      return "#";
    }
  };

  const handleDownloadIcs = () => {
    if (cardId && elementId) {
      window.open(`/api/cards/${cardId}/reminder/ics?elementId=${elementId}`, "_blank");
      return;
    }
    // Client-side fallback ICS generator
    try {
      const start = new Date(eventDate);
      const end = new Date(start.getTime() + durationMinutes * 60 * 1000);
      const toIcsDate = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
      const ics = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//WebsiteThiep//Wedding Reminder//VI",
        "CALSCALE:GREGORIAN",
        "METHOD:PUBLISH",
        "BEGIN:VEVENT",
        `UID:wedding-${Date.now()}@websitethiep.vn`,
        `DTSTAMP:${toIcsDate(new Date())}`,
        `DTSTART:${toIcsDate(start)}`,
        `DTEND:${toIcsDate(end)}`,
        `SUMMARY:${eventTitle}`,
        `DESCRIPTION:${eventDesc}`,
        `LOCATION:${eventLocation}`,
        "STATUS:CONFIRMED",
        "END:VEVENT",
        "END:VCALENDAR",
      ].join("\r\n");

      const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.setAttribute("download", "wedding-event.ics");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const formattedDateStr = (() => {
    try {
      const d = new Date(eventDate);
      if (isNaN(d.getTime())) return null;
      return new Intl.DateTimeFormat("vi-VN", {
        weekday: "short",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(d);
    } catch {
      return null;
    }
  })();

  if (style === "single-button") {
    return (
      <div className="flex size-full flex-col items-center justify-center p-3 text-center">
        {title && <h4 className="text-xs font-bold text-stone-800 mb-1">{title}</h4>}
        <a
          href={getGoogleCalendarUrl()}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold text-white shadow-xs transition hover:brightness-110 active:scale-97"
          style={{ backgroundColor: buttonColor }}
        >
          <CalendarPlus className="size-4" />
          <span>{config.reminderButtonText || "Thêm Vào Lịch Hẹn"}</span>
        </a>
      </div>
    );
  }

  if (style === "button-row") {
    return (
      <div className="flex size-full flex-col items-center justify-center p-3 text-center">
        {title && <h4 className="text-xs font-bold text-stone-800 mb-0.5">{title}</h4>}
        {desc && <p className="text-[11px] text-stone-500 mb-2.5 line-clamp-1">{desc}</p>}
        <div className="flex flex-wrap items-center justify-center gap-2">
          {showGoogle && (
            <a
              href={getGoogleCalendarUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xl border border-stone-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-stone-700 shadow-2xs hover:bg-stone-50 transition"
            >
              <Calendar className="size-3.5 text-blue-600" />
              <span>Google Calendar</span>
            </a>
          )}
          {showApple && (
            <button
              type="button"
              onClick={handleDownloadIcs}
              className="inline-flex items-center gap-1.5 rounded-xl border border-stone-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-stone-700 shadow-2xs hover:bg-stone-50 transition cursor-pointer"
            >
              {copied ? <Check className="size-3.5 text-emerald-600" /> : <Download className="size-3.5 text-stone-700" />}
              <span>{copied ? "Đã tải file .ics" : "Apple / Outlook (.ics)"}</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  // Default "card" style: elegant card with preview
  return (
    <div className="flex size-full flex-col items-center justify-center p-3">
      <div className="w-full rounded-2xl border border-amber-200/80 bg-gradient-to-br from-white via-amber-50/20 to-stone-50 p-3.5 shadow-xs text-center">
        <div className="inline-flex size-9 items-center justify-center rounded-xl bg-amber-100 text-amber-900 mb-2">
          <CalendarPlus className="size-5" />
        </div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-amber-950 mb-0.5">{title}</h4>
        {desc && <p className="text-[11px] text-stone-500 mb-2 line-clamp-2">{desc}</p>}

        {formattedDateStr && (
          <div className="mb-3 inline-flex items-center gap-1.5 rounded-lg bg-stone-100/80 px-2.5 py-1 text-[11px] font-medium text-stone-700">
            <Calendar className="size-3.5 text-stone-500" />
            <span>{formattedDateStr}</span>
          </div>
        )}

        {eventLocation && (
          <div className="mb-3 flex items-center justify-center gap-1 text-[11px] text-stone-500 line-clamp-1">
            <MapPin className="size-3 text-stone-400 shrink-0" />
            <span className="truncate">{eventLocation}</span>
          </div>
        )}

        <div className="flex flex-col gap-1.5 pt-1">
          {showGoogle && (
            <a
              href={getGoogleCalendarUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-semibold text-white shadow-xs transition hover:brightness-110 active:scale-98"
              style={{ backgroundColor: buttonColor }}
            >
              <ExternalLink className="size-3.5" />
              <span>{config.reminderButtonText || "Lưu Google Calendar"}</span>
            </a>
          )}
          {showApple && (
            <button
              type="button"
              onClick={handleDownloadIcs}
              className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-stone-200 bg-white py-1.5 text-[11px] font-medium text-stone-700 shadow-2xs hover:bg-stone-50 transition cursor-pointer"
            >
              {copied ? <Check className="size-3.5 text-emerald-600" /> : <Download className="size-3.5 text-stone-500" />}
              <span>{copied ? "Đã tải file lịch .ics" : "Tải file .ics cho iPhone / Outlook"}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
