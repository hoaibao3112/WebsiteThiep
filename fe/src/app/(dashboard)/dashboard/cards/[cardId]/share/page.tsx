"use client";

import { useCallback, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import {
  ArrowLeft,
  Check,
  Clipboard,
  ExternalLink,
  Loader2,
  MessageCircle,
  PenLine,
  Rocket,
  Send,
  Sparkles,
  Users,
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

/* ────── Constants ────── */
const EXAMPLE_PLACEHOLDER = `Nguyễn Văn An
Trần Thị Bình
Anh, Lê Hoàng Cường, Bạn cấp 3
Chị, Võ Thị Em, Đồng nghiệp, 0901234567`;

/* ────── Animation variants ────── */
const containerVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
  },
  exit: {
    opacity: 0,
    y: -24,
    transition: { duration: 0.3 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 16, scale: 0.97 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { delay: i * 0.07, duration: 0.45, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

/* ────── Copy-button hook ────── */
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

/* ────── Main Page ────── */
export default function SharePage() {
  const { cardId } = useParams<{ cardId: string }>();

  // Step 1 state
  const [paste, setPaste] = useState("");
  const [messageTemplate, setMessageTemplate] = useState(DEFAULT_INVITATION);
  const [showTemplateEditor, setShowTemplateEditor] = useState(false);

  // Step 2 state
  const [step, setStep] = useState<1 | 2>(1);
  const [guests, setGuests] = useState<GuestResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Copy feedback
  const linkCopy = useCopyFeedback();
  const msgCopy = useCopyFeedback();
  const bulkCopy = useCopyFeedback();

  // Parse realtime
  const parsed = useMemo(() => parseGuestText(paste), [paste]);
  const validCount = parsed.items.length;
  const errorCount = parsed.errors.length;
  const canSubmit = validCount > 0 && errorCount === 0 && !loading;

  // Submit: import guests → get links
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

    // 🎉 Confetti celebration
    setTimeout(() => {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ["#D4AF37", "#FFC0CB", "#8B9D83", "#FFD700", "#FF69B4"],
      });
    }, 300);
  }

  // Build full URL for a guest
  function guestFullUrl(guest: GuestResult) {
    return new URL(guest.customUrl, window.location.origin).toString();
  }

  // Build invitation message for a guest
  function guestMessage(guest: GuestResult) {
    return buildGuestInvitation(messageTemplate, {
      salutation: guest.salutation,
      fullName: guest.fullName,
      url: guestFullUrl(guest),
    });
  }

  // Share via Zalo
  async function handleZalo(guest: GuestResult) {
    const msg = guestMessage(guest);
    try {
      await copyInvitation(msg);
    } catch {
      /* clipboard may not be available */
    }
    openZaloShare(guestFullUrl(guest));
  }

  // Bulk copy all links
  async function copyAllLinks() {
    const text = guests.map((g) => `${g.salutation} ${g.fullName}: ${guestFullUrl(g)}`).join("\n");
    await bulkCopy.copy("all-links", text);
  }

  // Bulk copy all messages
  async function copyAllMessages() {
    const text = guests.map((g) => guestMessage(g)).join("\n\n---\n\n");
    await bulkCopy.copy("all-msgs", text);
  }

  // Reset to step 1
  function handleReset() {
    setStep(1);
    setGuests([]);
    setPaste("");
    setError("");
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href={`/dashboard/cards/${cardId}/guests`}
          className="inline-flex items-center gap-1.5 text-sm text-stone-500 transition-colors hover:text-stone-900"
        >
          <ArrowLeft className="size-4" />
          Quay lại danh sách khách mời
        </Link>
        <h1 className="mt-3 text-2xl font-bold tracking-tight text-stone-950 sm:text-3xl">
          <Sparkles className="mr-2 inline size-7 text-amber-500" />
          Gửi Thiệp Hàng Loạt
        </h1>
        <p className="mt-2 text-sm text-stone-500">
          Nhập danh sách tên khách mời → tự động tạo link cá nhân hóa cho từng
          người.
        </p>
      </div>

      {/* Error */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          role="alert"
          className="mb-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800"
        >
          {error}
        </motion.div>
      )}

      <AnimatePresence mode="wait">
        {/* ══════ STEP 1: NHẬP TÊN ══════ */}
        {step === 1 && (
          <motion.div
            key="step-1"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* Main card */}
            <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
              {/* Step indicator */}
              <div className="flex items-center gap-3 border-b border-stone-100 bg-gradient-to-r from-amber-50/80 to-rose-50/60 px-5 py-3">
                <span className="flex size-7 items-center justify-center rounded-full bg-amber-500 text-xs font-bold text-white">
                  1
                </span>
                <span className="text-sm font-semibold text-stone-800">
                  Nhập danh sách khách mời
                </span>
              </div>

              <div className="p-5">
                {/* Textarea */}
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-stone-700">
                    Danh sách tên{" "}
                    <span className="font-normal text-stone-400">
                      (mỗi dòng = 1 khách mời)
                    </span>
                  </span>
                  <textarea
                    id="share-guest-input"
                    value={paste}
                    onChange={(e) => setPaste(e.target.value)}
                    rows={8}
                    placeholder={EXAMPLE_PLACEHOLDER}
                    className="w-full rounded-xl border border-stone-200 bg-stone-50/50 p-4 text-sm leading-relaxed text-stone-800 outline-none transition-all placeholder:text-stone-400 focus:border-amber-300 focus:bg-white focus:ring-2 focus:ring-amber-200/50"
                  />
                </label>

                {/* Parse stats */}
                {paste.trim() && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mt-3 flex flex-wrap items-center gap-3"
                  >
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                      <Users className="size-3.5" />
                      {validCount} khách hợp lệ
                    </span>
                    {errorCount > 0 && (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-3 py-1 text-xs font-medium text-rose-700">
                        {errorCount} dòng lỗi
                      </span>
                    )}
                  </motion.div>
                )}

                {/* Format hint */}
                <details className="mt-4 text-xs text-stone-500">
                  <summary className="cursor-pointer font-medium hover:text-stone-700">
                    📖 Hướng dẫn định dạng
                  </summary>
                  <div className="mt-2 space-y-1 rounded-lg bg-stone-50 p-3">
                    <p>
                      <strong>Đơn giản:</strong> Mỗi dòng chỉ cần nhập tên
                    </p>
                    <p>
                      <strong>Đầy đủ:</strong> Danh xưng, Họ tên, Nhóm, SĐT
                    </p>
                    <p className="text-stone-400">
                      Ví dụ: Anh, Nguyễn Văn An, Bạn đại học, 0901234567
                    </p>
                  </div>
                </details>

                {/* Message template */}
                <div className="mt-5 border-t border-stone-100 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowTemplateEditor(!showTemplateEditor)}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-stone-600 transition-colors hover:text-stone-900"
                  >
                    <PenLine className="size-4" />
                    Tùy chỉnh mẫu lời mời
                  </button>

                  <AnimatePresence>
                    {showTemplateEditor && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <textarea
                          value={messageTemplate}
                          onChange={(e) => setMessageTemplate(e.target.value)}
                          rows={3}
                          className="mt-3 w-full rounded-xl border border-stone-200 bg-stone-50/50 p-3 text-sm text-stone-700 outline-none focus:border-amber-300 focus:ring-2 focus:ring-amber-200/50"
                        />
                        <p className="mt-1.5 text-xs text-stone-400">
                          Biến:{" "}
                          <code className="rounded bg-stone-100 px-1">
                            {"{danh_xung}"}
                          </code>{" "}
                          <code className="rounded bg-stone-100 px-1">
                            {"{ten_khach}"}
                          </code>{" "}
                          <code className="rounded bg-stone-100 px-1">
                            {"{link_thiep}"}
                          </code>
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Submit */}
              <div className="border-t border-stone-100 bg-stone-50/50 px-5 py-4">
                <button
                  id="share-generate-btn"
                  disabled={!canSubmit}
                  onClick={handleGenerate}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-amber-500/25 transition-all hover:shadow-xl hover:shadow-amber-500/30 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none sm:w-auto"
                >
                  {loading ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Đang tạo link...
                    </>
                  ) : (
                    <>
                      <Sparkles className="size-4" />
                      Tạo Link Cho {validCount} Khách Mời
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* ══════ STEP 2: DANH SÁCH LINK ══════ */}
        {step === 2 && (
          <motion.div
            key="step-2"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* Success header */}
            <div className="mb-6 overflow-hidden rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50 shadow-sm">
              <div className="flex items-center gap-3 px-5 py-4">
                <span className="flex size-10 items-center justify-center rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/30">
                  <Check className="size-5 text-white" />
                </span>
                <div>
                  <h2 className="font-bold text-emerald-900">
                    Đã tạo thành công {guests.length} link mời!
                  </h2>
                  <p className="text-sm text-emerald-700/80">
                    Copy link hoặc lời mời bên dưới để gửi cho khách.
                  </p>
                </div>
              </div>
            </div>

            {/* Bulk actions */}
            <div className="mb-4 flex flex-wrap gap-2">
              <button
                id="share-copy-all-links"
                onClick={copyAllLinks}
                className="inline-flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm font-medium text-stone-700 shadow-sm transition-all hover:bg-stone-50 hover:shadow"
              >
                {bulkCopy.copiedId === "all-links" ? (
                  <>
                    <Check className="size-4 text-emerald-500" />
                    <span className="text-emerald-600">Đã sao chép!</span>
                  </>
                ) : (
                  <>
                    <Clipboard className="size-4" />
                    Copy Tất Cả Link
                  </>
                )}
              </button>

              <button
                id="share-copy-all-msgs"
                onClick={copyAllMessages}
                className="inline-flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm font-medium text-stone-700 shadow-sm transition-all hover:bg-stone-50 hover:shadow"
              >
                {bulkCopy.copiedId === "all-msgs" ? (
                  <>
                    <Check className="size-4 text-emerald-500" />
                    <span className="text-emerald-600">Đã sao chép!</span>
                  </>
                ) : (
                  <>
                    <Send className="size-4" />
                    Copy Tất Cả Lời Mời
                  </>
                )}
              </button>

              <button
                onClick={handleReset}
                className="ml-auto inline-flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm font-medium text-amber-700 transition-all hover:bg-amber-100"
              >
                <Rocket className="size-4" />
                Tạo Thêm
              </button>
            </div>

            {/* Guest link cards */}
            <div className="space-y-3">
              {guests.map((guest, i) => (
                <motion.article
                  key={guest.id}
                  custom={i}
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  className="group overflow-hidden rounded-2xl border border-stone-200/80 bg-white/80 shadow-sm backdrop-blur-sm transition-all hover:border-amber-200 hover:shadow-md"
                >
                  <div className="p-4 sm:p-5">
                    {/* Guest name */}
                    <div className="mb-3 flex items-center gap-3">
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-rose-400 text-sm font-bold text-white shadow-md shadow-amber-400/20">
                        {guest.fullName.charAt(0).toUpperCase()}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-stone-900">
                          {guest.salutation} {guest.fullName}
                        </p>
                        {guest.group && (
                          <p className="truncate text-xs text-stone-500">
                            {guest.group}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Link display */}
                    <div className="mb-3 rounded-lg bg-stone-50 px-3 py-2">
                      <p className="truncate text-xs text-stone-500 select-all">
                        {guestFullUrl(guest)}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2">
                      {/* Copy Link */}
                      <button
                        onClick={() =>
                          linkCopy.copy(guest.id, guestFullUrl(guest))
                        }
                        className="inline-flex items-center gap-1.5 rounded-lg border border-stone-200 px-3 py-2 text-xs font-medium text-stone-600 transition-all hover:border-stone-300 hover:bg-stone-50"
                      >
                        {linkCopy.copiedId === guest.id ? (
                          <>
                            <Check className="size-3.5 text-emerald-500" />
                            <span className="text-emerald-600">Đã copy!</span>
                          </>
                        ) : (
                          <>
                            <Clipboard className="size-3.5" />
                            Copy Link
                          </>
                        )}
                      </button>

                      {/* Copy Invitation */}
                      <button
                        onClick={() =>
                          msgCopy.copy(guest.id, guestMessage(guest))
                        }
                        className="inline-flex items-center gap-1.5 rounded-lg border border-stone-200 px-3 py-2 text-xs font-medium text-stone-600 transition-all hover:border-stone-300 hover:bg-stone-50"
                      >
                        {msgCopy.copiedId === guest.id ? (
                          <>
                            <Check className="size-3.5 text-emerald-500" />
                            <span className="text-emerald-600">Đã copy!</span>
                          </>
                        ) : (
                          <>
                            <PenLine className="size-3.5" />
                            Copy Lời Mời
                          </>
                        )}
                      </button>

                      {/* Open Zalo */}
                      <button
                        onClick={() => handleZalo(guest)}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-[#0068ff] px-3 py-2 text-xs font-semibold text-white shadow-sm shadow-blue-500/20 transition-all hover:bg-[#0055d4] hover:shadow-md"
                      >
                        <MessageCircle className="size-3.5" />
                        Mở Zalo
                      </button>

                      {/* Preview link */}
                      <a
                        href={guestFullUrl(guest)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-lg border border-stone-200 px-3 py-2 text-xs font-medium text-stone-500 transition-all hover:border-stone-300 hover:text-stone-700"
                      >
                        <ExternalLink className="size-3.5" />
                        Xem thử
                      </a>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>

            {/* Back to guests */}
            <div className="mt-8 text-center">
              <Link
                href={`/dashboard/cards/${cardId}/guests`}
                className="inline-flex items-center gap-2 text-sm font-medium text-stone-500 transition-colors hover:text-stone-800"
              >
                <Users className="size-4" />
                Xem toàn bộ danh sách khách mời
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
