'use client';

import Link from 'next/link';
import { timeAgo } from '@/lib/urdu';
import { formatViews } from '@/lib/utils';
import { getWatermarkedUrl } from '@/lib/watermark-client';
import SafeImage from './SafeImage';
import { CATEGORY_URDU_NAMES } from '@/lib/i18n';
import { cleanArticleTitle } from '@/lib/translate';

interface NewsCardProps {
  title: string;
  slug: string;
  excerpt?: string | null;
  featuredImage?: string | null;
  category: { nameUrdu: string; slug: string };
  publishedAt?: Date | null;
  views: number;
  variant?: 'default' | 'featured' | 'compact';
}

export default function NewsCard({
  title, slug, excerpt, featuredImage, category, publishedAt, views, variant = 'default',
}: NewsCardProps) {
  const displayTitle = cleanArticleTitle(title.replace(/\[!\[.*?\]\(.*?\)\]|!\[.*?\]\(.*?\)|\[.*?\]\(.*?\)/g, '').trim());
  const categoryName = CATEGORY_URDU_NAMES[category.slug] || category.nameUrdu;
  const imgSrc = getWatermarkedUrl(featuredImage || '');

  if (variant === 'featured') {
    return (
      <article className="news-card h-full">
        <Link href={`/news/${slug}`} className="group relative block overflow-hidden rounded-2xl shadow-sm h-full">
          <div className="relative h-full min-h-[420px] md:min-h-[520px]">
            <SafeImage
              src={imgSrc}
              alt={displayTitle}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
          </div>
          <div className="absolute bottom-0 inset-x-0 p-6 text-white flex flex-col">
            <span className="bg-primary-600 text-white px-3 py-1 rounded-lg text-sm inline-block mb-3 font-extrabold self-start shadow-lg">
              {categoryName}
            </span>
            <h2 className="text-2xl md:text-3xl font-extrabold mb-2 leading-[2] group-hover:underline decoration-2 underline-offset-4 drop-shadow-lg break-words line-clamp-3">
              {displayTitle}
            </h2>
            <div className="flex items-center gap-4 text-sm text-white/80 font-medium">
              {publishedAt && <span>{timeAgo(publishedAt)}</span>}
              {views > 0 && <span>{formatViews(views)} ملاحظات</span>}
            </div>
          </div>
        </Link>
      </article>
    );
  }

  if (variant === 'compact') {
    return (
      <article>
        <Link href={`/news/${slug}`} className="flex gap-3 group items-start p-2 -mx-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-200">
          <div className="relative w-28 h-20 shrink-0 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 ring-1 ring-gray-200 dark:ring-gray-700">
            <SafeImage
              src={imgSrc}
              alt={displayTitle}
              fill
              sizes="112px"
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-primary-600 dark:text-primary-400 text-xs font-medium">{categoryName}</span>
            <h3 className="font-semibold text-sm leading-[1.6] mt-0.5 text-gray-800 dark:text-gray-200 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors break-words line-clamp-2">
              {displayTitle}
            </h3>
            <div className="flex items-center gap-2 mt-1.5 text-xs text-gray-400 dark:text-gray-500">
              {publishedAt && <span>{timeAgo(publishedAt)}</span>}
            </div>
          </div>
        </Link>
      </article>
    );
  }

  return (
    <article className="news-card">
      <Link href={`/news/${slug}`} className="card-base group block overflow-hidden">
        <div className="relative aspect-[16/9] overflow-hidden bg-gray-100 dark:bg-gray-700">
          <div className="img-shimmer absolute inset-0" />
          <SafeImage
            src={imgSrc}
            alt={displayTitle}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500 relative z-[1]"
          />
        </div>
        <div className="p-3.5">
          <span className="inline-block bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-[10px] font-semibold px-2 py-0.5 rounded-full mb-2">
            {categoryName}
          </span>
          <h3 className="font-bold text-sm mb-1.5 leading-[1.6] text-gray-900 dark:text-gray-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors break-words line-clamp-2">
            {displayTitle}
          </h3>
          {excerpt && (
            <p className="text-gray-500 dark:text-gray-400 text-xs mb-2 leading-[1.6] line-clamp-2">{excerpt}</p>
          )}
          <div className="flex items-center gap-3 text-[11px] text-gray-400 dark:text-gray-500">
            {publishedAt && <span>{timeAgo(publishedAt)}</span>}
            {views > 0 && <span>{formatViews(views)} ملاحظات</span>}
          </div>
        </div>
      </Link>
    </article>
  );
}
