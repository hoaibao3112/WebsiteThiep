"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { WeddingTemplateProps } from "./types";
import {
  MapPin,
  Calendar,
  Navigation,
  Send,
  Heart,
  ChevronDown,
  Volume2,
  VolumeX,
  ExternalLink,
  Sparkles,
  Share2,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import Image from "next/image";

export const Template10NhaCoHy: React.FC<WeddingTemplateProps> = ({
  card,
  data,
  primaryColor = "#B22222",
  guestName,
  onOpenRsvp,
  onOpenGift,
  onSelectPhoto,
  isPreview = false,
}) => {
  // ── 1. DỮ LIỆU CÔ DÂU & CHÚ RỂ ──
  const groomName = data.groom?.fullName || "Nguyễn Hoài Nam";
  const groomShort = data.groom?.shortName || groomName.split(" ").slice(-2).join(" ");
  const groomBirthOrder = data.groom?.birthOrder || "Thứ Nam";
  const groomFather = data.groom?.parents?.fatherName || "Nguyễn Văn Khải";
  const groomMother = data.groom?.parents?.motherName || "Trần Thu Hương";
  const groomAddress =
    data.groom?.parents?.address ||
    data.groom?.address ||
    "82 Trần Phú, phường Nha Trang, tỉnh Khánh Hòa";

  const brideName = data.bride?.fullName || "Võ Ngọc Diễm";
  const brideShort = data.bride?.shortName || brideName.split(" ").slice(-2).join(" ");
  const brideBirthOrder = data.bride?.birthOrder || "Út Nữ";
  const brideFather = data.bride?.parents?.fatherName || "Võ Quốc Cường";
  const brideMother = data.bride?.parents?.motherName || "Lê Thanh Mai";
  const brideAddress =
    data.bride?.parents?.address ||
    data.bride?.address ||
    "45 Lê Hồng Phong, phường Tuy Hòa, tỉnh Đắk Lắk";

  // ── 2. DỮ LIỆU SỰ KIỆN (LỄ THÀNH HÔN & TIỆC CƯỚI) ──
  const events = card.events && card.events.length > 0 ? card.events : [];
  const eventCeremony = events[0] || {
    eventName: "Lễ Thành Hôn",
    eventDate: new Date("2026-03-23T09:00:00Z"),
    lunarDate: "Tức ngày 05/02 năm Bính Ngọ âm lịch",
    venueName: "Tư Gia",
    address: groomAddress,
    mapUrl: "https://maps.google.com/?q=82+Trần+Phú+Nha+Trang",
  };

  const eventParty = events[1] || events[0] || {
    eventName: "Tiệc Cưới",
    eventDate: new Date("2026-05-03T18:00:00Z"),
    lunarDate: "Tức ngày 17/03 năm Bính Ngọ âm lịch",
    venueName: "Vinpearl Resort Nha Trang",
    address: "Vinpearl Resort Nha Trang, đảo Hòn Tre, phường Nha Trang, tỉnh Khánh Hòa.",
    mapUrl: "https://maps.google.com/?q=Vinpearl+Resort+Nha+Trang",
  };

  // Helper parse ngày tháng
  const parseDateDetails = (rawDate: string | Date) => {
    const d = new Date(rawDate);
    if (isNaN(d.getTime())) {
      return { dayName: "CHỦ NHẬT", day: "03", month: "05", year: "2026", time: "18:00" };
    }
    const daysOfWeek = ["CHỦ NHẬT", "THỨ HAI", "THỨ BA", "THỨ TƯ", "THỨ NĂM", "THỨ SÁU", "THỨ BẢY"];
    const dayName = daysOfWeek[d.getDay()];
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = String(d.getFullYear());
    const hours = String(d.getHours()).padStart(2, "0");
    const mins = String(d.getMinutes()).padStart(2, "0");
    return { dayName, day, month, year, time: `${hours}:${mins}` };
  };

  const ceremonyTime = parseDateDetails(eventCeremony.eventDate);
  const partyTime = parseDateDetails(eventParty.eventDate);

  // ── 3. ALBUM ẢNH (LƯỚI 4 ẢNH) ──
  const defaultPhotos = [
    "/images/templates/t10-nha-co-hy/hero-illustration.jpg",
    "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1606800052052-a08af7148866?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&auto=format&fit=crop",
  ];
  const cardPhotos = (card.photos && card.photos.length > 0)
    ? card.photos.map((p) => p.url)
    : defaultPhotos;

  const displayPhotos = cardPhotos.slice(0, 4);
  const remainingCount = Math.max(0, cardPhotos.length - 3);

  // ── 4. SỔ LƯU BÚT (STATE & SUBMIT) ──
  const [wishName, setWishName] = useState(guestName || "");
  const [wishContent, setWishContent] = useState("");
  const [submittingWish, setSubmittingWish] = useState(false);
  const [wishSuccess, setWishSuccess] = useState(false);
  const [wishesList, setWishesList] = useState<{ id: string; name: string; content: string; createdAt: string }[]>([]);

  // Tải danh sách lời chúc từ Backend nếu card có id thật
  useEffect(() => {
    if (card.id && !card.id.startsWith("demo-") && !card.id.startsWith("draft-")) {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://websitethiep.onrender.com/api";
      fetch(`${apiUrl}/wishes/${card.id}`)
        .then((r) => r.json())
        .then((res) => {
          if (res.success && Array.isArray(res.data)) {
            setWishesList(
              res.data.map((w: any) => ({
                id: w.id,
                name: w.guestName || "Khách mời",
                content: w.content || w.message || "",
                createdAt: w.createdAt ? new Date(w.createdAt).toLocaleDateString("vi-VN") : "",
              }))
            );
          }
        })
        .catch(() => {});
    }
  }, [card.id]);

  const handleSubmitWish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wishName.trim() || !wishContent.trim()) return;

    setSubmittingWish(true);
    const newWishItem = {
      id: `local-${Date.now()}`,
      name: wishName.trim(),
      content: wishContent.trim(),
      createdAt: "Vừa xong",
    };

    if (card.id && !card.id.startsWith("demo-") && !card.id.startsWith("draft-")) {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://websitethiep.onrender.com/api";
        const res = await fetch(`${apiUrl}/wishes`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            cardId: card.id,
            guestName: wishName.trim(),
            content: wishContent.trim(),
          }),
        });
        const json = await res.json();
        if (json.success) {
          setWishesList((prev) => [newWishItem, ...prev]);
        }
      } catch (err) {
        setWishesList((prev) => [newWishItem, ...prev]);
      }
    } else {
      // Demo / preview mode
      setWishesList((prev) => [newWishItem, ...prev]);
    }

    setSubmittingWish(false);
    setWishSuccess(true);
    setWishContent("");
    setTimeout(() => setWishSuccess(false), 4000);
  };

  // ── 5. WIDGET TỜ LỊCH THÁNG (TỰ ĐỘNG SINH TỪ THÁNG TIỆC CƯỚI) ──
  const partyDateObj = new Date(eventParty.eventDate);
  const calendarYear = isNaN(partyDateObj.getTime()) ? 2026 : partyDateObj.getFullYear();
  const calendarMonth = isNaN(partyDateObj.getTime()) ? 5 : partyDateObj.getMonth() + 1; // 1-indexed
  const calendarWeddingDay = isNaN(partyDateObj.getTime()) ? 3 : partyDateObj.getDate();

  // Tính số ngày và ngày bắt đầu của tháng
  const daysInMonth = new Date(calendarYear, calendarMonth, 0).getDate();
  const firstDayIndex = (new Date(calendarYear, calendarMonth - 1, 1).getDay() + 6) % 7; // Thứ 2 = 0, CN = 6

  // Google Calendar link
  const makeGoogleCalendarUrl = () => {
    const title = encodeURIComponent(`Đám Cưới ${groomShort} & ${brideShort}`);
    const details = encodeURIComponent(
      `Trân trọng kính mời bạn đến dự Tiệc Cưới của ${groomName} & ${brideName} tại ${eventParty.venueName}`
    );
    const location = encodeURIComponent(eventParty.address || eventParty.venueName);
    const startIso = (partyDateObj && !isNaN(partyDateObj.getTime()) ? partyDateObj : new Date())
      .toISOString()
      .replace(/-|:|\.\d\d\d/g, "");
    const endObj = new Date((partyDateObj && !isNaN(partyDateObj.getTime()) ? partyDateObj : new Date()).getTime() + 4 * 3600000);
    const endIso = endObj.toISOString().replace(/-|:|\.\d\d\d/g, "");
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startIso}/${endIso}&details=${details}&location=${location}`;
  };

  // Cuộn trang mượt xuống phần thông tin
  const scrollToContent = () => {
    const el = document.getElementById("ceremony-info-section");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div
      data-template-slug="wedding-nha-co-hy"
      className="relative min-h-screen w-full bg-[#FAF5EB] text-[#2E1618] font-serif overflow-x-hidden selection:bg-red-200 selection:text-red-900"
      style={{
        backgroundImage: `radial-gradient(#D6C2A0 0.8px, transparent 0.8px), radial-gradient(#D6C2A0 0.8px, #FAF5EB 0.8px)`,
        backgroundSize: "32px 32px",
        backgroundPosition: "0 0, 16px 16px",
      }}
    >
      {/* KHUNG BAO CHÍNH - TỈ LỆ THIỆP DI ĐỘNG CHUẨN */}
      <div className="w-full max-w-[430px] mx-auto min-h-screen bg-[#FFFDF9] shadow-[0_10px_45px_rgba(178,34,34,0.12)] border-x border-[#EBDCC5]/80 relative flex flex-col">
        
        {/* ───────────────────────────────────────────────────────────── */}
        {/* 1. MÀN 1: HERO COVER (CỔ PHỤC ÁO TẤC NHẬT BÌNH & SONG HỶ)   */}
        {/* ───────────────────────────────────────────────────────────── */}
        <section className="relative w-full min-h-[92vh] flex flex-col items-center justify-between p-4 pt-6 pb-8 overflow-hidden">
          {/* Cành hoa đào / mai nở ở góc trên bên trái */}
          <div className="absolute -top-4 -left-4 w-36 h-36 pointer-events-none opacity-90 z-20">
            <svg viewBox="0 0 100 100" className="w-full h-full text-[#B22222]">
              <path d="M 0,0 C 30,10 50,40 60,70" fill="none" stroke="#7A3B18" strokeWidth="2.5" />
              <path d="M 25,18 C 35,28 45,30 50,35" fill="none" stroke="#7A3B18" strokeWidth="1.5" />
              <circle cx="20" cy="14" r="5" fill="#C42B2B" opacity="0.85" />
              <circle cx="35" cy="22" r="6" fill="#D93838" opacity="0.9" />
              <circle cx="48" cy="34" r="4.5" fill="#E65252" opacity="0.8" />
              <circle cx="58" cy="65" r="5.5" fill="#C42B2B" opacity="0.85" />
            </svg>
          </div>

          {/* Lồng đèn đỏ truyền thống góc trên bên phải */}
          <div className="absolute top-3 right-4 pointer-events-none z-20 flex flex-col items-center animate-bounce-gentle">
            <div className="w-0.5 h-6 bg-[#C89B3C]" />
            <div className="w-7 h-9 rounded-full bg-gradient-to-b from-[#C42B2B] to-[#8F1212] border border-[#FFD700]/70 shadow-sm flex items-center justify-center">
              <span className="text-[7px] text-[#FFE8A3] font-bold">囍</span>
            </div>
            <div className="w-0.5 h-3 bg-[#C89B3C]" />
          </div>

          {/* TÊN CÔ DÂU & CHÚ RỂ */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center z-10 pt-4"
          >
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-wider text-[#B22222] uppercase drop-shadow-xs leading-tight font-serif">
              {groomShort}
            </h1>
            <div className="text-lg font-bold text-[#B22222]/80 my-0.5">&amp;</div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-wider text-[#B22222] uppercase drop-shadow-xs leading-tight font-serif">
              {brideShort}
            </h1>
          </motion.div>

          {/* HÌNH ẢNH MINH HOẠ CHÚ RỂ & CÔ DÂU CỔ PHỤC */}
          <div className="relative w-full max-w-[340px] my-auto flex items-center justify-center">
            <motion.div
              initial={{ scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.9, delay: 0.2 }}
              className="relative w-full aspect-[9/15] rounded-3xl overflow-hidden shadow-[0_12px_36px_rgba(178,34,34,0.18)] border-2 border-[#C89B3C]/50 bg-gradient-to-b from-[#FFFDF9] to-[#F7EEDC]"
            >
              <Image
                src="/images/templates/t10-nha-co-hy/hero-illustration.jpg"
                alt="Minh hoạ Cổ Phục Nhà Có Hỷ"
                fill
                priority
                className="object-cover object-top"
                sizes="(max-width: 430px) 100vw, 430px"
              />

              {/* Con dấu triện "NHÀ CÓ HỶ" */}
              <div className="absolute bottom-4 left-4 z-20">
                <div className="px-2.5 py-1.5 rounded-lg border-2 border-[#B22222] bg-[#FAF5EB]/90 text-[#B22222] font-black text-xs tracking-widest uppercase shadow-md flex flex-col items-center leading-none">
                  <span>NHÀ</span>
                  <span className="my-0.5">CÓ</span>
                  <span>HỶ</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* DƯỚI CHÂN HERO: NÚT CUỘN & TIÊU ĐỀ KHỐI THÔNG TIN */}
          <div className="w-full text-center z-10 pt-2 space-y-3">
            {/* Khung viền góc cổ điển */}
            <div className="relative inline-block px-8 py-2 border-y border-[#B22222]/40">
              <span className="absolute -top-1.5 left-0 text-[#B22222] text-xs">⌜</span>
              <span className="absolute -top-1.5 right-0 text-[#B22222] text-xs">⌝</span>
              <h2 className="text-base sm:text-lg font-black tracking-widest text-[#B22222] uppercase">
                THÔNG TIN LỄ CƯỚI
              </h2>
              <span className="absolute -bottom-1.5 left-0 text-[#B22222] text-xs">⌞</span>
              <span className="absolute -bottom-1.5 right-0 text-[#B22222] text-xs">⌟</span>
            </div>

            {/* Nút cuộn xuống */}
            <div>
              <button
                type="button"
                onClick={scrollToContent}
                className="w-10 h-10 rounded-full bg-[#B22222] hover:bg-[#8F1212] text-white flex items-center justify-center mx-auto shadow-md transition active:scale-95 cursor-pointer animate-pulse"
                title="Xem thông tin chi tiết"
              >
                <ChevronDown className="w-5 h-5" />
              </button>
            </div>
          </div>
        </section>

        {/* ───────────────────────────────────────────────────────────── */}
        {/* 2. MÀN 2: THÔNG TIN LỄ CƯỚI & GIA ĐÌNH HAI BÊN               */}
        {/* ───────────────────────────────────────────────────────────── */}
        <section id="ceremony-info-section" className="w-full px-5 py-8 space-y-6 relative border-t border-[#EBDCC5]/60 bg-gradient-to-b from-[#FFFDF9] via-[#FAF5EB] to-[#FFFDF9]">
          
          {/* BẢNG THÔNG TIN PHỤ MẪU 2 BÊN */}
          <div className="grid grid-cols-2 gap-3 text-center border-b border-[#B22222]/20 pb-6 relative">
            <div className="absolute top-2 bottom-6 left-1/2 w-[1px] bg-[#B22222]/20 -translate-x-1/2" />
            
            {/* NHÀ TRAI */}
            <div className="space-y-1 pr-2">
              <span className="text-[11px] font-bold tracking-wider text-stone-500 uppercase block">Ông Bà</span>
              <h3 className="text-xs sm:text-sm font-bold text-[#2E1618]">{groomFather}</h3>
              <h3 className="text-xs sm:text-sm font-bold text-[#2E1618]">{groomMother}</h3>
              <p className="text-[10px] sm:text-[11px] text-stone-600 leading-tight pt-1">
                {groomAddress}
              </p>
            </div>

            {/* NHÀ GÁI */}
            <div className="space-y-1 pl-2">
              <span className="text-[11px] font-bold tracking-wider text-stone-500 uppercase block">Ông Bà</span>
              <h3 className="text-xs sm:text-sm font-bold text-[#2E1618]">{brideFather}</h3>
              <h3 className="text-xs sm:text-sm font-bold text-[#2E1618]">{brideMother}</h3>
              <p className="text-[10px] sm:text-[11px] text-stone-600 leading-tight pt-1">
                {brideAddress}
              </p>
            </div>
          </div>

          {/* DÒNG BÁO TIN & TÊN CÔ DÂU CHÚ RỂ */}
          <div className="text-center space-y-3 pt-2">
            <p className="text-[11px] sm:text-xs tracking-widest text-[#B22222] font-semibold uppercase">
              TRÂN TRỌNG BÁO TIN<br />LỄ THÀNH HÔN CỦA CON CHÚNG TÔI.
            </p>

            <div className="space-y-1 pt-1">
              <h2 className="text-xl sm:text-2xl font-black tracking-wide text-[#B22222] uppercase">
                {groomName}
              </h2>
              <span className="text-xs font-semibold text-stone-600 uppercase tracking-wider block">
                {groomBirthOrder}
              </span>
            </div>

            <div className="text-xl font-bold text-[#B22222] my-1">&amp;</div>

            <div className="space-y-1">
              <h2 className="text-xl sm:text-2xl font-black tracking-wide text-[#B22222] uppercase">
                {brideName}
              </h2>
              <span className="text-xs font-semibold text-stone-600 uppercase tracking-wider block">
                {brideBirthOrder}
              </span>
            </div>
          </div>

          {/* KHUNG THỜI GIAN LỄ THÀNH HÔN */}
          <div className="text-center pt-4 space-y-2 border-t border-[#B22222]/20">
            <p className="text-[11px] tracking-widest text-stone-700 font-bold uppercase">
              LỄ THÀNH HÔN ĐƯỢC CỬ HÀNH TẠI<br />
              <span className="text-[#B22222] font-black">{eventCeremony.venueName || "TƯ GIA"}</span> VÀO LÚC
            </p>

            <div className="text-2xl sm:text-3xl font-black text-[#2E1618] font-mono tracking-tight">
              {ceremonyTime.time}
            </div>

            {/* BỐ CỤC NGÀY THÁNG NỔI BẬT */}
            <div className="flex items-center justify-center gap-3 py-1 font-semibold text-xs sm:text-sm text-[#2E1618]">
              <span className="tracking-wider">{ceremonyTime.dayName}</span>
              <span className="text-stone-300">|</span>
              <span className="text-2xl sm:text-3xl font-black text-[#B22222] font-mono">{ceremonyTime.day}</span>
              <span className="text-stone-300">|</span>
              <span className="tracking-wider">THÁNG {ceremonyTime.month}</span>
            </div>

            <div className="text-base font-bold text-[#2E1618] font-mono">
              {ceremonyTime.year}
            </div>

            <p className="text-xs text-stone-600 italic pt-1">
              {eventCeremony.lunarDate || "Tức ngày 05/02 năm Bính Ngọ âm lịch"}
            </p>
          </div>
        </section>

        {/* ───────────────────────────────────────────────────────────── */}
        {/* 3. MÀN 3: ALBUM ẢNH & THÔNG TIN TIỆC CƯỚI                    */}
        {/* ───────────────────────────────────────────────────────────── */}
        <section className="w-full px-5 py-8 space-y-7 bg-[#FFFDF9] border-t border-[#EBDCC5]/60">
          
          {/* TIÊU ĐỀ ALBUM */}
          <div className="text-center">
            <h2 className="text-lg sm:text-xl font-black tracking-widest text-[#B22222] uppercase">
              ALBUM ẢNH
            </h2>
            <div className="w-12 h-0.5 bg-[#C89B3C] mx-auto mt-1" />
          </div>

          {/* LƯỚI 4 ẢNH (2x2) */}
          <div className="grid grid-cols-2 gap-2.5">
            {displayPhotos.map((photoUrl, idx) => {
              const isLast = idx === 3 && remainingCount > 0;
              return (
                <div
                  key={idx}
                  onClick={() => onSelectPhoto(photoUrl)}
                  className="relative aspect-square rounded-2xl overflow-hidden border border-[#EBDCC5] shadow-xs cursor-pointer group bg-stone-100"
                >
                  <Image
                    src={photoUrl}
                    alt={`Ảnh cưới ${idx + 1}`}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="200px"
                  />
                  {isLast && (
                    <div className="absolute inset-0 bg-black/55 backdrop-blur-[1px] flex items-center justify-center text-white font-bold text-lg">
                      +{remainingCount}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* PHÂN CÁCH TRANG TRỌNG */}
          <div className="relative text-center my-4">
            <div className="h-[1px] bg-[#B22222]/20 w-full" />
            <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-3 bg-[#FFFDF9] text-[#B22222] text-xs font-bold">
              ❖
            </span>
          </div>

          {/* THÔNG TIN TIỆC CƯỚI (RECEPTION PARTY) */}
          <div className="text-center space-y-2 pt-1">
            <h2 className="text-lg sm:text-xl font-black tracking-widest text-[#B22222] uppercase">
              THÔNG TIN TIỆC CƯỚI
            </h2>

            <p className="text-[11px] tracking-widest text-stone-700 font-bold uppercase pt-1">
              TIỆC CƯỚI SẼ DIỄN RA VÀO LÚC:
            </p>

            <div className="text-2xl sm:text-3xl font-black text-[#2E1618] font-mono tracking-tight">
              {partyTime.time}
            </div>

            {/* BỐ CỤC NGÀY THÁNG TIỆC */}
            <div className="flex items-center justify-center gap-3 py-1 font-semibold text-xs sm:text-sm text-[#2E1618]">
              <span className="tracking-wider">{partyTime.dayName}</span>
              <span className="text-stone-300">|</span>
              <span className="text-2xl sm:text-3xl font-black text-[#B22222] font-mono">{partyTime.day}</span>
              <span className="text-stone-300">|</span>
              <span className="tracking-wider">THÁNG {partyTime.month}</span>
            </div>

            <div className="text-base font-bold text-[#2E1618] font-mono">
              {partyTime.year}
            </div>

            <p className="text-xs text-stone-600 italic uppercase">
              {eventParty.lunarDate || "TỨC NGÀY 17/03 NĂM BÍNH NGỌ ÂM LỊCH"}
            </p>
          </div>
        </section>

        {/* ───────────────────────────────────────────────────────────── */}
        {/* 4. MÀN 4: LỊCH THÁNG, THÊM LỊCH, RSVP & BẢN ĐỒ MAPS         */}
        {/* ───────────────────────────────────────────────────────────── */}
        <section className="w-full px-5 py-8 space-y-6 bg-gradient-to-b from-[#FFFDF9] via-[#FAF5EB] to-[#FFFDF9] border-t border-[#EBDCC5]/60">
          
          {/* WIDGET TỜ LỊCH THÁNG */}
          <div className="w-full max-w-[320px] mx-auto bg-white rounded-2xl shadow-sm border border-[#EBDCC5] overflow-hidden">
            {/* Header Lịch */}
            <div className="bg-[#B22222] text-white py-2 px-4 text-center font-bold text-xs tracking-wider">
              Tháng {calendarMonth} / {calendarYear}
            </div>

            {/* Lưới các ngày */}
            <div className="p-3 text-center">
              <div className="grid grid-cols-7 text-[10px] font-bold text-stone-400 mb-2">
                <span>T2</span>
                <span>T3</span>
                <span>T4</span>
                <span>T5</span>
                <span>T6</span>
                <span>T7</span>
                <span className="text-[#B22222]">CN</span>
              </div>

              <div className="grid grid-cols-7 gap-y-1.5 text-xs font-semibold text-stone-700">
                {/* Khoảng trống trước ngày đầu tháng */}
                {Array.from({ length: firstDayIndex }).map((_, i) => (
                  <span key={`empty-${i}`} className="p-1" />
                ))}

                {/* Các ngày trong tháng */}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const dayNum = i + 1;
                  const isWeddingDay = dayNum === calendarWeddingDay;
                  return (
                    <div key={dayNum} className="flex items-center justify-center p-0.5">
                      {isWeddingDay ? (
                        <span className="w-6 h-6 rounded-full bg-[#B22222] text-white font-bold flex items-center justify-center shadow-xs">
                          {dayNum}
                        </span>
                      ) : (
                        <span className="w-6 h-6 flex items-center justify-center text-stone-600">
                          {dayNum}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* NÚT THÊM VÀO LỊCH & NÚT XÁC NHẬN RSVP */}
          <div className="text-center space-y-3 pt-1">
            <a
              href={makeGoogleCalendarUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-bold text-[#B22222] underline underline-offset-4 hover:text-[#8F1212] transition inline-block"
            >
              Thêm vào lịch
            </a>

            <div>
              <button
                type="button"
                onClick={onOpenRsvp}
                className="w-full max-w-[240px] py-3 rounded-full bg-[#B22222] hover:bg-[#8F1212] text-white font-bold text-xs tracking-wider uppercase shadow-md transition active:scale-95 cursor-pointer mx-auto flex items-center justify-center gap-2"
              >
                <span>XÁC NHẬN</span>
              </button>
            </div>
          </div>

          {/* ĐỊA ĐIỂM TIỆC CƯỚI & GOOGLE MAPS */}
          <div className="text-center space-y-3 pt-4 border-t border-[#B22222]/20">
            <h2 className="text-base sm:text-lg font-black tracking-widest text-[#B22222] uppercase">
              TIỆC CƯỚI SẼ TỔ CHỨC TẠI
            </h2>

            <p className="text-xs sm:text-sm font-bold text-stone-800 leading-snug px-2">
              {eventParty.address || eventParty.venueName}
            </p>

            {/* Khung bản đồ */}
            <div className="relative w-full aspect-[16/10] rounded-2xl overflow-hidden border border-[#EBDCC5] shadow-xs mt-3 bg-stone-100">
              <iframe
                title="Bản đồ chỉ đường tiệc cưới"
                src={`https://maps.google.com/maps?q=${encodeURIComponent(eventParty.address || eventParty.venueName)}&t=&z=14&ie=UTF8&iwloc=&output=embed`}
                className="w-full h-full border-0"
                loading="lazy"
              />
              <a
                href={eventParty.mapUrl || `https://maps.google.com/?q=${encodeURIComponent(eventParty.address)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute top-2 left-2 px-3 py-1.5 rounded-lg bg-white/95 text-stone-800 text-[11px] font-bold shadow-sm flex items-center gap-1.5 hover:bg-white"
              >
                <ExternalLink className="w-3.5 h-3.5 text-[#B22222]" />
                <span>Mở trong Maps</span>
              </a>
            </div>

            {/* Nút chỉ đường */}
            <div className="pt-2">
              <a
                href={eventParty.mapUrl || `https://maps.google.com/?q=${encodeURIComponent(eventParty.address)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-2 rounded-full border border-[#B22222] text-[#B22222] hover:bg-[#B22222] hover:text-white font-bold text-xs tracking-wider transition inline-flex items-center gap-1.5"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>Chỉ đường</span>
              </a>
            </div>
          </div>
        </section>

        {/* ───────────────────────────────────────────────────────────── */}
        {/* 5. MÀN 5: SỔ LƯU BÚT & PHONG BAO MỪNG CƯỚI                  */}
        {/* ───────────────────────────────────────────────────────────── */}
        <section className="w-full px-5 py-8 space-y-7 bg-[#FFFDF9] border-t border-[#EBDCC5]/60">
          
          {/* SỔ LƯU BÚT */}
          <div className="space-y-4">
            <div className="text-center">
              <h2 className="text-lg sm:text-xl font-black tracking-widest text-[#B22222] uppercase">
                SỔ LƯU BÚT
              </h2>
              <div className="w-12 h-0.5 bg-[#C89B3C] mx-auto mt-1" />
            </div>

            {/* Form Gửi Lời Chúc */}
            <form onSubmit={handleSubmitWish} className="space-y-3 pt-2">
              <input
                type="text"
                placeholder="Nhập tên của bạn*"
                value={wishName}
                onChange={(e) => setWishName(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#EBDCC5] bg-[#FAF5EB]/50 text-xs text-stone-800 placeholder:text-stone-400 focus:outline-none focus:border-[#B22222] focus:bg-white"
              />

              <textarea
                placeholder="Nhập lời chúc của bạn*"
                rows={3}
                value={wishContent}
                onChange={(e) => setWishContent(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#EBDCC5] bg-[#FAF5EB]/50 text-xs text-stone-800 placeholder:text-stone-400 focus:outline-none focus:border-[#B22222] focus:bg-white resize-none"
              />

              <div className="text-right">
                <button
                  type="submit"
                  disabled={submittingWish}
                  className="px-6 py-2.5 rounded-xl bg-[#B22222] hover:bg-[#8F1212] text-white font-bold text-xs tracking-wider uppercase shadow-xs transition active:scale-95 cursor-pointer disabled:opacity-60 inline-flex items-center gap-1.5"
                >
                  {submittingWish ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>ĐANG GỬI...</span>
                    </>
                  ) : (
                    <span>GỬI LỜI CHÚC</span>
                  )}
                </button>
              </div>

              {wishSuccess && (
                <p className="text-center text-xs font-semibold text-emerald-700 bg-emerald-50 py-1.5 rounded-lg border border-emerald-200">
                  Cảm ơn bạn đã gửi lời chúc tốt đẹp đến đôi uyên ương! ✨
                </p>
              )}
            </form>

            {/* Danh sách lời chúc */}
            <div className="space-y-2 pt-2">
              {wishesList.length === 0 ? (
                <p className="text-center text-xs text-stone-400 italic py-2">
                  Chưa có lời chúc nào. Hãy là người đầu tiên!
                </p>
              ) : (
                <div className="max-h-52 overflow-y-auto space-y-2 pr-1 no-scrollbar">
                  {wishesList.map((wish) => (
                    <div key={wish.id} className="p-3 rounded-xl bg-[#FAF5EB] border border-[#EBDCC5]/70 space-y-1">
                      <div className="flex items-center justify-between text-[11px] font-bold text-[#B22222]">
                        <span>{wish.name}</span>
                        <span className="text-[10px] text-stone-400 font-normal">{wish.createdAt}</span>
                      </div>
                      <p className="text-xs text-stone-700 leading-relaxed">{wish.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* PHONG BAO MỪNG CƯỚI SONG HỶ */}
          <div className="text-center pt-4 space-y-3 border-t border-[#B22222]/20">
            <h2 className="text-base sm:text-lg font-black tracking-widest text-[#B22222] uppercase">
              PHONG BAO MỪNG CƯỚI
            </h2>

            {/* Hình ảnh 2 phong bao lì xì tương tác */}
            <div
              onClick={onOpenGift}
              className="relative w-full max-w-[280px] mx-auto aspect-square rounded-3xl overflow-hidden cursor-pointer group shadow-md hover:shadow-xl transition-all duration-300 border-2 border-[#C89B3C]/40 bg-[#FAF5EB]"
            >
              <Image
                src="/images/templates/t10-nha-co-hy/red-envelopes.jpg"
                alt="Phong bao mừng cưới Song Hỷ"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                sizes="280px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex flex-col items-center justify-end pb-4">
                <span className="px-3.5 py-1 rounded-full bg-[#B22222]/90 text-white font-bold text-[11px] uppercase tracking-wider shadow-sm group-hover:bg-[#8F1212] transition">
                  Nhấn để mở
                </span>
              </div>
            </div>

            <p className="text-xs text-stone-600 leading-relaxed pt-2 px-2">
              Sự hiện diện của quý khách là niềm vinh hạnh của gia đình chúng tôi!
            </p>

            <div className="pt-2 text-[11px] text-stone-400 tracking-wider">
              ♡ thiepmungonline.com
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
