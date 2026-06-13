export const dynamic = 'force-dynamic';

import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import NewsCard from '@/components/public/NewsCard';
import AdBanner from '@/components/public/AdBanner';
import Pagination from '@/components/public/Pagination';

interface Props {
  params: { category: string };
  searchParams: { page?: string };
}

export async function generateMetadata({ params }: Props) {
  const category = await prisma.category.findUnique({
    where: { slug: params.category },
  });
  if (!category) return { title: 'Category not found' };
  return {
    title: `${category.nameUrdu} - Azad Khabar`,
    description: `${category.nameUrdu} latest news and updates`,
  };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const category = await prisma.category.findUnique({
    where: { slug: params.category },
  });

  if (!category) notFound();

  const page = parseInt(searchParams.page || '1');
  const pageSize = 20;

  const [articles, total] = await Promise.all([
    prisma.article.findMany({
      where: { status: 'PUBLISHED', categoryId: category.id },
      orderBy: { publishedAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        category: { select: { name: true, nameUrdu: true, slug: true } },
      },
    }),
    prisma.article.count({
      where: { status: 'PUBLISHED', categoryId: category.id },
    }),
  ]);

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6">
        <h1 className="text-3xl font-bold">{category.nameUrdu}</h1>
        {category.description && (
          <p className="text-gray-600 dark:text-gray-400 mt-2">{category.description}</p>
        )}
      </div>

      {articles.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <p className="text-xl">اس زمرے میں کوئی خبر نہیں ہے</p>
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
              basePath={`/${params.category}`}
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
