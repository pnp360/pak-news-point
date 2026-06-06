'use client';

import Link from 'next/link';
import { timeAgo } from '@/lib/urdu';
import { formatViews } from '@/lib/utils';
import { getWatermarkedUrl } from '@/lib/watermark-client';
import SafeImage from './SafeImage';
import { useLanguage } from '@/components/LanguageProvider';
import { CATEGORY_ENGLISH_NAMES, CATEGORY_URDU_NAMES } from '@/lib/i18n';

interface NewsCardProps {
  title: string;
  slug: string;
  originalTitle?: string | null;
  excerpt?: string | null;
  featuredImage?: string | null;
  category: { nameUrdu: string; slug: string };
  publishedAt?: Date | null;
  views: number;
  variant?: 'default' | 'featured' | 'compact';
}

export default function NewsCard({
  title, originalTitle, slug, excerpt, featuredImage, category, publishedAt, views, variant = 'default',
}: NewsCardProps) {
  const { lang } = useLanguage();
  const rawTitle = lang === 'en' && originalTitle ? originalTitle : title;
  const displayTitle = rawTitle.replace(/\[!\[.*?\]\(.*?\)\]|!\[.*?\]\(.*?\)|\[.*?\]\(.*?\)/g, '').trim();
  const categoryName = lang === 'en' ? (CATEGORY_ENGLISH_NAMES[category.slug] || category.nameUrdu) : (CATEGORY_URDU_NAMES[category.slug] || category.nameUrdu);
  const imgSrc = getWatermarkedUrl(featuredImage || '');
  const viewsLabel = lang === 'en' ? 'views' : 'ملاحظات';

  if (variant === 'featured') {
    return (
      <article className="news-card">
        <Link href={`/news/${slug}`} className="group relative block overflow-hidden rounded-2xl shadow-sm">
          <div className="relative h-[420px] md:h-[520px]">
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
            <span className="bg-primary-600 text-white px-3 py-1 rounded text-sm inline-block mb-3 font-extrabold self-start">
              {categoryName}
            </span>
            <h2 className="text-2xl md:text-3xl font-extrabold mb-2 leading-[2] group-hover:underline decoration-2 underline-offset-4 drop-shadow-lg break-words line-clamp-3">
              {displayTitle}
            </h2>
            <div className="flex items-center gap-4 text-sm text-white/80 font-medium">
              {publishedAt && <span>{timeAgo(publishedAt, lang)}</span>}
              {views > 0 && <span>{formatViews(views)} {viewsLabel}</span>}
            </div>
          </div>
        </Link>
      </article>
    );
  }

  if (variant === 'compact') {
    return (
      <article>
        <Link href={`/news/${slug}`} className="flex gap-3 group items-start">
          <div className="relative w-28 h-20 shrink-0 rounded-lg overflow-hidden bg-gray-100">
            <SafeImage
              src={imgSrc}
              alt={displayTitle}
              fill
              sizes="112px"
              className="object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-primary-600 text-xs font-medium">{categoryName}</span>
            <h3 className="font-semibold text-sm leading-[1.6] mt-0.5 group-hover:text-primary-600 transition-colors break-words line-clamp-2">
              {displayTitle}
            </h3>
            <div className="flex items-center gap-2 mt-1.5 text-xs text-gray-400">
              {publishedAt && <span>{timeAgo(publishedAt, lang)}</span>}
            </div>
          </div>
        </Link>
      </article>
    );
  }

  return (
    <article className="news-card">
      <Link href={`/news/${slug}`} className="group block rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow duration-300">
        <div className="relative aspect-[16/9] overflow-hidden bg-gray-100">
          <SafeImage
            src={imgSrc}
            alt={displayTitle}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>
        <div className="p-4">
          <span className="text-primary-600 text-xs font-semibold uppercase tracking-wide">{categoryName}</span>
          <h3 className="font-bold text-base mt-1.5 mb-2 leading-[1.6] group-hover:text-primary-600 transition-colors break-words line-clamp-2">
            {displayTitle}
          </h3>
          {excerpt && (
            <p className="text-gray-500 text-sm mb-3 leading-[1.6]">{excerpt}</p>
          )}
          <div className="flex items-center gap-3 text-xs text-gray-400">
            {publishedAt && <span>{timeAgo(publishedAt, lang)}</span>}
            {views > 0 && <span>{formatViews(views)} {viewsLabel}</span>}
          </div>
        </div>
      </Link>
    </article>
  );
}

