"use client";

import React, { useCallback, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import {
  ArrowLeft,
  Check,
  ChevronDown,
  ChevronRight,
  Clipboard,
  ExternalLink,
  Eye,
  FileText,
  Heart,
  HelpCircle,
  Lightbulb,
  Loader2,
  Mail,
  MailOpen,
  MessageCircle,
  PenLine,
  Plus,
  Rocket,
  Send,
  Sparkles,
  Upload,
  Users,
  X,
} from "lucide-react";
import { ApiClient } from "@/lib/api";
import { parseGuestText } from "@/lib/guests/parse-guest-text";
import {
  buildGuestInvitation,
  copyInvitation,
  DEFAULT_INVITATION,
  openZaloShare,
} from "@/lib/guests/zalo-share";

/* ────── Types ────── */
interface GuestResult {
  id: string;
  fullName: string;
  salutation: string;
  guestToken: string;
  customUrl: string;
  group?: string | null;
  phone?: string | null;
}

interface ImportResponse {
  created: number;
  updated: number;
  skipped: number;
  errors: string[];
  items: GuestResult[];
}

const EXAMPLE_PLACEHOLDER = `Ví dụ:\nNguyễn Văn An\nTrần Thị Bình\nAnh, Lê Hoàng Cường, Bạn cấp 3\nChị, Võ Thị Em, Đồng nghiệp, 0901234567`;

function useCopyFeedback(timeout = 2000) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const copy = useCallback(
    async (id: string, text: string) => {
      await copyInvitation(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), timeout);
    },
    [timeout]
  );
  return { copiedId, copy };
}

export default function BulkSharePage() {
  const { cardId } = useParams<{ cardId: string }>();
  const router = useRouter();

  // Step 1 state
  const [paste, setPaste] = useState("");
  const [messageTemplate, setMessageTemplate] = useState(DEFAULT_INVITATION);
  const [showFormatGuide, setShowFormatGuide] = useState(false);
  const [showTemplateEditor, setShowTemplateEditor] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  // Step 2 state
  const [step, setStep] = useState<1 | 2>(1);
  const [guests, setGuests] = useState<GuestResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Copy helpers
  const linkCopy = useCopyFeedback();
  const msgCopy = useCopyFeedback();
  const bulkCopy = useCopyFeedback();

  // Parse realtime
  const parsed = useMemo(() => parseGuestText(paste), [paste]);
  const validCount = parsed.items.length;
  const errorCount = parsed.errors.length;
  const canSubmit = validCount > 0 && errorCount === 0 && !loading;

  // Submit import
  async function handleGenerate() {
    setLoading(true);
    setError("");

    const response = await ApiClient.request<ImportResponse>(
      `/cards/${cardId}/guests/import`,
      {
        method: "POST",
        headers: { "Idempotency-Key": crypto.randomUUID() },
        body: JSON.stringify({
          guests: parsed.items,
          mode: "SKIP_DUPLICATES",
        }),
      }
    );

    setLoading(false);

    if (!response.success || !response.data) {
      setError(response.error || "Không thể tạo link. Vui lòng thử lại.");
      return;
    }

    setGuests(response.data.items);
    setStep(2);

    // Confetti celebration
    setTimeout(() => {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#C77834", "#E5D7BE", "#8B1E2D", "#D4AF37", "#FFFFFF"],
      });
    }, 250);
  }

  function guestFullUrl(guest: GuestResult) {
    return new URL(guest.customUrl, window.location.origin).toString();
  }

  function guestMessage(guest: GuestResult) {
    return buildGuestInvitation(messageTemplate, {
      salutation: guest.salutation,
      fullName: guest.fullName,
      url: guestFullUrl(guest),
    });
  }

  async function handleZalo(guest: GuestResult) {
    const msg = guestMessage(guest);
    try {
      await copyInvitation(msg);
    } catch {}
    openZaloShare(guestFullUrl(guest));
  }

  async function copyAllLinks() {
    const text = guests
      .map((g) => `${g.salutation} ${g.fullName}: ${guestFullUrl(g)}`)
      .join("\n");
    await bulkCopy.copy("all-links", text);
  }

  async function copyAllMessages() {
    const text = guests.map((g) => guestMessage(g)).join("\n\n---\n\n");
    await bulkCopy.copy("all-msgs", text);
  }

  function handleReset() {
    setStep(1);
    setGuests([]);
    setPaste("");
    setError("");
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#2C1E14] font-sans selection:bg-[#E8DCCB] relative overflow-x-hidden flex flex-col justify-between">
      {/* ───────────────────────────────────────────────────────────── */}
      {/* 1. TOP MAIN HEADER & PAGE TITLE                               */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-6xl w-full px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-12 relative">
        {/* Back Link */}
        <Link
          href={`/dashboard/cards/${cardId}/guests`}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-[#7A6C5E] hover:text-[#2A1D13] transition mb-3"
        >
          <ArrowLeft className="w-4 h-4" />
          Quay lại danh sách thiệp
        </Link>

        {/* Header Row: Title & Top-Right Love Envelope Graphic */}
        <div className="flex items-start justify-between gap-4 mb-8 relative">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-[#2A1D14] tracking-tight flex items-center gap-2">
              <span className="text-[#C77834]">✦</span>
              <span>Gửi Thiệp Hàng Loạt</span>
            </h1>
            <p className="mt-1.5 text-xs sm:text-sm text-[#76685C]">
              Nhập danh sách khách mới ·· Tự động tạo link cá nhân hóa cho từng người.
            </p>
          </div>

          {/* Top-Right Envelope Graphic & Calligraphy */}
          <div className="hidden md:flex items-center gap-3 select-none pointer-events-none">
            {/* 3D Envelope illustration */}
            <div className="relative w-24 h-20">
              <svg viewBox="0 0 120 90" className="w-full h-full drop-shadow-md">
                {/* Envelope body */}
                <rect x="10" y="25" width="100" height="60" rx="8" fill="#E8DEC9" />
                {/* Paper insert with heart */}
                <rect x="20" y="10" width="80" height="45" rx="4" fill="#FFFDF9" />
                <path
                  d="M60 32 C55 24 45 25 45 33 C45 42 60 48 60 48 C60 48 75 42 75 33 C75 25 65 24 60 32 Z"
                  fill="#D47366"
                />
                {/* Envelope fold flaps */}
                <path d="M10 85 L60 52 L110 85 Z" fill="#DDD1B8" opacity="0.6" />
                <path d="M10 25 L60 55 L110 25" fill="#E5D9C2" />
              </svg>
            </div>

            {/* Handwritten calligraphy with dashed heart trail */}
            <div className="relative pt-1">
              <p className="font-serif italic text-xs sm:text-sm text-[#968372] whitespace-nowrap">
                Gửi yêu thương
                <br />
                đến nhiều người hơn ♡
              </p>
              {/* Subtle loop path */}
              <svg className="w-20 h-6 text-[#C7B59F] -mt-1" viewBox="0 0 80 25" fill="none">
                <path
                  d="M5 10 Q25 25 50 12 T75 8"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeDasharray="2 3"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Global Error Banner */}
        {error && (
          <div className="mb-6 rounded-2xl bg-rose-50 border border-rose-200 px-4 py-3 text-xs sm:text-sm text-rose-700">
            {error}
          </div>
        )}

        {/* ───────────────────────────────────────────────────────────── */}
        {/* 2. BODY TWO-COLUMN LAYOUT                                     */}
        {/* ───────────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* ══════════ LEFT COLUMN: MAIN WORKSPACE (8 COLS) ══════════ */}
          <div className="lg:col-span-8">
            {step === 1 ? (
              <div className="bg-white rounded-3xl border border-[#EFE8DD] shadow-xs p-6 sm:p-8">
                {/* Step Header Bar */}
                <div className="flex items-center justify-between pb-5 mb-5 border-b border-[#F2EAE0]">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-[#C77834] text-white flex items-center justify-center text-sm font-bold shadow-xs">
                      1
                    </span>
                    <h2 className="font-bold text-base sm:text-lg text-[#2D1F15]">
                      Nhập danh sách khách mới
                    </h2>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-[#F6ECE1] text-[#A16534] text-xs font-bold">
                    Bước 1/2
                  </span>
                </div>

                {/* Textarea Input */}
                <div className="mb-5">
                  <label className="block text-sm font-semibold text-[#2D1F15] mb-2">
                    Danh sách tên khách{" "}
                    <span className="text-[#8C7A6B] font-normal">
                      (mỗi dòng = 1 khách mới)
                    </span>
                  </label>
                  <textarea
                    rows={8}
                    value={paste}
                    onChange={(e) => setPaste(e.target.value)}
                    placeholder={EXAMPLE_PLACEHOLDER}
                    className="w-full rounded-2xl bg-white border border-[#E6DED3] p-4 text-xs sm:text-sm text-[#2D1F15] outline-none focus:border-[#C77834] focus:ring-2 focus:ring-[#C77834]/20 transition shadow-2xs font-mono leading-relaxed placeholder-[#A89A8D]"
                  />

                  {/* Realtime stats badge */}
                  {paste.trim() && (
                    <div className="mt-2.5 flex items-center gap-3">
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200/60">
                        <Check className="w-3.5 h-3.5" />
                        {validCount} khách hợp lệ
                      </span>
                      {errorCount > 0 && (
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-rose-700 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200/60">
                          {errorCount} dòng cần kiểm tra
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Accordion 1: Hướng dẫn định dạng */}
                <div className="border-t border-[#F0E8DE] py-3.5">
                  <button
                    type="button"
                    onClick={() => setShowFormatGuide(!showFormatGuide)}
                    className="w-full flex items-center justify-between text-xs sm:text-sm font-medium text-[#4A382A] hover:text-[#C77834] transition cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-xs text-[#C77834]">▶</span>
                      <span>📖 Hướng dẫn định dạng</span>
                    </span>
                    {showFormatGuide ? (
                      <ChevronDown className="w-4 h-4 text-[#8C7A6B]" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-[#8C7A6B]" />
                    )}
                  </button>

                  {showFormatGuide && (
                    <div className="mt-3 p-4 rounded-xl bg-[#FAF7F2] border border-[#EDE5DA] text-xs text-[#6B5A4B] space-y-1.5 leading-relaxed">
                      <p>
                        <strong>Cách 1 (Nhanh nhất):</strong> Chỉ cần dán họ tên khách (mỗi dòng 1 người).
                      </p>
                      <p>
                        <strong>Cách 2 (Chi tiết):</strong> Danh xưng, Họ tên, Nhóm, Số điện thoại.
                      </p>
                      <p className="text-[#8C7A6B] italic">
                        Ví dụ: Anh, Lê Hoàng Cường, Bạn cấp 3, 0901234567
                      </p>
                    </div>
                  )}
                </div>

                {/* Accordion 2: Tùy chỉnh mẫu lời mời mới */}
                <div className="border-t border-[#F0E8DE] py-3.5">
                  <button
                    type="button"
                    onClick={() => setShowTemplateEditor(!showTemplateEditor)}
                    className="w-full flex items-center justify-between text-xs sm:text-sm font-medium text-[#4A382A] hover:text-[#C77834] transition cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <span>✏️</span>
                      <span>Tùy chỉnh mẫu lời mời mới</span>
                    </span>
                    {showTemplateEditor ? (
                      <ChevronDown className="w-4 h-4 text-[#8C7A6B]" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-[#8C7A6B]" />
                    )}
                  </button>

                  {showTemplateEditor && (
                    <div className="mt-3">
                      <textarea
                        rows={3}
                        value={messageTemplate}
                        onChange={(e) => setMessageTemplate(e.target.value)}
                        className="w-full rounded-xl bg-[#FAF7F2] border border-[#E6DED3] p-3 text-xs sm:text-sm text-[#2D1F15] outline-none focus:border-[#C77834] focus:ring-1 focus:ring-[#C77834]"
                      />
                      <p className="mt-1 text-[11px] text-[#8C7A6B]">
                        Biến tự động thay thế:{" "}
                        <code className="bg-[#F0E8DE] px-1 rounded">{"{danh_xung}"}</code>,{" "}
                        <code className="bg-[#F0E8DE] px-1 rounded">{"{ten_khach}"}</code>,{" "}
                        <code className="bg-[#F0E8DE] px-1 rounded">{"{link_thiep}"}</code>
                      </p>
                    </div>
                  )}
                </div>

                {/* Bottom Action Bar */}
                <div className="mt-6 pt-5 border-t border-[#F0E8DE] flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    disabled={!canSubmit}
                    onClick={handleGenerate}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-[#C77834] to-[#A86228] hover:from-[#B36922] hover:to-[#915421] text-white text-xs sm:text-sm font-semibold shadow-md hover:shadow-lg transition active:scale-95 disabled:opacity-40 disabled:pointer-events-none"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Đang tạo link...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Tạo Link Cho {validCount} Khách Mới</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowPreviewModal(true)}
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#FAF5EE] hover:bg-[#F2ECE1] border border-[#E8DFD3] text-[#5A4B3D] text-xs sm:text-sm font-semibold transition"
                  >
                    <Eye className="w-4 h-4" />
                    <span>Xem trước</span>
                  </button>
                </div>
              </div>
            ) : (
              /* ══════════ STEP 2: DANH SÁCH LINK ĐÃ TẠO THÀNH CÔNG ══════════ */
              <div className="space-y-4">
                {/* Success Top Card */}
                <div className="bg-white rounded-3xl p-6 sm:p-7 border border-emerald-200/80 shadow-xs flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
                      <Check className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-lg sm:text-xl font-serif font-bold text-[#2D1F15]">
                        Đã tạo thành công {guests.length} link thiệp mời!
                      </h2>
                      <p className="text-xs sm:text-sm text-[#76685C] mt-0.5">
                        Copy link riêng hoặc bấm gửi Zalo từng người bên dưới.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={copyAllLinks}
                      className="px-4 py-2 rounded-xl bg-white border border-[#E0D6C8] hover:bg-[#F6F1EA] text-xs font-semibold text-[#4A382A] shadow-2xs transition"
                    >
                      {bulkCopy.copiedId === "all-links" ? "✓ Đã copy tất cả link!" : "Copy Tất Cả Link"}
                    </button>
                    <button
                      type="button"
                      onClick={copyAllMessages}
                      className="px-4 py-2 rounded-xl bg-[#FAF0E6] hover:bg-[#F5E6D8] border border-[#E8D6C4] text-xs font-semibold text-[#8A562B] transition"
                    >
                      {bulkCopy.copiedId === "all-msgs" ? "✓ Đã copy lời mời!" : "Copy Lời Mời Zalo"}
                    </button>
                    <button
                      type="button"
                      onClick={handleReset}
                      className="px-4 py-2 rounded-xl bg-[#3D2C1E] text-white hover:bg-[#2B1E14] text-xs font-semibold transition"
                    >
                      + Nhập Thêm
                    </button>
                  </div>
                </div>

                {/* Guest Link Rows */}
                <div className="bg-white rounded-3xl border border-[#EDE5DA] shadow-xs divide-y divide-[#F2EAE0] overflow-hidden">
                  {guests.map((g) => (
                    <div
                      key={g.id}
                      className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#FAF7F2]/60 transition"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm sm:text-base text-[#2D1F15]">
                            {g.salutation} {g.fullName}
                          </span>
                          {g.group && (
                            <span className="text-[11px] bg-[#F2EBE1] text-[#7A6D60] px-2 py-0.5 rounded-md font-medium">
                              {g.group}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#8C7A6B] truncate select-all mt-1 font-mono">
                          {guestFullUrl(g)}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => linkCopy.copy(g.id, guestFullUrl(g))}
                          className="px-3 py-1.5 rounded-lg border border-[#E0D6C8] hover:bg-[#F5EFE6] text-xs font-medium text-[#4A382A] transition"
                        >
                          {linkCopy.copiedId === g.id ? "Đã copy!" : "Copy Link"}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleZalo(g)}
                          className="px-3 py-1.5 rounded-lg bg-[#0068FF] hover:bg-[#0055D4] text-white text-xs font-semibold shadow-2xs transition flex items-center gap-1.5"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          Mở Zalo
                        </button>
                        <a
                          href={guestFullUrl(g)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-lg border border-[#E0D6C8] text-[#7A6C5E] hover:text-[#2A1D13] hover:bg-[#F5EFE6] transition"
                          title="Mở xem thử thiệp"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ══════════ RIGHT COLUMN: TIPS & EXAMPLE SIDEBAR (4 COLS) ══════════ */}
          <div className="lg:col-span-4 space-y-4">
            {/* Card 1: Gửi nhiều hơn, yêu thương nhiều hơn */}
            <div className="bg-white rounded-3xl p-5 border border-[#EFE8DD] shadow-xs flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-[#FFF5EB] border border-[#F5E7D8] flex items-center justify-center shrink-0">
                <MailOpen className="w-6 h-6 text-[#C77834]" />
              </div>
              <div>
                <h3 className="font-bold text-xs sm:text-sm text-[#2D1F15] leading-snug">
                  Gửi nhiều hơn,
                  <br />
                  yêu thương nhiều hơn
                </h3>
                <p className="text-[11px] text-[#7A6C5E] mt-1 leading-relaxed">
                  Tạo link cá nhân hóa cho từng người chỉ trong vài giây.
                </p>
              </div>
            </div>

            {/* Card 2: Mẹo nhỏ */}
            <div className="rounded-3xl bg-[#FAF3E8] border border-[#F0E6D8] p-5 shadow-2xs">
              <div className="flex items-center gap-2 text-[#C77834] font-bold text-sm mb-3">
                <Lightbulb className="w-4 h-4 fill-current text-[#C77834]" />
                <span>Mẹo nhỏ</span>
              </div>
              <ul className="space-y-2.5 text-xs text-[#5C4A3A]">
                <li className="flex items-start gap-2">
                  <div className="w-4 h-4 rounded-full bg-[#C77834] text-white flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-2.5 h-2.5" />
                  </div>
                  <span>Mỗi dòng chỉ một khách</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-4 h-4 rounded-full bg-[#C77834] text-white flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-2.5 h-2.5" />
                  </div>
                  <span>Có thể thêm ghi chú, số điện thoại</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-4 h-4 rounded-full bg-[#C77834] text-white flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-2.5 h-2.5" />
                  </div>
                  <span>Hệ thống sẽ tự tạo link riêng cho từng người</span>
                </li>
              </ul>
            </div>

            {/* Card 3: Ví dụ định dạng */}
            <div className="bg-white rounded-3xl p-5 border border-[#EFE8DD] shadow-xs">
              <div className="flex items-center gap-2 text-[#2D1F15] font-bold text-sm mb-3">
                <FileText className="w-4 h-4 text-[#8C7A6B]" />
                <span>Ví dụ định dạng</span>
              </div>
              <div className="rounded-2xl bg-[#FAF7F2] p-4 text-xs text-[#524438] space-y-1.5 font-mono leading-relaxed border border-[#EFE7DC]">
                <p>Nguyễn Văn An</p>
                <p>Trần Thị Bình</p>
                <p>Anh, Lê Hoàng Cường, Bạn cấp 3</p>
                <p>Chị, Võ Thị Em, Đồng nghiệp, 0901234567</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 3. BOTANICAL ILLUSTRATION & CALLIGRAPHY FOOTER ELEMENTS       */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-6 flex items-end justify-between select-none pointer-events-none opacity-85">
        {/* Bottom-Left: Plant in ceramic vase + Calligraphy */}
        <div className="flex items-end gap-3">
          {/* Ceramic potted plant vector */}
          <div className="relative w-16 sm:w-20">
            <svg viewBox="0 0 100 130" className="w-full h-auto">
              {/* Leaves */}
              <path
                d="M50 80 C30 50 15 30 20 10 C35 25 45 55 50 80 Z"
                fill="#5E7D63"
                opacity="0.85"
              />
              <path
                d="M50 75 C65 45 85 30 80 10 C65 25 55 55 50 75 Z"
                fill="#4E6B53"
                opacity="0.9"
              />
              <path
                d="M50 70 C40 40 45 20 50 5 C55 20 60 40 50 70 Z"
                fill="#6F8F75"
                opacity="0.8"
              />
              <path
                d="M50 85 C20 70 5 60 10 40 C25 50 40 70 50 85 Z"
                fill="#547359"
                opacity="0.75"
              />
              <path
                d="M50 85 C80 70 95 60 90 40 C75 50 60 70 50 85 Z"
                fill="#547359"
                opacity="0.75"
              />
              {/* Ceramic vase */}
              <path
                d="M38 78 Q50 82 62 78 L66 90 Q85 105 75 125 L25 125 Q15 105 34 90 Z"
                fill="#E8DEC9"
                stroke="#D8CCB6"
                strokeWidth="1.5"
              />
            </svg>
            {/* Calligraphy on vase / side */}
            <div className="absolute -bottom-1 -left-2 sm:left-0 text-[11px] sm:text-xs font-serif italic text-[#8F7C6B] whitespace-nowrap">
              Kết nối
              <br />
              những điều tốt đẹp ♡
            </div>
          </div>
        </div>

        {/* Bottom-Right: Calligraphy flourish */}
        <div className="text-right">
          <p className="font-serif italic text-xs sm:text-sm text-[#968372]">
            Một tấm thiệp
            <br />
            ngàn cảm xúc ♡
          </p>
          <svg className="w-24 h-4 text-[#D2C2AD] ml-auto mt-0.5" viewBox="0 0 100 20" fill="none">
            <path
              d="M10 15 Q50 5 90 10"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 4. MODAL XEM TRƯỚC LỜI MỜI                                    */}
      {/* ───────────────────────────────────────────────────────────── */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-[#FAF7F2] border border-[#E5DDD2] rounded-3xl p-6 max-w-md w-full shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-[#EDE5DA]">
              <h3 className="font-serif font-bold text-lg text-[#2D1F15]">
                Xem trước lời mời mẫu
              </h3>
              <button
                type="button"
                onClick={() => setShowPreviewModal(false)}
                className="p-1 rounded-full text-[#8C7A6B] hover:bg-[#EFE7DC] transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 p-4 rounded-2xl bg-white border border-[#EDE5DA] text-xs sm:text-sm text-[#4E4034] leading-relaxed">
              {buildGuestInvitation(messageTemplate, {
                salutation: parsed.items[0]?.salutation || "Bạn",
                fullName: parsed.items[0]?.fullName || "Nguyễn Văn An",
                url: `${typeof window !== "undefined" ? window.location.origin : ""}/thiep/demo?g=sample`,
              })}
            </div>

            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => setShowPreviewModal(false)}
                className="px-5 py-2 rounded-xl bg-[#3D2C1E] text-white text-xs sm:text-sm font-semibold hover:bg-[#2B1E14] transition"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
