'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { POEMS, dailyIndex } from '@/data/poems';

export default function PoetryWidget() {
  const poem = useMemo(() => POEMS[dailyIndex(POEMS.length)], []);
  const [first, second] = poem.verse.split('\n');

  return (
    <div className="bg-gradient-to-br from-amber-600 to-amber-800 rounded-xl p-5 text-white shadow-sm">
      <h3 className="text-sm font-bold flex items-center gap-2 mb-3 border-b border-white/20 pb-2">
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M3 17h18v2H3v-2zm0-7h18v5H3v-5zm0-4h18v2H3V6z" /></svg>
        شعرِ آج
      </h3>
      <div className="font-nastaliq leading-[2.5] text-sm mb-3">
        <p>{first}</p>
        <p>{second}</p>
      </div>
      <p className="text-xs text-amber-200 mb-4">— {poem.poet}</p>
      <Link
        href="/poetry"
        className="inline-flex items-center gap-1.5 text-xs bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded-lg transition-colors"
      >
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        مزید شاعری
      </Link>
    </div>
  );
}
