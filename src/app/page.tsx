export const dynamic = 'force-dynamic';

import { prisma } from '@/lib/prisma';
import HomePageClient from '@/components/public/HomePageClient';

const RECENT_DAYS = 90;

/** Generate a unique placeholder image per article using its slug as a seed.
 *  picsum.photos returns a different random photo for each seed. */
function pickFallback(id: string, slug?: string): string {
  const seed = slug || id;
  return `https://picsum.photos/seed/${seed}/800/600`;
}

async function getHomepageData() {
  const recentSince = new Date(Date.now() - RECENT_DAYS * 24 * 60 * 60 * 1000);

  const [breakingArticles, rawFeatured, rawLatest, trendingArticles] = await Promise.all([
    prisma.article.findMany({
      where: { status: 'PUBLISHED', isBreaking: true, publishedAt: { gte: recentSince } },
      orderBy: { publishedAt: 'desc' },
      take: 10,
      select: { id: true, title: true, slug: true },
    }),
    prisma.article.findMany({
      where: { status: 'PUBLISHED', isFeatured: true },
      orderBy: { publishedAt: 'desc' },
      take: 5,
      include: { category: { select: { name: true, nameUrdu: true, slug: true } } },
    }),
    prisma.article.findMany({
      where: { status: 'PUBLISHED', publishedAt: { gte: recentSince } },
      orderBy: { publishedAt: 'desc' },
      take: 20,
      include: { category: { select: { name: true, nameUrdu: true, slug: true } } },
    }),
    prisma.article.findMany({
      where: { status: 'PUBLISHED', publishedAt: { gte: recentSince } },
      orderBy: { views: 'desc' },
      take: 10,
      select: { id: true, title: true, slug: true, views: true, publishedAt: true },
    }),
  ]);

  const categories = await prisma.category.findMany({ orderBy: { order: 'asc' } });

  /* Fill missing featuredImage with a unique placeholder per article. */
  function fillImage<T extends { id: string; featuredImage?: string | null }>(items: T[]): T[] {
    return items.map((a) => ({ ...a, featuredImage: a.featuredImage || pickFallback(a.id) }));
  }
  const featuredArticles = fillImage(rawFeatured);
  const latestArticles = fillImage(rawLatest);

  const pakistanSlug = categories.find((c) => c.slug === 'pakistan')?.slug;
  const worldSlug = categories.find((c) => c.slug === 'world')?.slug;

  const pakistanArticles = pakistanSlug
    ? latestArticles.filter((a) => a.category?.slug === pakistanSlug)
    : [];
  const worldArticles = worldSlug
    ? latestArticles.filter((a) => a.category?.slug === worldSlug)
    : [];

  const latestFeed: typeof latestArticles = [];
  let pi = 0, wi = 0;
  while (pi < pakistanArticles.length || wi < worldArticles.length) {
    for (let i = 0; i < 3 && pi < pakistanArticles.length; i++) {
      latestFeed.push(pakistanArticles[pi++]);
    }
    if (wi < worldArticles.length) {
      latestFeed.push(worldArticles[wi++]);
    } else if (pi < pakistanArticles.length) {
      latestFeed.push(pakistanArticles[pi++]);
    } else {
      break;
    }
  }

  const remainingLatest = latestArticles.filter((a) => {
    if (!pakistanSlug || !worldSlug) return false;
    const s = a.category?.slug;
    return s !== pakistanSlug && s !== worldSlug;
  });
  latestFeed.push(...remainingLatest);

  const categoryArticles: Record<string, typeof latestArticles[0][]> = {};
  for (const cat of categories) {
    let take = 5;
    if (cat.slug === 'pakistan') take = 8;
    else if (cat.slug === 'world') take = 4;
    const articles = await prisma.article.findMany({
      where: { status: 'PUBLISHED', categoryId: cat.id, publishedAt: { gte: recentSince } },
      orderBy: { publishedAt: 'desc' },
      take,
      include: { category: { select: { name: true, nameUrdu: true, slug: true } } },
    });
    if (articles.length > 0) categoryArticles[cat.slug] = fillImage(articles);
  }

  return { breakingArticles, featuredArticles, latestArticles, latestFeed, trendingArticles, categories, categoryArticles };
}

export default async function HomePage() {
  const data = await getHomepageData();
  return <HomePageClient data={data} />;
}
