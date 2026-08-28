"use client";

import React from "react";
import { useLanguage } from "@/context/LanguageContext";
import { SupportedLanguage } from "@/config/i18n";
import { Globe } from "lucide-react";

export const LanguageSwitcher: React.FC<{ className?: string }> = ({
  className = "",
}) => {
  const { lang, setLang } = useLanguage();

  const languages: Array<{ code: SupportedLanguage; label: string; flag: string }> = [
    { code: "vi", label: "VI", flag: "🇻🇳" },
    { code: "en", label: "EN", flag: "🇬🇧" },
    { code: "zh", label: "中文", flag: "🇨🇳" },
  ];

  return (
    <div
      className={`inline-flex items-center p-1 bg-white/90 backdrop-blur-md rounded-full border border-stone-200/80 shadow-xs gap-0.5 ${className}`}
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
  );
};
