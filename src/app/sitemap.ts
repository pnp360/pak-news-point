export const dynamic = 'force-dynamic';

import type { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  const articles = await prisma.article.findMany({
    where: { status: 'PUBLISHED' },
    select: { slug: true, updatedAt: true, views: true },
    orderBy: { publishedAt: 'desc' },
  });

  const categories = await prisma.category.findMany({
    select: { slug: true },
  });

  const staticPages = [
    { path: '', lastModified: new Date(), priority: 1.0 },
    { path: '/about', lastModified: new Date(), priority: 0.5 },
    { path: '/contact', lastModified: new Date(), priority: 0.5 },
    { path: '/search', lastModified: new Date(), priority: 0.7 },
    { path: '/privacy-policy', lastModified: new Date(), priority: 0.3 },
    { path: '/terms', lastModified: new Date(), priority: 0.3 },
  ];

  return [
    ...staticPages.map((page) => ({
      url: `${baseUrl}${page.path}`,
      lastModified: page.lastModified,
      changeFrequency: 'daily' as const,
      priority: page.priority,
    })),
    ...categories.map((cat) => ({
      url: `${baseUrl}/${cat.slug}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.8,
    })),
    ...articles.map((article) => ({
      url: `${baseUrl}/news/${article.slug}`,
      lastModified: article.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: article.views > 100 ? 0.8 : article.views > 10 ? 0.6 : 0.5,
    })),
  ];
}
