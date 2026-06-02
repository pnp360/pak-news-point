'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { HiMenu, HiX, HiSearch, HiSun, HiMoon } from 'react-icons/hi';
import Logo from './Logo';

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
];

export default function Header({ breakingNews = [] }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [todayDateUrdu, setTodayDateUrdu] = useState('');
  const [todayDateIntl, setTodayDateIntl] = useState('');
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
    setTodayDateUrdu(
      new Date().toLocaleDateString('ur-PK', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        timeZone: 'Asia/Karachi',
      })
    );
    setTodayDateIntl(
      new Date().toLocaleDateString('en-GB', {
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
      {/* Top bar — date + breaking ticker side by side */}
      <div className="bg-primary-600 text-white">
        <div className="container mx-auto px-4 flex items-center py-2 gap-3">
          {breakingNews.length > 0 && (
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <span className="bg-yellow-300 text-red-800 font-bold text-xs px-2 py-0.5 rounded shrink-0">
                بریکنگ
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
          <span className="text-xs whitespace-nowrap shrink-0">{todayDateUrdu} | {todayDateIntl}</span>
        </div>
      </div>

      {/* Logo and search */}
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Logo />

        <div className="flex items-center gap-3">
          <button
            onClick={toggleDark}
            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full"
            aria-label="ڈارک موڈ"
          >
            {darkMode ? <HiSun className="w-6 h-6" /> : <HiMoon className="w-6 h-6" />}
          </button>
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full"
            aria-label="تلاش"
          >
            <HiSearch className="w-6 h-6" />
          </button>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 hover:bg-gray-100 rounded-full md:hidden"
            aria-label="مینو"
          >
            {menuOpen ? <HiX className="w-6 h-6" /> : <HiMenu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Search bar */}
      {searchOpen && (
        <div className="bg-gray-50 dark:bg-slate-700 border-t dark:border-slate-600 py-3 px-4">
          <form onSubmit={handleSearch} className="container mx-auto flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="خبریں تلاش کریں..."
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-slate-800 dark:text-white"
            />
            <button
              type="submit"
              className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700"
            >
              تلاش
            </button>
          </form>
        </div>
      )}

      {/* Navigation */}
      <nav className={`border-t dark:border-slate-600 bg-white dark:bg-slate-800 transition-shadow duration-300 ${scrolled ? 'nav-shadow' : 'shadow-sm'} sticky top-0 z-50 ${menuOpen ? 'block' : 'hidden'} md:block`}>
        <div className="container mx-auto px-4">
          <ul className="flex flex-col md:flex-row md:items-center overflow-x-auto scrollbar-hide">
            {categories.map((cat) => (
              <li key={cat.slug}>
                  <Link
                      href={`/${cat.slug}`}
                      className="block px-4 py-3 hover:bg-gray-100 dark:hover:bg-slate-700 hover:text-primary-600 whitespace-nowrap font-medium"
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
