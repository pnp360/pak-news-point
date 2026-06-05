'use client';

import { useLanguage } from '@/components/LanguageProvider';

interface LangTextProps {
  ur: string;
  en: string;
  className?: string;
}

/**
 * Renders Urdu or English text based on the current language toggle.
 * Use this in server components by wrapping inside a client boundary:
 *
 *   <LangText ur="اردو متن" en="English text" />
 */
export default function LangText({ ur, en, className }: LangTextProps) {
  const { lang } = useLanguage();
  return <span className={className}>{lang === 'en' ? en : ur}</span>;
}
