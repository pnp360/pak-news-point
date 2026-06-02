export const dynamic = 'force-dynamic';

import { prisma } from '@/lib/prisma';
import BreakingNews from '@/components/public/BreakingNews';
import EnglishBreaking from '@/components/public/EnglishBreaking';
import NewsCard from '@/components/public/NewsCard';
import Sidebar from '@/components/public/Sidebar';
import Link from 'next/link';
import Image from 'next/image';
import { getWatermarkedUrl } from '@/lib/watermark';
import { timeAgo } from '@/lib/urdu';
import AdBanner from '@/components/public/AdBanner';

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
      take: 13,
      include: { category: { select: { nameUrdu: true, slug: true } } },
    }),
    prisma.article.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: { views: 'desc' },
      take: 10,
      select: { id: true, title: true, slug: true, views: true, publishedAt: true },
    }),
  ]);

  const categories = await prisma.category.findMany({ orderBy: { order: 'asc' } });

  const categoryArticles: Record<string, any[]> = {};
  for (const cat of categories) {
    const articles = await prisma.article.findMany({
      where: { status: 'PUBLISHED', categoryId: cat.id },
      orderBy: { publishedAt: 'desc' },
      take: 5,
      include: { category: { select: { nameUrdu: true, slug: true } } },
    });
    if (articles.length > 0) categoryArticles[cat.slug] = articles;
  }

  return { breakingArticles, englishArticles, featuredArticles, latestArticles, trendingArticles, categories, categoryArticles };
}

function SectionHeader({ title, href }: { title: string; href?: string }) {
  return (
    <div className="flex items-center justify-between mb-5">
      <h2 className="text-lg font-bold flex items-center gap-2">
        <span className="w-1.5 h-6 bg-primary-600 rounded inline-block" />
        {title}
      </h2>
      {href && (
        <Link href={href} className="text-xs text-primary-600 hover:text-primary-700 font-medium transition-colors flex items-center gap-1">
          <span>مزید</span>
          <svg className="w-3 h-3 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        </Link>
      )}
    </div>
  );
}

export default async function HomePage() {
  const data = await getHomepageData();
  const hasFeatured = data.featuredArticles.length > 0;
  const mainFeatured = hasFeatured ? data.featuredArticles[0] : data.latestArticles[0];
  const heroSideStories = hasFeatured
    ? data.featuredArticles.slice(1, 5)
    : data.latestArticles.slice(1, 5);

  return (
    <div className="mx-auto px-4 py-4" style={{ maxWidth: '1400px' }}>
      {/* Breaking News Tickers */}
      <BreakingNews articles={data.breakingArticles} />
      <EnglishBreaking articles={data.englishArticles} />

      {/* ════════ HERO ZONE — Magazine Style ════════ */}
      <section className="mt-5 mb-10">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Main Hero — 3/4 width */}
          {mainFeatured && (
            <div className="lg:col-span-3">
              <Link href={`/news/${mainFeatured.slug}`} className="group relative block overflow-hidden rounded-2xl shadow-sm h-full min-h-[450px] md:min-h-[550px]">
                <Image
                  src={getWatermarkedUrl(mainFeatured.featuredImage || 'https://images.unsplash.com/photo-1555333145-deb2e18f22b0?w=1200&q=80')}
                  alt={mainFeatured.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 75vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                <div className="absolute bottom-0 right-0 left-0 p-6 md:p-8 text-white flex flex-col">
                  <span className="bg-primary-600 text-white px-3 py-1 rounded text-xs font-semibold inline-block mb-3 uppercase tracking-wider self-start">
                    {mainFeatured.category?.nameUrdu}
                  </span>
                  <h1 className="text-2xl md:text-3xl font-bold leading-[2.2] mb-3 group-hover:underline decoration-2 underline-offset-4">
                    {mainFeatured.title}
                  </h1>
                  <div className="flex items-center gap-3 text-sm text-gray-300">
                    {mainFeatured.publishedAt && <span>{timeAgo(mainFeatured.publishedAt)}</span>}
                  </div>
                </div>
              </Link>
            </div>
          )}
          {/* Side Stories — 1/4 width */}
          <div className="flex flex-col gap-3">
            {heroSideStories.map((story) => (
              <article key={story.id} className="news-card">
                <Link href={`/news/${story.slug}`} className="group flex flex-row-reverse gap-3 items-center bg-white rounded-xl p-3 shadow-sm hover:shadow-md transition-shadow border border-gray-100">
                  <div className="relative w-20 h-20 shrink-0 rounded-md overflow-hidden bg-gray-100">
                    <Image
                      src={getWatermarkedUrl(story.featuredImage || '')}
                      alt={story.title}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0 w-full">
                    <span className="text-xs text-primary-600 font-medium">{story.category?.nameUrdu}</span>
                    <h3 className="text-sm font-semibold leading-[1.6] mt-0.5 group-hover:text-primary-600 transition-colors">
                      {story.title}
                    </h3>
                    <span className="text-xs text-gray-400 mt-1 block">{story.publishedAt && timeAgo(story.publishedAt)}</span>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Leaderboard Ad */}
      <div className="mb-8">
        <AdBanner format="leaderboard" />
      </div>

      {/* ════════ TRENDING STRIP ════════ */}
      {data.trendingArticles.length > 0 && (
        <section className="mb-10 bg-gradient-to-l from-primary-600 to-primary-700 rounded-2xl p-4 text-white">
          <div className="flex items-center gap-4 overflow-x-auto scrollbar-hide">
            <span className="text-sm font-bold whitespace-nowrap flex items-center gap-1.5 bg-white/20 px-3 py-1.5 rounded-full">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.66 11.2C17.43 10.9 17.15 10.64 16.89 10.38C16.22 9.78 15.46 9.35 14.82 8.72C13.33 7.26 13 4.85 13.95 3C13 3.23 12.17 3.75 11.46 4.32C8.87 6.4 7.85 10.07 9.07 13.22C9.11 13.32 9.15 13.42 9.15 13.55C9.15 13.77 9 13.97 8.8 14.05C8.57 14.15 8.33 14.09 8.14 13.93C8.08 13.88 8.04 13.83 8 13.76C6.87 12.33 6.69 10.28 7.45 8.64C5.78 10 4.87 12.3 5 14.47C5.06 14.97 5.12 15.47 5.29 15.97C5.43 16.57 5.7 17.17 6 17.7C7.08 19.43 8.95 20.67 10.96 20.92C13.1 21.19 15.39 20.8 16.89 19.32C18.55 17.68 19.15 15.15 18.23 13C17.96 12.38 17.6 11.79 17.21 11.24L17.66 11.2Z" /></svg>
              ٹرینڈنگ
            </span>
            {data.trendingArticles.map((article, i) => (
              <Link
                key={article.id}
                href={`/news/${article.slug}`}
                className="flex items-center gap-2 whitespace-nowrap hover:bg-white/10 px-3 py-2 rounded-lg transition-colors shrink-0"
              >
                <span className="text-lg font-bold text-white/50 tabular-nums">{String(i + 1).padStart(2, '0')}</span>
                <span className="text-sm font-medium">{article.title}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ════════ MAIN CONTENT + SIDEBAR (3-column grid with flanking ads) ════════ */}
      <div className="main-news-grid">

        {/* Left Skyscraper Ad */}
        <div className="side-ad-column sticky top-24">
          <AdBanner format="skyscraper" />
        </div>

        {/* Center: Content + Sidebar */}
        <div className="center-news-feed">

          {/* Main Column */}
          <div className="flex-1 min-w-0">

            {/* LATEST NEWS — Magazine Grid */}
            <section className="mb-10">
              <SectionHeader title="تازہ ترین خبریں" />
              {data.latestArticles.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="md:col-span-2">
                    <NewsCard {...(data.latestArticles[0] as any)} variant="featured" />
                  </div>
                  <div>
                    <NewsCard {...(data.latestArticles[1] as any)} />
                  </div>
                  <NewsCard {...(data.latestArticles[2] as any)} />
                  <NewsCard {...(data.latestArticles[3] as any)} />
                  {data.latestArticles.slice(4).map((article) => (
                    <NewsCard key={article.id} {...article} />
                  ))}
                </div>
              )}
            </section>

            {/* CATEGORY ZONES */}
            {Object.entries(data.categoryArticles).slice(0, 6).map(([slug, articles]) => {
              const category = data.categories.find((c) => c.slug === slug);
              if (!category || articles.length === 0) return null;
              return (
                <section key={slug} className="mb-10">
                  <SectionHeader title={category.nameUrdu} href={`/category/${slug}`} />
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                    <div className="md:col-span-2 md:row-span-2">
                      <article className="news-card h-full">
                        <Link href={`/news/${articles[0].slug}`} className="group relative block overflow-hidden rounded-2xl shadow-sm h-full min-h-[300px]">
                          <Image
                            src={getWatermarkedUrl(articles[0].featuredImage || '')}
                            alt={articles[0].title}
                            fill
                            sizes="(max-width: 768px) 100vw, 50vw"
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                          <div className="absolute bottom-0 right-0 left-0 p-5 text-white flex flex-col">
                            <h3 className="text-lg font-bold leading-[2] group-hover:underline">{articles[0].title}</h3>
                            <span className="text-xs text-gray-300 mt-1 block">{articles[0].publishedAt && timeAgo(articles[0].publishedAt)}</span>
                          </div>
                        </Link>
                      </article>
                    </div>
                    {articles.slice(1, 5).map((article: any) => (
                      <NewsCard key={article.id} {...article} />
                    ))}
                  </div>
                </section>
              );
            })}

            {/* NEWSLETTER CTA */}
            <section className="mb-10 bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 text-white text-center">
              <h2 className="text-2xl font-bold mb-2">تازہ ترین خبریں اپنی ای میل پر حاصل کریں</h2>
              <p className="text-gray-400 mb-5">روزانہ کی اہم خبریں اور خصوصی اپ ڈیٹس براہ راست اپنی ان باکس میں</p>
              <form className="flex gap-3 max-w-md mx-auto" action="#">
                <input type="email" placeholder="ای میل ایڈریس درج کریں" className="flex-1 px-4 py-3 rounded-xl text-gray-900 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                <button type="button" className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-xl text-sm font-semibold transition-colors">سبسکرائب کریں</button>
              </form>
            </section>

          </div>

          {/* Sidebar */}
          <div className="w-full lg:w-80 shrink-0">
            <Sidebar trending={data.trendingArticles} latest={data.latestArticles} />
          </div>
        </div>

        {/* Right Skyscraper Ad */}
        <div className="side-ad-column sticky top-24">
          <AdBanner format="skyscraper" />
        </div>
      </div>
    </div>
  );
}
