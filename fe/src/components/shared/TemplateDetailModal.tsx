"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { X, Eye, Check } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export interface TemplateModalData {
  id: string;
  name: string;
  category: string;
  style: string;
  price: string;
  imageUrl: string;
  isNew?: boolean;
  description?: string;
  tags?: string[];
  demoSlug?: string;
}

interface TemplateDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  template: TemplateModalData | null;
}

export const TemplateDetailModal: React.FC<TemplateDetailModalProps> = ({
  isOpen,
  onClose,
  template,
}) => {
  const { t } = useLanguage();

  // Đóng modal khi bấm phím ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !template) return null;

  const leftFeatures = [
    t("modalFeatCustom"),
    t("modalFeatGallery"),
    t("modalFeatWishes"),
    t("modalFeatReminder"),
    t("modalFeatTimeline"),
    t("modalFeatGuestName"),
    t("modalFeatShareLink"),
  ];

  const rightFeatures = [
    t("modalFeatMaps"),
    t("modalFeatRsvp"),
    t("modalFeatQr"),
    t("modalFeatCountdown"),
    t("modalFeatLoveStory"),
    t("modalFeatMultiLang"),
    t("modalFeatMusic"),
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 md:p-10 overflow-y-auto">
        {/* BACKDROP BLUR */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/65 backdrop-blur-md transition-all"
        />

        {/* MODAL MAIN CONTAINER */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative w-full max-w-[960px] rounded-[28px] sm:rounded-[32px] overflow-hidden shadow-2xl z-10 my-auto border border-white/10"
        >
          {/* CLOSE BUTTON */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 sm:top-5 sm:right-5 z-30 w-8 h-8 rounded-full bg-white/20 hover:bg-white/35 text-white flex items-center justify-center transition hover:rotate-90 duration-300 cursor-pointer shadow-md"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="grid grid-cols-1 md:grid-cols-12 min-h-[540px]">
            {/* ------------------------------------------------------------- */}
            {/* LEFT COLUMN: ELEGANT FLORAL & POLAROID CARD CANVAS */}
            {/* ------------------------------------------------------------- */}
            <div className="md:col-span-5 bg-[#F6F0E8] p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden">
              {/* WATERCOLOR FLORAL CORNER ACCENTS */}
              <div className="absolute -top-6 -left-6 w-36 h-36 rounded-full bg-rose-200/40 blur-2xl pointer-events-none" />
              <div className="absolute -bottom-8 -right-8 w-40 h-40 rounded-full bg-amber-200/40 blur-2xl pointer-events-none" />

              {/* CARD TOP TYPOGRAPHY */}
              <div className="text-center relative z-10 pt-2">
                <p className="text-[11px] uppercase tracking-widest text-[#9C795E] font-serif">
                  {t("eldestSon")}
                </p>
                <h4 className="text-xl sm:text-2xl font-serif font-bold text-[#6D4C33] tracking-wide mt-0.5">
                  Minh Khôi
                </h4>
                <p className="text-xs font-serif italic text-[#A6876E] my-0.5">&</p>
                <p className="text-[11px] uppercase tracking-widest text-[#9C795E] font-serif">
                  {t("youngestDaughter")}
                </p>
                <h4 className="text-xl sm:text-2xl font-serif font-bold text-[#6D4C33] tracking-wide mt-0.5">
                  Ngọc Hân
                </h4>
              </div>

              {/* CENTER COUPLE POLAROID PHOTOS */}
              <div className="relative my-6 flex items-center justify-center min-h-[220px]">
                {/* POLAROID 1 (TOP RIGHT ROTATED) */}
                <div className="absolute w-32 sm:w-36 bg-white p-2 pb-5 shadow-lg rounded-sm transform rotate-6 hover:rotate-2 transition-transform duration-300 z-10 -top-2 right-4 border border-stone-200/60">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=400&auto=format&fit=crop"
                    alt="Couple 1"
                    className="w-full aspect-[4/5] object-cover rounded-xs"
                  />
                </div>

                {/* POLAROID 2 (BOTTOM LEFT ROTATED) */}
                <div className="relative w-36 sm:w-40 bg-white p-2 pb-6 shadow-xl rounded-sm transform -rotate-6 hover:-rotate-1 transition-transform duration-300 z-20 top-4 left-0 border border-stone-200/60">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={template.imageUrl || "https://images.unsplash.com/photo-1519741497674-611481863552?w=400&auto=format&fit=crop"}
                    alt={template.name}
                    className="w-full aspect-[4/5] object-cover rounded-xs"
                  />
                </div>
              </div>

              {/* CARD BOTTOM SUBTEXT */}
              <div className="text-center relative z-10 pb-1">
                <span className="text-[10px] uppercase tracking-[0.25em] text-[#8C6D53] font-medium">
                  {template.style}
                </span>
              </div>
            </div>

            {/* ------------------------------------------------------------- */}
            {/* RIGHT COLUMN: WARM MOCHA CARAMEL DETAILS & FEATURES */}
            {/* ------------------------------------------------------------- */}
            <div className="md:col-span-7 bg-gradient-to-b from-[#8C6846] via-[#815E3D] to-[#735133] p-7 sm:p-9 lg:p-10 text-white flex flex-col justify-between relative z-10">
              <div className="space-y-4 sm:space-y-5">
                {/* TEMPLATE TITLE & DESCRIPTION */}
                <div>
                  <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white tracking-tight leading-tight">
                    {template.name}
                  </h2>
                  <p className="text-xs sm:text-sm text-white/85 leading-relaxed mt-2.5 font-light max-w-lg">
                    {template.description ||
                      "Thiệp hoa hồng watercolor tông hồng nâu ngọt ngào, phong cách ChungĐôi."}
                  </p>
                </div>

                {/* TAG PILLS */}
                <div className="flex flex-wrap items-center gap-2 pt-0.5">
                  <span className="px-3.5 py-1 rounded-full bg-black/20 text-white/90 text-xs font-medium border border-white/10 shadow-xs">
                    {t("modalTagFloral")}
                  </span>
                  <span className="px-3.5 py-1 rounded-full bg-black/20 text-white/90 text-xs font-medium border border-white/10 shadow-xs">
                    {t("modalTagPopular")}
                  </span>
                  <span className="px-3.5 py-1 rounded-full bg-black/20 text-white/90 text-xs font-medium border border-white/10 shadow-xs">
                    {t("modalTagNew")}
                  </span>
                </div>

                {/* FEATURES CHECKLIST SECTION */}
                <div className="pt-2">
                  <h3 className="text-sm sm:text-base font-serif font-bold text-white mb-3">
                    {t("modalFeaturesTitle")}
                  </h3>

                  <div className="grid grid-cols-2 gap-x-6 gap-y-2.5 text-xs text-white/90 font-light">
                    {/* LEFT COLUMN LIST */}
                    <div className="space-y-2.5">
                      {leftFeatures.map((feat, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <Check className="w-3.5 h-3.5 text-white/80 shrink-0" strokeWidth={2.2} />
                          <span className="truncate">{feat}</span>
                        </div>
                      ))}
                    </div>

                    {/* RIGHT COLUMN LIST */}
                    <div className="space-y-2.5">
                      {rightFeatures.map((feat, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <Check className="w-3.5 h-3.5 text-white/80 shrink-0" strokeWidth={2.2} />
                          <span className="truncate">{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* HINT FOOTER TEXT */}
                <p className="text-[11.5px] text-white/75 font-light leading-relaxed pt-1">
                  {t("modalFooterHint")}
                </p>
              </div>

              {/* ------------------------------------------------------------- */}
              {/* BOTTOM CTAS (BUTTONS) */}
              {/* ------------------------------------------------------------- */}
              <div className="pt-6 mt-6 flex flex-col sm:flex-row items-center gap-3.5">
                {/* PRIMARY BUTTON: + TẠO THIỆP */}
                <Link
                  href={`/dashboard/cards/new?templateId=${template.id}`}
                  className="w-full sm:flex-1 py-3 px-6 rounded-xl sm:rounded-2xl bg-[#A2774C] hover:bg-[#93693F] active:scale-[0.98] text-white font-medium text-xs sm:text-sm tracking-wide shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer border border-white/10"
                >
                  <span className="text-base font-light leading-none">+</span>
                  <span>{t("modalBtnCreate")}</span>
                </Link>

                {/* SECONDARY BUTTON: 👁 XEM DEMO THIỆP */}
                <Link
                  href={`/thiep/${template.demoSlug || "demo-wedding"}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:flex-1 py-3 px-6 rounded-xl sm:rounded-2xl bg-transparent hover:bg-white/10 active:scale-[0.98] border border-white/70 text-white font-medium text-xs sm:text-sm tracking-wide transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <Eye className="w-4 h-4 text-white/90" />
                  <span>{t("modalBtnLiveDemo")}</span>
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

