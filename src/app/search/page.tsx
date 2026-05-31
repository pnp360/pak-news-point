export const dynamic = 'force-dynamic';

import { prisma } from '@/lib/prisma';
import NewsCard from '@/components/public/NewsCard';
import Pagination from '@/components/public/Pagination';

interface Props {
  searchParams: { q?: string; page?: string };
}

export const metadata = { title: 'تلاش - PNP365' };

export default async function SearchPage({ searchParams }: Props) {
  const query = searchParams.q || '';
  const page = parseInt(searchParams.page || '1');
  const pageSize = 20;

  const [articles, total] = await Promise.all([
    prisma.article.findMany({
      where: query
        ? {
            status: 'PUBLISHED',
            OR: [
              { title: { contains: query } },
              { excerpt: { contains: query } },
              { content: { contains: query } },
            ],
          }
        : { status: 'PUBLISHED' },
      orderBy: { publishedAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        category: { select: { nameUrdu: true, slug: true } },
      },
    }),
    prisma.article.count({
      where: query
        ? {
            status: 'PUBLISHED',
            OR: [
              { title: { contains: query } },
              { excerpt: { contains: query } },
              { content: { contains: query } },
            ],
          }
        : { status: 'PUBLISHED' },
    }),
  ]);

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold mb-6">
        {query ? `تلاش: ${query}` : 'تمام خبریں'}
      </h1>
      <p className="text-gray-500 mb-6">
        {total} {query ? 'میں' : ''} نتائج ملے
      </p>

      {articles.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <p className="text-xl">کوئی خبر نہیں ملی</p>
          <p className="mt-2">براہ کرم دوسرے کلیدی الفاظ سے تلاش کریں</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {articles.map((article) => (
              <NewsCard key={article.id} {...article} />
            ))}
          </div>
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            basePath="/search"
          />
        </>
      )}
    </div>
  );
}
