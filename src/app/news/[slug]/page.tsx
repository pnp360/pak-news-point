export const dynamic = 'force-dynamic';

import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Metadata } from 'next';
import { getUrduDate, getHijriDate, timeAgo } from '@/lib/urdu';
import { formatViews, getReadingTime, stripMarkdown } from '@/lib/utils';
import { getWatermarkedUrl } from '@/lib/watermark';
import NewsCard from '@/components/public/NewsCard';
import ShareButtons from '@/components/public/ShareButtons';
import CommentSection from '@/components/public/CommentSection';
import AdBanner from '@/components/public/AdBanner';

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const article = await prisma.article.findUnique({
    where: { slug: params.slug },
    include: { category: true, author: true },
  });
  if (!article) return { title: 'Article not found' };
  const articleUrl = `${process.env.NEXT_PUBLIC_SITE_URL || ''}/news/${article.slug}`;
  return {
    title: article.title,
    description: article.excerpt || article.title,
    alternates: { canonical: articleUrl },
    openGraph: {
      title: article.title,
      description: article.excerpt || article.title,
      url: articleUrl,
      type: 'article',
      publishedTime: article.publishedAt?.toISOString(),
      authors: [article.author.name || ''],
      images: article.featuredImage ? [{ url: article.featuredImage }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.excerpt || article.title,
    },
  };
}

export default async function ArticlePage({ params }: Props) {
  const article = await prisma.article.findUnique({
    where: { slug: params.slug },
    include: {
      category: { select: { id: true, name: true, nameUrdu: true, slug: true } },
      author: { select: { id: true, name: true, email: true, image: true } },
      tags: { include: { tag: { select: { id: true, name: true, slug: true } } } },
    },
  });

  if (!article || article.status !== 'PUBLISHED') notFound();

  await prisma.article.update({
    where: { id: article.id },
    data: { views: { increment: 1 } },
  });

  const relatedArticles = await prisma.article.findMany({
    where: { status: 'PUBLISHED', categoryId: article.categoryId, id: { not: article.id } },
    orderBy: { publishedAt: 'desc' },
    take: 4,
    include: { category: { select: { name: true, nameUrdu: true, slug: true } } },
  });

  const articleUrl = `${process.env.NEXT_PUBLIC_SITE_URL || ''}/news/${article.slug}`;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://azadkhabar.vercel.app';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'NewsArticle',
        headline: article.title,
        description: article.excerpt || article.title,
        image: article.featuredImage || undefined,
        datePublished: article.publishedAt?.toISOString(),
        dateModified: article.publishedAt?.toISOString(),
        author: article.author.name ? { '@type': 'Person', name: article.author.name } : undefined,
        publisher: {
          '@type': 'Organization',
          name: 'Azad Khabar',
          url: siteUrl,
        },
        mainEntityOfPage: { '@type': 'WebPage', '@id': articleUrl },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl },
          { '@type': 'ListItem', position: 2, name: article.category.name, item: `${siteUrl}/category/${article.category.slug}` },
          { '@type': 'ListItem', position: 3, name: article.title, item: articleUrl },
        ],
      },
    ],
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="flex flex-col lg:flex-row gap-10">
        <article className="flex-1 min-w-0">

          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-gray-400 mb-4" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-primary-600 transition-colors">صفحہ اول</Link>
            <span>/</span>
            <Link href={`/category/${article.category.slug}`} className="hover:text-primary-600 transition-colors">
              {article.category.nameUrdu}
            </Link>
            <span>/</span>
            <span className="text-gray-600 dark:text-gray-400 truncate max-w-[200px]">{stripMarkdown(article.title)}</span>
          </nav>

          {/* Category Badge */}
          <span className="inline-block bg-primary-600 text-white text-xs font-semibold px-3 py-1.5 rounded-full mb-4 uppercase tracking-wider">
            {article.category.nameUrdu}
          </span>

          {/* Title */}
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-semibold leading-[1.6] mb-4 text-gray-900 dark:text-white break-words">
            {stripMarkdown(article.title)}
          </h1>

          {/* Meta Bar */}
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-gray-500 mb-6 pb-5 border-b border-gray-200 dark:border-gray-700">
            {article.author.name && (
              <Link href={`/author/${article.author.id}`} className="flex items-center gap-2 hover:text-primary-600 transition-colors">
                {article.author.image ? (
                  <Image src={article.author.image} alt="" width={24} height={24} className="rounded-full" />
                ) : (
                  <span className="w-6 h-6 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-xs font-bold">
                    {article.author.name.charAt(0)}
                  </span>
                )}
                <span className="font-medium">{article.author.name}</span>
              </Link>
            )}
            {article.publishedAt && (
              <>
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  {timeAgo(article.publishedAt)}
                </span>
                <span title={getUrduDate(article.publishedAt)} className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  {getHijriDate()}
                </span>
              </>
            )}
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
              {formatViews(article.views + 1)} ملاحظات
            </span>
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
              {getReadingTime(article.content)} منٹ پڑھیں
            </span>
          </div>

          {/* Featured Image */}
          {article.featuredImage && (
            <figure className="relative mb-8">
              <div className="relative h-[350px] md:h-[480px] rounded-2xl overflow-hidden shadow-sm">
                <Image
                  src={getWatermarkedUrl(article.featuredImage)}
                  alt={article.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 800px"
                  className="object-cover"
                  priority
                />
              </div>
              <figcaption className="text-sm text-gray-400 mt-2 text-center">
                {article.category.nameUrdu} — {article.title}
              </figcaption>
            </figure>
          )}

          {/* Content */}
          <div
            className="article-content text-lg leading-loose text-gray-800 dark:text-gray-200"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />

          {/* In-content Ad */}
          <AdBanner format="in-content" />

          {/* Tags */}
          {article.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 mt-10 pt-6 border-t border-gray-200 dark:border-gray-700">
              <span className="text-sm font-bold text-gray-600 dark:text-gray-400 ml-2">ٹیگز:</span>
              {article.tags.map((at) => (
                <Link
                  key={at.tag.id}
                  href={`/tag/${at.tag.slug}`}
                  className="bg-gray-50 dark:bg-gray-700 hover:bg-primary-50 hover:text-primary-600 border border-gray-200 dark:border-gray-600 px-3 py-1 rounded-full text-sm transition-colors"
                >
                  {at.tag.name}
                </Link>
              ))}
            </div>
          )}

          {/* Share */}
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-4">
              <span className="text-sm font-bold text-gray-600 dark:text-gray-400">اشتراک کریں:</span>
              <ShareButtons url={articleUrl} title={article.title} />
            </div>
          </div>

          {/* Comments */}
          <CommentSection articleId={article.id} />

        </article>

        {/* Sidebar */}
        <aside className="w-full lg:w-96 shrink-0">
          {relatedArticles.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-5 sticky top-24">
              <h3 className="text-base font-bold pb-3 mb-4 border-b border-gray-100 dark:border-gray-700 flex items-center gap-2 leading-[1.6]">
                <span className="w-1 h-5 bg-primary-600 rounded inline-block" />
                متعلقہ خبریں
              </h3>
              <div className="space-y-4">
                {relatedArticles.slice(0, 3).map((article) => (
                  <NewsCard key={article.id} {...article} variant="compact" />
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
