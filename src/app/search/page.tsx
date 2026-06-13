export const dynamic = 'force-dynamic';

import { prisma } from '@/lib/prisma';
import NewsCard from '@/components/public/NewsCard';
import AdBanner from '@/components/public/AdBanner';
import Pagination from '@/components/public/Pagination';

interface Props {
  searchParams: { q?: string; page?: string };
}

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
        category: { select: { name: true, nameUrdu: true, slug: true } },
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
        {query ? (
          <>تلاش: {query}</>
        ) : (
          'تمام خبریں'
        )}
      </h1>
      <p className="text-gray-500 mb-6">
        {total} نتائج ملے
      </p>

      {articles.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <p className="text-xl">کوئی خبر نہیں ملی</p>
          <p className="mt-2">براہ کرم دوسرے کلیدی الفاظ سے تلاش کریں</p>
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
              basePath="/search"
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
