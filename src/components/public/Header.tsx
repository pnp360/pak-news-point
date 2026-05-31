'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { HiMenu, HiX, HiSearch } from 'react-icons/hi';

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

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [todayDateUrdu, setTodayDateUrdu] = useState('');
  const [todayDateIntl, setTodayDateIntl] = useState('');

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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      {/* Top bar */}
      <div className="bg-primary-600 text-white">
        <div className="container mx-auto px-4 py-1 flex justify-between items-center text-sm">
          <span>{todayDateUrdu} | {todayDateIntl}</span>
          <span>PNP365</span>
        </div>
      </div>

      {/* Logo and search */}
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="text-2xl md:text-3xl font-bold text-primary-600">
          PNP365
        </Link>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className="p-2 hover:bg-gray-100 rounded-full"
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
        <div className="bg-gray-50 border-t py-3 px-4">
          <form onSubmit={handleSearch} className="container mx-auto flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="خبریں تلاش کریں..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
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
      <nav className={`border-t ${menuOpen ? 'block' : 'hidden'} md:block`}>
        <div className="container mx-auto px-4">
          <ul className="flex flex-col md:flex-row md:items-center overflow-x-auto scrollbar-hide">
            {categories.map((cat) => (
              <li key={cat.slug}>
                <Link
                  href={`/${cat.slug}`}
                  className="block px-4 py-3 hover:bg-gray-100 hover:text-primary-600 whitespace-nowrap font-medium"
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
