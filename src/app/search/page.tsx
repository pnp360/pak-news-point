export const dynamic = 'force-dynamic';

import { prisma } from '@/lib/prisma';
import NewsCard from '@/components/public/NewsCard';
import AdBanner from '@/components/public/AdBanner';
import Pagination from '@/components/public/Pagination';
import LangText from '@/components/LangText';

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
          <><LangText ur="تلاش:" en="Search:" /> {query}</>
        ) : (
          <LangText ur="تمام خبریں" en="All News" />
        )}
      </h1>
      <p className="text-gray-500 mb-6">
        {total} <LangText ur="نتائج ملے" en="results found" />
      </p>

      {articles.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <p className="text-xl"><LangText ur="کوئی خبر نہیں ملی" en="No articles found" /></p>
          <p className="mt-2"><LangText ur="براہ کرم دوسرے کلیدی الفاظ سے تلاش کریں" en="Please try different keywords" /></p>
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
              basePath="/search"
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
