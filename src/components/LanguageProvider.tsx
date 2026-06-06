'use client';

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import type { Language } from '@/lib/i18n';

const COOKIE_NAME = 'lang';
const COOKIE_MAX_AGE = 365 * 24 * 60 * 60; // 1 year

function setCookie(lang: Language) {
  try {
    document.cookie = `${COOKIE_NAME}=${lang};path=/;max-age=${COOKIE_MAX_AGE};SameSite=Lax`;
  } catch {}
}

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  toggleLang: () => void;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: 'ur',
  setLang: () => {},
  toggleLang: () => {},
});

export function useLanguage() {
  return useContext(LanguageContext);
}

export default function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>('ur');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Prefer cookie (set by server), fall back to localStorage
    const cookieLang = document.cookie
      .split('; ')
      .find((row) => row.startsWith(`${COOKIE_NAME}=`))
      ?.split('=')[1] as Language | undefined;
    const stored = cookieLang || (localStorage.getItem('lang') as Language | null);
    if (stored === 'en' || stored === 'ur') {
      setLangState(stored);
    }
    setMounted(true);
  }, []);

  const syncAttributes = useCallback((newLang: Language) => {
    document.documentElement.lang = newLang;
    document.documentElement.dir = newLang === 'ur' ? 'rtl' : 'ltr';
  }, []);

  const setLang = useCallback((newLang: Language) => {
    setLangState(newLang);
    syncAttributes(newLang);
    setCookie(newLang);
    try { localStorage.setItem('lang', newLang); } catch {}
  }, [syncAttributes]);

  const toggleLang = useCallback(() => {
    setLang(lang === 'ur' ? 'en' : 'ur');
  }, [lang, setLang]);

  // Sync attributes on mount
  useEffect(() => {
    if (mounted) {
      syncAttributes(lang);
    }
  }, [mounted, lang, syncAttributes]);

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLang }}>
      {children}
    </LanguageContext.Provider>
  );
}