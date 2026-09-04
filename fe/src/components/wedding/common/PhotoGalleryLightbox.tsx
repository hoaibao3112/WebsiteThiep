"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Maximize2, X, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";

export interface GalleryPhoto {
  url: string;
  caption?: string;
}

interface PhotoGalleryLightboxProps {
  photos: GalleryPhoto[];
  accentColor?: string;
  title?: string;
  subtitle?: string;
}

export const PhotoGalleryLightbox: React.FC<PhotoGalleryLightboxProps> = ({
  photos,
  accentColor = "#B84A39",
  title = "Khoảnh Khắc Hạnh Phúc",
  subtitle = "Từng góc ảnh lưu giữ những nụ cười và ánh mắt đong đầy yêu thương",
}) => {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const total = photos.length;

  const handlePrev = useCallback(() => {
    if (lightboxIndex === null) return;
    setLightboxIndex((lightboxIndex - 1 + total) % total);
  }, [lightboxIndex, total]);

  const handleNext = useCallback(() => {
    if (lightboxIndex === null) return;
    setLightboxIndex((lightboxIndex + 1) % total);
  }, [lightboxIndex, total]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (lightboxIndex === null) return;
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "Escape") setLightboxIndex(null);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxIndex, handlePrev, handleNext]);

  if (!photos || photos.length === 0) return null;

  return (
    <div className="py-6 px-4 space-y-4 text-center">
      <div className="space-y-1">
        <span
          className="text-[10px] font-mono uppercase tracking-[0.3em] font-bold block"
          style={{ color: accentColor }}
        >
          GALLERY &amp; MEMORIES
        </span>
        <h3 className="text-xl sm:text-2xl font-serif italic font-bold text-stone-900">
          {title}
        </h3>
        <p className="text-xs text-stone-500 italic max-w-xs mx-auto">
          {subtitle}
        </p>
      </div>

      {/* Grid ảnh nghệ thuật so le */}
      <div className="max-w-md mx-auto grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        {photos.map((item, idx) => {
          // Cho một số ảnh chiếm 2 cột để tạo bố cục báo chí tự nhiên
          const isFeatured = idx === 0 || idx === 3;
          return (
            <motion.div
              key={idx}
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setLightboxIndex(idx)}
              className={`relative rounded-2xl overflow-hidden shadow-xs cursor-pointer group bg-stone-100 border border-stone-200/60 ${
                isFeatured && photos.length > 4 ? "col-span-2 aspect-[16/10]" : "aspect-[3/4]"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.url}
                alt={item.caption || `Ảnh cưới ${idx + 1}`}
                className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition duration-300 flex items-end justify-between p-2.5 text-white">
                <span className="text-[10px] line-clamp-1 italic font-serif">
                  {item.caption || "Chạm để phóng to"}
                </span>
                <Maximize2 className="w-3.5 h-3.5 shrink-0 opacity-80" />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* LIGHTBOX MODAL PHÓNG TO TOÀN MÀN HÌNH */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightboxIndex(null)}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col justify-between p-4"
          >
            {/* Top Bar */}
            <div
              className="flex items-center justify-between text-white px-2 pt-2"
              onClick={(e) => e.stopPropagation()}
            >
              <span className="text-xs font-mono text-stone-300">
                {lightboxIndex + 1} / {total}
              </span>
              <button
                onClick={() => setLightboxIndex(null)}
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
                aria-label="Đóng"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Central Image with Navigation */}
            <div
              className="relative flex-1 flex items-center justify-center max-w-2xl mx-auto w-full my-auto px-2"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={handlePrev}
                className="absolute left-1 z-20 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition cursor-pointer backdrop-blur-xs"
                aria-label="Ảnh trước"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              <motion.div
                key={lightboxIndex}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="max-h-[75vh] max-w-full rounded-2xl overflow-hidden shadow-2xl flex items-center justify-center"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photos[lightboxIndex].url}
                  alt={photos[lightboxIndex].caption || "Phóng to ảnh cưới"}
                  className="max-h-[75vh] w-auto object-contain rounded-xl"
                />
              </motion.div>

              <button
                onClick={handleNext}
                className="absolute right-1 z-20 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition cursor-pointer backdrop-blur-xs"
                aria-label="Ảnh sau"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>

            {/* Bottom Caption */}
            <div
              className="text-center text-stone-300 text-xs italic font-serif pb-4 px-4"
              onClick={(e) => e.stopPropagation()}
            >
              <p>{photos[lightboxIndex].caption || "Khoảnh khắc ngọt ngào của hai ta"}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
