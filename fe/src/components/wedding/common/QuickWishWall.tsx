"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Heart, MessageSquareHeart, Sparkles, Check } from "lucide-react";
import { ApiClient } from "@/lib/api";

interface QuickWishWallProps {
  cardId: string;
  accentColor?: string;
  guestName?: string;
}

interface DisplayWish {
  id: string;
  author: string;
  content: string;
  time: string;
}

const SAMPLE_WISHES: DisplayWish[] = [
  {
    id: "w1",
    author: "Gia đình Bác Hải",
    content: "Chúc hai cháu trăm năm hạnh phúc, tình duyên bền chặt, cùng nhau xây đắp tổ ấm viên mãn!",
    time: "Vừa xong",
  },
  {
    id: "w2",
    author: "Bạn Thu Trang",
    content: "Chúc cô dâu xinh đẹp và chú rể phong độ mãi mãi ngọt ngào như những ngày đầu tiên nhé!",
    time: "10 phút trước",
  },
  {
    id: "w3",
    author: "Nhóm Bạn Cấp 3",
    content: "Cuối cùng cũng thấy hai đứa về chung một nhà! Chúc mừng ngày đại hỷ của cặp đôi vàng!",
    time: "30 phút trước",
  },
  {
    id: "w4",
    author: "Anh Tuấn & Chị Lan",
    content: "Chúc tân lang tân nương bách niên giai lão, sự nghiệp thăng hoa, gia đạo an khang!",
    time: "1 giờ trước",
  },
];

export const QuickWishWall: React.FC<QuickWishWallProps> = ({
  cardId,
  accentColor = "#B84A39",
  guestName = "",
}) => {
  const [wishes, setWishes] = useState<DisplayWish[]>(SAMPLE_WISHES);
  const [name, setName] = useState(guestName);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !message.trim()) return;

    setSubmitting(true);
    try {
      if (cardId) {
        await ApiClient.request(`/wishes/${cardId}`, {
          method: "POST",
          body: JSON.stringify({
            senderName: name.trim(),
            message: message.trim(),
          }),
        });
      }
    } catch {
      // Optimistic fallback
    } finally {
      const newWish: DisplayWish = {
        id: Date.now().toString(),
        author: name.trim(),
        content: message.trim(),
        time: "Vừa xong",
      };
      setWishes([newWish, ...wishes]);
      setMessage("");
      setSubmitting(false);
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3500);
    }
  };

  return (
    <div className="py-6 px-4 space-y-5 text-center">
      <div className="space-y-1">
        <span
          className="text-[10px] font-mono uppercase tracking-[0.3em] font-bold block"
          style={{ color: accentColor }}
        >
          GUESTBOOK &amp; WISHES
        </span>
        <h3 className="text-xl sm:text-2xl font-serif italic font-bold text-stone-900">
          Sổ Lưu Bút Chúc Phúc
        </h3>
        <p className="text-xs text-stone-500 italic max-w-xs mx-auto">
          Gửi gắm những lời chúc yêu thương đến cô dâu và chú rể
        </p>
      </div>

      {/* Form gửi lời chúc nhanh */}
      <div className="max-w-sm mx-auto p-4 rounded-3xl bg-white/85 border border-stone-200/80 shadow-xs backdrop-blur-xs text-left">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-[11px] font-serif font-bold text-stone-700 mb-1">
              Tên của bạn
            </label>
            <input
              type="text"
              placeholder="Nhập họ tên của bạn..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50/50 focus:outline-none focus:ring-1 text-stone-800 transition"
              style={{ outlineColor: accentColor }}
            />
          </div>

          <div>
            <label className="block text-[11px] font-serif font-bold text-stone-700 mb-1">
              Lời chúc phúc
            </label>
            <textarea
              placeholder="Gửi lời chúc hạnh phúc trăm năm đến cô dâu &amp; chú rể..."
              rows={2}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50/50 focus:outline-none focus:ring-1 text-stone-800 resize-none transition"
              style={{ outlineColor: accentColor }}
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 rounded-xl text-white text-xs font-bold font-sans shadow-sm flex items-center justify-center gap-2 cursor-pointer transition disabled:opacity-60"
            style={{ backgroundColor: accentColor }}
          >
            {submitted ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Đã Gửi Lời Chúc Phúc!</span>
              </>
            ) : submitting ? (
              <span>Đang gửi...</span>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span>Gửi Lời Chúc</span>
              </>
            )}
          </motion.button>
        </form>
      </div>

      {/* Danh sách lời chúc cuộn hiển thị */}
      <div className="max-w-sm mx-auto space-y-2.5 text-left">
        <AnimatePresence>
          {wishes.slice(0, 4).map((w, idx) => (
            <motion.div
              key={w.id || idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="p-3.5 rounded-2xl bg-white/70 border border-stone-100 shadow-2xs space-y-1 backdrop-blur-2xs"
            >
              <div className="flex items-center justify-between">
                <span className="font-serif font-bold text-xs text-stone-800 flex items-center gap-1.5">
                  <MessageSquareHeart className="w-3.5 h-3.5" style={{ color: accentColor }} />
                  {w.author}
                </span>
                <span className="text-[10px] text-stone-400 font-sans">{w.time}</span>
              </div>
              <p className="text-[11px] text-stone-600 leading-relaxed italic font-serif">
                “{w.content}”
              </p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};
