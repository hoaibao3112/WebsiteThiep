"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Menu,
  X,
  Sparkles,
  QrCode,
  Sparkle,
  Image as ImageIcon,
  Globe2,
  CalendarCheck,
} from "lucide-react";
import { LanguageSwitcher } from "@/components/shared/LanguageSwitcher";

export default function CardViteHomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Bộ chọn danh mục (Không dùng emoji, phong cách tối giản thanh lịch)
  const [selectedCategory, setSelectedCategory] = useState("WEDDING");
  const [customName, setCustomName] = useState("");
  const [selectedEffect, setSelectedEffect] = useState("WAX_SEAL");
  const [selectedColor, setSelectedColor] = useState("#C8A251");

  const categories = [
    { id: "WEDDING", label: "Đám Cưới & Lễ Thành Hôn" },
    { id: "NEWBORN", label: "Đầy Tháng & Thôi Nôi" },
    { id: "BIRTHDAY", label: "Sinh Nhật & Party" },
    { id: "EVENT", label: "Sự Kiện Doanh Nghiệp" },
  ];

  const themeColors = [
    { name: "Hoàng Kim", hex: "#C8A251" },
    { name: "Xanh Rêu", hex: "#4E654C" },
    { name: "San Hô", hex: "#E08269" },
    { name: "Hồng Phấn", hex: "#F5A893" },
  ];

  return (
    <div className="min-h-screen w-full bg-[#FAF7F2] text-[#181716] font-sans antialiased overflow-x-hidden selection:bg-[#C8A251]/20">
      {/* ------------------------------------------------------------- */}
      {/* 1. HEADER & NAVIGATION BAR */}
      {/* ------------------------------------------------------------- */}
      <header className="w-full px-6 py-6 md:px-12 lg:px-20 bg-[#FAF7F2]">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          {/* LOGO */}
          <Link href="/" className="group flex items-center">
            <span className="text-3xl font-serif font-bold tracking-tight text-[#181716] group-hover:text-[#99732b] transition">
              CardVite
            </span>
          </Link>

          {/* DESKTOP NAV LINKS */}
          <nav className="hidden md:flex items-center gap-10 text-[11px] font-bold uppercase tracking-[0.2em] text-[#181716]/80">
            <Link
              href="#collections"
              className="text-[#99732b] border-b-2 border-[#99732b] pb-0.5"
            >
              COLLECTIONS
            </Link>
            <Link href="#custom" className="hover:text-[#181716] transition">
              CUSTOM
            </Link>
            <Link href="#rsvp" className="hover:text-[#181716] transition">
              RSVP
            </Link>
            <Link href="#gallery" className="hover:text-[#181716] transition">
              GALLERY
            </Link>
          </nav>

          {/* RIGHT BUTTON */}
          <div className="hidden md:flex items-center gap-3">
            <LanguageSwitcher />
            <Link
              href="/dashboard/cards/new"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#7a5e28] hover:bg-[#684f22] text-white text-[11px] font-bold tracking-widest uppercase shadow-xs hover:scale-105 transition-all cursor-pointer"
            >
              <span>CREATE INVITATION</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* MOBILE HAMBURGER BUTTON */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-[#181716]"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* MOBILE MENU OVERLAY */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-[#FAF7F2]/98 backdrop-blur-xl flex flex-col justify-center px-8 md:hidden">
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="absolute top-6 right-6 p-2 text-[#181716]"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="space-y-6 text-center">
            <Link
              href="#collections"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-2xl font-serif font-bold text-[#181716]"
            >
              Collections
            </Link>
            <Link
              href="#custom"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-2xl font-serif font-bold text-[#181716]"
            >
              Custom
            </Link>
            <Link
              href="#rsvp"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-2xl font-serif font-bold text-[#181716]"
            >
              RSVP
            </Link>
            <div className="pt-6 flex flex-col items-center gap-4">
              <LanguageSwitcher />
              <Link
                href="/dashboard/cards/new"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full max-w-xs py-3.5 rounded-full bg-[#7a5e28] text-white text-xs font-bold uppercase tracking-widest shadow-md"
              >
                Create Invitation
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 2. HERO SECTION */}
      {/* ------------------------------------------------------------- */}
      <section className="max-w-6xl mx-auto px-6 pt-4 pb-16 md:px-12 lg:px-20">
        {/* CATEGORY PILLS (KHÔNG DÙNG EMOJI - THANH LỊCH) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition cursor-pointer border ${
                selectedCategory === cat.id
                  ? "bg-white text-[#181716] border-[#181716] font-semibold shadow-2xs"
                  : "bg-white/50 text-[#181716]/60 border-[#E8E2D8] hover:bg-white"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* HERO TITLE & SIMULATOR FORM */}
        <div className="max-w-xl mt-6 space-y-6">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold tracking-tight text-[#181716] leading-[1.12]">
            Trao thiệp trang <br />
            trọng — <br />
            <span className="italic font-normal text-[#99732b]">
              Chạm vạn cảm xúc
            </span> <br />
            chỉ trong <span className="italic font-normal text-[#99732b]">5 phút</span>.
          </h1>

          {/* SIMULATOR FORM BOX */}
          <div className="p-6 bg-white/80 rounded-3xl border border-[#EFE9E1] shadow-2xs space-y-4 max-w-md">
            <div>
              <label className="block text-[11px] font-semibold text-[#181716]/60 mb-1.5">
                Tên nhân vật chính
              </label>
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="Nhập tên..."
                className="w-full px-4 py-2.5 text-xs rounded-xl bg-[#FAF7F2] border border-[#E8E2D8] focus:outline-none focus:ring-2 focus:ring-[#99732b]/40 text-[#181716]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#181716]/60 mb-1.5">
                Hiệu ứng đính kèm
              </label>
              <div className="grid grid-cols-3 gap-2 text-xs">
                {[
                  { id: "WAX_SEAL", label: "Sáp Nến 3D" },
                  { id: "GATE_OPEN", label: "Cổng Hoa" },
                  { id: "GIFT_BOX", label: "Hộp Quà" },
                ].map((eff) => (
                  <button
                    key={eff.id}
                    type="button"
                    onClick={() => setSelectedEffect(eff.id)}
                    className={`py-2 px-2 rounded-xl border text-center transition cursor-pointer text-[11px] font-medium ${
                      selectedEffect === eff.id
                        ? "bg-white border-[#99732b] text-[#99732b] font-bold shadow-2xs"
                        : "bg-[#FAF7F2]/60 border-[#E8E2D8] text-[#181716]/70 hover:bg-white"
                    }`}
                  >
                    {eff.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#181716]/60 mb-1.5">
                Theme Color
              </label>
              <div className="flex items-center gap-3">
                {themeColors.map((c) => (
                  <button
                    key={c.hex}
                    type="button"
                    onClick={() => setSelectedColor(c.hex)}
                    className={`w-7 h-7 rounded-full transition transform cursor-pointer border-2 ${
                      selectedColor === c.hex
                        ? "scale-110 border-[#181716] shadow-xs"
                        : "border-transparent hover:scale-105"
                    }`}
                    style={{ backgroundColor: c.hex }}
                    title={c.name}
                  />
                ))}
              </div>
            </div>

            <Link
              href="/dashboard/cards/new"
              className="w-full py-3 rounded-xl bg-[#7a5e28] hover:bg-[#684f22] text-white text-[11px] font-bold uppercase tracking-widest shadow-xs transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>TẠO BẢN XEM TRƯỚC</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 3. SECTION: TRẢI NGHIỆM THƯỢNG LƯU SỐ */}
      {/* ------------------------------------------------------------- */}
      <section id="custom" className="max-w-6xl mx-auto px-6 py-16 md:px-12 lg:px-20">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#181716]">
            Trải Nghiệm <span className="italic font-normal text-[#99732b]">Thượng Lưu</span> Số
          </h2>
          <p className="text-xs text-[#181716]/65 mt-2">
            Tích hợp công nghệ tiên tiến nhất để mang lại sự tiện lợi cho bạn và sự trân trọng tuyệt đối cho khách mời.
          </p>
        </div>

        {/* BENTO GRID 3 ROWS */}
        <div className="space-y-5">
          {/* ROW 1: THIỆP GỬI ĐÍCH DANH (LEFT 65%) + QUẢN LÝ RSVP (RIGHT 35%) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* CARD 1: THIỆP GỬI ĐÍCH DANH */}
            <div className="lg:col-span-8 bg-white rounded-3xl p-8 border border-[#EFE9E1] shadow-2xs relative overflow-hidden flex flex-col justify-end min-h-[300px] group hover:shadow-md transition">
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage: `url('https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=1200&auto=format&fit=crop')`,
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-white via-white/85 to-transparent" />

              <div className="relative z-10 pt-16">
                <span className="inline-block px-3 py-1 bg-white/90 backdrop-blur-xs text-[#99732b] rounded-full text-[10px] font-bold uppercase tracking-wider mb-2 border border-[#EFE9E1]">
                  Cá Nhân Hóa Cao Cấp
                </span>
                <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#181716]">
                  Thiệp Gửi Đích Danh Từng Khách Mời
                </h3>
                <p className="text-xs text-[#181716]/70 mt-1.5 max-w-lg leading-relaxed">
                  Hệ thống tự động sinh link riêng biệt. Lời chào (Anh/Chị/Em/Cô/Chú) được cá nhân hóa tự động, thể hiện sự tinh tế trong giao tiếp.
                </p>
              </div>
            </div>

            {/* CARD 2: QUẢN LÝ RSVP & CHỐT BÀN */}
            <div className="lg:col-span-4 bg-white rounded-3xl p-7 border border-[#EFE9E1] shadow-2xs flex flex-col justify-between group hover:shadow-md transition">
              <div>
                <div className="w-10 h-10 rounded-2xl bg-[#5C7658]/10 text-[#5C7658] flex items-center justify-center mb-4">
                  <CalendarCheck className="w-4 h-4" strokeWidth={1.5} />
                </div>
                <h3 className="text-lg font-serif font-bold text-[#181716]">
                  Quản Lý RSVP & Chốt Bàn
                </h3>
                <p className="text-xs text-[#181716]/65 mt-2 leading-relaxed">
                  Tự động thống kê số lượng tham dự. Xuất file Excel chuẩn form nhà hàng chỉ với 1 click.
                </p>
              </div>
            </div>
          </div>

          {/* ROW 2: HỘP MỪNG CƯỚI VIETQR (50%) + MINI-GAME TƯƠNG TÁC (50%) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* CARD 3: HỘP MỪNG CƯỚI VIETQR */}
            <div className="bg-white rounded-3xl p-7 border border-[#EFE9E1] shadow-2xs flex flex-col justify-between group hover:shadow-md transition">
              <div>
                <div className="w-10 h-10 rounded-2xl bg-[#99732b]/10 text-[#99732b] flex items-center justify-center mb-4">
                  <QrCode className="w-4 h-4" strokeWidth={1.5} />
                </div>
                <h3 className="text-lg font-serif font-bold text-[#181716]">
                  Hộp Mừng Cưới VietQR
                </h3>
                <p className="text-xs text-[#181716]/65 mt-2 leading-relaxed">
                  Tích hợp cổng thanh toán Napas247, tự động điền số tiền và lời chúc. Lịch sự, minh bạch và an toàn.
                </p>
              </div>
            </div>

            {/* CARD 4: MINI-GAME TƯƠNG TÁC */}
            <div className="bg-white rounded-3xl p-7 border border-[#EFE9E1] shadow-2xs flex flex-col justify-between group hover:shadow-md transition">
              <div>
                <div className="w-10 h-10 rounded-2xl bg-[#E08269]/10 text-[#E08269] flex items-center justify-center mb-4">
                  <Sparkle className="w-4 h-4" strokeWidth={1.5} />
                </div>
                <h3 className="text-lg font-serif font-bold text-[#181716]">
                  Mini-Game Tương Tác
                </h3>
                <p className="text-xs text-[#181716]/65 mt-2 leading-relaxed">
                  Tạo không khí sôi động với mini-game bốc đồ thôi nôi, dự đoán giới tính hay quay số trúng thưởng ngay trên thiệp.
                </p>
              </div>
            </div>
          </div>

          {/* ROW 3: ALBUM ẢNH 3D & NHẠC (50%) + ĐA NGÔN NGỮ TOÀN CẦU (50%) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* CARD 5: ALBUM ẢNH 3D & NHẠC */}
            <div className="bg-white rounded-3xl p-7 border border-[#EFE9E1] shadow-2xs flex flex-col justify-between group hover:shadow-md transition">
              <div>
                <div className="w-10 h-10 rounded-2xl bg-stone-100 text-stone-700 flex items-center justify-center mb-4">
                  <ImageIcon className="w-4 h-4" strokeWidth={1.5} />
                </div>
                <h3 className="text-lg font-serif font-bold text-[#181716]">
                  Album Ảnh 3D & Nhạc
                </h3>
                <p className="text-xs text-[#181716]/65 mt-2 leading-relaxed">
                  Trình diễn ảnh cưới phong cách gallery 3D kết hợp nhạc nền MP3 chất lượng cao.
                </p>
              </div>
            </div>

            {/* CARD 6: ĐA NGÔN NGỮ TOÀN CẦU */}
            <div className="bg-white rounded-3xl p-7 border border-[#EFE9E1] shadow-2xs flex flex-col justify-between group hover:shadow-md transition">
              <div>
                <div className="w-10 h-10 rounded-2xl bg-sky-50 text-sky-700 flex items-center justify-center mb-4">
                  <Globe2 className="w-4 h-4" strokeWidth={1.5} />
                </div>
                <h3 className="text-lg font-serif font-bold text-[#181716]">
                  Đa Ngôn Ngữ Toàn Cầu
                </h3>
                <p className="text-xs text-[#181716]/65 mt-2 leading-relaxed">
                  Tự động chuyển đổi ngôn ngữ (VI/EN/ZH) tùy theo cài đặt trình duyệt của khách mời quốc tế.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 4. FOOTER */}
      {/* ------------------------------------------------------------- */}
      <footer className="border-t border-[#EFE9E1] bg-white py-12 px-6 md:px-12 lg:px-20 mt-12">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <span className="text-3xl font-serif font-bold text-[#181716]">
              CardVite
            </span>
            <p className="text-xs text-[#181716]/50 mt-1.5">
              © 2024 CardVite Digital Invitations. Crafted for moments that matter.
            </p>
          </div>

          <div className="flex items-center gap-6 text-xs text-[#181716]/65 font-medium">
            <Link href="#" className="hover:text-[#181716]">Privacy Policy</Link>
            <Link href="#" className="hover:text-[#181716]">Terms of Service</Link>
            <Link href="#" className="hover:text-[#181716]">Shipping</Link>
            <Link href="#" className="hover:text-[#181716]">Contact Us</Link>
            <Link href="#" className="hover:text-[#181716]">Press Kit</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
