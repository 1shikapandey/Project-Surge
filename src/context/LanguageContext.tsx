'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { SupportedLanguage, translations, TranslationSchema, SUPPORTED_LANGUAGES, LanguageOption } from '@/lib/i18n/translations';

interface LanguageContextType {
  lang: SupportedLanguage;
  setLang: (lang: SupportedLanguage) => void;
  t: TranslationSchema;
  supportedLanguages: LanguageOption[];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'aquaalert_user_lang';

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<SupportedLanguage>('en');

  useEffect(() => {
    try {
      const savedLang = localStorage.getItem(LOCAL_STORAGE_KEY) as SupportedLanguage | null;
      if (savedLang && translations[savedLang]) {
        setLangState(savedLang);
      } else {
        // Detect browser language if matches our supported languages
        const browserLang = navigator.language.split('-')[0] as SupportedLanguage;
        if (translations[browserLang]) {
          setLangState(browserLang);
        }
      }
    } catch {
      // Fallback to English if localStorage fails
    }
  }, []);

  const setLang = (newLang: SupportedLanguage) => {
    if (translations[newLang]) {
      setLangState(newLang);
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, newLang);
      } catch {
        // Ignore localStorage error
      }
    }
  };

  const currentTranslations = translations[lang] || translations.en;

  return (
    <LanguageContext.Provider
      value={{
        lang,
        setLang,
        t: currentTranslations,
        supportedLanguages: SUPPORTED_LANGUAGES,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    // Return a default fallback if used outside provider
    return {
      lang: 'en',
      setLang: () => {},
      t: translations.en,
      supportedLanguages: SUPPORTED_LANGUAGES,
    };
  }
  return context;
};
