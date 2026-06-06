'use client';

import BreakingNews from '@/components/public/BreakingNews';
import NewsCard from '@/components/public/NewsCard';
import Sidebar from '@/components/public/Sidebar';
import Link from 'next/link';
import { getWatermarkedUrl } from '@/lib/watermark-client';
import SafeImage from '@/components/public/SafeImage';
import { timeAgo } from '@/lib/urdu';
import { cleanArticleTitle } from '@/lib/translate';
import AdBanner from '@/components/public/AdBanner';
import { useLanguage } from '@/components/LanguageProvider';
import { t, CATEGORY_ENGLISH_NAMES, CATEGORY_URDU_NAMES } from '@/lib/i18n';
import type { Language } from '@/lib/i18n';

interface ArticleItem {
  id: string; slug: string; title: string; originalTitle?: string | null;
  featuredImage?: string | null; publishedAt: Date | null; views: number;
  category: { name: string; nameUrdu: string; slug: string };
}

interface TrendingItem {
  id: string; slug: string; title: string; originalTitle?: string | null;
  views: number; publishedAt: Date | null;
}

interface HomePageData {
  breakingArticles: { id: string; title: string; originalTitle?: string | null; slug: string }[];
  featuredArticles: ArticleItem[];
  latestArticles: ArticleItem[];
  trendingArticles: TrendingItem[];
  latestFeed: ArticleItem[];
  categories: { slug: string; name: string; nameUrdu: string }[];
  categoryArticles: Record<string, ArticleItem[]>;
}

export default function HomePageClient({ data }: { data: HomePageData }) {
  const { lang } = useLanguage();

  const hasFeatured = data.featuredArticles.length > 0;
  const mainFeatured = hasFeatured ? data.featuredArticles[0] : data.latestArticles[0];
  const heroSideStories = hasFeatured
    ? data.featuredArticles.slice(1, 5)
    : data.latestArticles.slice(1, 5);

  const mainFeaturedTitle = lang === 'en' && mainFeatured?.originalTitle
    ? mainFeatured.originalTitle
    : mainFeatured?.title || '';
  const mainFeaturedCategory = lang === 'en'
    ? (CATEGORY_ENGLISH_NAMES[mainFeatured?.category?.slug] || mainFeatured?.category?.name || mainFeatured?.category?.nameUrdu)
    : (CATEGORY_URDU_NAMES[mainFeatured?.category?.slug] || mainFeatured?.category?.nameUrdu);

  return (
    <div className="mx-auto px-4 py-4" style={{ maxWidth: '1400px' }}>
      <BreakingNews articles={data.breakingArticles} />

      {/* Hero Zone */}
      <section className="mt-5 mb-10">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {mainFeatured && (
            <div className="lg:col-span-3">
              <Link href={`/news/${mainFeatured.slug}`} className="group relative block overflow-hidden rounded-2xl shadow-sm h-full min-h-[450px] md:min-h-[550px]">
                <SafeImage
                  src={getWatermarkedUrl(mainFeatured.featuredImage || 'https://images.unsplash.com/photo-1555333145-deb2e18f22b0?w=1200&q=80')}
                  alt={mainFeaturedTitle}
                  fill
                  sizes="(max-width: 1024px) 100vw, 75vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.3) 70%, transparent 100%)' }} />
                <div className="absolute bottom-0 inset-x-0 p-6 md:p-8">
                  <span className="bg-primary-600 text-white px-4 py-1.5 rounded text-xs font-extrabold inline-block mb-4 uppercase tracking-wider shadow-lg">
                    {mainFeaturedCategory}
                  </span>
                  <h1 className="text-white text-2xl md:text-3xl font-extrabold leading-[2.5] mb-4 group-hover:underline decoration-2 underline-offset-4 drop-shadow-lg overflow-hidden">
                    {cleanArticleTitle(mainFeaturedTitle)}
                  </h1>
                  <div className="flex items-center gap-3 text-sm text-white/80 font-medium">
                    {mainFeatured.publishedAt && <span>{timeAgo(mainFeatured.publishedAt, lang)}</span>}
                  </div>
                </div>
              </Link>
            </div>
          )}
          <div className="flex flex-col gap-3">
            {heroSideStories.map((story: ArticleItem) => {
              const sideTitle = lang === 'en' && story.originalTitle ? story.originalTitle : story.title;
              const sideCategory = lang === 'en'
                ? (CATEGORY_ENGLISH_NAMES[story.category?.slug] || story.category?.name || story.category?.nameUrdu)
                : (CATEGORY_URDU_NAMES[story.category?.slug] || story.category?.nameUrdu);
              return (
                <article key={story.id} className="news-card">
                  <Link href={`/news/${story.slug}`} className="group flex flex-row-reverse items-center gap-4 bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
                    <div className="relative w-28 aspect-video shrink-0 rounded-md overflow-hidden">
                      <SafeImage
                        src={getWatermarkedUrl(story.featuredImage || '')}
                        alt={sideTitle}
                        fill
                        sizes="112px"
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0 overflow-hidden">
                      <span className="text-xs text-primary-600 font-medium">{sideCategory}</span>
                      <h3 className="text-sm font-semibold leading-[1.6] mt-0.5 group-hover:text-primary-600 transition-colors line-clamp-2">
                        {cleanArticleTitle(sideTitle)}
                      </h3>
                      <span className="text-xs text-gray-400 mt-1 block">{story.publishedAt && timeAgo(story.publishedAt, lang)}</span>
                    </div>
                  </Link>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* Leaderboard Ad */}
      <div className="mb-8">
        <AdBanner format="leaderboard" />
      </div>

      {/* Trending Strip — show all in English mode */}
      <section className="mb-10 bg-gradient-to-l from-primary-600 to-primary-700 rounded-2xl p-4 text-white">
        <div className="flex items-center gap-4 overflow-x-auto scrollbar-hide">
          <span className="text-sm font-bold whitespace-nowrap flex items-center gap-1.5 bg-white/20 px-3 py-1.5 rounded-full">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.66 11.2C17.43 10.9 17.15 10.64 16.89 10.38C16.22 9.78 15.46 9.35 14.82 8.72C13.33 7.26 13 4.85 13.95 3C13 3.23 12.17 3.75 11.46 4.32C8.87 6.4 7.85 10.07 9.07 13.22C9.11 13.32 9.15 13.42 9.15 13.55C9.15 13.77 9 13.97 8.8 14.05C8.57 14.15 8.33 14.09 8.14 13.93C8.08 13.88 8.04 13.83 8 13.76C6.87 12.33 6.69 10.28 7.45 8.64C5.78 10 4.87 12.3 5 14.47C5.06 14.97 5.12 15.47 5.29 15.97C5.43 16.57 5.7 17.17 6 17.7C7.08 19.43 8.95 20.67 10.96 20.92C13.1 21.19 15.39 20.8 16.89 19.32C18.55 17.68 19.15 15.15 18.23 13C17.96 12.38 17.6 11.79 17.21 11.24L17.66 11.2Z" /></svg>
            {lang === 'en' ? 'Trending' : 'ٹرینڈنگ'}
          </span>
          {data.trendingArticles.map((article: TrendingItem, i: number) => {
            const trendTitle = lang === 'en' && article.originalTitle ? article.originalTitle : article.title;
            return (
              <Link
                key={article.id}
                href={`/news/${article.slug}`}
                className="flex items-center gap-2 whitespace-nowrap hover:bg-white/10 px-3 py-2 rounded-lg transition-colors shrink-0"
              >
                <span className="text-lg font-bold text-white/50 tabular-nums">{String(i + 1).padStart(2, '0')}</span>
                <span className="text-sm font-medium">{cleanArticleTitle(trendTitle)}</span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Main Content + Sidebar */}
      <div className="main-news-grid">
        <div className="side-ad-column sticky top-24">
          <AdBanner format="skyscraper" />
        </div>

        <div className="center-news-feed">
          <div className="flex-1 min-w-0">
            {/* Latest News */}
            <section className="mb-10">
              <SectionHeader title={t('latest', lang)} lang={lang} />
              {data.latestFeed.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="md:col-span-2">
                    <NewsCard {...data.latestFeed[0]} variant="featured" />
                  </div>
                  <div>
                    <NewsCard {...data.latestFeed[1]} />
                  </div>
                  <NewsCard {...data.latestFeed[2]} />
                  <NewsCard {...data.latestFeed[3]} />
                  {data.latestFeed.slice(4).map((article) => (
                    <NewsCard key={article.id} {...article} />
                  ))}
                </div>
              )}
            </section>

            {/* Category Zones */}
            {Object.entries(data.categoryArticles).slice(0, 6).map(([slug, articles]) => {
              const category = data.categories.find((c) => c.slug === slug);
              if (!category || articles.length === 0) return null;
              const sliceEnd = slug === 'pakistan' ? 7 : slug === 'world' ? 3 : 5;
              const catTitle = lang === 'en' ? (CATEGORY_ENGLISH_NAMES[slug] || category.name) : (CATEGORY_URDU_NAMES[slug] || category.nameUrdu);
              return (
                <section key={slug} className="mb-10">
                  <SectionHeader title={catTitle} href={`/${slug}`} lang={lang} />
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                    <div className="md:col-span-2 md:row-span-2">
                      <article className="news-card h-full">
                        <Link href={`/news/${articles[0].slug}`} className="group relative block overflow-hidden rounded-2xl shadow-sm h-full min-h-[300px]">
                          <SafeImage
                            src={getWatermarkedUrl(articles[0].featuredImage || '')}
                            alt={articles[0].title}
                            fill
                            sizes="(max-width: 768px) 100vw, 50vw"
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.3) 70%, transparent 100%)' }} />
                          <div className="absolute bottom-0 inset-x-0 p-4">
                            <h3 className="text-white font-extrabold text-lg leading-[2] group-hover:underline drop-shadow-lg break-words line-clamp-3">{cleanArticleTitle(articles[0].title)}</h3>
                            <span className="text-white/80 text-xs mt-1 block font-medium">{articles[0].publishedAt && timeAgo(articles[0].publishedAt, lang)}</span>
                          </div>
                        </Link>
                      </article>
                    </div>
                    {articles.slice(1, sliceEnd).map((article) => (
                      <NewsCard key={article.id} {...article} />
                    ))}
                  </div>
                </section>
              );
            })}

            {/* Newsletter CTA */}
            <section className="mb-10 bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 text-white text-center">
              <h2 className="text-2xl font-bold mb-2">{t('newsletter.title', lang)}</h2>
              <p className="text-gray-400 mb-5">{t('newsletter.description', lang)}</p>
              <form className="flex gap-3 max-w-md mx-auto" action="#">
                <input type="email" placeholder={t('newsletter.placeholder', lang)} className="flex-1 px-4 py-3 rounded-xl text-gray-900 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                <button type="button" className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-xl text-sm font-semibold transition-colors">{t('newsletter.subscribe', lang)}</button>
              </form>
            </section>
          </div>

          <div className="w-full lg:w-80 shrink-0">
            <Sidebar trending={data.trendingArticles} latest={data.latestArticles} />
          </div>
        </div>

        {/* Right sidebar trending */}
        <div className="side-ad-column sticky top-24">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
            <h3 className="text-sm font-bold border-b dark:border-gray-700 pb-2 mb-3 flex items-center gap-2">
              <span className="w-1 h-5 bg-primary-600 rounded inline-block" />
              {t('trending', lang)}
            </h3>
            <div className="space-y-3">
              {data.trendingArticles.slice(0, 5).map((article: TrendingItem, i: number) => {
                const trendTitle = lang === 'en' && article.originalTitle ? article.originalTitle : article.title;
                return (
                  <Link
                    key={article.id}
                    href={`/news/${article.slug}`}
                    className="flex gap-2 group"
                  >
                    <span className="text-primary-600 font-bold text-sm w-5 shrink-0 tabular-nums">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <p className="text-xs font-medium leading-[1.6] group-hover:text-primary-600 transition-colors line-clamp-2">
                      {cleanArticleTitle(trendTitle)}
                    </p>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionHeader({ title, href, lang }: { title: string; href?: string; lang: Language }) {
  return (
    <div className="flex items-center justify-between mb-5">
      <h2 className="text-lg font-bold flex items-center gap-2">
        <span className="w-1.5 h-6 bg-primary-600 rounded inline-block" />
        {title}
      </h2>
      {href && (
        <Link href={href} className="text-xs text-primary-600 hover:text-primary-700 font-medium transition-colors flex items-center gap-1">
          <span>{t('more', lang)}</span>
          <svg className={`w-3 h-3 ${lang === 'en' ? '' : 'rotate-180'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        </Link>
      )}
    </div>
  );
}
