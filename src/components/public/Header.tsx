'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { HiMenu, HiX, HiSearch, HiSun, HiMoon } from 'react-icons/hi';
import Logo from './Logo';
import { useLanguage } from '@/components/LanguageProvider';
import { t } from '@/lib/i18n';

interface BreakingItem {
  slug: string;
  title: string;
}

interface HeaderProps {
  breakingNews?: BreakingItem[];
}

const categories = [
  { name: 'پاکستان', slug: 'pakistan' },
  { name: 'دنیا', slug: 'world' },
  { name: 'کھیل', slug: 'sports' },
  { name: 'کاروبار', slug: 'business' },
  { name: 'شوبز', slug: 'entertainment' },
  { name: 'سائنس و ٹیکنالوجی', slug: 'technology' },
  { name: 'صحت', slug: 'health' },
  { name: 'تعلیم', slug: 'education' },
  { name: 'شاعری', slug: 'poetry' },
];

export default function Header({ breakingNews = [] }: HeaderProps) {
  const { lang, toggleLang } = useLanguage();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [todayDate, setTodayDate] = useState('');
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    setDarkMode(document.documentElement.classList.contains('dark'));
  }, []);

  const toggleDark = () => {
    const next = !darkMode;
    setDarkMode(next);
    document.documentElement.classList.toggle('dark', next);
    try { localStorage.setItem('theme', next ? 'dark' : 'light'); } catch {}
  };

  useEffect(() => {
    setTodayDate(
      new Date().toLocaleDateString(lang === 'ur' ? 'ur-PK' : 'en-PK', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        timeZone: 'Asia/Karachi',
      })
    );
  }, [lang]);

  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 100);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <header className="bg-white dark:bg-slate-800">
      {/* Top bar — date + breaking ticker side by side */}
      <div className="bg-primary-600 text-white">
        <div className="container mx-auto px-4 flex items-center py-2 gap-3">
          {breakingNews.length > 0 && (
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <span className="bg-yellow-300 text-red-800 font-bold text-xs px-2 py-0.5 rounded shrink-0">
                {t('breaking', lang)}
              </span>
              <div className="overflow-hidden flex-1 min-w-0">
                <div className="whitespace-nowrap animate-scroll-left inline-block">
                  {breakingNews.map((item, i) => (
                    <span key={item.slug}>
                      <Link href={`/news/${item.slug}`} className="hover:underline text-sm">
                        {item.title}
                      </Link>
                      {i < breakingNews.length - 1 && (
                        <span className="mx-3 text-red-300">|</span>
                      )}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
          <span className="text-xs whitespace-nowrap shrink-0 bg-white/10 px-3 py-1.5 rounded" style={{ unicodeBidi: 'plaintext' }}>{todayDate}</span>
        </div>
      </div>

      {/* Logo + Navigation + Utilities — RTL-aware flex row */}
      <div className="border-b dark:border-slate-600 shadow-sm">
        <div className="flex justify-between items-center w-full px-6 py-3">
          {/* Logo: first child → rightmost in RTL */}
          <Logo />

          {/* Desktop nav: flows after logo */}
          <div className="hidden md:flex items-center">
            <nav className="flex items-center gap-1">
              {categories.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/${cat.slug}`}
                  className="px-3 py-2 text-sm font-medium hover:text-primary-600 whitespace-nowrap rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                  onClick={() => setMenuOpen(false)}
                >
                  {cat.name}
                </Link>
              ))}
            </nav>
          </div>

          {/* Utility icons: last child → leftmost in RTL */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={toggleDark}
              className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full"
              aria-label={t('theme.dark', lang)}
            >
              {darkMode ? <HiSun className="w-5 h-5" /> : <HiMoon className="w-5 h-5" />}
            </button>
            <button
              onClick={toggleLang}
              className="px-2 py-1 text-xs font-bold border border-gray-300 dark:border-slate-500 rounded hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
              aria-label={t('language.toggle', lang)}
            >
              {t('language.toggle', lang)}
            </button>
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full"
              aria-label={t('search.button', lang)}
            >
              <HiSearch className="w-5 h-5" />
            </button>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 hover:bg-gray-100 rounded-full md:hidden"
              aria-label="مینو"
            >
              {menuOpen ? <HiX className="w-5 h-5" /> : <HiMenu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        {menuOpen && (
          <nav className="md:hidden border-t dark:border-slate-600 pb-2 pt-2 px-6">
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/${cat.slug}`}
                className="block px-4 py-3 hover:bg-gray-100 dark:hover:bg-slate-700 hover:text-primary-600 font-medium rounded-lg"
                onClick={() => setMenuOpen(false)}
              >
                {cat.name}
              </Link>
            ))}
          </nav>
        )}
      </div>

      {/* Search bar */}
      {searchOpen && (
        <div className="bg-gray-50 dark:bg-slate-700 border-b dark:border-slate-600 py-3 px-4">
          <form onSubmit={handleSearch} className="container mx-auto flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('search.placeholder', lang)}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-slate-800 dark:text-white"
            />
            <button
              type="submit"
              className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700"
            >
              {t('search.button', lang)}
            </button>
          </form>
        </div>
      )}

      {/* Sticky nav spacer (for the scrolling effect) */}
      <nav className={`md:hidden border-t dark:border-slate-600 bg-white dark:bg-slate-800 transition-shadow duration-300 ${scrolled ? 'nav-shadow' : ''} sticky top-0 z-50`}>
        <div className="container mx-auto px-4">
          <ul className="flex overflow-x-auto scrollbar-hide">
            {categories.map((cat) => (
              <li key={cat.slug}>
                <Link
                  href={`/${cat.slug}`}
                  className="block px-4 py-3 hover:bg-gray-100 dark:hover:bg-slate-700 hover:text-primary-600 whitespace-nowrap font-medium text-sm"
                  onClick={() => setMenuOpen(false)}
                >
                  {cat.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </header>
  );
}
