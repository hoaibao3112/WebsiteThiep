"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { SupportedLanguage, DICTIONARY } from "@/config/i18n";

interface LanguageContextType {
  lang: SupportedLanguage;
  setLang: (lang: SupportedLanguage) => void;
  t: (key: keyof typeof DICTIONARY.vi) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: "vi",
  setLang: () => {},
  t: (key) => DICTIONARY.vi[key] || "",
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [lang, setLangState] = useState<SupportedLanguage>("vi");

  useEffect(() => {
    const savedLang = localStorage.getItem("preferred_lang") as SupportedLanguage;
    if (savedLang && (savedLang === "vi" || savedLang === "en" || savedLang === "zh")) {
      setLangState(savedLang);
    }
  }, []);

  const setLang = (newLang: SupportedLanguage) => {
    setLangState(newLang);
    if (typeof window !== "undefined") {
      localStorage.setItem("preferred_lang", newLang);
    }
  };

  const t = (key: keyof typeof DICTIONARY.vi): string => {
    const currentDict = DICTIONARY[lang] || DICTIONARY.vi;
    return currentDict[key] || DICTIONARY.vi[key] || "";
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
