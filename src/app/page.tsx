export const dynamic = 'force-dynamic';

import { prisma } from '@/lib/prisma';
import HomePageClient from '@/components/public/HomePageClient';

const RECENT_DAYS = 90;

/** Diverse fallback images so image-less articles don't all share the same photo.
 *  Each article picks a consistent image based on a hash of its id. */
const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1504711434969-e33886168d8c?w=800&q=75',  // news studio
  'https://images.unsplash.com/photo-1495020689067-958852a7765e?w=800&q=75',  // newspaper
  'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=75',  // globe
  'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&q=75',  // data/tech
  'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&q=75',  // nature
  'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=800&q=75',  // earth from space
  'https://images.unsplash.com/photo-1461360228754-6e81c478b882?w=800&q=75',  // cityscape
  'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=75',  // building
  'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=75',  // laptop/news
  'https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=800&q=75',  // code/data
];

function pickFallback(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = ((hash << 5) - hash) + id.charCodeAt(i);
    hash |= 0;
  }
  return FALLBACK_IMAGES[Math.abs(hash) % FALLBACK_IMAGES.length];
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

  /* Fill missing featuredImage with a diverse fallback so different
     articles get different placeholder images instead of all sharing one. */
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
