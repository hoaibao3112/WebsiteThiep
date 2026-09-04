"use client";

import React from "react";
import { motion } from "framer-motion";
import { Heart, Sparkles, Calendar, MapPin } from "lucide-react";

export interface LoveStoryMilestone {
  date: string;
  title: string;
  desc: string;
  imageUrl?: string;
  location?: string;
}

interface LoveStoryTimelineProps {
  milestones?: LoveStoryMilestone[];
  accentColor?: string;
  variant?:
    | "heritage"
    | "editorial"
    | "romantic"
    | "marsala"
    | "botanical"
    | "lotus"
    | "cinematic"
    | "alpine"
    | "imperial";
  onSelectPhoto?: (url: string) => void;
}

const DEFAULT_MILESTONES: LoveStoryMilestone[] = [
  {
    date: "14.02.2021",
    title: "Lần Đầu Chạm Mắt",
    desc: "Một buổi chiều mưa bất chợt ở quán cà phê nhỏ, cái nhìn đầu tiên đã thắp lên ngọn lửa định mệnh trong tim.",
    imageUrl: "/images/demo/korean-hero.png",
    location: "Hà Nội",
  },
  {
    date: "24.12.2022",
    title: "Lời Hẹn Ước Tình Yêu",
    desc: "Dưới ánh đèn lung linh đêm Giáng Sinh, hai bàn tay khẽ nắm lấy nhau, bắt đầu hành trình cùng nhau vượt qua mọi thăng trầm.",
    imageUrl: "/images/demo/korean-calendar.png",
    location: "Tràng Tiền Plaza",
  },
  {
    date: "20.10.2024",
    title: "Khoảnh Khắc Cầu Hôn",
    desc: "“Em có đồng ý cùng anh đi hết cuộc đời này không?” — Nụ cười trong nước mắt hạnh phúc và tiếng “Em đồng ý!” ngọt ngào.",
    imageUrl: "/images/demo/couple-aodai.png",
    location: "Đỉnh Núi Fansipan",
  },
  {
    date: "2026",
    title: "Ngày Chung Đôi",
    desc: "Từ khoảnh khắc này, hai ta chính thức gọi nhau là Vợ - Chồng trước sự chứng kiến và chúc phúc của những người thương yêu nhất.",
    imageUrl: "/images/templates/template-04-marsala.png",
    location: "Lễ Thành Hôn",
  },
];

export const LoveStoryTimeline: React.FC<LoveStoryTimelineProps> = ({
  milestones = DEFAULT_MILESTONES,
  accentColor = "#B84A39",
  variant = "romantic",
  onSelectPhoto,
}) => {
  const items = milestones.length > 0 ? milestones : DEFAULT_MILESTONES;

  return (
    <div className="py-6 px-4 relative overflow-hidden">
      <div className="text-center space-y-1 mb-8">
        <span
          className="text-[10px] font-mono uppercase tracking-[0.3em] font-bold block"
          style={{ color: accentColor }}
        >
          OUR LOVE STORY
        </span>
        <h3 className="text-xl sm:text-2xl font-serif italic font-bold">
          Hành Trình Yêu Thương
        </h3>
        <p className="text-xs text-stone-500 italic max-w-xs mx-auto">
          Từng khoảnh khắc đi qua đều là một mảnh ghép kỳ diệu dệt nên câu chuyện trăm năm
        </p>
      </div>

      {/* Trục thời gian dọc */}
      <div className="relative max-w-sm mx-auto">
        {/* Đường line giữa */}
        <div
          className="absolute left-1/2 top-4 bottom-4 w-0.5 -translate-x-1/2 opacity-30"
          style={{ backgroundColor: accentColor }}
        />

        <div className="space-y-8 relative">
          {items.map((item, idx) => {
            const isEven = idx % 2 === 0;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-30px" }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                className={`relative flex items-center ${
                  isEven ? "flex-row" : "flex-row-reverse"
                } gap-3`}
              >
                {/* Cột Nội Dung */}
                <div
                  className={`w-1/2 ${
                    isEven ? "text-right pr-3" : "text-left pl-3"
                  } space-y-1.5`}
                >
                  <span
                    className="inline-block text-[10px] font-mono font-bold px-2 py-0.5 rounded-full shadow-2xs border"
                    style={{
                      borderColor: `${accentColor}40`,
                      backgroundColor: `${accentColor}10`,
                      color: accentColor,
                    }}
                  >
                    {item.date}
                  </span>
                  <h4 className="text-xs sm:text-sm font-serif font-bold text-stone-800 leading-tight">
                    {item.title}
                  </h4>
                  <p className="text-[10px] sm:text-[11px] text-stone-600 leading-relaxed italic">
                    {item.desc}
                  </p>
                  {item.location && (
                    <span className="inline-flex items-center gap-1 text-[9px] text-stone-400 font-sans">
                      <MapPin className="w-2.5 h-2.5" />
                      <span>{item.location}</span>
                    </span>
                  )}
                </div>

                {/* Chấm tròn mốc thời gian ở trục giữa */}
                <div className="absolute left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-white border-2 shadow-sm flex items-center justify-center z-10"
                  style={{ borderColor: accentColor }}
                >
                  <motion.div
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ duration: 2, repeat: Infinity, delay: idx * 0.4 }}
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: accentColor }}
                  />
                </div>

                {/* Cột Hình Ảnh */}
                <div className={`w-1/2 ${isEven ? "pl-3" : "pr-3"}`}>
                  {item.imageUrl && (
                    <motion.div
                      whileHover={{ scale: 1.04, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => onSelectPhoto && onSelectPhoto(item.imageUrl!)}
                      className="aspect-[4/3] rounded-2xl overflow-hidden shadow-sm border border-stone-200 bg-stone-100 cursor-pointer group relative"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      />
                      <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition" />
                    </motion.div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
