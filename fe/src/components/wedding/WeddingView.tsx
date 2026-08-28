"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CardDetail,
  WeddingDataPayload,
  PhotoItem,
} from "@/types/card.types";
import { WaxSealOpening } from "../shared/OpeningEffect/WaxSealOpening";
import { FallingEffect } from "../shared/FallingEffect";
import { AudioPlayer } from "../shared/AudioPlayer";
import { GiftQrBoxModal } from "../shared/GiftQrBoxModal";
import { RsvpFormModal } from "../shared/RsvpFormModal";
import { GuestbookSection } from "../shared/GuestbookSection";
import { LanguageSwitcher } from "../shared/LanguageSwitcher";
import { useLanguage } from "@/context/LanguageContext";
import {
  Heart,
  MapPin,
  Calendar,
  Gift,
  UserCheck,
  Navigation,
  Clock,
  Sparkles,
  ChevronRight,
  Maximize2,
  X,
} from "lucide-react";
import { formatDate, formatTime } from "@/lib/utils";

interface WeddingViewProps {
  card: CardDetail;
  guestName?: string;
  guestCode?: string;
}

export const WeddingView: React.FC<WeddingViewProps> = ({
  card,
  guestName,
  guestCode,
}) => {
  const { t } = useLanguage();
  const [opened, setOpened] = useState(false);
  const [showRsvp, setShowRsvp] = useState(false);
  const [showGift, setShowGift] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  const data = card.categoryData as WeddingDataPayload;
  const primaryColor = card.primaryColor || "#BE944E";

  const mainEvent = card.events[0];
  const targetDate = mainEvent ? mainEvent.eventDate : new Date("2026-11-20T18:00:00Z");

  const groomName = data.groom?.fullName || "Nguyễn Minh Khôi";
  const groomShortName = data.groom?.shortName || "Minh Khôi";
  const brideName = data.bride?.fullName || "Lê Ngọc Hân";
  const brideShortName = data.bride?.shortName || "Ngọc Hân";

  const coverPhoto =
    card.photos[0]?.url ||
    data.groom.avatarUrl ||
    "https://images.unsplash.com/photo-1519741497674-611481863552?w=1000&auto=format&fit=crop";

  return (
    <div className="relative min-h-screen bg-[#FBF8F3] text-stone-800 font-sans pb-28 overflow-x-hidden selection:bg-amber-200">
      {/* 1. HIỆU ỨNG MỞ PHONG BÌ SÁP NẾN */}
      {!opened && card.openingEffect === "WAX_SEAL" && (
        <WaxSealOpening
          primaryColor={primaryColor}
          title={`${groomShortName} & ${brideShortName}`}
          guestName={guestName}
          onOpened={() => setOpened(true)}
        />
      )}

      {/* 2. HIỆU ỨNG RƠI & NHẠC NỀN */}
      <FallingEffect effect={card.fallingEffect || "PETAL"} />
      <AudioPlayer musicUrl={card.musicUrl} autoPlay={card.isAutoPlay} />

      {/* AMBIENT BACKGROUND GLOWS */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-lg h-96 bg-radial from-amber-200/30 via-rose-100/20 to-transparent pointer-events-none -z-10 blur-3xl" />
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-lg h-96 bg-radial from-rose-200/20 via-amber-100/15 to-transparent pointer-events-none -z-10 blur-3xl" />

      {/* CONTAINER CHÍNH - CARD MOCKUP SANG TRỌNG TƯƠI SÁNG */}
      <main className="max-w-md sm:max-w-lg mx-auto bg-white/95 backdrop-blur-sm min-h-screen shadow-[0_15px_60px_rgba(190,148,78,0.15)] overflow-hidden border-x border-[#EFE8DC] relative">
        {/* NÚT ĐỔI NGÔN NGỮ FLOATING TRÊN ĐẦU THIỆP */}
        <div className="absolute top-4 right-4 z-30">
          <LanguageSwitcher />
        </div>

        {/* ------------------------------------------------------------- */}
        {/* 1. HERO SECTION: LỘNG LẪY, TƯƠI SÁNG, NGHỆ THUẬT */}
        {/* ------------------------------------------------------------- */}
        <section className="relative w-full pt-8 pb-10 px-6 text-center bg-gradient-to-b from-[#FDF9F3] via-white to-[#FAF6F0] overflow-hidden border-b border-[#F0EAE1]">
          {/* DECORATIVE TOP MONOGRAM EMBLEM */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="inline-flex items-center justify-center gap-2 mb-4 px-4 py-1 rounded-full bg-[#FAF2E6] border border-[#E9DAC3] text-[#A67B34] shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#BE944E]" />
            <span className="text-[10px] font-bold uppercase tracking-[0.25em]">
              SAVE OUR SPECIAL DAY
            </span>
            <Sparkles className="w-3.5 h-3.5 text-[#BE944E]" />
          </motion.div>

          {/* GROOM & BRIDE NAMES */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.15 }}
            className="space-y-1"
          >
            <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#6D4C33] tracking-tight leading-tight">
              {groomShortName}
            </h1>
            <div className="flex items-center justify-center gap-3 my-1">
              <div className="h-px w-12 bg-gradient-to-r from-transparent via-[#BE944E]/60 to-[#BE944E]" />
              <span className="text-sm font-serif italic text-[#BE944E] px-1">
                &amp;
              </span>
              <div className="h-px w-12 bg-gradient-to-l from-transparent via-[#BE944E]/60 to-[#BE944E]" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#6D4C33] tracking-tight leading-tight">
              {brideShortName}
            </h1>
          </motion.div>

          {/* WEDDING DATE BADGE */}
          <p className="text-xs sm:text-sm font-serif text-[#8C6D53] tracking-widest uppercase mt-3">
            {formatDate(targetDate)}
          </p>

          {/* HERO ARCH COVER PHOTO */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.3 }}
            className="relative mt-6 mx-auto w-full aspect-[4/5] rounded-[36px] overflow-hidden p-2.5 bg-gradient-to-b from-[#F2E8DC] via-[#EAE0D2] to-[#FAF6F0] shadow-[0_16px_40px_rgba(109,76,51,0.12)] border border-[#E8DCCB] group cursor-pointer"
            onClick={() => setSelectedPhoto(coverPhoto)}
          >
            <div className="relative w-full h-full rounded-[28px] overflow-hidden bg-stone-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={coverPhoto}
                alt="Wedding Cover"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/0 to-black/10 pointer-events-none" />
              
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-black/60 backdrop-blur-md text-white text-[11px] font-medium tracking-wider flex items-center gap-1.5 shadow-md">
                <Maximize2 className="w-3 h-3 text-amber-300" />
                <span>Chạm để phóng to</span>
              </div>
            </div>
          </motion.div>
        </section>

        {/* ------------------------------------------------------------- */}
        {/* 2. THƯ MỜI THÀNH HÔN & LỜI NGỎ LÃNG MẠN */}
        {/* ------------------------------------------------------------- */}
        <section className="p-7 sm:p-9 text-center bg-[#FAF6F0] relative overflow-hidden border-b border-[#EFE9E0]">
          {/* DECORATIVE FLORAL CORNERS */}
          <div className="absolute top-0 left-0 w-24 h-24 bg-rose-200/20 rounded-full blur-xl pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-24 h-24 bg-amber-200/20 rounded-full blur-xl pointer-events-none" />

          {/* MONOGRAM HEART SEAL */}
          <div className="inline-flex items-center justify-center w-11 h-11 rounded-full bg-white border border-[#E6D5BE] shadow-xs mb-3 text-[#BE944E]">
            <Heart className="w-5 h-5 fill-[#BE944E]" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#6D4C33] tracking-tight mb-3">
            {t("invitationLetter") || "Thư Mời Thành Hôn"}
          </h2>

          {/* PERSONALIZED GUEST BADGE */}
          {guestName && (
            <div className="inline-block px-5 py-2 bg-white rounded-full border border-[#DFCEBA] text-xs sm:text-sm font-semibold text-[#6D4C33] mb-4 shadow-xs">
              {t("invitationTo")}: <span className="underline font-bold">{guestName}</span>
            </div>
          )}

          {/* ROMANTIC INVITATION QUOTE */}
          <div className="max-w-sm mx-auto bg-white/80 backdrop-blur-xs p-5 rounded-2xl border border-[#EDE3D6] shadow-2xs">
            <p className="text-xs sm:text-sm text-[#735843] leading-relaxed italic font-serif">
              {card.greetingMessage ||
                data.greeting ||
                t("fallbackInvitationQuote")}
            </p>
          </div>
        </section>

        {/* ------------------------------------------------------------- */}
        {/* 3. THÔNG TIN CÔ DÂU & CHÚ RỂ (ARCH-FRAMED PORTRAITS) */}
        {/* ------------------------------------------------------------- */}
        <section className="p-6 sm:p-8 bg-white border-b border-[#EFE9E0]">
          <div className="text-center mb-6">
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#9C795E]">
              COUPLE PROFILE
            </span>
            <h3 className="text-2xl font-serif font-bold text-[#6D4C33] mt-1">
              Chú Rể &amp; Cô Dâu
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:gap-6">
            {/* CHÚ RỂ */}
            <div className="flex flex-col items-center text-center p-4 rounded-3xl bg-[#FAF6F0] border border-[#EDE2D4] shadow-2xs hover:shadow-md transition">
              <div className="w-24 h-32 sm:w-28 sm:h-36 rounded-[28px] overflow-hidden border-2 border-white shadow-md mb-3 bg-stone-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={
                    data.groom.avatarUrl ||
                    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop"
                  }
                  alt={t("groom")}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="px-3 py-0.5 rounded-full bg-white border border-[#E0D2C2] text-[10px] font-bold uppercase tracking-wider text-[#8C6442] shadow-2xs">
                {t("groom") || "Chú Rể"}
              </span>
              <h4 className="text-base sm:text-lg font-serif font-bold text-[#6D4C33] mt-2">
                {groomName}
              </h4>
              <p className="text-[11px] text-[#8C6D53] italic">
                {data.groom?.birthOrder || t("eldestSon")}
              </p>
              {data.groom.parents && (
                <div className="text-[11px] text-stone-500 mt-2 pt-2 border-t border-[#EAE0D2] w-full leading-snug">
                  <p>{t("father")}: {data.groom.parents.fatherName || "Nguyễn Văn Hùng"}</p>
                  <p>{t("mother")}: {data.groom.parents.motherName || "Trần Thị Mai"}</p>
                </div>
              )}
            </div>

            {/* CÔ DÂU */}
            <div className="flex flex-col items-center text-center p-4 rounded-3xl bg-[#FAF6F0] border border-[#EDE2D4] shadow-2xs hover:shadow-md transition">
              <div className="w-24 h-32 sm:w-28 sm:h-36 rounded-[28px] overflow-hidden border-2 border-white shadow-md mb-3 bg-stone-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={
                    data.bride.avatarUrl ||
                    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop"
                  }
                  alt={t("bride")}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="px-3 py-0.5 rounded-full bg-white border border-[#E0D2C2] text-[10px] font-bold uppercase tracking-wider text-[#8C6442] shadow-2xs">
                {t("bride") || "Cô Dâu"}
              </span>
              <h4 className="text-base sm:text-lg font-serif font-bold text-[#6D4C33] mt-2">
                {brideName}
              </h4>
              <p className="text-[11px] text-[#8C6D53] italic">
                {data.bride?.birthOrder || t("youngestDaughter")}
              </p>
              {data.bride.parents && (
                <div className="text-[11px] text-stone-500 mt-2 pt-2 border-t border-[#EAE0D2] w-full leading-snug">
                  <p>{t("father")}: {data.bride.parents.fatherName || "Lê Quốc Bảo"}</p>
                  <p>{t("mother")}: {data.bride.parents.motherName || "Phạm Thu Cúc"}</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------------- */}
        {/* 4. BỘ ĐẾM NGƯỢC COUNTDOWN TƯƠI SÁNG & SANG TRỌNG */}
        {/* ------------------------------------------------------------- */}
        <section className="px-6 py-8 bg-gradient-to-b from-[#FAF6F0] to-[#F7F1E8] border-b border-[#EFE9E0] text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#E2D5C3] text-[#8C6846] text-[10px] font-bold uppercase tracking-widest shadow-2xs mb-4">
            <Clock className="w-3 h-3 text-[#BE944E]" />
            <span>{t("countdownTitle") || "Đếm Ngược Ngày Trọng Đại"}</span>
          </div>

          <CountdownWrapper targetDate={targetDate} />
        </section>

        {/* ------------------------------------------------------------- */}
        {/* 5. LỊCH TRÌNH CÁC SỰ KIỆN CƯỚI (BOARDING PASS / TICKET CARDS) */}
        {/* ------------------------------------------------------------- */}
        <section className="p-6 sm:p-8 bg-white space-y-6 border-b border-[#EFE9E0]">
          <div className="text-center">
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#9C795E]">
              SCHEDULE &amp; LOCATION
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#6D4C33] mt-1">
              {t("eventsTitle") || "Sự Kiện Trọng Đại"}
            </h2>
          </div>

          <div className="space-y-5">
            {card.events.map((event, idx) => (
              <div
                key={event.id || idx}
                className="rounded-[28px] bg-gradient-to-b from-[#FDFBF7] to-[#FAF5ED] border border-[#EAE0D2] shadow-sm hover:shadow-md transition p-5 sm:p-6 flex flex-col gap-4 relative overflow-hidden"
              >
                {/* TOP ROW: EVENT NAME & TIME BADGE */}
                <div className="flex items-center justify-between border-b border-[#EDE4D8] pb-3">
                  <h4 className="text-base sm:text-lg font-serif font-bold text-[#6D4C33]">
                    {event.eventName}
                  </h4>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#7A5636] bg-white px-3 py-1 rounded-full border border-[#DFCEBA] shadow-2xs">
                    <Clock className="w-3.5 h-3.5 text-[#BE944E]" />
                    <span>{formatTime(event.eventDate)}</span>
                  </div>
                </div>

                {/* EVENT DETAILS */}
                <div className="space-y-2 text-xs text-stone-600">
                  <div className="flex items-start gap-2.5">
                    <Calendar className="w-4 h-4 text-[#A67B34] shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-stone-800">
                        {formatDate(event.eventDate)}
                      </span>
                      {event.lunarDate && (
                        <span className="block text-[11px] text-stone-500 mt-0.5">
                          ({t("lunarDatePrefix") || "Âm lịch"}: {event.lunarDate})
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <MapPin className="w-4 h-4 text-[#A67B34] shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-stone-800 font-semibold text-xs sm:text-sm">
                        {event.venueName}
                      </strong>
                      <p className="text-stone-500 text-[11.5px] mt-0.5 leading-snug">
                        {event.address}
                      </p>
                    </div>
                  </div>
                </div>

                {/* GOOGLE MAPS BUTTON */}
                {event.mapUrl && (
                  <a
                    href={event.mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 w-full py-2.5 bg-white hover:bg-[#FAF6F0] rounded-xl border border-[#DFCEBA] text-xs font-bold text-[#7A5636] transition shadow-2xs hover:shadow-xs cursor-pointer mt-1"
                  >
                    <Navigation className="w-3.5 h-3.5 text-[#BE944E]" />
                    <span>{t("openMap") || "Chỉ đường trên Google Maps"}</span>
                  </a>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ------------------------------------------------------------- */}
        {/* 6. CHUYỆN TÌNH YÊU (LOVE STORY TIMELINE) */}
        {/* ------------------------------------------------------------- */}
        {data.loveStory && data.loveStory.length > 0 && (
          <section className="p-6 sm:p-8 bg-[#FAF6F0] border-b border-[#EFE9E0]">
            <div className="text-center mb-6">
              <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#9C795E]">
                OUR JOURNEY
              </span>
              <h3 className="text-2xl font-serif font-bold text-[#6D4C33] mt-1">
                {t("modalFeatLoveStory") || "Chuyện Tình Yêu"}
              </h3>
            </div>

            <div className="space-y-4 max-w-sm mx-auto">
              {data.loveStory.map((story, i) => (
                <div
                  key={i}
                  className="bg-white p-4 rounded-2xl border border-[#EAE0D2] shadow-2xs flex items-start gap-3.5"
                >
                  <div className="w-10 h-10 rounded-full bg-[#FAF2E6] border border-[#DFCEBA] text-[#BE944E] font-bold text-xs flex items-center justify-center shrink-0">
                    {i + 1}
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-[#A67B34] uppercase tracking-wider">
                      {story.date}
                    </span>
                    <h5 className="text-sm font-serif font-bold text-[#6D4C33]">
                      {story.title}
                    </h5>
                    {story.description && (
                      <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                        {story.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ------------------------------------------------------------- */}
        {/* 7. ALBUM ẢNH CƯỚI GALLERY (INTERACTIVE MASONRY) */}
        {/* ------------------------------------------------------------- */}
        {card.photos.length > 0 && (
          <section className="p-6 sm:p-8 bg-white border-b border-[#EFE9E0]">
            <div className="text-center mb-6">
              <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#9C795E]">
                PHOTO GALLERY
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#6D4C33] mt-1">
                {t("galleryTitle") || "Album Khoảnh Khắc"}
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {card.photos.map((photo, idx) => (
                <div
                  key={photo.id || idx}
                  onClick={() => setSelectedPhoto(photo.url)}
                  className={`relative overflow-hidden rounded-2xl bg-stone-100 shadow-2xs hover:shadow-md transition group cursor-pointer border border-[#EFE8DC] ${
                    idx % 3 === 0 ? "col-span-2 aspect-[16/10]" : "aspect-[4/5]"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photo.url}
                    alt={photo.caption || "Ảnh cưới"}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="w-8 h-8 rounded-full bg-white/80 text-stone-900 flex items-center justify-center shadow-md">
                      <Maximize2 className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ------------------------------------------------------------- */}
        {/* 8. SỔ LƯU BÚT GUESTBOOK & BỨC TƯỜNG LỜI CHÚC */}
        {/* ------------------------------------------------------------- */}
        <GuestbookSection cardId={card.id} primaryColor={primaryColor} />

        {/* ------------------------------------------------------------- */}
        {/* 9. BOTTOM FIXED ACTION BAR DÀNH CHO KHÁCH (LUXURY FLOATING DOCK) */}
        {/* ------------------------------------------------------------- */}
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#EAE0D2] p-3 sm:p-4 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] flex items-center justify-center gap-3 max-w-md sm:max-w-lg mx-auto">
          {/* NÚT XÁC NHẬN THAM DỰ RSVP */}
          <button
            onClick={() => setShowRsvp(true)}
            className="flex-1 py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#A6784D] via-[#BE944E] to-[#8C6038] hover:opacity-95 text-white text-xs sm:text-sm font-bold uppercase tracking-wider shadow-[0_6px_20px_rgba(190,148,78,0.35)] transition cursor-pointer flex items-center justify-center gap-2"
          >
            <UserCheck className="w-4 h-4" />
            <span>{t("btnRsvp") || "Xác Nhận Tham Dự"}</span>
          </button>

          {/* NÚT MỪNG CƯỚI QR */}
          {(card.bankingPrimary || card.bankingSecondary) && (
            <button
              onClick={() => setShowGift(true)}
              className="py-3.5 px-5 rounded-2xl bg-[#221F1C] hover:bg-black text-amber-200 text-xs sm:text-sm font-bold uppercase tracking-wider shadow-md transition cursor-pointer flex items-center justify-center gap-2 border border-white/10"
            >
              <Gift className="w-4 h-4 text-amber-300" />
              <span>{t("btnGift") || "Mừng Cưới"}</span>
            </button>
          )}
        </div>
      </main>

      {/* FULLSCREEN PHOTO LIGHTBOX MODAL */}
      <AnimatePresence>
        {selectedPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedPhoto(null)}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-zoom-out"
          >
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={selectedPhoto}
              alt="Zoomed photo"
              className="max-w-full max-h-[85vh] rounded-2xl object-contain shadow-2xl"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODALS */}
      <RsvpFormModal
        isOpen={showRsvp}
        onClose={() => setShowRsvp(false)}
        cardId={card.id}
        defaultGuestName={guestName}
        guestCode={guestCode}
        primaryColor={primaryColor}
      />

      <GiftQrBoxModal
        isOpen={showGift}
        onClose={() => setShowGift(false)}
        bankingPrimary={card.bankingPrimary}
        bankingSecondary={card.bankingSecondary}
        primaryColor={primaryColor}
      />
    </div>
  );
};

// SUB-COMPONENT: RADIANT COUNTDOWN TIMER
function CountdownWrapper({ targetDate }: { targetDate: string | Date }) {
  const { t } = useLanguage();
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  React.useEffect(() => {
    const calculateTime = () => {
      const target = new Date(targetDate).getTime();
      const now = new Date().getTime();
      const difference = target - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      }
    };

    calculateTime();
    const timer = setInterval(calculateTime, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  const handleCalendar = () => {
    const d = new Date(targetDate);
    const startTime = d.toISOString().replace(/-|:|\.\d\d\d/g, "");
    const endTime = new Date(d.getTime() + 3 * 60 * 60 * 1000)
      .toISOString()
      .replace(/-|:|\.\d\d\d/g, "");

    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=Lễ Cưới Trọng Đại&dates=${startTime}/${endTime}&details=Trân trọng kính mời quý khách đến tham dự hôn lễ!`;
    window.open(url, "_blank");
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-2.5 sm:gap-3.5 max-w-xs sm:max-w-sm mx-auto">
        {[
          { label: t("days") || "Ngày", val: timeLeft.days },
          { label: t("hours") || "Giờ", val: timeLeft.hours },
          { label: t("minutes") || "Phút", val: timeLeft.minutes },
          { label: t("seconds") || "Giây", val: timeLeft.seconds },
        ].map((c, i) => (
          <div
            key={i}
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white border border-[#E6D8C5] shadow-xs"
          >
            <span className="text-2xl sm:text-3xl font-serif font-bold text-[#7A5636]">
              {String(c.val).padStart(2, "0")}
            </span>
            <span className="text-[10px] sm:text-[11px] font-semibold text-[#9C795E] uppercase tracking-wider mt-0.5">
              {c.label}
            </span>
          </div>
        ))}
      </div>

      <button
        onClick={handleCalendar}
        className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-full bg-white hover:bg-[#FAF6F0] text-[#7A5636] transition cursor-pointer border border-[#DFCEBA] shadow-2xs"
      >
        <Calendar className="w-3.5 h-3.5 text-[#BE944E]" />
        <span>{t("addToCalendar") || "Thêm vào Google Calendar"}</span>
      </button>
    </div>
  );
}
