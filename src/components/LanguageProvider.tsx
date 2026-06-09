'use client';

import { createContext, useContext, ReactNode } from 'react';

interface LanguageContextType {
  lang: 'ur';
}

const LanguageContext = createContext<LanguageContextType>({ lang: 'ur' });

export function useLanguage() {
  return useContext(LanguageContext);
}

export default function LanguageProvider({ children }: { children: ReactNode }) {
  return (
    <LanguageContext.Provider value={{ lang: 'ur' }}>
      {children}
    </LanguageContext.Provider>
  );
}
