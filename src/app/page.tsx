export const dynamic = 'force-dynamic';

import { prisma } from '@/lib/prisma';
import BreakingNews from '@/components/public/BreakingNews';
import NewsCard from '@/components/public/NewsCard';
import Sidebar from '@/components/public/Sidebar';

async function getHomepageData() {
  const [breakingArticles, featuredArticles, latestArticles, trendingArticles] = await Promise.all([
    prisma.article.findMany({
      where: { status: 'PUBLISHED', isBreaking: true },
      orderBy: { publishedAt: 'desc' },
      take: 10,
      select: { id: true, title: true, slug: true },
    }),
    prisma.article.findMany({
      where: { status: 'PUBLISHED', isFeatured: true },
      orderBy: { publishedAt: 'desc' },
      take: 5,
      include: {
        category: { select: { nameUrdu: true, slug: true } },
      },
    }),
    prisma.article.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: { publishedAt: 'desc' },
      take: 12,
      include: {
        category: { select: { nameUrdu: true, slug: true } },
      },
    }),
    prisma.article.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: { views: 'desc' },
      take: 8,
      select: { id: true, title: true, slug: true, views: true, publishedAt: true },
    }),
  ]);

  const categories = await prisma.category.findMany({
    orderBy: { order: 'asc' },
  });

  const categoryArticles: Record<string, any[]> = {};
  for (const cat of categories) {
    const articles = await prisma.article.findMany({
      where: { status: 'PUBLISHED', categoryId: cat.id },
      orderBy: { publishedAt: 'desc' },
      take: 4,
      include: {
        category: { select: { nameUrdu: true, slug: true } },
      },
    });
    if (articles.length > 0) {
      categoryArticles[cat.slug] = articles;
    }
  }

  return { breakingArticles, featuredArticles, latestArticles, trendingArticles, categories, categoryArticles };
}

export default async function HomePage() {
  const data = await getHomepageData();

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Breaking News */}
      <BreakingNews articles={data.breakingArticles} />

      {/* Featured Carousel */}
      {data.featuredArticles.length > 0 && (
        <section className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="lg:col-span-2">
              <NewsCard
                {...(data.featuredArticles[0] as any)}
                variant="featured"
              />
            </div>
            {data.featuredArticles.slice(1, 3).map((article) => (
              <NewsCard
                key={article.id}
                {...article}
                variant="featured"
              />
            ))}
          </div>
        </section>
      )}

      <div className="flex flex-col lg:flex-row gap-8 mt-8">
        {/* Main Content */}
        <div className="flex-1">
          {/* Latest News */}
          <section>
            <h2 className="text-2xl font-bold border-b-2 border-primary-600 pb-3 mb-6 flex items-center gap-2">
              <span className="w-2 h-6 bg-primary-600 rounded inline-block" />
              تازہ ترین خبریں
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {data.latestArticles.map((article) => (
                <NewsCard key={article.id} {...article} />
              ))}
            </div>
          </section>

          {/* Category Sections */}
          {Object.entries(data.categoryArticles).slice(0, 4).map(([slug, articles]) => {
            const category = data.categories.find((c) => c.slug === slug);
            if (!category || articles.length === 0) return null;
            return (
              <section key={slug} className="mt-10">
                <h2 className="text-xl font-bold border-b-2 border-primary-600 pb-3 mb-6 flex items-center gap-2">
                  <span className="w-2 h-6 bg-primary-600 rounded inline-block" />
                  {category.nameUrdu}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  {articles.map((article: any) => (
                    <NewsCard key={article.id} {...article} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>

        {/* Sidebar */}
        <div className="w-full lg:w-80 shrink-0">
          <Sidebar
            trending={data.trendingArticles}
            latest={data.latestArticles}
          />
        </div>
      </div>
    </div>
  );
}
