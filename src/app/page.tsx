export const dynamic = 'force-dynamic';

import { prisma } from '@/lib/prisma';
import BreakingNews from '@/components/public/BreakingNews';
import EnglishBreaking from '@/components/public/EnglishBreaking';
import NewsCard from '@/components/public/NewsCard';
import Sidebar from '@/components/public/Sidebar';
import Link from 'next/link';

async function getHomepageData() {
  const [breakingArticles, englishArticles, featuredArticles, latestArticles, trendingArticles] = await Promise.all([
    prisma.article.findMany({
      where: { status: 'PUBLISHED', isBreaking: true },
      orderBy: { publishedAt: 'desc' },
      take: 10,
      select: { id: true, title: true, originalTitle: true, slug: true },
    }),
    prisma.article.findMany({
      where: { status: 'PUBLISHED', originalTitle: { not: null } },
      orderBy: { publishedAt: 'desc' },
      take: 10,
      select: { id: true, title: true, originalTitle: true, slug: true },
    }),
    prisma.article.findMany({
      where: { status: 'PUBLISHED', isFeatured: true },
      orderBy: { publishedAt: 'desc' },
      take: 5,
      include: { category: { select: { nameUrdu: true, slug: true } } },
    }),
    prisma.article.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: { publishedAt: 'desc' },
      take: 12,
      include: { category: { select: { nameUrdu: true, slug: true } } },
    }),
    prisma.article.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: { views: 'desc' },
      take: 8,
      select: { id: true, title: true, slug: true, views: true, publishedAt: true },
    }),
  ]);

  const categories = await prisma.category.findMany({ orderBy: { order: 'asc' } });

  const categoryArticles: Record<string, any[]> = {};
  for (const cat of categories) {
    const articles = await prisma.article.findMany({
      where: { status: 'PUBLISHED', categoryId: cat.id },
      orderBy: { publishedAt: 'desc' },
      take: 4,
      include: { category: { select: { nameUrdu: true, slug: true } } },
    });
    if (articles.length > 0) categoryArticles[cat.slug] = articles;
  }

  return { breakingArticles, englishArticles, featuredArticles, latestArticles, trendingArticles, categories, categoryArticles };
}

function SectionHeader({ title, href }: { title: string; href?: string }) {
  return (
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-xl font-bold flex items-center gap-2">
        <span className="w-1.5 h-7 bg-primary-600 rounded inline-block" />
        {title}
      </h2>
      {href && (
        <Link href={href} className="text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors">
          مزید {title} ←
        </Link>
      )}
    </div>
  );
}

export default async function HomePage() {
  const data = await getHomepageData();

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      {/* Breaking News Tickers */}
      <BreakingNews articles={data.breakingArticles} />
      <EnglishBreaking articles={data.englishArticles} />

      {/* Featured Hero Section */}
      {data.featuredArticles.length > 0 && (
        <section className="mt-6 mb-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="lg:col-span-2">
              <NewsCard {...(data.featuredArticles[0] as any)} variant="featured" />
            </div>
            {data.featuredArticles.slice(1, 3).map((article) => (
              <NewsCard key={article.id} {...article} variant="featured" />
            ))}
          </div>
        </section>
      )}

      <div className="flex flex-col lg:flex-row gap-10">
        {/* Main Content */}
        <div className="flex-1 min-w-0">

          {/* Latest News Section */}
          <section className="mb-10">
            <SectionHeader title="تازہ ترین خبریں" />
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {data.latestArticles.map((article) => (
                <NewsCard key={article.id} {...article} />
              ))}
            </div>
          </section>

          {/* Category Sections */}
          {Object.entries(data.categoryArticles).slice(0, 6).map(([slug, articles]) => {
            const category = data.categories.find((c) => c.slug === slug);
            if (!category || articles.length === 0) return null;
            return (
              <section key={slug} className="mb-10">
                <SectionHeader title={category.nameUrdu} href={`/category/${slug}`} />
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
                  {articles.slice(0, 4).map((article: any) => (
                    <NewsCard key={article.id} {...article} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>

        {/* Sidebar */}
        <div className="w-full lg:w-80 shrink-0">
          <Sidebar trending={data.trendingArticles} latest={data.latestArticles} />
        </div>
      </div>
    </div>
  );
}
