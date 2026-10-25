"use client";

import React, { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { SupportedLanguage } from "@/config/i18n";
import { Globe, ChevronDown } from "lucide-react";

export const LanguageSwitcher: React.FC<{ className?: string }> = ({
  className = "",
}) => {
  const { lang, setLang } = useLanguage();
  const [isOpenMobile, setIsOpenMobile] = useState(false);

  const languages: Array<{ code: SupportedLanguage; label: string; flag: string }> = [
    { code: "vi", label: "VI", flag: "🇻🇳" },
    { code: "en", label: "EN", flag: "🇬🇧" },
    { code: "zh", label: "中文", flag: "🇨🇳" },
  ];

  const currentLang = languages.find((l) => l.code === lang) || languages[0];

  return (
    <>
      {/* DESKTOP VIEW: FULL 3 PILLS */}
      <div
        className={`hidden sm:inline-flex items-center p-1 bg-white/90 backdrop-blur-md rounded-full border border-stone-200/80 shadow-xs gap-0.5 ${className}`}
      >
        <Globe className="w-3.5 h-3.5 text-stone-400 ml-1.5 mr-0.5" />
        {languages.map((l) => (
          <button
            key={l.code}
            type="button"
            onClick={() => setLang(l.code)}
            className={`px-2 py-1 rounded-full text-[10px] font-bold transition cursor-pointer flex items-center gap-1 ${
              lang === l.code
                ? "bg-stone-900 text-white shadow-xs"
                : "text-stone-600 hover:text-stone-900 hover:bg-stone-100"
            }`}
          >
            <span>{l.flag}</span>
            <span>{l.label}</span>
          </button>
        ))}
      </div>

      {/* MOBILE VIEW: COMPACT PILL WITH DROPDOWN */}
      <div className={`relative sm:hidden inline-block ${className}`}>
        <button
          type="button"
          onClick={() => setIsOpenMobile(!isOpenMobile)}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-white/90 backdrop-blur-md rounded-full border border-stone-200/80 shadow-xs text-[10.5px] font-bold text-stone-800 transition active:scale-95 cursor-pointer"
        >
          <span className="text-xs">{currentLang.flag}</span>
          <span>{currentLang.label}</span>
          <ChevronDown className={`w-3 h-3 text-stone-400 transition-transform ${isOpenMobile ? "rotate-180" : ""}`} />
        </button>

        {isOpenMobile && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpenMobile(false)}
            />
            <div className="absolute right-0 top-full mt-1.5 w-28 bg-white/95 backdrop-blur-md rounded-xl border border-stone-200 shadow-xl z-50 py-1 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
              {languages.map((l) => (
                <button
                  key={l.code}
                  type="button"
                  onClick={() => {
                    setLang(l.code);
                    setIsOpenMobile(false);
                  }}
                  className={`w-full px-3 py-1.5 text-left text-[11px] font-bold flex items-center justify-between cursor-pointer transition ${
                    lang === l.code
                      ? "bg-amber-50 text-[#8C6424]"
                      : "text-stone-700 hover:bg-stone-50"
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <span>{l.flag}</span>
                    <span>{l.label}</span>
                  </span>
                  {lang === l.code && <span className="w-1.5 h-1.5 rounded-full bg-[#BE944E]" />}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
};
