'use client';

import Link from 'next/link';
import { useRef } from 'react';
import SafeImage from './SafeImage';
import { timeAgo } from '@/lib/urdu';

interface DynamicNewsCardProps {
  title: string;
  slug: string;
  excerpt?: string | null;
  featuredImage?: string | null;
  category: { nameUrdu: string; slug: string };
  sourceName?: string | null;
  publishedAt?: Date | null;
  index?: number;
}

export default function DynamicNewsCard({
  title,
  slug,
  excerpt,
  featuredImage,
  category,
  sourceName,
  publishedAt,
  index = 0,
}: DynamicNewsCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={cardRef}
      className="group relative bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500"
      style={{
        animation: `fadeSlideUp 0.5s ease-out ${index * 0.08}s both`,
      }}
    >
      <Link href={`/news/${slug}`} className="block">
        {/* Image container */}
        <div className="relative aspect-[16/10] overflow-hidden bg-gray-100 dark:bg-gray-800">
          <SafeImage
            src={featuredImage || ''}
            alt={title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover group-hover:scale-105 transition-transform duration-700"
          />

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          {/* Source badge */}
          {sourceName && (
            <span className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm text-white text-[10px] font-medium px-2 py-0.5 rounded-full">
              {sourceName}
            </span>
          )}

          {/* Category badge */}
          <span className="absolute top-3 right-3 bg-primary-600 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full">
            {category.nameUrdu}
          </span>
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-bold text-sm md:text-base leading-[1.7] mb-2 line-clamp-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-300">
            {title}
          </h3>

          {excerpt && (
            <p className="text-gray-500 dark:text-gray-400 text-xs leading-[1.6] mb-3 line-clamp-2">
              {excerpt}
            </p>
          )}

          {publishedAt && (
            <div className="flex items-center text-[11px] text-gray-400 dark:text-gray-500">
              <svg className="w-3 h-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{timeAgo(publishedAt)}</span>
            </div>
          )}
        </div>
      </Link>

      {/* Keyframe animation */}
      <style jsx>{`
        @keyframes fadeSlideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
