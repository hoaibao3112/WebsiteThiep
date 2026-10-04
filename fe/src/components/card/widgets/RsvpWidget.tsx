"use client";

import React, { useState } from "react";
import { UserCheck, CheckCircle2, HeartHandshake, Loader2, Sparkles } from "lucide-react";
import confetti from "canvas-confetti";
import type { CanvasWidgetConfig } from "@/types/canvas.types";

interface Props {
  config: CanvasWidgetConfig;
  cardId?: string;
  guestName?: string;
  isEditor?: boolean;
}

export function RsvpWidget({ config, cardId, guestName, isEditor }: Props) {
  const [attending, setAttending] = useState<boolean>(true);
  const [name, setName] = useState(guestName || "");
  const [phone, setPhone] = useState("");
  const [guestCount, setGuestCount] = useState<number>(1);
  const [side, setSide] = useState<"GROOM" | "BRIDE">("GROOM");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const title = config.rsvpTitle || config.title || "Xác Nhận Tham Dự";
  const subtitle = config.rsvpSubtitle || config.description || "Vui lòng gửi phản hồi để gia đình chuẩn bị đón tiếp chu đáo nhất.";
  const buttonText = config.rsvpButtonText || "Gửi Xác Nhận";
  const buttonColor = config.rsvpButtonColor || "#D4AF37";
  const attendingLabel = config.rsvpAttendingLabel || "Tham dự";
  const declinedLabel = config.rsvpDeclinedLabel || "Rất tiếc vắng mặt";
  const successMessage = config.rsvpSuccessMessage || "Cảm ơn quý khách đã gửi phản hồi cho gia đình chúng tôi! 💐";

  const showPhone = config.rsvpShowPhone !== false;
  const requirePhone = config.rsvpRequirePhone !== false;
  const showGuestCount = config.rsvpShowGuestCount !== false;
  const showSide = config.rsvpShowSide !== false;
  const showNote = config.rsvpShowNote !== false;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditor) {
      alert("Đang ở chế độ chỉnh sửa thiệp. Form hoạt động khi khách xem thiệp thực tế.");
      return;
    }
    if (!name.trim()) {
      setError("Vui lòng nhập họ và tên của bạn");
      return;
    }
    if (showPhone && requirePhone && !phone.trim()) {
      setError("Vui lòng nhập số điện thoại liên hệ");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const payload = {
        cardId: cardId || "",
        guestName: name.trim(),
        phoneNumber: phone.trim() || undefined,
        status: attending ? "ATTENDING" : "DECLINED",
        attendingCount: attending ? Number(guestCount) || 1 : 0,
        side,
        wishes: note.trim() || undefined,
      };

      const res = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || data.success === false) {
        throw new Error(data.error || "Gửi phản hồi thất bại");
      }

      setSubmitted(true);
      if (attending) {
        try {
          confetti({ particleCount: 80, spread: 60, origin: { y: 0.7 } });
        } catch {}
      }
    } catch (err: any) {
      setError(err.message || "Đã có lỗi xảy ra. Vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="flex size-full flex-col items-center justify-center p-4 text-center">
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/90 p-5 shadow-xs max-w-sm w-full">
          <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <CheckCircle2 className="size-6" />
          </div>
          <h4 className="text-sm font-bold text-emerald-950 mb-1">Xác Nhận Thành Công!</h4>
          <p className="text-xs text-emerald-800 leading-relaxed">{successMessage}</p>
          <button
            type="button"
            onClick={() => setSubmitted(false)}
            className="mt-4 text-[11px] text-emerald-700 underline font-medium cursor-pointer"
          >
            Chỉnh sửa lại phản hồi
          </button>
        </div>
      </div>
    );
  }

  const inputClass = "w-full rounded-xl border border-stone-200 bg-white/90 px-3 py-2 text-xs text-stone-800 outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition placeholder:text-stone-400";

  return (
    <div className="flex size-full flex-col items-center justify-center p-3">
      <div className="w-full max-w-sm rounded-2xl border border-amber-200/70 bg-white/95 p-4 shadow-sm backdrop-blur-xs">
        <div className="text-center mb-3">
          <div className="inline-flex size-8 items-center justify-center rounded-full bg-amber-100 text-amber-900 mb-1">
            <UserCheck className="size-4" />
          </div>
          <h3 className="text-sm font-bold text-stone-900">{title}</h3>
          {subtitle && <p className="text-[11px] text-stone-500 line-clamp-2 mt-0.5">{subtitle}</p>}
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-2.5">
          {/* Status Choice: Attend vs Decline */}
          <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-stone-100">
            <button
              type="button"
              onClick={() => setAttending(true)}
              className={`flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-semibold transition cursor-pointer ${
                attending ? "bg-white text-amber-950 shadow-2xs" : "text-stone-500 hover:text-stone-800"
              }`}
            >
              <Sparkles className="size-3.5 text-amber-500" />
              <span>{attendingLabel}</span>
            </button>
            <button
              type="button"
              onClick={() => setAttending(false)}
              className={`flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-semibold transition cursor-pointer ${
                !attending ? "bg-white text-rose-950 shadow-2xs" : "text-stone-500 hover:text-stone-800"
              }`}
            >
              <HeartHandshake className="size-3.5 text-rose-400" />
              <span>{declinedLabel}</span>
            </button>
          </div>

          {/* Name */}
          <input
            type="text"
            required
            placeholder="Họ và tên của quý khách *"
            className={inputClass}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          {/* Phone */}
          {showPhone && (
            <input
              type="tel"
              required={requirePhone}
              placeholder={requirePhone ? "Số điện thoại liên hệ *" : "Số điện thoại (tùy chọn)"}
              className={inputClass}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          )}

          {/* Guest Count & Side (Only if attending) */}
          {attending && (
            <div className="grid grid-cols-2 gap-2">
              {showGuestCount && (
                <div>
                  <label className="text-[10px] text-stone-500 block mb-0.5">Số người tham dự</label>
                  <select
                    className={inputClass}
                    value={guestCount}
                    onChange={(e) => setGuestCount(Number(e.target.value))}
                  >
                    <option value={1}>1 người (Đi 1 mình)</option>
                    <option value={2}>2 người (Kèm 1 người)</option>
                    <option value={3}>3 người</option>
                    <option value={4}>4 người</option>
                    <option value={5}>Gia đình (5+)</option>
                  </select>
                </div>
              )}

              {showSide && (
                <div>
                  <label className="text-[10px] text-stone-500 block mb-0.5">Khách nhà</label>
                  <select
                    className={inputClass}
                    value={side}
                    onChange={(e) => setSide(e.target.value as "GROOM" | "BRIDE")}
                  >
                    <option value="GROOM">Nhà Trai (Chú Rể)</option>
                    <option value="BRIDE">Nhà Gái (Cô Dâu)</option>
                  </select>
                </div>
              )}
            </div>
          )}

          {/* Note / Wishes */}
          {showNote && (
            <textarea
              rows={2}
              placeholder="Lời nhắn gửi tới cô dâu chú rể hoặc ghi chú món ăn..."
              className={inputClass}
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          )}

          {error && <p className="text-[11px] text-rose-600 text-center font-medium">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-bold text-white shadow-xs transition hover:brightness-110 active:scale-98 disabled:opacity-60 cursor-pointer"
            style={{ backgroundColor: buttonColor }}
          >
            {loading ? <Loader2 className="size-4 animate-spin" /> : <UserCheck className="size-4" />}
            <span>{buttonText}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
