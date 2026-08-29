"use client";

import React from "react";
import Link from "next/link";
import { Mail, Phone, Facebook, Github, MessageCircle } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export const Footer: React.FC = () => {
  const { t } = useLanguage();

  return (
    <footer className="border-t border-[#EFE9E1] bg-white py-12 px-6 md:px-12 lg:px-20 mt-16 text-[#181716]">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* TOP ROW: BRAND & SOCIAL / CONTACT LINKS */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-[#EFE9E1]/80">
          {/* BRAND WITH LOGO */}
          <Link href="/" className="flex items-center gap-2.5 group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/logo.png" alt="Logo CardVite" className="h-9 w-auto object-contain transition-transform group-hover:scale-105" />
            <span className="text-2xl font-serif font-bold text-[#181716] group-hover:text-[#BE944E] transition">
              CardVite
            </span>
          </Link>

          {/* CONTACT & SOCIAL BUTTONS */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            {/* GMAIL */}
            <a
              href="mailto:baohoaitran3112@gmail.com"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-stone-100 hover:bg-red-50 hover:text-red-600 text-xs font-semibold text-stone-700 transition border border-stone-200/80 cursor-pointer shadow-2xs"
              title="Gửi Email cho tôi"
            >
              <Mail className="w-3.5 h-3.5 text-red-500" />
              <span>baohoaitran3112@gmail.com</span>
            </a>

            {/* ZALO */}
            <a
              href="https://zalo.me/0374170367"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-stone-100 hover:bg-blue-50 hover:text-blue-600 text-xs font-semibold text-stone-700 transition border border-stone-200/80 cursor-pointer shadow-2xs"
              title="Nhắn tin qua Zalo: 0374170367"
            >
              <MessageCircle className="w-3.5 h-3.5 text-blue-500" />
              <span>Zalo: 0374170367</span>
            </a>

            {/* FACEBOOK */}
            <a
              href="https://www.facebook.com/tran.bao.28897"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-stone-100 hover:bg-indigo-50 hover:text-indigo-600 text-xs font-semibold text-stone-700 transition border border-stone-200/80 cursor-pointer shadow-2xs"
              title="Facebook Cá Nhân"
            >
              <Facebook className="w-3.5 h-3.5 text-indigo-600" />
              <span>Facebook</span>
            </a>

            {/* GITHUB */}
            <a
              href="https://github.com/hoaibao3112"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-stone-100 hover:bg-stone-900 hover:text-white text-xs font-semibold text-stone-700 transition border border-stone-200/80 cursor-pointer shadow-2xs"
              title="GitHub: hoaibao3112"
            >
              <Github className="w-3.5 h-3.5 text-stone-800 group-hover:text-white" />
              <span>GitHub</span>
            </a>
          </div>
        </div>

        {/* BOTTOM ROW: POLICY & COPYRIGHT */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-[#181716]/65">
          <div className="flex flex-wrap items-center justify-center gap-6 font-medium">
            <Link href="#" className="hover:text-[#BE944E] transition">{t("footerPrivacy")}</Link>
            <Link href="#" className="hover:text-[#BE944E] transition">{t("footerTerms")}</Link>
            <Link href="#" className="hover:text-[#BE944E] transition">{t("footerSustainability")}</Link>
            <Link href="#" className="hover:text-[#BE944E] transition">{t("footerAccessibility")}</Link>
          </div>

          <div className="text-center md:text-right">
            <span>{t("footerCopyright")}</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
