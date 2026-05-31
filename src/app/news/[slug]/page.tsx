export const dynamic = 'force-dynamic';

import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Metadata } from 'next';
import { getUrduDate, getHijriDate, timeAgo } from '@/lib/urdu';
import { formatViews, getReadingTime } from '@/lib/utils';
import { getWatermarkedUrl } from '@/lib/watermark';
import NewsCard from '@/components/public/NewsCard';
import ShareButtons from '@/components/public/ShareButtons';

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const article = await prisma.article.findUnique({
    where: { slug: params.slug },
    include: { category: true, author: true },
  });

  if (!article) return { title: 'خبر نہیں ملی' };

  return {
    title: article.title,
    description: article.excerpt || article.title,
    openGraph: {
      title: article.title,
      description: article.excerpt || article.title,
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

  // Increment views
  await prisma.article.update({
    where: { id: article.id },
    data: { views: { increment: 1 } },
  });

  // Get related articles
  const relatedArticles = await prisma.article.findMany({
    where: {
      status: 'PUBLISHED',
      categoryId: article.categoryId,
      id: { not: article.id },
    },
    orderBy: { publishedAt: 'desc' },
    take: 4,
    include: {
      category: { select: { nameUrdu: true, slug: true } },
    },
  });

  const articleUrl = `${process.env.NEXT_PUBLIC_SITE_URL || ''}/news/${article.slug}`;

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col lg:flex-row gap-8">
        <article className="flex-1">
          {/* Breadcrumb */}
          <nav className="text-sm text-gray-500 mb-4">
            <Link href="/" className="hover:text-primary-600">صفحہ اول</Link>
            <span className="mx-2">/</span>
            <Link href={`/${article.category.slug}`} className="hover:text-primary-600">
              {article.category.nameUrdu}
            </Link>
            <span className="mx-2">/</span>
            <span className="text-gray-700">{article.title}</span>
          </nav>

          {/* Category badge */}
          <span className="bg-primary-600 text-white px-3 py-1 rounded text-sm inline-block mb-3">
            {article.category.nameUrdu}
          </span>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-4">
            {article.title}
          </h1>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-6 pb-4 border-b">
            {article.author.name && (
              <Link href={`/author/${article.author.id}`} className="hover:text-primary-600">
                {article.author.name}
              </Link>
            )}
            {article.publishedAt && (
              <>
                <span>{timeAgo(article.publishedAt)}</span>
                <span title={getUrduDate(article.publishedAt)}>{getHijriDate()}</span>
              </>
            )}
            <span>{formatViews(article.views + 1)} ملاحظات</span>
            <span>{getReadingTime(article.content)} منٹ پڑھیں</span>
          </div>

          {/* Featured Image */}
          {article.featuredImage && (
            <div className="relative h-[300px] md:h-[450px] rounded-xl overflow-hidden mb-6">
              <Image
                src={getWatermarkedUrl(article.featuredImage)}
                alt={article.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          )}

          {/* Content */}
          <div
            className="article-content text-lg leading-loose"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />

          {/* Tags */}
          {article.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-8 pt-6 border-t">
              <span className="font-bold">ٹیگز:</span>
              {article.tags.map((at) => (
                <Link
                  key={at.tag.id}
                  href={`/tag/${at.tag.slug}`}
                  className="bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded text-sm"
                >
                  {at.tag.name}
                </Link>
              ))}
            </div>
          )}

          {/* Share */}
          <div className="mt-8 pt-6 border-t">
            <ShareButtons url={articleUrl} title={article.title} />
          </div>
        </article>

        {/* Sidebar */}
        <aside className="w-full lg:w-80 shrink-0">
          <div className="bg-white rounded-xl shadow-sm p-5 sticky top-24">
            <h3 className="text-lg font-bold border-b pb-3 mb-4 flex items-center gap-2">
              <span className="w-1 h-6 bg-primary-600 rounded inline-block" />
              متعلقہ خبریں
            </h3>
            <div className="space-y-4">
              {relatedArticles.map((article) => (
                <NewsCard key={article.id} {...article} variant="compact" />
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
