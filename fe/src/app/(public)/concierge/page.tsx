"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  MessageSquare,
  Phone,
  Mail,
  MapPin,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { LanguageSwitcher } from "@/components/shared/LanguageSwitcher";

export default function ConciergePage() {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [servicePackage, setServicePackage] = useState("Bespoke (Thiết Kế Độc Bản)");
  const [favoriteTemplate, setFavoriteTemplate] = useState("Không chọn");
  const [notes, setNotes] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFullName("");
      setPhone("");
      setEmail("");
      setNotes("");
    }, 4000);
  };

  return (
    <div className="min-h-screen w-full bg-[#FAF7F2] text-[#181716] font-sans antialiased overflow-x-hidden">
      {/* ------------------------------------------------------------- */}
      {/* 1. HEADER */}
      {/* ------------------------------------------------------------- */}
      <header className="w-full px-6 py-6 md:px-12 lg:px-20 bg-[#FAF7F2]">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-3xl font-serif font-bold tracking-tight text-[#181716]">
            CardVite
          </Link>

          <nav className="hidden md:flex items-center gap-8 lg:gap-10 text-[11px] font-bold uppercase tracking-[0.2em] text-[#181716]/80">
            <Link href="/collections" className="hover:text-[#181716] transition">COLLECTIONS</Link>
            <Link href="/custom" className="hover:text-[#181716] transition">CUSTOM</Link>
            <Link href="/rsvp" className="hover:text-[#181716] transition">RSVP</Link>
            <Link href="/gallery" className="hover:text-[#181716] transition">GALLERY</Link>
            <Link href="/concierge" className="text-[#BE944E] border-b-2 border-[#BE944E] pb-0.5">
              CONCIERGE
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <Link
              href="/dashboard/cards/new"
              className="inline-flex items-center justify-center px-6 py-2 rounded-full bg-[#7D6331] hover:bg-[#685226] text-white text-[11px] font-bold tracking-widest uppercase shadow-2xs transition cursor-pointer"
            >
              CREATE
            </Link>
          </div>
        </div>
      </header>

      {/* ------------------------------------------------------------- */}
      {/* 2. HERO HEADER */}
      {/* ------------------------------------------------------------- */}
      <section className="max-w-4xl mx-auto px-6 pt-10 pb-12 text-center">
        <div className="inline-block px-3.5 py-1 rounded-full bg-[#E8ECE5] text-[#556353] text-[10px] font-bold uppercase tracking-widest mb-3">
          • CARDVITE CONCIERGE •
        </div>
        <h1 className="text-4xl sm:text-5xl font-serif font-bold text-[#181716] tracking-tight">
          Đăng Ký Thuê Thiết Kế Riêng.
        </h1>
        <p className="text-xs sm:text-sm text-[#181716]/65 mt-3 max-w-xl mx-auto leading-relaxed">
          Chuyên viên thiết kế của chúng tôi sẽ liên hệ lại với bạn trong vòng 15 phút làm việc để bắt đầu hiện thực hóa ý tưởng cho sự kiện của bạn.
        </p>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 3. 2-COLUMN CONCIERGE LAYOUT */}
      {/* ------------------------------------------------------------- */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* CỘT TRÁI: KÊNH LIÊN HỆ NHANH (4 PILL BOXES) */}
          <div className="lg:col-span-5 space-y-4">
            {/* CARD 1: ZALO */}
            <div className="bg-white rounded-3xl p-5 border border-[#EFE9E1] shadow-2xs flex items-center gap-4 hover:shadow-md transition">
              <div className="w-11 h-11 rounded-2xl bg-stone-100 flex items-center justify-center text-stone-700 shrink-0">
                <MessageSquare className="w-5 h-5" strokeWidth={1.5} />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">
                  ZALO HỖ TRỢ
                </span>
                <span className="text-sm font-bold text-stone-900 mt-0.5 block">
                  090 123 4567
                </span>
              </div>
            </div>

            {/* CARD 2: HOTLINE */}
            <div className="bg-white rounded-3xl p-5 border border-[#EFE9E1] shadow-2xs flex items-center gap-4 hover:shadow-md transition">
              <div className="w-11 h-11 rounded-2xl bg-stone-100 flex items-center justify-center text-stone-700 shrink-0">
                <Phone className="w-5 h-5" strokeWidth={1.5} />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">
                  HOTLINE (24/7)
                </span>
                <span className="text-sm font-bold text-stone-900 mt-0.5 block">
                  1800 8888
                </span>
              </div>
            </div>

            {/* CARD 3: EMAIL */}
            <div className="bg-white rounded-3xl p-5 border border-[#EFE9E1] shadow-2xs flex items-center gap-4 hover:shadow-md transition">
              <div className="w-11 h-11 rounded-2xl bg-stone-100 flex items-center justify-center text-stone-700 shrink-0">
                <Mail className="w-5 h-5" strokeWidth={1.5} />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">
                  EMAIL
                </span>
                <span className="text-sm font-bold text-stone-900 mt-0.5 block">
                  concierge@cardvite.com
                </span>
              </div>
            </div>

            {/* CARD 4: STUDIO */}
            <div className="bg-white rounded-3xl p-5 border border-[#EFE9E1] shadow-2xs flex items-center gap-4 hover:shadow-md transition">
              <div className="w-11 h-11 rounded-2xl bg-stone-100 flex items-center justify-center text-stone-700 shrink-0">
                <MapPin className="w-5 h-5" strokeWidth={1.5} />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">
                  CREATIVE STUDIO
                </span>
                <span className="text-xs font-semibold text-stone-900 mt-0.5 block">
                  Tầng 12, The Landmark, Quận 1, TP. Hồ Chí Minh
                </span>
              </div>
            </div>
          </div>

          {/* CỘT PHẢI: FORM THÔNG TIN YÊU CẦU */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-8 sm:p-10 border border-[#EFE9E1] shadow-2xs">
            <h2 className="text-2xl font-serif font-bold text-[#181716] mb-6">
              Thông Tin Yêu Cầu
            </h2>

            {submitted ? (
              <div className="py-12 text-center flex flex-col items-center">
                <CheckCircle2 className="w-16 h-16 text-emerald-500 mb-3 animate-bounce" />
                <h3 className="text-xl font-bold font-serif text-stone-900">
                  Đã Gửi Yêu Cầu Thành Công!
                </h3>
                <p className="text-xs text-stone-500 mt-1 max-w-sm">
                  Chuyên viên CardVite sẽ liên hệ với bạn qua Zalo/SĐT trong vòng 15 phút.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                {/* ROW 1: HỌ TÊN + SỐ ĐIỆN THOẠI */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-600 mb-1.5">
                      Họ & Tên
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Nguyễn Văn A"
                      className="w-full px-4 py-3 rounded-xl bg-[#FAF7F2] border border-[#E8E2D8] focus:outline-none focus:ring-2 focus:ring-[#BE944E]/40 text-stone-800"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-600 mb-1.5">
                      Số Điện Thoại (Zalo)
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="090..."
                      className="w-full px-4 py-3 rounded-xl bg-[#FAF7F2] border border-[#E8E2D8] focus:outline-none focus:ring-2 focus:ring-[#BE944E]/40 text-stone-800"
                    />
                  </div>
                </div>

                {/* ROW 2: EMAIL */}
                <div>
                  <label className="block text-[11px] font-semibold text-stone-600 mb-1.5">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@example.com"
                    className="w-full px-4 py-3 rounded-xl bg-[#FAF7F2] border border-[#E8E2D8] focus:outline-none focus:ring-2 focus:ring-[#BE944E]/40 text-stone-800"
                  />
                </div>

                {/* ROW 3: GÓI DỊCH VỤ + MẪU THIỆP YÊU THÍCH */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-600 mb-1.5">
                      Gói Dịch Vụ
                    </label>
                    <select
                      value={servicePackage}
                      onChange={(e) => setServicePackage(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-[#FAF7F2] border border-[#E8E2D8] focus:outline-none focus:ring-2 focus:ring-[#BE944E]/40 text-stone-800 font-medium"
                    >
                      <option value="Bespoke (Thiết Kế Độc Bản)">Bespoke (Thiết Kế Độc Bản)</option>
                      <option value="Gói VIP Hoàng Gia">Gói VIP Hoàng Gia</option>
                      <option value="Gói Tiêu Chuẩn">Gói Tiêu Chuẩn</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-stone-600 mb-1.5">
                      Mẫu Thiệp Yêu Thích (Tùy chọn)
                    </label>
                    <select
                      value={favoriteTemplate}
                      onChange={(e) => setFavoriteTemplate(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-[#FAF7F2] border border-[#E8E2D8] focus:outline-none focus:ring-2 focus:ring-[#BE944E]/40 text-stone-800 font-medium"
                    >
                      <option value="Không chọn">Không chọn</option>
                      <option value="Minimalism Nâu">Minimalism Nâu</option>
                      <option value="Hoa Mộc Hồng">Hoa Mộc Hồng</option>
                      <option value="Cổ Điển Hoàng Gia">Cổ Điển Hoàng Gia</option>
                      <option value="Mộc Nhi Nhi">Mộc Nhi Nhi</option>
                    </select>
                  </div>
                </div>

                {/* ROW 4: GHI CHÚ */}
                <div>
                  <label className="block text-[11px] font-semibold text-stone-600 mb-1.5">
                    Ghi Chú Đặc Biệt / Ý Tưởng Của Bạn
                  </label>
                  <textarea
                    rows={4}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Hãy mô tả ngắn gọn về sự kiện hoặc phong cách bạn mong muốn..."
                    className="w-full px-4 py-3 rounded-xl bg-[#FAF7F2] border border-[#E8E2D8] focus:outline-none focus:ring-2 focus:ring-[#BE944E]/40 text-stone-800"
                  />
                </div>

                {/* SUBMIT BUTTON */}
                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-xl bg-[#7D6331] hover:bg-[#685226] text-white text-xs font-bold uppercase tracking-widest transition shadow-md flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>GỬI ĐĂNG KÝ THUÊ THIỆP</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 4. FOOTER */}
      {/* ------------------------------------------------------------- */}
      <footer className="border-t border-[#EFE9E1] bg-white py-10 px-6 md:px-12 lg:px-20">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-[#181716]/65">
          <span className="text-2xl font-serif font-bold text-[#181716]">CardVite</span>
          <div className="flex items-center gap-6 font-medium">
            <Link href="#" className="hover:text-[#181716]">Privacy Policy</Link>
            <Link href="#" className="hover:text-[#181716]">Terms of Service</Link>
            <Link href="#" className="hover:text-[#181716]">Sustainability</Link>
            <Link href="#" className="hover:text-[#181716]">Accessibility</Link>
          </div>
          <span>© 2024 CardVite Event Studio. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
}
