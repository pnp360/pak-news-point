import Parser from 'rss-parser';
import { URDU_FEED_SOURCES, TRUSTED_IMAGE_DOMAINS, UrduFeedSource, classifyArticleCategory } from './sources';

const parser = new Parser({
  timeout: 15000,
  headers: {
    'User-Agent': 'AzadKhabar/2.0 (Urdu News Aggregator)',
    'Accept': 'application/rss+xml, application/xml, text/xml',
  },
  customFields: {
    item: [
      ['media:content', 'mediaContent', { keepArray: false }],
      ['media:thumbnail', 'mediaThumbnail', { keepArray: false }],
      ['enclosure', 'enclosure'],
      ['content:encoded', 'contentEncoded'],
      ['dc:creator', 'creator'],
    ],
  },
});

export interface ScrapedArticle {
  sourceName: string;
  sourceUrl: string;
  originalTitle: string;
  originalBody: string;
  excerpt: string;
  imageUrl: string;
  category: string;
  publishedAt: Date;
}

function isTrustedDomain(url: string): boolean {
  try {
    const host = new URL(url).hostname.replace('www.', '');
    return TRUSTED_IMAGE_DOMAINS.some((d) => host === d || host.endsWith('.' + d));
  } catch {
    return false;
  }
}

function extractImage(item: any): string {
  // 1) <media:content>
  const mc = item.mediaContent;
  if (mc) {
    const arr = Array.isArray(mc) ? mc : [mc];
    for (const m of arr) {
      const url = m?.$?.url || m?.url;
      if (url && isTrustedDomain(url)) return url;
    }
  }

  // 2) <media:thumbnail>
  const thumb = item.mediaThumbnail;
  if (thumb) {
    const arr = Array.isArray(thumb) ? thumb : [thumb];
    for (const t of arr) {
      const url = t?.$?.url || t?.url;
      if (url && isTrustedDomain(url)) return url;
    }
  }

  // 3) <enclosure>
  if (item.enclosure?.url && isTrustedDomain(item.enclosure.url)) {
    return item.enclosure.url;
  }

  // 4) First <img> inside content:encoded or description
  const contentFields = [
    item.contentEncoded,
    item.content,
    item['content:encoded'],
    item.description,
    item.summary,
  ].filter(Boolean);

  for (const content of contentFields) {
    const match = content.match(/<img[^>]+src=["']([^"']+)["']/i);
    if (match) {
      const url = match[1];
      if (isTrustedDomain(url)) return url;
    }
  }

  return '';
}

function extractBody(item: any): string {
  const fields = [
    item.contentEncoded,
    item.content,
    item['content:encoded'],
    item.description,
    item.summary,
    item.contentSnippet,
  ].filter(Boolean);

  for (const field of fields) {
    const cleaned = field.replace(/<[^>]*>/g, '').trim();
    if (cleaned.length > 50) return cleaned.slice(0, 2000);
  }

  return item.title || '';
}

/** Map a per-item RSS category string to our known slugs */
const ITEM_CATEGORY_MAP: Record<string, string> = {
  pakistan: 'Pakistan',
  'پاکستان': 'Pakistan',
  world: 'World',
  'دنیا': 'World',
  sports: 'Sports',
  'کھیل': 'Sports',
  business: 'Business',
  'کاروبار': 'Business',
  entertainment: 'Entertainment',
  'شوبز': 'Entertainment',
  technology: 'Technology',
  'ٹیکنالوجی': 'Technology',
  'سائنس و ٹیکنالوجی': 'Technology',
  health: 'Health',
  'صحت': 'Health',
  education: 'Education',
  'تعلیم': 'Education',
};

export async function scrapeSource(source: UrduFeedSource): Promise<ScrapedArticle[]> {
  try {
    const feed = await parser.parseURL(source.url);
    if (!feed.items?.length) {
      console.warn(`[scraper] ${source.name}: 0 items parsed`);
      return [];
    }

    const articles: ScrapedArticle[] = [];

    for (const item of feed.items) {
      const title = (item.title || '').trim();
      if (!title) continue;

      // Prefer per-item RSS <category> tags over source-level category
      let category = source.category;
      if (item.categories && item.categories.length > 0) {
        for (const cat of item.categories) {
          const mapped = ITEM_CATEGORY_MAP[cat.toLowerCase()];
          if (mapped) {
            category = mapped;
            break;
          }
        }
      }

      // Content-based keyword classifier overrides mixed-source feeds (e.g., Geo News)
      const classified = classifyArticleCategory(title);
      if (classified && classified !== category) {
        category = classified;
      }

      const imageUrl = extractImage(item);
      const body = extractBody(item);
      const link = item.link || item.guid || '';

      // Validate date: reject dates in the future or older than 7 days
      let publishedAt: Date;
      if (item.pubDate) {
        const parsed = new Date(item.pubDate);
        const now = Date.now();
        if (!isNaN(parsed.getTime()) && parsed.getTime() <= now && parsed.getTime() > now - 7 * 24 * 60 * 60 * 1000) {
          publishedAt = parsed;
        } else {
          publishedAt = new Date();
        }
      } else {
        publishedAt = new Date();
      }

      articles.push({
        sourceName: source.name,
        sourceUrl: link,
        originalTitle: title,
        originalBody: body,
        excerpt: body.slice(0, 200),
        imageUrl,
        category,
        publishedAt,
      });
    }

    console.log(`[scraper] ${source.name}: ${articles.length} articles (category: ${source.category})`);
    return articles;
  } catch (err) {
    console.error(`[scraper] ${source.name} FAILED:`, err instanceof Error ? err.message : err);
    return [];
  }
}

export async function scrapeAllSources(): Promise<ScrapedArticle[]> {
  const results = await Promise.allSettled(
    URDU_FEED_SOURCES.map((s) => scrapeSource(s))
  );

  const all: ScrapedArticle[] = [];
  let failed = 0;
  for (const r of results) {
    if (r.status === 'fulfilled') all.push(...r.value);
    else failed++;
  }

  // Deduplicate by title + sourceUrl combination
  const seen = new Set<string>();
  const deduped = all.filter((a) => {
    const titleKey = a.originalTitle.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 60);
    const key = `${titleKey}::${a.sourceUrl}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  console.log(`[scraper] Total: ${all.length} raw, ${deduped.length} unique, ${failed} failed sources`);
  return deduped;
}
