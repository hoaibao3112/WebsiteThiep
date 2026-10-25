"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, CalendarDays, X, ChevronDown, ChevronUp, Gift, Heart } from "lucide-react";
import confetti from "canvas-confetti";

export interface LiveEventItem {
  id?: string;
  eventName: string;
  eventDate: Date | string;
  venueName?: string;
  address?: string;
}

export type BannerState = "hidden" | "upcoming" | "live" | "ended";
export type CardCategory = "WEDDING" | "BIRTHDAY" | "NEWBORN";

export interface LiveEventBannerProps {
  events: LiveEventItem[];
  primaryColor?: string;
  cardCategory?: CardCategory;
  onOpenRsvp?: () => void;
  onOpenGift?: () => void;
  isPreview?: boolean;
}

const DEFAULT_DURATION_MS = 3 * 60 * 60 * 1000; // 3 giờ

function toDate(d: Date | string): Date {
  if (d instanceof Date) return isNaN(d.getTime()) ? new Date() : d;
  const parsed = new Date(d);
  return isNaN(parsed.getTime()) ? new Date() : parsed;
}

function getVNDateString(d: Date): string {
  try {
    return d.toLocaleDateString("en-CA", { timeZone: "Asia/Ho_Chi_Minh" });
  } catch {
    return d.toISOString().slice(0, 10);
  }
}

function isSameDayVN(a: Date, b: Date): boolean {
  return getVNDateString(a) === getVNDateString(b);
}

function formatHHMM(date: Date): string {
  try {
    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "Asia/Ho_Chi_Minh",
    });
  } catch {
    return date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", hour12: false });
  }
}

function formatDDMM(date: Date): string {
  try {
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      timeZone: "Asia/Ho_Chi_Minh",
    });
  } catch {
    return date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
  }
}

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function getBannerState(events: LiveEventItem[]) {
  if (!events || events.length === 0) {
    return { state: "hidden" as BannerState, activeEvent: null, msUntilStart: 0, msUntilEnd: 0 };
  }

  const now = Date.now();
  const nowDate = new Date(now);

  const sorted = [...events].sort(
    (a, b) => toDate(a.eventDate).getTime() - toDate(b.eventDate).getTime()
  );

  // 1. Live: Event đang diễn ra (trong vòng DEFAULT_DURATION_MS)
  const liveEvent = sorted.find((ev) => {
    const s = toDate(ev.eventDate).getTime();
    return now >= s && now < s + DEFAULT_DURATION_MS;
  });

  if (liveEvent) {
    const s = toDate(liveEvent.eventDate).getTime();
    return {
      state: "live" as BannerState,
      activeEvent: liveEvent,
      msUntilStart: 0,
      msUntilEnd: s + DEFAULT_DURATION_MS - now,
    };
  }

  // 2. Upcoming: Có event trong hôm nay (theo giờ VN) chưa bắt đầu
  const upcomingToday = sorted.find((ev) => {
    const s = toDate(ev.eventDate);
    return isSameDayVN(s, nowDate) && s.getTime() > now;
  });

  if (upcomingToday) {
    return {
      state: "upcoming" as BannerState,
      activeEvent: upcomingToday,
      msUntilStart: toDate(upcomingToday.eventDate).getTime() - now,
      msUntilEnd: 0,
    };
  }

  // 3. Ended: Event gần nhất vừa kết thúc trong vòng 12h
  const recentlyEnded = sorted
    .filter((ev) => {
      const e = toDate(ev.eventDate).getTime() + DEFAULT_DURATION_MS;
      return e < now && now - e < 12 * 3600 * 1000;
    })
    .pop();

  if (recentlyEnded) {
    return {
      state: "ended" as BannerState,
      activeEvent: recentlyEnded,
      msUntilStart: 0,
      msUntilEnd: 0,
    };
  }

  return { state: "hidden" as BannerState, activeEvent: null, msUntilStart: 0, msUntilEnd: 0 };
}

function msToCountdown(ms: number) {
  const t = Math.max(0, Math.floor(ms / 1000));
  return {
    h: Math.floor(t / 3600),
    m: Math.floor((t % 3600) / 60),
    s: t % 60,
  };
}

function getCategoryTexts(c: CardCategory) {
  if (c === "BIRTHDAY") {
    return {
      upcomingTitle: "Hôm Nay Là Sinh Nhật!",
      liveTitle: "Tiệc Sinh Nhật Đang Diễn Ra!",
      endedTitle: "Tiệc Sinh Nhật Đã Kết Thúc",
      endedMsg: "Cảm ơn quý khách đã đến chung vui! Chúc mừng sinh nhật rực rỡ 🎂",
      upcomingEmoji: "🎂",
      liveEmoji: "🎉",
      endedEmoji: "🎊",
    };
  }
  if (c === "NEWBORN") {
    return {
      upcomingTitle: "Hôm Nay Là Ngày Trọng Đại!",
      liveTitle: "Tiệc Đầy Tháng Đang Diễn Ra!",
      endedTitle: "Tiệc Đầy Tháng Đã Kết Thúc",
      endedMsg: "Cảm ơn quý khách đã đến chung vui! Chúc bé yêu mau ăn chóng lớn 👶",
      upcomingEmoji: "👶",
      liveEmoji: "🌟",
      endedEmoji: "💝",
    };
  }
  return {
    upcomingTitle: "Hôm Nay Là Ngày Trọng Đại!",
    liveTitle: "Lễ Cưới Đang Diễn Ra!",
    endedTitle: "Lễ Cưới Đã Kết Thúc",
    endedMsg: "Cảm ơn quý khách đã đến chung vui! Chúc đôi uyên ương trăm năm hạnh phúc 💑",
    upcomingEmoji: "🎊",
    liveEmoji: "💒",
    endedEmoji: "💑",
  };
}

const DigitBlock: React.FC<{ value: number; label: string }> = ({ value, label }) => (
  <div className="flex flex-col items-center min-w-[34px] sm:min-w-[38px] bg-black/20 backdrop-blur-xs px-1.5 py-1 rounded-md border border-white/10">
    <AnimatePresence mode="popLayout">
      <motion.span
        key={value}
        initial={{ y: -8, opacity: 0, scale: 0.85 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 8, opacity: 0, scale: 0.85 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="text-base sm:text-lg font-bold font-mono tabular-nums leading-none text-white drop-shadow-xs"
      >
        {pad2(value)}
      </motion.span>
    </AnimatePresence>
    <span className="text-[8px] sm:text-[9px] uppercase tracking-wider text-white/75 mt-0.5 font-medium">{label}</span>
  </div>
);

export const LiveEventBanner: React.FC<LiveEventBannerProps> = ({
  events,
  primaryColor = "#BE944E",
  cardCategory = "WEDDING",
  onOpenRsvp,
  onOpenGift,
  isPreview = false,
}) => {
  const [info, setInfo] = useState(() => getBannerState(events));
  const [countdown, setCountdown] = useState({ h: 0, m: 0, s: 0 });
  const [dismissed, setDismissed] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const confettiFiredRef = useRef(false);
  const texts = getCategoryTexts(cardCategory);

  const tick = useCallback(() => {
    const next = getBannerState(events);
    setInfo(next);
    if (next.state === "upcoming") {
      setCountdown(msToCountdown(next.msUntilStart));
    } else if (next.state === "live") {
      setCountdown(msToCountdown(next.msUntilEnd));
    }
  }, [events]);

  useEffect(() => {
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [tick]);

  useEffect(() => {
    if (info.state === "upcoming" && !confettiFiredRef.current && !isPreview) {
      confettiFiredRef.current = true;
      setTimeout(() => {
        confetti({
          particleCount: 50,
          spread: 75,
          startVelocity: 25,
          gravity: 0.9,
          origin: { x: 0.5, y: 0 },
          colors: ["#fbbf24", "#f59e0b", "#ec4899", "#f43f5e", "#a78bfa"],
        });
      }, 700);
    }
  }, [info.state, isPreview]);

  if (dismissed || info.state === "hidden" || !info.activeEvent) return null;

  const { state, activeEvent } = info;
  const eventDate = toDate(activeEvent.eventDate);
  const eventEndDate = new Date(eventDate.getTime() + DEFAULT_DURATION_MS);

  const sep = <span className="text-sm sm:text-base font-bold text-white/60 mb-2 select-none">:</span>;

  // 1. STATE: UPCOMING (Hôm nay, sắp diễn ra)
  if (state === "upcoming") {
    return (
      <AnimatePresence>
        <motion.aside
          initial={{ y: -80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -80, opacity: 0 }}
          transition={{ type: "spring", stiffness: 280, damping: 26 }}
          className="fixed top-0 left-0 right-0 z-50 pointer-events-auto"
          aria-label="Thông báo sự kiện trực tiếp"
        >
          <div className="w-full bg-gradient-to-r from-amber-600 via-rose-600 to-pink-600 text-white shadow-xl shadow-rose-950/30 border-b border-white/20">
            <div className="max-w-md sm:max-w-lg mx-auto relative px-3.5 py-2.5 sm:px-4">
              <button
                type="button"
                onClick={() => setDismissed(true)}
                className="absolute top-2 right-2 p-1 rounded-full text-white/80 hover:text-white hover:bg-white/20 transition cursor-pointer"
                aria-label="Đóng thông báo"
              >
                <X className="w-3.5 h-3.5" />
              </button>

              <div className="flex items-center gap-2 mb-2 pr-6">
                <span className="text-xl leading-none select-none">{texts.upcomingEmoji}</span>
                <div className="min-w-0">
                  <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-amber-200">
                    {texts.upcomingTitle}
                  </p>
                  <p className="text-xs sm:text-sm font-semibold truncate leading-tight text-white">
                    {activeEvent.eventName} · {formatHHMM(eventDate)}
                    {activeEvent.venueName ? ` · ${activeEvent.venueName}` : ""}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between gap-2 pt-1 border-t border-white/15">
                <div className="flex items-center gap-1">
                  <DigitBlock value={countdown.h} label="Giờ" />
                  {sep}
                  <DigitBlock value={countdown.m} label="Phút" />
                  {sep}
                  <DigitBlock value={countdown.s} label="Giây" />
                </div>

                <div className="flex items-center gap-1.5 ml-auto">
                  <button
                    type="button"
                    onClick={() => {
                      const s = eventDate.toISOString().replace(/[-:]|\.\d{3}/g, "");
                      const e = eventEndDate.toISOString().replace(/[-:]|\.\d{3}/g, "");
                      const name = encodeURIComponent(activeEvent.eventName);
                      const loc = encodeURIComponent(activeEvent.address || activeEvent.venueName || "");
                      window.open(
                        `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${name}&dates=${s}/${e}&location=${loc}`,
                        "_blank"
                      );
                    }}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-white/20 hover:bg-white/30 text-[11px] font-bold text-white transition cursor-pointer border border-white/30 shadow-xs backdrop-blur-xs"
                    title="Thêm vào Google Calendar"
                  >
                    <CalendarDays className="w-3.5 h-3.5" />
                    <span>Lưu Lịch</span>
                  </button>

                  {onOpenRsvp && (
                    <button
                      type="button"
                      onClick={onOpenRsvp}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-white text-rose-700 hover:bg-rose-50 text-[11px] font-bold transition cursor-pointer shadow-md"
                    >
                      <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
                      <span>Xác Nhận</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.aside>
      </AnimatePresence>
    );
  }

  // 2. STATE: LIVE (Đang diễn ra)
  if (state === "live") {
    const mapQuery = activeEvent.address || activeEvent.venueName;

    return (
      <AnimatePresence>
        <motion.aside
          initial={{ y: -80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -80, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 28 }}
          className="fixed top-0 left-0 right-0 z-50 pointer-events-auto"
          aria-label="Sự kiện đang diễn ra trực tiếp"
        >
          <div className="w-full bg-gradient-to-r from-red-700 via-rose-700 to-red-800 text-white shadow-xl shadow-red-950/40 border-b border-red-500/40">
            <div className="h-0.5 w-full bg-gradient-to-r from-amber-300 via-yellow-200 to-rose-300 animate-pulse" />
            <div className="max-w-md sm:max-w-lg mx-auto px-3.5 py-2.5 sm:px-4 relative">
              <button
                type="button"
                onClick={() => setDismissed(true)}
                className="absolute top-2 right-2 p-1 rounded-full text-white/80 hover:text-white hover:bg-white/20 transition cursor-pointer"
                aria-label="Đóng thông báo"
              >
                <X className="w-3.5 h-3.5" />
              </button>

              <div className="flex items-start gap-2.5 pr-6">
                <div className="flex items-center gap-1.5 shrink-0 mt-0.5 bg-red-950/40 px-2 py-0.5 rounded-full border border-red-400/30">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-200" />
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-widest text-red-100">Live</span>
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-bold leading-tight truncate text-white">{texts.liveTitle}</p>
                  <p className="text-[11px] sm:text-xs text-red-100 mt-0.5 truncate">
                    {texts.liveEmoji} {activeEvent.eventName} · {formatHHMM(eventDate)} – {formatHHMM(eventEndDate)}
                    {activeEvent.venueName ? ` (${activeEvent.venueName})` : ""}
                  </p>
                </div>
              </div>

              {!collapsed && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  className="mt-2.5 pt-2 border-t border-white/15 flex items-center gap-2 flex-wrap"
                >
                  {mapQuery && (
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-white/15 hover:bg-white/25 text-[11px] font-semibold text-white transition cursor-pointer border border-white/20 shadow-xs"
                    >
                      <MapPin className="w-3 h-3 text-red-200" />
                      <span>Xem Bản Đồ</span>
                    </a>
                  )}

                  {onOpenRsvp && (
                    <button
                      type="button"
                      onClick={onOpenRsvp}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-white text-rose-800 hover:bg-rose-50 text-[11px] font-bold transition cursor-pointer shadow-md"
                    >
                      <span>💌</span>
                      <span>Gửi Lời Chúc</span>
                    </button>
                  )}

                  {onOpenGift && (
                    <button
                      type="button"
                      onClick={onOpenGift}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-amber-400 text-stone-900 hover:bg-amber-300 text-[11px] font-bold transition cursor-pointer shadow-md ml-auto"
                    >
                      <Gift className="w-3 h-3" />
                      <span>Gửi Quà</span>
                    </button>
                  )}
                </motion.div>
              )}

              <button
                type="button"
                onClick={() => setCollapsed(!collapsed)}
                className="absolute bottom-2 right-8 p-0.5 text-white/70 hover:text-white transition cursor-pointer"
                aria-label={collapsed ? "Mở rộng" : "Thu gọn"}
              >
                {collapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </motion.aside>
      </AnimatePresence>
    );
  }

  // 3. STATE: ENDED (Đã kết thúc trong ngày)
  if (state === "ended") {
    return (
      <AnimatePresence>
        <motion.aside
          initial={{ y: -60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -60, opacity: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 28 }}
          className="fixed top-0 left-0 right-0 z-50 pointer-events-auto"
          aria-label="Sự kiện đã kết thúc"
        >
          <div className="w-full bg-stone-900/95 backdrop-blur-md text-white shadow-lg border-b border-stone-700/60">
            <div className="max-w-md sm:max-w-lg mx-auto px-3.5 py-2.5 sm:px-4 relative">
              <button
                type="button"
                onClick={() => setDismissed(true)}
                className="absolute top-2 right-2 p-1 rounded-full text-stone-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
                aria-label="Đóng thông báo"
              >
                <X className="w-3.5 h-3.5" />
              </button>

              <div className="flex items-center gap-2.5 pr-6">
                <span className="text-xl leading-none shrink-0 select-none">{texts.endedEmoji}</span>
                <div className="min-w-0">
                  <p className="text-[10px] sm:text-xs font-bold text-amber-300 uppercase tracking-widest">
                    {texts.endedTitle} · {formatHHMM(eventDate)} ngày {formatDDMM(eventDate)}
                  </p>
                  <p className="text-xs sm:text-sm text-stone-200 mt-0.5 leading-snug">{texts.endedMsg}</p>
                </div>
              </div>
            </div>
          </div>
        </motion.aside>
      </AnimatePresence>
    );
  }

  return null;
};
