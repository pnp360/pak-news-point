export const dynamic = 'force-dynamic';

import { prisma } from '@/lib/prisma';
import HomePageClient from '@/components/public/HomePageClient';

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
      include: { category: { select: { name: true, nameUrdu: true, slug: true } } },
    }),
    prisma.article.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: { publishedAt: 'desc' },
      take: 20,
      include: { category: { select: { name: true, nameUrdu: true, slug: true } } },
    }),
    prisma.article.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: { views: 'desc' },
      take: 10,
      select: { id: true, title: true, originalTitle: true, slug: true, views: true, publishedAt: true },
    }),
  ]);

  const categories = await prisma.category.findMany({ orderBy: { order: 'asc' } });

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

  const categoryArticles: Record<string, { id: string; slug: string; title: string; featuredImage?: string | null; publishedAt: Date | null; views: number; category: { name: string; nameUrdu: string; slug: string } }[]> = {};
  for (const cat of categories) {
    let take = 5;
    if (cat.slug === 'pakistan') take = 8;
    else if (cat.slug === 'world') take = 4;
    const articles = await prisma.article.findMany({
      where: { status: 'PUBLISHED', categoryId: cat.id },
      orderBy: { publishedAt: 'desc' },
      take,
      include: { category: { select: { name: true, nameUrdu: true, slug: true } } },
    });
    if (articles.length > 0) categoryArticles[cat.slug] = articles;
  }

  return { breakingArticles, englishArticles, featuredArticles, latestArticles, latestFeed, trendingArticles, categories, categoryArticles };
}

export default async function HomePage() {
  const data = await getHomepageData();
  return <HomePageClient data={data} />;
}
