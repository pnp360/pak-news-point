import { prisma } from '@/lib/prisma';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://azadkhabar.vercel.app';

export async function GET() {
  const articles = await prisma.article.findMany({
    where: { status: 'PUBLISHED' },
    orderBy: { publishedAt: 'desc' },
    take: 1000,
    select: {
      slug: true,
      title: true,
      publishedAt: true,
    },
  });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
  ${articles.map((a) => `  <url>
    <loc>${SITE_URL}/news/${a.slug}</loc>
    <news:news>
      <news:publication>
        <news:name>Azad Khabar</news:name>
        <news:language>ur</news:language>
      </news:publication>
      <news:publication_date>${a.publishedAt?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0]}</news:publication_date>
      <news:title>${escapeXml(a.title)}</news:title>
    </news:news>
  </url>`).join('\n')}
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}

function escapeXml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}
