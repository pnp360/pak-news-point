export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  const articles = await prisma.article.findMany({
    where: { status: 'PUBLISHED' },
    orderBy: { publishedAt: 'desc' },
    take: 50,
    include: {
      category: { select: { nameUrdu: true } },
      author: { select: { name: true } },
    },
  });

  const items = articles
    .map(
      (article) => `
    <item>
      <title>${escapeXml(article.title)}</title>
      <link>${baseUrl}/news/${article.slug}</link>
      <guid>${baseUrl}/news/${article.slug}</guid>
      <description>${escapeXml(article.excerpt || article.title)}</description>
      <pubDate>${article.publishedAt?.toUTCString() || ''}</pubDate>
      <category>${escapeXml(article.category.nameUrdu)}</category>
      <author>${escapeXml(article.author.name || '')}</author>
    </item>`
    )
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>پاکستان نیوز پوائنٹ - RSS Feed</title>
    <link>${baseUrl}</link>
    <description>پاکستان کی تازہ ترین خبریں</description>
    <language>ur-pk</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${baseUrl}/api/feed" rel="self" type="application/rss+xml"/>
    ${items}
  </channel>
</rss>`;

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
