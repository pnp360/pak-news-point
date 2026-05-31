'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import {
  HiHome, HiDocumentText, HiCollection, HiTag, HiUsers,
  HiPhotograph, HiCog, HiLogout, HiMenu, HiX, HiSparkles,
} from 'react-icons/hi';
import { useState } from 'react';

const menuItems = [
  { href: '/admin/dashboard', label: 'ڈیش بورڈ', icon: HiHome },
  { href: '/admin/news', label: 'خبریں', icon: HiDocumentText },
  { href: '/admin/categories', label: 'زمرہ جات', icon: HiCollection },
  { href: '/admin/tags', label: 'ٹیگز', icon: HiTag },
  { href: '/admin/users', label: 'صارفین', icon: HiUsers },
  { href: '/admin/media', label: 'میڈیا', icon: HiPhotograph },
  { href: '/admin/settings', label: 'سیٹنگز', icon: HiCog },
  { href: '/admin/ai-rewrite', label: 'AI ری رائٹر', icon: HiSparkles },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed top-4 right-4 z-50 bg-primary-600 text-white p-2 rounded-lg"
      >
        {mobileOpen ? <HiX className="w-6 h-6" /> : <HiMenu className="w-6 h-6" />}
      </button>

      {/* Overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 right-0 z-40 w-64 bg-gray-900 text-white
        transform transition-transform duration-200
        ${mobileOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
        flex flex-col
      `}>
        <div className="p-5 border-b border-gray-800">
          <Link href="/admin/dashboard" className="text-xl font-bold text-white block">
            پاکستان نیوز پوائنٹ
          </Link>
          <span className="text-sm text-gray-400">ایڈمن پینل</span>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors ${
                  active
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800'
                }`}
                onClick={() => setMobileOpen(false)}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-800">
          <button
            onClick={() => signOut({ callbackUrl: '/admin/login' })}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm text-gray-300 hover:bg-gray-800 transition-colors"
          >
            <HiLogout className="w-5 h-5" />
            لاگ آؤٹ
          </button>
        </div>
      </aside>
    </>
  );
}
