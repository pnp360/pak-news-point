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
  if (!tag) return { title: 'Tag not found' };
  return { title: `${tag.name} - Azad Khabar`, description: `${tag.name} related news` };
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
        category: { select: { name: true, nameUrdu: true, slug: true } },
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
      <h1 className="text-3xl font-bold mb-2">
        ٹیگ: {tag.name}
      </h1>
      <p className="text-gray-500 mb-6">{total} خبریں</p>

      {articles.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <p className="text-xl">اس ٹیگ میں کوئی خبر نہیں ہے</p>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1 min-w-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
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
          <aside className="w-full lg:w-72 shrink-0">
            <div className="sticky top-24 space-y-5">
              <AdBanner format="skyscraper" />
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
