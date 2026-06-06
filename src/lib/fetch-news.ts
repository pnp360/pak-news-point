import { prisma } from '@/lib/prisma';
import { FEED_CONFIG, parser } from '@/lib/rss-fetcher';
import { translateToUrduAsync, translateToUrdu } from '@/lib/translate';
import { autoFetchImageForArticle, resetUsedUrls } from '@/lib/image-fetcher';
import { applyUrduJournalism } from '@/lib/urdu-journalism';
import { incrementPublishedCount } from '@/lib/daily-limit';

const CATEGORY_SLUG_MAP: Record<string, string> = {
  Pakistan: 'pakistan',
  World: 'world',
  Politics: 'pakistan',
  Sports: 'sports',
  Business: 'business',
  Entertainment: 'entertainment',
  Technology: 'technology',
  Health: 'health',
  Education: 'education',
};

function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function titleSimilarity(a: string, b: string): number {
  const wordsA = normalizeTitle(a).split(/\s+/).filter(Boolean);
  const wordsB = normalizeTitle(b).split(/\s+/).filter(Boolean);
  if (!wordsA.length || !wordsB.length) return 0;
  const setB = new Set(wordsB);
  let matches = 0;
  for (const w of wordsA) {
    if (setB.has(w)) matches++;
  }
  return matches / Math.max(wordsA.length, wordsB.length);
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80) || 'news';
}

export async function fetchAllFeeds(): Promise<{
  success: boolean;
  totalCreated: number;
  totalErrors: number;
  feeds: { feed: string; fetched: number; created: number; errors: number }[];
}> {
  resetUsedUrls();

  const categories = await prisma.category.findMany();
  const catBySlug = new Map(categories.map((c) => [c.slug, c]));

  const results = await Promise.allSettled(
    FEED_CONFIG.map(async (feed) => {
      try {
        const parsed = await parser.parseURL(feed.url);
        if (!parsed.items?.length) return { feed: feed.name, fetched: 0, created: 0, errors: 0 };

        const catSlug = CATEGORY_SLUG_MAP[feed.category];
        const category = catSlug ? catBySlug.get(catSlug) : null;
        if (!category) return { feed: feed.name, fetched: parsed.items.length, created: 0, errors: 0 };

        let created = 0;
        let errors = 0;

        for (const item of parsed.items.slice(0, 10)) {
          try {
            const englishTitle = (item.title || '').trim();
            if (!englishTitle) continue;

            const existing = await prisma.article.findFirst({
              where: { title: { contains: englishTitle.slice(0, 40) } },
              select: { id: true },
            });
            if (existing) continue;

            const existingTranslated = await prisma.article.findFirst({
              where: { title: { contains: translateToUrdu(englishTitle).slice(0, 40) } },
              select: { id: true },
            });
            if (existingTranslated) continue;

            const latestArticles = await prisma.article.findMany({
              where: { categoryId: category.id, status: 'PUBLISHED' },
              orderBy: { publishedAt: 'desc' },
              take: 20,
              select: { title: true },
            });
            let isDuplicate = false;
            for (const a of latestArticles) {
              if (titleSimilarity(englishTitle, a.title) > 0.5) {
                isDuplicate = true;
                break;
              }
            }
            if (isDuplicate) continue;

            const urduTitle = applyUrduJournalism(await translateToUrduAsync(englishTitle), true);

            const existingUrdu = await prisma.article.findFirst({
              where: { title: { contains: urduTitle.slice(0, 40) } },
              select: { id: true },
            });
            if (existingUrdu) continue;

            const description = item.contentSnippet || item.content || item.summary || '';
            const urduDescription = description ? applyUrduJournalism(await translateToUrduAsync(description.slice(0, 300))) : '';
            const excerpt = urduDescription.slice(0, 200) || urduTitle;

            const content = item['content:encoded'] || item.content || description || englishTitle;
            const rawContent = content.replace(/<[^>]*>/g, '').slice(0, 1500);
            const translatedContent = rawContent.trim() ? applyUrduJournalism(await translateToUrduAsync(rawContent)) : urduTitle;
            const formattedParagraphs = translatedContent
              .split(/[۔\.\?\!]\s*/)
              .filter(Boolean)
              .reduce((acc: string[], _, i, arr) => {
                if (i % 3 === 0) {
                  const group = arr.slice(i, i + 3).join('۔ ');
                  if (group.trim()) acc.push(group + '۔');
                }
                return acc;
              }, []);
            const urduContent = formattedParagraphs.length > 1
              ? formattedParagraphs.map(p => `<p>${p}</p>`).join('\n')
              : translatedContent
                ? `<p>${translatedContent}</p>`
                : `<p>${urduTitle}</p>`;

            const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' }, select: { id: true } });
            if (!admin?.id) continue;

            const article = await prisma.article.create({
              data: {
                title: urduTitle,
                originalTitle: englishTitle,
                slug: `${slugify(urduTitle || englishTitle)}-${Date.now().toString(36)}`,
                excerpt,
                content: urduContent,
                categoryId: category.id,
                authorId: admin.id,
                status: 'PUBLISHED',
                publishedAt: item.pubDate ? new Date(item.pubDate) : new Date(),
                isBreaking: false,
                isFeatured: false,
              },
            });

            try {
              const img = await autoFetchImageForArticle(urduTitle, englishTitle, category.nameUrdu);
              if (img) {
                await prisma.article.update({
                  where: { id: article.id },
                  data: { featuredImage: img },
                });
              }
            } catch {}

            await incrementPublishedCount();
            created++;
          } catch {
            errors++;
          }
        }

        return { feed: feed.name, fetched: parsed.items.length, created, errors };
      } catch {
        return { feed: feed.name, fetched: 0, created: 0, errors: 1 };
      }
    })
  );

  return {
    success: true,
    feeds: results.map((r) => (r.status === 'fulfilled' ? r.value : { feed: 'error', fetched: 0, created: 0, errors: 1 })),
    totalCreated: results.reduce((sum, r) => sum + (r.status === 'fulfilled' ? r.value.created : 0), 0),
    totalErrors: results.reduce((sum, r) => sum + (r.status === 'fulfilled' ? r.value.errors : 1), 0),
  };
}
