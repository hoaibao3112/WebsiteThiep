"use client";

import React, { useState } from "react";
import {
  CardDetail,
  WeddingDataPayload,
} from "@/types/card.types";
import { WaxSealOpening } from "../shared/OpeningEffect/WaxSealOpening";
import { FallingEffect } from "../shared/FallingEffect";
import { AudioPlayer } from "../shared/AudioPlayer";
import { CountdownTimer } from "../shared/CountdownTimer";
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

  const data = card.categoryData as WeddingDataPayload;
  const primaryColor = card.primaryColor || "#D4AF37";

  const mainEvent = card.events[0];
  const targetDate = mainEvent ? mainEvent.eventDate : new Date();

  return (
    <div className="relative min-h-screen bg-[#faf8f5] text-stone-800 font-sans pb-24 overflow-x-hidden selection:bg-amber-200">
      {/* 1. HIỆU ỨNG MỞ PHONG BÌ SÁP NẾN */}
      {!opened && card.openingEffect === "WAX_SEAL" && (
        <WaxSealOpening
          primaryColor={primaryColor}
          title={`${data.groom?.shortName || data.groom?.fullName} & ${
            data.bride?.shortName || data.bride?.fullName
          }`}
          guestName={guestName}
          onOpened={() => setOpened(true)}
        />
      )}

      {/* 2. HIỆU ỨNG RƠI & NHẠC NỀN */}
      <FallingEffect effect={card.fallingEffect} />
      <AudioPlayer musicUrl={card.musicUrl} autoPlay={card.isAutoPlay} />

      {/* CONTAINER CHÍNH */}
      <main className="max-w-md sm:max-w-lg mx-auto bg-white min-h-screen shadow-2xl overflow-hidden border-x border-stone-200/60 relative">
        {/* NÚT ĐỔI NGÔN NGỮ FLOATING TRÊN ĐẦU THIỆP */}
        <div className="absolute top-4 right-4 z-20">
          <LanguageSwitcher />
        </div>

        {/* HERO BANNER SECTION */}
        <section className="relative w-full aspect-[3/4] overflow-hidden bg-stone-900">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={
              card.photos[0]?.url ||
              data.groom.avatarUrl ||
              "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&auto=format&fit=crop"
            }
            alt="Wedding Cover"
            className="w-full h-full object-cover opacity-90 scale-105"
          />
          <div className="absolute inset-0 bg-linear-to-t from-stone-950 via-stone-950/20 to-transparent flex flex-col justify-end p-6 text-center text-white">
            <span className="text-xs uppercase tracking-[0.3em] font-light text-amber-200/90 mb-2">
              {t("saveTheDate")}
            </span>
            <h1 className="text-3xl sm:text-4xl font-serif font-bold tracking-tight text-white mb-2">
              {data.groom?.shortName || data.groom?.fullName} &{" "}
              {data.bride?.shortName || data.bride?.fullName}
            </h1>
            <p className="text-xs text-stone-300 font-light tracking-widest uppercase">
              {formatDate(targetDate)}
            </p>
          </div>
        </section>

        {/* LỜI NGỎ */}
        <section className="p-6 text-center bg-[#fdfbf7] border-b border-stone-100">
          <div className="flex items-center justify-center gap-2 text-stone-400 mb-3">
            <div className="h-px w-10 bg-stone-300" />
            <Heart className="w-4 h-4 fill-amber-500 text-amber-500" />
            <div className="h-px w-10 bg-stone-300" />
          </div>

          <h2
            className="text-2xl font-serif font-bold tracking-tight mb-3"
            style={{ color: primaryColor }}
          >
            {t("invitationLetter")}
          </h2>

          {guestName && (
            <div className="inline-block px-4 py-1.5 bg-amber-50 rounded-full border border-amber-200 text-xs font-semibold text-amber-900 mb-4 shadow-2xs">
              {t("invitationTo")}: <span className="underline">{guestName}</span>
            </div>
          )}

          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed max-w-sm mx-auto italic font-serif">
            {card.greetingMessage ||
              data.greeting ||
              `"Tình yêu không phải là nhìn nhau, mà là cùng nhau nhìn về một hướng." Chúng mình rất vinh hạnh được đón tiếp bạn đến chung vui trong ngày trọng đại này!`}
          </p>
        </section>

        {/* GIỚI THIỆU CÔ DÂU & CHÚ RỂ */}
        <section className="p-6 bg-white">
          <div className="grid grid-cols-2 gap-4 text-center">
            {/* CHÚ RỂ */}
            <div className="flex flex-col items-center">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-2 p-1 shadow-md mb-2 border-stone-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={
                    data.groom.avatarUrl ||
                    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop"
                  }
                  alt="Chú rể"
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400">
                {t("groom")}
              </span>
              <h3 className="text-base font-bold font-serif text-stone-800 mt-0.5">
                {data.groom.fullName}
              </h3>
              {data.groom.parents && (
                <p className="text-[11px] text-stone-500 mt-1 leading-snug">
                  {t("father")}: {data.groom.parents.fatherName || "---"}
                  <br />
                  {t("mother")}: {data.groom.parents.motherName || "---"}
                </p>
              )}
            </div>

            {/* CÔ DÂU */}
            <div className="flex flex-col items-center">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-2 p-1 shadow-md mb-2 border-stone-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={
                    data.bride.avatarUrl ||
                    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&auto=format&fit=crop"
                  }
                  alt="Cô dâu"
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400">
                {t("bride")}
              </span>
              <h3 className="text-base font-bold font-serif text-stone-800 mt-0.5">
                {data.bride.fullName}
              </h3>
              {data.bride.parents && (
                <p className="text-[11px] text-stone-500 mt-1 leading-snug">
                  {t("father")}: {data.bride.parents.fatherName || "---"}
                  <br />
                  {t("mother")}: {data.bride.parents.motherName || "---"}
                </p>
              )}
            </div>
          </div>
        </section>

        {/* BỘ ĐẾM NGƯỢC COUNTDOWN */}
        <section className="px-6 py-2 bg-stone-50/60 border-y border-stone-100">
          <CountdownTimer
            targetDate={targetDate}
            title={`${t("weddingOf")} ${data.groom?.shortName || data.groom?.fullName} & ${
              data.bride?.shortName || data.bride?.fullName
            }`}
            location={mainEvent?.venueName || "Việt Nam"}
            primaryColor={primaryColor}
          />
        </section>

        {/* LỊCH TRÌNH CÁC SỰ KIỆN CƯỚI */}
        <section className="p-6 bg-white space-y-6">
          <div className="text-center">
            <span className="text-xs uppercase tracking-widest text-stone-400 font-semibold">
              Schedule & Location
            </span>
            <h2 className="text-2xl font-serif font-bold text-stone-800 mt-1">
              {t("eventsTitle")}
            </h2>
          </div>

          <div className="space-y-4">
            {card.events.map((event, idx) => (
              <div
                key={event.id || idx}
                className="p-5 rounded-3xl bg-[#fdfbf7] border border-stone-200/80 shadow-xs flex flex-col gap-3"
              >
                <div className="flex items-center justify-between border-b border-stone-200/60 pb-2.5">
                  <h4
                    className="text-base font-serif font-bold"
                    style={{ color: primaryColor }}
                  >
                    {event.eventName}
                  </h4>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-700 bg-white px-2.5 py-1 rounded-full border border-stone-200 shadow-2xs">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    <span>{formatTime(event.eventDate)}</span>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-stone-600">
                  <div className="flex items-start gap-2">
                    <Calendar className="w-4 h-4 text-stone-400 shrink-0 mt-0.5" />
                    <span>
                      {formatDate(event.eventDate)}
                      {event.lunarDate && (
                        <span className="block text-[11px] text-stone-400">
                          ({t("lunarDatePrefix")}: {event.lunarDate})
                        </span>
                      )}
                    </span>
                  </div>

                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-stone-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-stone-800 font-semibold">
                        {event.venueName}
                      </strong>
                      <p className="text-stone-500 text-[11px] mt-0.5">
                        {event.address}
                      </p>
                    </div>
                  </div>
                </div>

                {event.mapUrl && (
                  <a
                    href={event.mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-1.5 w-full py-2 bg-white hover:bg-stone-50 rounded-xl border border-stone-200 text-xs font-semibold text-stone-700 transition shadow-2xs cursor-pointer"
                  >
                    <Navigation className="w-3.5 h-3.5 text-amber-600" />
                    <span>{t("openMap")}</span>
                  </a>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ALBUM ẢNH CƯỚI GALLERY */}
        {card.photos.length > 0 && (
          <section className="p-6 bg-[#faf8f5]">
            <div className="text-center mb-4">
              <span className="text-xs uppercase tracking-widest text-stone-400 font-semibold">
                Photo Gallery
              </span>
              <h2 className="text-2xl font-serif font-bold text-stone-800 mt-1">
                {t("galleryTitle")}
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {card.photos.map((photo, idx) => (
                <div
                  key={photo.id || idx}
                  className={`relative overflow-hidden rounded-2xl bg-stone-200 shadow-xs ${
                    idx % 3 === 0 ? "col-span-2 aspect-[16/9]" : "aspect-[4/5]"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photo.url}
                    alt={photo.caption || "Ảnh cưới"}
                    className="w-full h-full object-cover hover:scale-105 transition duration-500"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* SỔ LƯU BÚT GUESTBOOK */}
        <GuestbookSection cardId={card.id} primaryColor={primaryColor} />

        {/* BOTTOM FIXED ACTION BAR DÀNH CHO KHÁCH */}
        <div className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-stone-200 p-3 shadow-lg flex items-center justify-center gap-3 max-w-md sm:max-w-lg mx-auto">
          <button
            onClick={() => setShowRsvp(true)}
            className="flex-1 py-3 px-4 rounded-2xl text-white text-xs sm:text-sm font-bold shadow-md transition cursor-pointer flex items-center justify-center gap-1.5"
            style={{ backgroundColor: primaryColor }}
          >
            <UserCheck className="w-4 h-4" />
            <span>{t("btnRsvp")}</span>
          </button>

          {(card.bankingPrimary || card.bankingSecondary) && (
            <button
              onClick={() => setShowGift(true)}
              className="py-3 px-4 rounded-2xl bg-stone-900 hover:bg-black text-white text-xs sm:text-sm font-bold shadow-md transition cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Gift className="w-4 h-4 text-amber-300" />
              <span>{t("btnGift")}</span>
            </button>
          )}
        </div>
      </main>

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
