export const dynamic = 'force-dynamic';

import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import NewsCard from '@/components/public/NewsCard';
import AdBanner from '@/components/public/AdBanner';
import Pagination from '@/components/public/Pagination';

interface Props {
  params: { id: string };
  searchParams: { page?: string };
}

export async function generateMetadata({ params }: Props) {
  const author = await prisma.user.findUnique({ where: { id: params.id } });
  if (!author) return { title: 'Author not found' };
  return { title: `${author.name || 'Author'} - Azad Khabar` };
}

export default async function AuthorPage({ params, searchParams }: Props) {
  const author = await prisma.user.findUnique({ where: { id: params.id } });
  if (!author) notFound();

  const page = parseInt(searchParams.page || '1');
  const pageSize = 20;

  const [articles, total] = await Promise.all([
    prisma.article.findMany({
      where: { status: 'PUBLISHED', authorId: author.id },
      orderBy: { publishedAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        category: { select: { name: true, nameUrdu: true, slug: true } },
      },
    }),
    prisma.article.count({
      where: { status: 'PUBLISHED', authorId: author.id },
    }),
  ]);

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6 flex items-center gap-4">
        <div className="w-16 h-16 rounded-full overflow-hidden bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center shrink-0">
          <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <div>
          <h1 className="text-2xl font-bold">{author.name || 'Author'}</h1>
          <p className="text-gray-500">{total} خبریں</p>
        </div>
      </div>

      {articles.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <p className="text-xl">اس مصنف کی کوئی خبر نہیں ہے</p>
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
              basePath={`/author/${params.id}`}
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
