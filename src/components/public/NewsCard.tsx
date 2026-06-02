import Link from 'next/link';
import Image from 'next/image';
import { timeAgo } from '@/lib/urdu';
import { formatViews } from '@/lib/utils';
import { getWatermarkedUrl } from '@/lib/watermark';

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

function NewsImage({ src, alt, className, fill }: { src: string; alt: string; className?: string; fill?: boolean }) {
  if (!src || src === '/images/placeholder.svg') {
    return (
      <div
        className={`bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center ${className || ''}`}
        style={fill ? { position: 'absolute', inset: 0 } : undefined}
      >
        <svg className="w-10 h-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
    );
  }
  let sizes = '(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw';
  if (className?.includes('w-28')) sizes = '112px';
  else if (className?.includes('h-[420px]')) sizes = '(max-width: 768px) 100vw, 50vw';
  if (fill) return <Image src={src} alt={alt} fill className={className} sizes={sizes} />;
  return <Image src={src} alt={alt} width={400} height={250} className={className} />;
}

export default function NewsCard({
  title, slug, excerpt, featuredImage, category, publishedAt, views, variant = 'default',
}: NewsCardProps) {
  const imgSrc = getWatermarkedUrl(featuredImage || '');

  if (variant === 'featured') {
    return (
      <Link href={`/news/${slug}`} className="group relative block overflow-hidden rounded-2xl shadow-sm">
        <div className="relative h-[420px] md:h-[520px]">
          <NewsImage
            src={imgSrc}
            alt={title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
        </div>
        <div className="absolute bottom-0 right-0 left-0 p-7 text-white flex flex-col h-auto">
          <span className="bg-primary-600 text-white px-3 py-1 rounded text-sm inline-block mb-3 font-medium self-start">
            {category.nameUrdu}
          </span>
          <h2 className="text-2xl md:text-3xl font-bold mb-2 leading-[2] group-hover:underline decoration-2 underline-offset-4">
            {title}
          </h2>
          <div className="flex items-center gap-4 text-sm text-gray-300">
            {publishedAt && <span>{timeAgo(publishedAt)}</span>}
            <span>{formatViews(views)} ملاحظات</span>
          </div>
        </div>
      </Link>
    );
  }

  if (variant === 'compact') {
    return (
      <Link href={`/news/${slug}`} className="flex gap-3 group items-start">
        <div className="relative w-28 h-20 shrink-0 rounded-lg overflow-hidden bg-gray-100">
          <NewsImage
            src={imgSrc}
            alt={title}
            fill
            className="object-cover"
          />
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-primary-600 text-xs font-medium">{category.nameUrdu}</span>
          <h3 className="font-semibold text-sm leading-[1.5] mt-0.5 group-hover:text-primary-600 transition-colors">
            {title}
          </h3>
          <div className="flex items-center gap-2 mt-1.5 text-xs text-gray-400">
            {publishedAt && <span>{timeAgo(publishedAt)}</span>}
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/news/${slug}`} className="group block rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow duration-300">
      <div className="relative aspect-[16/9] overflow-hidden bg-gray-100">
        <NewsImage
          src={imgSrc}
          alt={title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </div>
      <div className="p-4">
        <span className="text-primary-600 text-xs font-semibold uppercase tracking-wide">{category.nameUrdu}</span>
        <h3 className="font-bold text-base mt-1.5 mb-2 leading-[1.6] group-hover:text-primary-600 transition-colors">
          {title}
        </h3>
        {excerpt && (
          <p className="text-gray-500 text-sm mb-3 leading-[1.6]">{excerpt}</p>
        )}
        <div className="flex items-center gap-3 text-xs text-gray-400">
          {publishedAt && <span>{timeAgo(publishedAt)}</span>}
          <span>{formatViews(views)} ملاحظات</span>
        </div>
      </div>
    </Link>
  );
}
