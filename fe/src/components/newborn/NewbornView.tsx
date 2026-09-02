"use client";

import React, { useState } from "react";
import { CardDetail, NewbornDataPayload } from "@/types/card.types";
import { WaxSealOpening } from "../shared/OpeningEffect/WaxSealOpening";
import { FallingEffect } from "../shared/FallingEffect";
import { AudioPlayer } from "../shared/AudioPlayer";
import { CountdownTimer } from "../shared/CountdownTimer";
import { GiftQrBoxModal } from "../shared/GiftQrBoxModal";
import { RsvpFormModal } from "../shared/RsvpFormModal";
import { GuestbookSection } from "../shared/GuestbookSection";
import { LanguageSwitcher } from "../shared/LanguageSwitcher";
import { BocDoGame } from "./BocDoGame";
import { useLanguage } from "@/context/LanguageContext";
import {
  Baby,
  MapPin,
  Calendar,
  Clock,
  Gift,
  UserCheck,
  Navigation,
  Scale,
  Ruler,
} from "lucide-react";
import { formatDate, formatTime } from "@/lib/utils";
import { getTemplateConfig } from "@/lib/editor/template-config";

export const NewbornView: React.FC<{
  card: CardDetail;
  guestName?: string;
  guestPhone?: string;
  isVipExperience?: boolean;
  guestCode?: string;
  templateSlug?: string;
}> = ({ card, guestName, guestPhone, guestCode, isVipExperience = false, templateSlug }) => {
  const { t } = useLanguage();
  const [opened, setOpened] = useState(false);
  const [audioStarted, setAudioStarted] = useState(false);
  const [showRsvp, setShowRsvp] = useState(false);
  const [showGift, setShowGift] = useState(false);

  const data = card.categoryData as NewbornDataPayload;
  const primaryColor = card.primaryColor || "#70A1FF";
  const variant = getTemplateConfig(templateSlug || card.template?.slug, "NEWBORN")?.variant || "little-prince";

  const isAnnouncementOnly = data.ceremonyType === "ANNOUNCEMENT_ONLY";
  const isOneYear = data.ceremonyType === "ONE_YEAR";

  const mainEvent = card.events && card.events.length > 0 ? card.events[0] : null;

  const ceremonyTitle = isAnnouncementOnly
    ? t("announcementOnly")
    : isOneYear
    ? t("oneYearCeremony")
    : t("fullMonthCeremony");

  return (
    <div data-template-variant={variant} className={`relative min-h-screen text-stone-800 font-sans pb-24 overflow-x-hidden ${variant === "sweet-angel" ? "bg-[#fff4f8]" : "bg-[#f0f7ff]"}`}>
      {!opened && card.openingEffect === "WAX_SEAL" && (
        <WaxSealOpening
          primaryColor={primaryColor}
          title={`${data.babyName}`}
          subtitle={ceremonyTitle}
          guestName={guestName}
          isVipExperience={isVipExperience}
          onOpenStart={() => setAudioStarted(true)}
          onOpened={() => setOpened(true)}
        />
      )}

      <FallingEffect effect={card.fallingEffect || "BALLOON"} />
      <AudioPlayer musicUrl={card.musicUrl} autoPlay={false} startOnGesture={audioStarted && card.isAutoPlay} />

      <main className={`max-w-md sm:max-w-lg mx-auto min-h-screen shadow-2xl overflow-hidden relative ${variant === "sweet-angel" ? "bg-[#fffafd] border-x border-pink-100" : "bg-white border-x border-sky-100"}`}>
        <div className="absolute top-4 right-4 z-20">
          <LanguageSwitcher />
        </div>

        {/* HERO BANNER BÉ */}
        <section className="relative w-full aspect-[4/5] overflow-hidden bg-sky-100 flex flex-col justify-end p-6 text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={
              card.photos[0]?.url ||
              data.avatarUrl ||
              "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&auto=format&fit=crop"
            }
            alt="Baby Portrait"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-t from-sky-950/80 via-sky-950/20 to-transparent" />

          <div className="relative z-10 text-white">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[11px] font-bold tracking-widest uppercase mb-2 border border-white/30">
              <Baby className="w-3.5 h-3.5" />
              <span>{ceremonyTitle}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-serif font-extrabold text-white tracking-tight">
              {data.babyName}
            </h1>
            {data.nickname && (
              <p className="text-sm font-medium text-sky-200 mt-0.5">
                ({data.nickname})
              </p>
            )}
          </div>
        </section>

        {/* THÔNG SỐ CỦA BÉ */}
        <section className="p-6 bg-linear-to-b from-sky-50 to-white text-center">
          <h2
            className="text-xl font-bold font-serif mb-4"
            style={{ color: primaryColor }}
          >
            {t("babyTitle")} 👼
          </h2>

          <div className="grid grid-cols-3 gap-2 max-w-sm mx-auto mb-6">
            <div className="p-3 rounded-2xl bg-white border border-sky-100 shadow-xs flex flex-col items-center">
              <Calendar className="w-4 h-4 text-sky-500 mb-1" />
              <span className="text-[10px] text-stone-400">{t("birthDate")}</span>
              <span className="text-xs font-bold text-stone-800 mt-0.5">
                {new Date(data.birthDate).toLocaleDateString("vi-VN")}
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-white border border-sky-100 shadow-xs flex flex-col items-center">
              <Scale className="w-4 h-4 text-sky-500 mb-1" />
              <span className="text-[10px] text-stone-400">{t("weight")}</span>
              <span className="text-xs font-bold text-stone-800 mt-0.5">
                {data.weight || "3.2 kg"}
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-white border border-sky-100 shadow-xs flex flex-col items-center">
              <Ruler className="w-4 h-4 text-sky-500 mb-1" />
              <span className="text-[10px] text-stone-400">{t("height")}</span>
              <span className="text-xs font-bold text-stone-800 mt-0.5">
                {data.height || "50 cm"}
              </span>
            </div>
          </div>

          {guestName && (
            <div className="inline-block px-4 py-1.5 bg-sky-50 rounded-full border border-sky-200 text-xs font-semibold text-sky-900 mb-3">
              {t("invitationTo")}: {guestName}
            </div>
          )}

          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed max-w-sm mx-auto italic">
            {card.greetingMessage ||
              data.greeting ||
              `"Gia đình chúng mình vô cùng hạnh phúc khi được chào đón thiên thần nhỏ đến với thế giới này. Cảm ơn sự yêu thương và quan tâm của bạn dành cho bé!"`}
          </p>
        </section>

        {/* NẾU LÀ THÔI NÔI (ONE_YEAR) -> HIỂN THỊ MINI GAME BỐC ĐỒ */}
        {isOneYear && <BocDoGame babyName={data.nickname || data.babyName} />}

        {/* NẾU CÓ TIỆC -> HIỂN THỊ COUNTDOWN & SỰ KIỆN */}
        {!isAnnouncementOnly && mainEvent && (
          <>
            <section className="px-6 py-2 bg-sky-50/50 border-y border-sky-100">
              <CountdownTimer
                targetDate={mainEvent.eventDate}
                title={`${ceremonyTitle} - ${data.babyName}`}
                location={mainEvent.venueName}
                primaryColor={primaryColor}
              />
            </section>

            <section className="p-6 space-y-4">
              <h3 className="text-xl font-bold font-serif text-stone-800 text-center">
                {t("eventsTitle")} 🎈
              </h3>

              {card.events.map((event, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-3xl bg-sky-50/60 border border-sky-100 text-xs space-y-2.5"
                >
                  <div className="flex items-center justify-between border-b border-sky-200/60 pb-2">
                    <span
                      className="font-bold text-sm"
                      style={{ color: primaryColor }}
                    >
                      {event.eventName}
                    </span>
                    <span className="flex items-center gap-1 text-stone-700 font-semibold bg-white px-2.5 py-1 rounded-full border border-sky-200 shadow-2xs">
                      <Clock className="w-3.5 h-3.5 text-sky-600" />
                      {formatTime(event.eventDate)}
                    </span>
                  </div>

                  <div className="flex items-start gap-2 text-stone-700">
                    <Calendar className="w-4 h-4 text-sky-500 shrink-0" />
                    <span>{formatDate(event.eventDate)}</span>
                  </div>

                  <div className="flex items-start gap-2 text-stone-700">
                    <MapPin className="w-4 h-4 text-sky-500 shrink-0" />
                    <div>
                      <strong className="text-stone-900">{event.venueName}</strong>
                      <p className="text-stone-500 mt-0.5">{event.address}</p>
                    </div>
                  </div>

                  {event.mapUrl && (
                    <a
                      href={event.mapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-1.5 w-full py-2.5 bg-white hover:bg-sky-50 rounded-xl text-sky-700 border border-sky-200 font-semibold transition"
                    >
                      <Navigation className="w-3.5 h-3.5 text-sky-600" />
                      <span>{t("openMap")}</span>
                    </a>
                  )}
                </div>
              ))}
            </section>
          </>
        )}

        {/* ALBUM ẢNH BÉ */}
        {card.photos.length > 0 && (
          <section className="p-6 bg-stone-50">
            <h3 className="text-xl font-bold font-serif text-stone-800 text-center mb-4">
              {t("galleryTitle")} 📸
            </h3>
            <div className="grid grid-cols-2 gap-2.5">
              {card.photos.map((p, idx) => (
                <div
                  key={idx}
                  className="aspect-square rounded-2xl overflow-hidden bg-sky-100 shadow-xs"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={p.url}
                    alt="Baby Moment"
                    className="w-full h-full object-cover hover:scale-105 transition"
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* SỔ LƯU BÚT */}
        <GuestbookSection cardId={card.id} primaryColor={primaryColor} />

        {/* ACTION BAR */}
        <div className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-sky-100 p-3 flex items-center justify-center gap-3 max-w-md sm:max-w-lg mx-auto">
          {!isAnnouncementOnly ? (
            <button
              onClick={() => setShowRsvp(true)}
              className="flex-1 py-3 px-4 rounded-2xl text-white text-xs sm:text-sm font-bold shadow-lg cursor-pointer flex items-center justify-center gap-1.5"
              style={{ backgroundColor: primaryColor }}
            >
              <UserCheck className="w-4 h-4" />
              <span>{t("btnRsvp")}</span>
            </button>
          ) : (
            <div className="flex-1 text-center text-xs text-sky-700 font-semibold">
              ✨ {t("wishSuccess")}
            </div>
          )}

          {card.bankingPrimary && (
            <button
              onClick={() => setShowGift(true)}
              className="py-3 px-4 rounded-2xl bg-stone-900 hover:bg-black text-white text-xs sm:text-sm font-bold cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Gift className="w-4 h-4 text-amber-300" />
              <span>{t("babyGiftTab")}</span>
            </button>
          )}
        </div>
      </main>

      <RsvpFormModal
        isOpen={showRsvp}
        onClose={() => setShowRsvp(false)}
        cardId={card.id}
        defaultGuestName={guestName}
        defaultGuestPhone={guestPhone}
        guestCode={guestCode}
        primaryColor={primaryColor}
      />

      <GiftQrBoxModal
        isOpen={showGift}
        onClose={() => setShowGift(false)}
        bankingPrimary={card.bankingPrimary}
        labelPrimary={t("babyGiftTab")}
        primaryColor={primaryColor}
      />
    </div>
  );
};
