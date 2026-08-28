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

const SAMPLE_DEMO_WISHES: WishItem[] = [
  {
    id: "demo-w-1",
    senderName: "Bảo Châu & Tuấn Anh",
    relationship: "Bạn Đại Học",
    content: "Chúc hai bạn trăm năm hạnh phúc, cùng nhau đi qua mọi thăng trầm cuộc đời và luôn ngọt ngào như ngày đầu tiên nhé! 🎉💐",
    emoji: "🥂",
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
  {
    id: "demo-w-2",
    senderName: "Gia đình Bác Thành",
    relationship: "Gia Đình Nhà Trai",
    content: "Chúc mừng hạnh phúc hai cháu Minh Khôi & Ngọc Hân. Chúc hai cháu răng long đầu bạc, con cháu sum vầy, sự nghiệp hanh thông! ❤️",
    emoji: "❤️",
    createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
  },
  {
    id: "demo-w-3",
    senderName: "Hải Đăng (Designer)",
    relationship: "Đồng Nghiệp Cô Dâu",
    content: "Thiệp cưới xinh xỉu luôn Khôi - Hân ơi! Hẹn gặp 2 bạn trong ngày trọng đại để nâng ly chúc mừng nha! ✨",
    emoji: "✨",
    createdAt: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
  },
];

export const GuestbookSection: React.FC<GuestbookSectionProps> = ({
  cardId,
  primaryColor = "#D4AF37",
}) => {
  const { t } = useLanguage();
  const [wishes, setWishes] = useState<WishItem[]>(SAMPLE_DEMO_WISHES);
  const [senderName, setSenderName] = useState("");
  const [relationship, setRelationship] = useState("");
  const [content, setContent] = useState("");
  const [selectedEmoji, setSelectedEmoji] = useState("❤️");

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const fetchWishes = async () => {
    if (!cardId || cardId.startsWith("demo-")) {
      setWishes(SAMPLE_DEMO_WISHES);
      return;
    }
    setLoading(true);
    try {
      const res = await ApiClient.request(`/wishes/${cardId}?limit=30`);
      if (res.success && res.data && res.data.items && res.data.items.length > 0) {
        setWishes(res.data.items);
      } else {
        setWishes(SAMPLE_DEMO_WISHES);
      }
    } catch {
      setWishes(SAMPLE_DEMO_WISHES);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishes();
  }, [cardId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!senderName.trim() || !content.trim()) return;

    setSubmitting(true);
    setSuccessMsg("");

    const newWish: WishItem = {
      id: `wish-${Date.now()}`,
      senderName: senderName.trim(),
      relationship: relationship.trim() || undefined,
      content: content.trim(),
      emoji: selectedEmoji,
      createdAt: new Date().toISOString(),
    };

    // Optimistically add wish to state immediately
    setWishes((prev) => [newWish, ...prev]);

    if (!cardId || !cardId.startsWith("demo-")) {
      try {
        await ApiClient.request("/wishes", {
          method: "POST",
          body: JSON.stringify({
            cardId,
            senderName: senderName.trim(),
            relationship: relationship.trim() || undefined,
            content: content.trim(),
            emoji: selectedEmoji,
          }),
        });
      } catch {
        // keep local state
      }
    }

    setSubmitting(false);
    setSuccessMsg(t("wishSuccess") || "Gửi lời chúc thành công! Cảm ơn bạn rất nhiều! ✨");
    setContent("");
    setTimeout(() => setSuccessMsg(""), 4000);
  };

  return (
    <section className="w-full max-w-lg mx-auto my-6 sm:my-8 px-4 sm:px-6 pb-6">
      <div className="text-center mb-4 sm:mb-6">
        <div
          className="inline-flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full mb-1.5 sm:mb-2 bg-[#FAF2E6] border border-[#E8D9C5] shadow-2xs"
        >
          <MessageSquare className="w-4 h-4 text-[#BE944E]" />
        </div>
        <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#6D4C33]">
          {t("guestbookTitle") || "Sổ Lưu Bút & Lời Chúc"}
        </h2>
        <p className="text-[11px] sm:text-xs text-[#8C6D53] mt-0.5 sm:mt-1 font-light leading-relaxed">
          {t("guestbookSubtitle") || "Hãy để lại những lời chúc phúc ngọt ngào nhất dành cho chúng mình nhé!"}
        </p>
      </div>

      {/* FORM GỬI LỜI CHÚC */}
      <form
        onSubmit={handleSubmit}
        className="bg-gradient-to-b from-[#FDFBF7] to-[#FAF6F0] p-4 sm:p-6 rounded-2xl sm:rounded-[28px] border border-[#EAE0D2] shadow-xs space-y-3 sm:space-y-3.5 mb-6 sm:mb-8"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <input
            type="text"
            required
            placeholder={t("yourName") || "Tên của bạn *"}
            value={senderName}
            onChange={(e) => setSenderName(e.target.value)}
            className="w-full px-3.5 py-2.5 text-base sm:text-xs rounded-xl border border-[#DFCEBA] focus:outline-none focus:ring-2 focus:ring-[#BE944E]/30 bg-white placeholder:text-stone-400 font-medium text-stone-800"
          />
          <input
            type="text"
            placeholder={t("relationship") || "Mối quan hệ (VD: Bạn thân)"}
            value={relationship}
            onChange={(e) => setRelationship(e.target.value)}
            className="w-full px-3.5 py-2.5 text-base sm:text-xs rounded-xl border border-[#DFCEBA] focus:outline-none focus:ring-2 focus:ring-[#BE944E]/30 bg-white placeholder:text-stone-400 font-medium text-stone-800"
          />
        </div>

        <textarea
          rows={3}
          required
          placeholder={t("writeWish") || "Viết lời chúc của bạn ở đây..."}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full px-3.5 py-2.5 text-base sm:text-xs rounded-xl border border-[#DFCEBA] focus:outline-none focus:ring-2 focus:ring-[#BE944E]/30 bg-white placeholder:text-stone-400 font-medium text-stone-800 resize-none"
        />

        {/* EMOJI SELECTOR & SUBMIT */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          <div className="flex items-center gap-1 overflow-x-auto py-1 max-w-full">
            {EMOJI_OPTIONS.map((em) => (
              <button
                key={em}
                type="button"
                onClick={() => setSelectedEmoji(em)}
                className={`p-1 sm:p-1.5 text-base sm:text-lg rounded-lg transition cursor-pointer min-w-[34px] min-h-[34px] flex items-center justify-center ${
                  selectedEmoji === em
                    ? "bg-[#FAF2E6] border border-[#BE944E]/50 scale-110 shadow-2xs"
                    : "hover:bg-white active:bg-stone-100"
                }`}
              >
                {em}
              </button>
            ))}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-5 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl bg-gradient-to-r from-[#A6784D] to-[#8C6038] active:scale-[0.98] text-white shadow-sm transition cursor-pointer disabled:opacity-50 min-h-[40px]"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{submitting ? "..." : t("sendWish") || "Gửi Lời Chúc"}</span>
          </button>
        </div>

        {successMsg && (
          <p className="text-xs text-emerald-700 text-center font-medium pt-1 bg-emerald-50 py-2 rounded-xl border border-emerald-200">
            {successMsg}
          </p>
        )}
      </form>

      {/* DANH SÁCH LỜI CHÚC */}
      <div className="space-y-2.5 sm:space-y-3">
        {wishes.length > 0 ? (
          wishes.map((w) => (
            <div
              key={w.id}
              className="p-3.5 sm:p-4 rounded-2xl bg-white border border-[#EAE0D2] shadow-2xs flex items-start gap-3"
            >
              <div className="text-xl sm:text-2xl pt-0.5 select-none">{w.emoji || "❤️"}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-2">
                  <h4 className="text-xs font-bold text-[#6D4C33] truncate">
                    {w.senderName}
                    {w.relationship && (
                      <span className="ml-1.5 font-normal text-[10px] text-[#9C795E]">
                        ({w.relationship})
                      </span>
                    )}
                  </h4>
                  <span className="text-[9.5px] sm:text-[10px] text-stone-400 shrink-0">
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
          <div className="p-6 sm:p-8 text-center bg-gradient-to-b from-[#FDFBF7] to-[#FAF6F0] rounded-2xl border border-dashed border-[#DFCEBA] text-[#8C6D53] text-xs">
            {t("emptyWishes") || "Chưa có lời chúc nào. Hãy là người đầu tiên gửi lời chúc nhé! ✨"}
          </div>
        )}
      </div>
    </section>
  );
};

