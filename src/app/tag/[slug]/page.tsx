export const dynamic = 'force-dynamic';

import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import NewsCard from '@/components/public/NewsCard';
import AdBanner from '@/components/public/AdBanner';
import Pagination from '@/components/public/Pagination';

interface Props {
  params: { slug: string };
  searchParams: { page?: string };
}

export async function generateMetadata({ params }: Props) {
  const tag = await prisma.tag.findUnique({ where: { slug: params.slug } });
  if (!tag) return { title: 'ٹیگ نہیں ملا' };
  return { title: `${tag.name} - خبریں`, description: `${tag.name} سے متعلق خبریں` };
}

export default async function TagPage({ params, searchParams }: Props) {
  const tag = await prisma.tag.findUnique({ where: { slug: params.slug } });
  if (!tag) notFound();

  const page = parseInt(searchParams.page || '1');
  const pageSize = 20;

  const [articles, total] = await Promise.all([
    prisma.article.findMany({
      where: {
        status: 'PUBLISHED',
        tags: { some: { tagId: tag.id } },
      },
      orderBy: { publishedAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        category: { select: { nameUrdu: true, slug: true } },
      },
    }),
    prisma.article.count({
      where: {
        status: 'PUBLISHED',
        tags: { some: { tagId: tag.id } },
      },
    }),
  ]);

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold mb-2">ٹیگ: {tag.name}</h1>
      <p className="text-gray-500 mb-6">{total} خبریں</p>

      {articles.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <p className="text-xl">اس ٹیگ میں کوئی خبر نہیں ہے</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-[160px_1fr_160px] gap-4 items-start">
          <div className="hidden xl:block sticky top-24">
            <AdBanner format="skyscraper" />
          </div>
          <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {articles.map((article) => (
                <NewsCard key={article.id} {...article} />
              ))}
            </div>
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              basePath={`/tag/${params.slug}`}
            />
          </div>
          <div className="hidden xl:block sticky top-24">
            <AdBanner format="skyscraper" />
          </div>
        </div>
      )}
    </div>
  );
}
