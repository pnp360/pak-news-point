'use client';

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import type { Language } from '@/lib/i18n';

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
    const stored = localStorage.getItem('lang') as Language | null;
    if (stored === 'en' || stored === 'ur') {
      setLangState(stored);
    }
    setMounted(true);
  }, []);

  const setLang = useCallback((newLang: Language) => {
    setLangState(newLang);
    try { localStorage.setItem('lang', newLang); } catch {}
    document.documentElement.lang = newLang;
    document.documentElement.dir = newLang === 'ur' ? 'rtl' : 'ltr';
    document.body.classList.toggle('font-serif', newLang === 'ur');
    document.body.classList.toggle('font-sans', newLang === 'en');
  }, []);

  const toggleLang = useCallback(() => {
    setLang(lang === 'ur' ? 'en' : 'ur');
  }, [lang, setLang]);

  // Sync attributes on mount
  useEffect(() => {
    if (mounted) {
      document.documentElement.lang = lang;
      document.documentElement.dir = lang === 'ur' ? 'rtl' : 'ltr';
      document.body.classList.toggle('font-serif', lang === 'ur');
      document.body.classList.toggle('font-sans', lang === 'en');
    }
  }, [mounted, lang]);

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLang }}>
      {children}
    </LanguageContext.Provider>
  );
}
