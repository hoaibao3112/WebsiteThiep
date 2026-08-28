"use client";

import React, { useState, useEffect } from "react";
import { MessageSquare, Send } from "lucide-react";
import { ApiClient } from "@/lib/api";
import { useLanguage } from "@/context/LanguageContext";

interface WishItem {
  id: string;
  senderName: string;
  relationship?: string | null;
  content: string;
  emoji?: string | null;
  createdAt: string | Date;
}

interface GuestbookSectionProps {
  cardId: string;
  primaryColor?: string;
}

const EMOJI_OPTIONS = ["❤️", "🥂", "🎉", "💐", "✨", "💍", "🥰", "🥳"];

export const GuestbookSection: React.FC<GuestbookSectionProps> = ({
  cardId,
  primaryColor = "#D4AF37",
}) => {
  const { t } = useLanguage();
  const [wishes, setWishes] = useState<WishItem[]>([]);
  const [senderName, setSenderName] = useState("");
  const [relationship, setRelationship] = useState("");
  const [content, setContent] = useState("");
  const [selectedEmoji, setSelectedEmoji] = useState("❤️");

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const fetchWishes = async () => {
    setLoading(true);
    const res = await ApiClient.request(`/wishes/${cardId}?limit=30`);
    if (res.success && res.data) {
      setWishes(res.data.items || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchWishes();
  }, [cardId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!senderName.trim() || !content.trim()) return;

    setSubmitting(true);
    setSuccessMsg("");

    const res = await ApiClient.request("/wishes", {
      method: "POST",
      body: JSON.stringify({
        cardId,
        senderName: senderName.trim(),
        relationship: relationship.trim() || undefined,
        content: content.trim(),
        emoji: selectedEmoji,
      }),
    });

    setSubmitting(false);
    if (res.success) {
      setSuccessMsg(t("wishSuccess"));
      setContent("");
      fetchWishes();
      setTimeout(() => setSuccessMsg(""), 4000);
    }
  };

  return (
    <section className="w-full max-w-lg mx-auto my-12 px-4">
      <div className="text-center mb-6">
        <div
          className="inline-flex items-center justify-center w-10 h-10 rounded-full mb-2 shadow-xs"
          style={{ backgroundColor: `${primaryColor}20` }}
        >
          <MessageSquare className="w-5 h-5" style={{ color: primaryColor }} />
        </div>
        <h2 className="text-2xl font-bold font-serif text-stone-800">
          {t("guestbookTitle")}
        </h2>
        <p className="text-xs text-stone-500 mt-1">
          {t("guestbookSubtitle")}
        </p>
      </div>

      {/* FORM GỬI LỜI CHÚC */}
      <form
        onSubmit={handleSubmit}
        className="bg-white p-5 rounded-3xl border border-stone-200/80 shadow-md space-y-3 mb-8"
      >
        <div className="grid grid-cols-2 gap-2">
          <input
            type="text"
            required
            placeholder={t("yourName")}
            value={senderName}
            onChange={(e) => setSenderName(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/40 bg-stone-50"
          />
          <input
            type="text"
            placeholder={t("relationship")}
            value={relationship}
            onChange={(e) => setRelationship(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/40 bg-stone-50"
          />
        </div>

        <textarea
          rows={3}
          required
          placeholder={t("writeWish")}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/40 bg-stone-50"
        />

        {/* EMOJI SELECTOR */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-1.5">
            {EMOJI_OPTIONS.map((em) => (
              <button
                key={em}
                type="button"
                onClick={() => setSelectedEmoji(em)}
                className={`p-1 text-base rounded-md transition cursor-pointer ${
                  selectedEmoji === em
                    ? "bg-amber-100 scale-125 shadow-xs"
                    : "hover:bg-stone-100"
                }`}
              >
                {em}
              </button>
            ))}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl text-white shadow-md transition cursor-pointer disabled:opacity-50"
            style={{ backgroundColor: primaryColor }}
          >
            <Send className="w-3.5 h-3.5" />
            <span>{submitting ? "..." : t("sendWish")}</span>
          </button>
        </div>

        {successMsg && (
          <p className="text-xs text-emerald-600 text-center font-medium pt-1">
            {successMsg}
          </p>
        )}
      </form>

      {/* DANH SÁCH LỜI CHÚC */}
      <div className="space-y-3">
        {wishes.length > 0 ? (
          wishes.map((w) => (
            <div
              key={w.id}
              className="p-4 rounded-2xl bg-white/90 backdrop-blur-xs border border-stone-200/60 shadow-xs flex items-start gap-3"
            >
              <div className="text-2xl pt-0.5 select-none">{w.emoji || "❤️"}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-2">
                  <h4 className="text-xs font-bold text-stone-800 truncate">
                    {w.senderName}
                    {w.relationship && (
                      <span className="ml-1.5 font-normal text-[10px] text-stone-400">
                        ({w.relationship})
                      </span>
                    )}
                  </h4>
                  <span className="text-[10px] text-stone-400 shrink-0">
                    {new Date(w.createdAt).toLocaleDateString("vi-VN")}
                  </span>
                </div>
                <p className="text-xs text-stone-600 mt-1 leading-relaxed break-words">
                  {w.content}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="p-8 text-center bg-white/60 rounded-2xl border border-dashed border-stone-200 text-stone-400 text-xs">
            {t("emptyWishes")}
          </div>
        )}
      </div>
    </section>
  );
};
