"use client";

import React, { useState } from "react";
import { Sparkles, Check } from "lucide-react";
import confetti from "canvas-confetti";
import { useLanguage } from "@/context/LanguageContext";

interface BocDoItem {
  id: string;
  nameVi: string;
  nameEn: string;
  nameZh: string;
  icon: string;
  meaningVi: string;
  meaningEn: string;
  meaningZh: string;
  votes: number;
}

const INITIAL_ITEMS: BocDoItem[] = [
  {
    id: "1",
    nameVi: "Ống Nghe",
    nameEn: "Stethoscope",
    nameZh: "听诊器",
    icon: "🩺",
    meaningVi: "Bác sĩ / Y dược",
    meaningEn: "Doctor / Medicine",
    meaningZh: "医生 / 医疗",
    votes: 42,
  },
  {
    id: "2",
    nameVi: "Laptop",
    nameEn: "Laptop",
    nameZh: "电脑",
    icon: "💻",
    meaningVi: "Lập trình viên / Công nghệ",
    meaningEn: "Developer / Tech",
    meaningZh: "程序员 / 科技",
    votes: 56,
  },
  {
    id: "3",
    nameVi: "Cây Bút",
    nameEn: "Pen",
    nameZh: "毛笔 / 钢笔",
    icon: "🖋️",
    meaningVi: "Nhà văn / Nhà giáo",
    meaningEn: "Writer / Scholar",
    meaningZh: "作家 / 学者",
    votes: 28,
  },
  {
    id: "4",
    nameVi: "Micro",
    nameEn: "Microphone",
    nameZh: "麦克风",
    icon: "🎤",
    meaningVi: "Ca sĩ / MC nổi tiếng",
    meaningEn: "Singer / Host",
    meaningZh: "歌手 / 主持人",
    votes: 35,
  },
  {
    id: "5",
    nameVi: "Thỏi Vàng",
    nameEn: "Gold Ingot",
    nameZh: "金元宝",
    icon: "💰",
    meaningVi: "Doanh nhân thành đạt",
    meaningEn: "Entrepreneur / Wealth",
    meaningZh: "成功企业家 / 财源广进",
    votes: 89,
  },
  {
    id: "6",
    nameVi: "Máy Bay",
    nameEn: "Airplane",
    nameZh: "飞机",
    icon: "✈️",
    meaningVi: "Phi công / Du lịch",
    meaningEn: "Pilot / Explorer",
    meaningZh: "飞行员 / 环球旅行家",
    votes: 21,
  },
];

export const BocDoGame: React.FC<{ babyName?: string; primaryColor?: string }> = ({
  babyName = "bé",
  primaryColor = "#70A1FF",
}) => {
  const { lang, t } = useLanguage();
  const [items, setItems] = useState<BocDoItem[]>(INITIAL_ITEMS);
  const [votedId, setVotedId] = useState<string | null>(null);

  const totalVotes = items.reduce((acc, curr) => acc + curr.votes, 0);

  const handleVote = (id: string) => {
    if (votedId) return;
    setVotedId(id);
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, votes: item.votes + 1 } : item))
    );

    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 },
    });
  };

  return (
    <div className="w-full max-w-md mx-auto my-10 p-6 bg-linear-to-b from-sky-50 to-white rounded-3xl border border-sky-100 shadow-md text-center">
      <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-sky-100/80 rounded-full text-[11px] font-bold text-sky-700 uppercase tracking-wider mb-2">
        <Sparkles className="w-3.5 h-3.5" />
        <span>{t("bocDoGameTitle")}</span>
      </div>

      <h3 className="text-xl font-bold font-serif text-stone-800">
        {t("bocDoQuestion")} ({babyName}) 🎁
      </h3>
      <p className="text-xs text-stone-500 mt-1 mb-6">
        {t("bocDoSubtitle")}
      </p>

      {/* GRID MÓN ĐỒ */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {items.map((item) => {
          const percent = totalVotes > 0 ? Math.round((item.votes / totalVotes) * 100) : 0;
          const isSelected = votedId === item.id;

          const itemName =
            lang === "zh" ? item.nameZh : lang === "en" ? item.nameEn : item.nameVi;
          const itemMeaning =
            lang === "zh"
              ? item.meaningZh
              : lang === "en"
              ? item.meaningEn
              : item.meaningVi;

          return (
            <button
              key={item.id}
              onClick={() => handleVote(item.id)}
              disabled={!!votedId}
              className={`relative flex flex-col items-center justify-between p-3.5 rounded-2xl border transition text-center cursor-pointer ${
                isSelected
                  ? "bg-sky-500 text-white border-sky-600 shadow-md scale-105"
                  : "bg-white border-stone-200/80 text-stone-800 hover:border-sky-300 hover:shadow-xs"
              }`}
            >
              {isSelected && (
                <div className="absolute top-2 right-2 bg-white text-sky-600 rounded-full p-0.5 shadow-xs">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
              )}

              <span className="text-3xl mb-1.5">{item.icon}</span>
              <span
                className={`text-xs font-bold ${
                  isSelected ? "text-white" : "text-stone-800"
                }`}
              >
                {itemName}
              </span>
              <span
                className={`text-[10px] mt-0.5 ${
                  isSelected ? "text-sky-100" : "text-stone-400"
                }`}
              >
                {itemMeaning}
              </span>

              {/* TỶ LỆ BÌNH CHỌN */}
              {votedId && (
                <div className="w-full mt-2 pt-2 border-t border-stone-200/40 flex items-center justify-between text-[10px]">
                  <span className={isSelected ? "text-sky-100" : "text-stone-500"}>
                    {percent}%
                  </span>
                  <span className={isSelected ? "text-sky-100" : "text-stone-400"}>
                    {item.votes} {t("votes")}
                  </span>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
