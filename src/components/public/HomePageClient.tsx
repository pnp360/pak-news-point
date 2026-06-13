'use client';

import dynamic from 'next/dynamic';
import NewsCard from '@/components/public/NewsCard';
import Link from 'next/link';
import { getWatermarkedUrl } from '@/lib/watermark-client';
import SafeImage from '@/components/public/SafeImage';
import { timeAgo } from '@/lib/urdu';
import { cleanArticleTitle } from '@/lib/translate';
import { CATEGORY_URDU_NAMES } from '@/lib/i18n';

const BreakingNews = dynamic(() => import('@/components/public/BreakingNews'), { ssr: false });
const AdBanner = dynamic(() => import('@/components/public/AdBanner'), { ssr: false });
const Sidebar = dynamic(() => import('@/components/public/Sidebar'), { ssr: false });

interface ArticleItem {
  id: string; slug: string; title: string;
  featuredImage?: string | null; publishedAt: Date | null; views: number;
  category: { name: string; nameUrdu: string; slug: string };
}

interface TrendingItem {
  id: string; slug: string; title: string;
  views: number; publishedAt: Date | null;
}

interface HomePageData {
  breakingArticles: { id: string; title: string; slug: string }[];
  featuredArticles: ArticleItem[];
  latestArticles: ArticleItem[];
  trendingArticles: TrendingItem[];
  latestFeed: ArticleItem[];
  categories: { slug: string; name: string; nameUrdu: string }[];
  categoryArticles: Record<string, ArticleItem[]>;
}

export default function HomePageClient({ data }: { data: HomePageData }) {
  const hasFeatured = data.featuredArticles.length > 0;
  const mainFeatured = hasFeatured ? data.featuredArticles[0] : data.latestArticles[0];
  const heroSideStories = hasFeatured
    ? data.featuredArticles.slice(1, 5)
    : data.latestArticles.slice(1, 5);

  const mainFeaturedTitle = mainFeatured?.title || '';
  const mainFeaturedCategory = CATEGORY_URDU_NAMES[mainFeatured?.category?.slug] || mainFeatured?.category?.nameUrdu;

  return (
    <div className="mx-auto px-4" style={{ maxWidth: '1360px' }}>
      <BreakingNews articles={data.breakingArticles} />

      {/* Hero Zone */}
      <section className="mt-4 mb-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
          {mainFeatured && (
            <div className="lg:col-span-3">
              <Link href={`/news/${mainFeatured.slug}`} className="group relative block overflow-hidden rounded-2xl shadow-sm h-full min-h-[200px] md:min-h-[380px] lg:min-h-[440px]">
                <SafeImage
                  src={getWatermarkedUrl(mainFeatured.featuredImage || 'https://images.unsplash.com/photo-1555333145-deb2e18f22b0?w=1200&q=80')}
                  alt={mainFeaturedTitle}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 75vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.92) 10%, rgba(0,0,0,0.5) 50%, rgba(0,0,0,0.15) 85%, transparent 100%)', zIndex: 1 }} />
                <div className="absolute bottom-0 inset-x-0 p-4 md:p-6" style={{ zIndex: 2 }}>
                  <span className="bg-primary-600 text-white px-2.5 py-0.5 rounded text-xs font-extrabold inline-block mb-2.5 shadow-lg">
                    {mainFeaturedCategory}
                  </span>
                  <h1 className="hero-banner-title-clamp text-white text-lg sm:text-xl md:text-2xl font-extrabold leading-[1.8] md:leading-[2.2] mb-2 group-hover:underline decoration-2 underline-offset-4 drop-shadow-lg">
                    {cleanArticleTitle(mainFeaturedTitle)}
                  </h1>
                  <div className="flex items-center gap-3 text-xs text-white/70 font-medium">
                    {mainFeatured.publishedAt && <span>{timeAgo(mainFeatured.publishedAt)}</span>}
                  </div>
                </div>
              </Link>
            </div>
          )}
          <div className="grid grid-cols-2 lg:grid-cols-1 gap-3 min-w-0">
            {heroSideStories.map((story: ArticleItem) => {
              const sideCategory = CATEGORY_URDU_NAMES[story.category?.slug] || story.category?.nameUrdu;
              return (
                <article key={story.id} className="min-w-0 flex-1">
                  <Link href={`/news/${story.slug}`} className="card-base group relative block overflow-hidden h-full min-h-[80px] border-0" style={{ aspectRatio: 'auto' }}>
                    <SafeImage
                      src={getWatermarkedUrl(story.featuredImage || '')}
                      alt={story.title}
                      fill
                      sizes="(max-width: 1024px) 50vw, 15vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.4) 60%, rgba(0,0,0,0.1) 100%)', zIndex: 1 }} />
                    <div className="absolute bottom-0 inset-x-0 p-2" style={{ zIndex: 2 }}>
                      <span className="text-[9px] text-primary-300 font-bold uppercase tracking-wider">{sideCategory}</span>
                      <h3 className="text-[11px] font-bold leading-[1.4] text-white drop-shadow-lg line-clamp-2">
                        {cleanArticleTitle(story.title)}
                      </h3>
                    </div>
                  </Link>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <hr className="section-divider" />

      {/* Leaderboard Ad */}
      <div className="mb-8">
        <AdBanner format="leaderboard" />
      </div>

      {/* Trending Strip */}
      <section className="mb-8 bg-gradient-to-l from-primary-600 to-primary-700 rounded-2xl p-3 text-white overflow-hidden shadow-md" style={{ direction: 'rtl' }}>
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold whitespace-nowrap flex items-center gap-1 bg-white/20 px-2.5 py-1 rounded-full shrink-0 relative z-10">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.66 11.2C17.43 10.9 17.15 10.64 16.89 10.38C16.22 9.78 15.46 9.35 14.82 8.72C13.33 7.26 13 4.85 13.95 3C13 3.23 12.17 3.75 11.46 4.32C8.87 6.4 7.85 10.07 9.07 13.22C9.11 13.32 9.15 13.42 9.15 13.55C9.15 13.77 9 13.97 8.8 14.05C8.57 14.15 8.33 14.09 8.14 13.93C8.08 13.88 8.04 13.83 8 13.76C6.87 12.33 6.69 10.28 7.45 8.64C5.78 10 4.87 12.3 5 14.47C5.06 14.97 5.12 15.47 5.29 15.97C5.43 16.57 5.7 17.17 6 17.7C7.08 19.43 8.95 20.67 10.96 20.92C13.1 21.19 15.39 20.8 16.89 19.32C18.55 17.68 19.15 15.15 18.23 13C17.96 12.38 17.6 11.79 17.21 11.24L17.66 11.2Z" /></svg>
            ٹرینڈنگ
          </span>
          <div className="overflow-hidden flex-1 min-w-0">
            <div className="marquee-track">
              {[...data.trendingArticles, ...data.trendingArticles].map((article: TrendingItem, i: number) => (
                <Link
                  key={`${article.id}-${i}`}
                  href={`/news/${article.slug}`}
                  className="ticker-item flex items-center gap-2"
                >
                  <span className="text-base font-bold text-white/50 tabular-nums">{String((i % data.trendingArticles.length) + 1).padStart(2, '0')}</span>
                  <span className="text-sm font-medium">{cleanArticleTitle(article.title)}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <hr className="section-divider" />

      {/* Main Content + Sidebar */}
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 min-w-0">
          {/* Latest News */}
          <section className="mb-8">
            <SectionHeader title="تازہ ترین خبریں" />
            {data.latestFeed.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="sm:col-span-2 lg:col-span-2 lg:row-span-2">
                  <NewsCard {...data.latestFeed[0]} variant="featured" />
                </div>
                <div className="hidden sm:block">
                  <NewsCard {...data.latestFeed[1]} />
                </div>
                <NewsCard {...data.latestFeed[2]} />
                <NewsCard {...data.latestFeed[3]} />
                <NewsCard {...data.latestFeed[4]} />
                {data.latestFeed.slice(5).map((article) => (
                  <NewsCard key={article.id} {...article} />
                ))}
              </div>
            )}
          </section>

          {/* In-stream Ad */}
          <div className="mb-8">
            <AdBanner format="in-content" />
          </div>

          {/* Category Zones */}
          {Object.entries(data.categoryArticles).slice(0, 6).map(([slug, articles], idx) => {
            const category = data.categories.find((c) => c.slug === slug);
            if (!category || articles.length === 0) return null;
            const sliceEnd = slug === 'pakistan' ? 7 : slug === 'world' ? 3 : 5;
            const catTitle = CATEGORY_URDU_NAMES[slug] || category.nameUrdu;
            const useHeroLayout = idx % 2 === 0;

            return (
              <section key={slug} className="mb-8">
                <SectionHeader title={catTitle} href={`/${slug}`} />
                {useHeroLayout && articles.length > 1 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="sm:col-span-2 sm:row-span-2">
                      <article className="news-card h-full">
                        <Link href={`/news/${articles[0].slug}`} className="card-base group relative block overflow-hidden h-full min-h-[240px] border-0">
                          <SafeImage
                            src={getWatermarkedUrl(articles[0].featuredImage || '')}
                            alt={articles[0].title}
                            fill
                            sizes="(max-width: 768px) 100vw, 50vw"
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.7) 50%, rgba(0,0,0,0.3) 100%)', zIndex: 1 }} />
                          <div className="absolute bottom-0 inset-x-0 p-3.5" style={{ zIndex: 2 }}>
                            <h3 className="text-white font-extrabold text-base leading-[1.8] group-hover:underline drop-shadow-lg break-words line-clamp-3">{cleanArticleTitle(articles[0].title)}</h3>
                            <span className="text-white/70 text-xs mt-0.5 block font-medium">{articles[0].publishedAt && timeAgo(articles[0].publishedAt)}</span>
                          </div>
                        </Link>
                      </article>
                    </div>
                    {articles.slice(1, sliceEnd).map((article) => (
                      <NewsCard key={article.id} {...article} />
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    {articles.slice(0, sliceEnd).map((article) => (
                      <NewsCard key={article.id} {...article} />
                    ))}
                  </div>
                )}
              </section>
            );
          })}

          <hr className="section-divider" />

          {/* Newsletter CTA */}
          <section className="mb-8 relative overflow-hidden rounded-2xl shadow-md">
            <div className="absolute inset-0 bg-gradient-to-br from-primary-700 via-primary-600 to-red-800" />
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 0%, transparent 50%), radial-gradient(circle at 80% 50%, white 0%, transparent 50%)' }} />
            <div className="relative p-6 md:p-8 text-white text-center">
              <div className="max-w-lg mx-auto">
                <svg className="w-10 h-10 mx-auto mb-3 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                <h2 className="text-xl md:text-2xl font-bold mb-1.5">تازہ ترین خبریں اپنی ای میل پر حاصل کریں</h2>
                <p className="text-white/70 text-sm mb-4">روزانہ کی اہم خبریں اور خصوصی اپ ڈیٹس براہ راست اپنی ان باکس میں</p>
                <form className="flex gap-2 max-w-sm mx-auto" action="#">
                  <input type="email" placeholder="ای میل ایڈریس درج کریں" className="flex-1 px-3 py-2.5 rounded-xl text-gray-900 bg-white/95 text-sm focus:outline-none focus:ring-2 focus:ring-white/50" />
                  <button type="button" className="bg-white text-primary-700 hover:bg-gray-100 px-5 py-2.5 rounded-xl text-sm font-bold transition-colors shadow">سبسکرائب کریں</button>
                </form>
              </div>
            </div>
          </section>
        </div>

        <div className="w-full lg:w-72 shrink-0">
          <Sidebar trending={data.trendingArticles} latest={data.latestArticles} />
        </div>
      </div>
    </div>
  );
}

function SectionHeader({ title, href }: { title: string; href?: string }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-lg font-bold flex items-center gap-2.5">
        <span className="w-2 h-6 bg-gradient-to-b from-primary-500 to-primary-700 rounded-full inline-block" />
        {title}
      </h2>
      {href && (
        <Link href={href} className="group text-[11px] text-primary-600 hover:text-primary-700 font-semibold transition-all flex items-center gap-1 bg-primary-50 dark:bg-primary-900/30 px-3 py-1.5 rounded-full hover:bg-primary-100 dark:hover:bg-primary-900/50">
          <span>مزید</span>
          <svg className="w-2.5 h-2.5 rotate-180 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        </Link>
      )}
    </div>
  );
}
