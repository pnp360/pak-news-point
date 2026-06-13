'use client';

import { useState, useCallback, useEffect, useRef } from 'react';

function stripMarkdown(text: string): string {
  return text.replace(/\[!\[.*?\]\(.*?\)\]|!\[.*?\]\(.*?\)|\[.*?\]\(.*?\)/g, '').trim();
}

interface SafeImageProps {
  src: string;
  alt: string;
  className?: string;
  fill?: boolean;
  sizes?: string;
  width?: number;
  height?: number;
  priority?: boolean;
}

function BrandedFallback({ className, fill }: { className?: string; fill?: boolean }) {
  return (
    <div
      data-fallback="azad-khabar"
      className={`bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center overflow-hidden select-none ${className || ''}`}
      style={fill ? { position: 'absolute', inset: 0 } : { width: '100%', height: '100%', minHeight: 120 }}
    >
      <div className="flex flex-col items-center gap-1.5 p-3">
        <svg className="w-7 h-7 text-gray-400 dark:text-gray-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 font-nastaliq leading-tight">آزاد خبر</span>
      </div>
    </div>
  );
}

export default function SafeImage({ src, alt, className, fill, sizes, width, height, priority }: SafeImageProps) {
  const [error, setError] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [useDirect, setUseDirect] = useState(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    return () => { mountedRef.current = false; };
  }, []);

  useEffect(() => {
    setError(false);
    setLoaded(false);
    setUseDirect(false);
  }, [src]);

  const onError = useCallback(() => {
    if (!mountedRef.current) return;
    if (!useDirect && src.startsWith('/api/image-proxy')) {
      try {
        const direct = new URL(src, window.location.origin).searchParams.get('url');
        if (direct) {
          setUseDirect(true);
          setLoaded(false);
          return;
        }
      } catch {}
    }
    setError(true);
    setLoaded(true);
  }, [src, useDirect]);

  const onLoad = useCallback(() => {
    if (mountedRef.current) setLoaded(true);
  }, []);

  const cleanAlt = stripMarkdown(alt);
  const imgSrc = useDirect && src.startsWith('/api/image-proxy')
    ? new URL(src, 'http://x').searchParams.get('url') || src
    : src;

  if (!imgSrc || error) {
    return <BrandedFallback className={className} fill={fill} />;
  }

  const imgProps: React.ImgHTMLAttributes<HTMLImageElement> & { fetchPriority?: 'high' | 'low' | 'auto' } = {
    src: imgSrc,
    alt: cleanAlt,
    className,
    sizes,
    style: { width: '100%', height: '100%', objectFit: 'cover' },
    onError,
    onLoad,
    loading: priority ? 'eager' as const : 'lazy' as const,
    fetchPriority: priority ? 'high' as const : 'auto' as const,
  };

  if (fill) {
    return (
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
        {!loaded && <div className="absolute inset-0 img-shimmer" />}
        <img {...imgProps} />
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', width: width || 400, height: height || 250, overflow: 'hidden' }}>
      {!loaded && <div className="absolute inset-0 img-shimmer" />}
      <img {...imgProps} />
    </div>
  );
}
