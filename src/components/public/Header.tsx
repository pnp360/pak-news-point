'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import Logo from './Logo';

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

function MenuIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
  );
}
function CloseIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
  );
}
function SearchIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
  );
}
function SunIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
  );
}
function MoonIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
  );
}

export default function Header() {
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
      new Date().toLocaleDateString('ur-PK', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        timeZone: 'Asia/Karachi',
      })
    );
  }, []);

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
      {/* Top bar — date only */}
      <div className="bg-gradient-to-l from-primary-700 via-primary-600 to-primary-700 text-white">
        <div className="container mx-auto px-4 flex items-center py-1.5 md:py-2 justify-center">
          <span className="text-xs bg-white/10 px-3 py-1.5 rounded" style={{ unicodeBidi: 'plaintext' }}>{todayDate}</span>
        </div>
      </div>

      {/* Logo + Navigation + Utilities */}
      <div className="border-b dark:border-slate-700/60 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm">
        <div className="flex justify-between items-center w-full px-4 md:px-6 py-2 md:py-3">
          <Logo />

          {/* Desktop nav */}
          <div className="hidden md:flex items-center">
            <nav className="flex items-center gap-0.5">
              {categories.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/${cat.slug}`}
                  className="px-3 py-2 text-sm font-medium hover:text-primary-600 whitespace-nowrap rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20"
                  onClick={() => setMenuOpen(false)}
                >
                  {cat.name}
                </Link>
              ))}
            </nav>
          </div>

          {/* Utility icons */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={toggleDark}
              className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full touch-manipulation"
              aria-label="ڈارک موڈ"
            >
              {darkMode ? <SunIcon /> : <MoonIcon />}
            </button>
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full touch-manipulation"
              aria-label="تلاش"
            >
              <SearchIcon />
            </button>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full md:hidden touch-manipulation"
              aria-label="مینو"
            >
              {menuOpen ? <CloseIcon /> : <MenuIcon />}
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        {menuOpen && (
          <nav className="md:hidden border-t dark:border-slate-700/60 pb-1 pt-1 px-4 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm">
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/${cat.slug}`}
                className="block px-4 py-2.5 hover:bg-gray-100 dark:hover:bg-slate-700 hover:text-primary-600 font-medium rounded-lg text-sm active:bg-gray-200"
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
        <div className="bg-gray-50 dark:bg-slate-800/80 border-b dark:border-slate-700/60 py-3 px-4 animate-slideDown">
          <form onSubmit={handleSearch} className="container mx-auto flex gap-2 max-w-2xl">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="خبریں تلاش کریں..."
              className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-slate-800 dark:text-white text-base md:text-sm"
              autoFocus
            />
            <button
              type="submit"
              className="bg-primary-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-primary-700 touch-manipulation"
            >
              تلاش
            </button>
          </form>
        </div>
      )}

      {/* Sticky mobile nav */}
      <nav className={`md:hidden border-t dark:border-slate-700/60 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm transition-shadow duration-300 ${scrolled ? 'nav-shadow' : ''} sticky top-0 z-50`}>
        <div className="container mx-auto px-4">
          <ul className="flex overflow-x-auto scrollbar-hide">
            {categories.map((cat) => (
              <li key={cat.slug}>
                <Link
                  href={`/${cat.slug}`}
                  className="block px-4 py-3 hover:text-primary-600 whitespace-nowrap font-medium text-sm active:text-primary-600 touch-manipulation"
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
