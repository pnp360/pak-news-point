import Parser from 'rss-parser';
import { translateToEnglish, extractEnglishKeywords } from './translate';

export const parser = new Parser({
  timeout: 15000,
  headers: {
    'User-Agent': 'Azad Khabar/1.0 (RSS Image Aggregator)',
    'Accept': 'application/rss+xml, application/xml, text/xml',
  },
  customFields: {
    item: [
      ['media:content', 'mediaContent', { keepArray: false }],
      ['media:thumbnail', 'mediaThumbnail', { keepArray: false }],
      ['enclosure', 'enclosure'],
      ['content:encoded', 'contentEncoded'],
    ],
  },
});

export const FEED_CONFIG: { url: string; name: string; category: string }[] = [
  // BBC - all categories
  { url: 'https://feeds.bbci.co.uk/news/world/rss.xml', name: 'BBC', category: 'World' },
  { url: 'https://feeds.bbci.co.uk/news/politics/rss.xml', name: 'BBC', category: 'Politics' },
  { url: 'https://feeds.bbci.co.uk/news/business/rss.xml', name: 'BBC', category: 'Business' },
  { url: 'https://feeds.bbci.co.uk/news/technology/rss.xml', name: 'BBC', category: 'Technology' },
  { url: 'https://feeds.bbci.co.uk/sport/rss.xml', name: 'BBC', category: 'Sports' },
  { url: 'https://feeds.bbci.co.uk/news/entertainment_and_arts/rss.xml', name: 'BBC', category: 'Entertainment' },
  { url: 'https://feeds.bbci.co.uk/news/health/rss.xml', name: 'BBC', category: 'Health' },
  { url: 'https://feeds.bbci.co.uk/news/education/rss.xml', name: 'BBC', category: 'Education' },

  // Dawn - Pakistan's own English newspaper (covers local news BBC doesn't)
  { url: 'https://www.dawn.com/feeds/pakistan', name: 'Dawn', category: 'Pakistan' },
  { url: 'https://www.dawn.com/feeds/sport', name: 'Dawn', category: 'Sports' },
  { url: 'https://www.dawn.com/feeds/business', name: 'Dawn', category: 'Business' },
  { url: 'https://www.dawn.com/feeds/world', name: 'Dawn', category: 'World' },
  { url: 'https://www.dawn.com/feeds/technology', name: 'Dawn', category: 'Technology' },

  // Guardian (including Pakistan-specific section)
  { url: 'https://www.theguardian.com/world/pakistan/rss', name: 'Guardian', category: 'Pakistan' },

  // Guardian
  { url: 'https://www.theguardian.com/world/rss', name: 'Guardian', category: 'World' },
  { url: 'https://www.theguardian.com/uk/sport/rss', name: 'Guardian', category: 'Sports' },
  { url: 'https://www.theguardian.com/uk/technology/rss', name: 'Guardian', category: 'Technology' },
  { url: 'https://www.theguardian.com/uk/business/rss', name: 'Guardian', category: 'Business' },
  { url: 'https://www.theguardian.com/culture/rss', name: 'Guardian', category: 'Entertainment' },
  { url: 'https://www.theguardian.com/education/rss', name: 'Guardian', category: 'Education' },

  // Pakistani English news sources
  { url: 'https://arynews.tv/en/feed/', name: 'ARY News', category: 'Pakistan' },
  { url: 'https://www.bolnews.com/feed/', name: 'Bol News', category: 'Pakistan' },

  // Other world news
  { url: 'http://rss.cnn.com/rss/edition.rss', name: 'CNN', category: 'World' },
  { url: 'https://feeds.skynews.com/feeds/rss/home.xml', name: 'SkyNews', category: 'World' },
  { url: 'https://www.independent.co.uk/news/world/rss', name: 'Independent', category: 'World' },
];

const URDU_CATEGORY_MAP: Record<string, string> = {
  'پاکستان': 'Pakistan',
  'دنیا': 'World',
  'کھیل': 'Sports',
  'کاروبار': 'Business',
  'شوبز': 'Entertainment',
  'سائنس و ٹیکنالوجی': 'Technology',
  'صحت': 'Health',
  'تعلیم': 'Education',
};

interface RssFeedItem {
  title: string;
  imageUrl: string;
  feedName: string;
  category: string;
}

function upscaleImageUrl(url: string): string {
  return url
    .replace('/standard/240/', '/standard/1024/')
    .replace('/240x135/', '/976x549/')
    .replace('/320x180/', '/976x549/')
    .replace('/480x270/', '/976x549/');
}

function extractImageUrl(item: any): string | null {
  const mc = item.mediaContent;
  if (mc) {
    const arr = Array.isArray(mc) ? mc : [mc];
    for (const m of arr) {
      const url = m?.$?.url || m?.url;
      if (url) return upscaleImageUrl(url);
    }
  }

  const thumb = item.mediaThumbnail;
  if (thumb) {
    const arr = Array.isArray(thumb) ? thumb : [thumb];
    for (const t of arr) {
      let url = t?.$?.url || t?.url;
      if (url) return upscaleImageUrl(url);
    }
  }

  if (item.enclosure?.url) return upscaleImageUrl(item.enclosure.url);

  const contentFields = [item.contentEncoded, item.content, item['content:encoded'], item.description].filter(Boolean);
  for (const content of contentFields) {
    const imgMatch = content.match(/<img[^>]+src=["']([^"']+)["']/i);
    if (imgMatch) return upscaleImageUrl(imgMatch[1]);
  }

  return null;
}

function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

const RSS_TWO_LETTER_KEEP = new Set(['ai', 'us', 'uk', 'eu', 'tv', 'pc', '5g', '4g', 'ps', 'psl', 'imf', 'cpec', 'odi', 't20']);

function getKeywords(text: string): Set<string> {
  const stopWords = new Set([
    'the', 'a', 'an', 'in', 'of', 'to', 'and', 'is', 'are', 'was', 'for',
    'on', 'by', 'with', 'at', 'from', 'as', 'be', 'has', 'had', 'its',
    'it', 'this', 'that', 'but', 'not', 'or', 'new', 'after', 'over',
  ]);
  return new Set(
    normalizeTitle(text)
      .split(/\s+/)
      .filter(w => (w.length > 2 || RSS_TWO_LETTER_KEEP.has(w)) && !stopWords.has(w))
  );
}

function computeRelevance(titleA: string, titleB: string): number {
  const kwA = getKeywords(titleA);
  const kwB = getKeywords(titleB);
  if (kwA.size === 0 || kwB.size === 0) return 0;

  let intersection = 0;
  kwA.forEach((kw) => {
    if (kwB.has(kw)) intersection++;
  });

  const unionArr: string[] = [];
  kwA.forEach((k) => unionArr.push(k));
  kwB.forEach((k) => { if (!kwA.has(k)) unionArr.push(k); });
  const unionSize = unionArr.length;
  const jaccard = unionSize > 0 ? intersection / unionSize : 0;

  const keywordMatch = intersection >= 2 ? 0.1 : 0;

  const aLow = titleA.toLowerCase();
  const bLow = titleB.toLowerCase();
  const longerContains = aLow.includes(bLow) || bLow.includes(aLow);
  const containmentBonus = longerContains ? 0.25 : 0;

  let phraseBonus = 0;
  if (intersection >= 3) {
    const wordsA = aLow.split(/\s+/);
    const wordsB = bLow.split(/\s+/);
    let matchCount = 0;
    const kwSetA = new Set(kwA);
    for (let i = 0; i < wordsA.length; i++) {
      if (kwSetA.has(wordsA[i])) {
        for (let j = 0; j < wordsB.length; j++) {
          if (wordsA[i] === wordsB[j]) {
            let k = 0;
            while (
              i + k < wordsA.length &&
              j + k < wordsB.length &&
              wordsA[i + k] === wordsB[j + k]
            ) {
              k++;
            }
            if (k >= 2) {
              matchCount = Math.max(matchCount, k);
            }
          }
        }
      }
    }
    phraseBonus = matchCount >= 3 ? 0.15 : matchCount >= 2 ? 0.08 : 0;
  }

  return Math.min(jaccard + keywordMatch + containmentBonus + phraseBonus, 1);
}

function getTextContent(item: any): string {
  const fields = [item.title, item.contentSnippet, item.content, item.summary, item.description].filter(Boolean);
  return fields.join(' ');
}

let cachedFeedItems: RssFeedItem[] | null = null;
let lastFetchTime = 0;
const CACHE_TTL = 60 * 1000;

async function fetchAllFeeds(): Promise<RssFeedItem[]> {
  if (cachedFeedItems && Date.now() - lastFetchTime < CACHE_TTL && cachedFeedItems.length > 0) {
    return cachedFeedItems;
  }

  const allItems: RssFeedItem[] = [];
  const results = await Promise.allSettled(
    FEED_CONFIG.map(async (feed) => {
      try {
        const parsed = await parser.parseURL(feed.url);
        if (!parsed.items?.length) return [];
        return parsed.items
          .map((item) => ({
            title: item.title || '',
            imageUrl: extractImageUrl(item) || '',
            feedName: feed.name,
            category: feed.category,
          }))
          .filter((item) => item.title && item.imageUrl);
      } catch {
        return [];
      }
    })
  );

  for (const result of results) {
    if (result.status === 'fulfilled') {
      allItems.push(...result.value);
    }
  }

  cachedFeedItems = allItems;
  lastFetchTime = Date.now();
  return allItems;
}

function getEnglishCategory(urduCategory: string): string {
  return URDU_CATEGORY_MAP[urduCategory] || '';
}

const CATEGORY_FEED_MAP: Record<string, string[]> = {
  'Pakistan': ['Dawn Pakistan', 'Guardian Pakistan', 'BBC World', 'Dawn World'],
  'World': ['BBC World', 'Dawn World', 'Guardian World', 'CNN', 'SkyNews', 'Independent'],
  'Sports': ['BBC Sports', 'Guardian Sports', 'Dawn Sports'],
  'Business': ['BBC Business', 'Dawn Business', 'Guardian Business'],
  'Entertainment': ['BBC Entertainment', 'Guardian Entertainment', 'Dawn'],
  'Technology': ['BBC Technology', 'Guardian Technology', 'Dawn Technology'],
  'Health': ['BBC Health'],
  'Education': ['BBC Education', 'Guardian Education'],
};

export async function findRssImage(
  articleTitle: string,
  categoryNameUrdu?: string,
  skipUrls?: Set<string>
): Promise<{ url: string; source: string } | null> {
  try {
    const feedItems = await fetchAllFeeds();
    if (feedItems.length === 0) return null;

    const englishTitle = translateToEnglish(articleTitle);
    const keywords = extractEnglishKeywords(articleTitle);
    const keyPhrase = keywords.slice(0, 4).join(' ');

    const searchTexts = [englishTitle, keyPhrase].filter(Boolean);
    const englishCat = categoryNameUrdu ? getEnglishCategory(categoryNameUrdu) : '';
    const preferredFeeds = englishCat ? CATEGORY_FEED_MAP[englishCat] || [] : [];

    const scored = feedItems
      .map((item) => {
        let maxRel = 0;
        for (const search of searchTexts) {
          const relTitle = computeRelevance(search, item.title);
          const relDesc = computeRelevance(search, getTextContent(item));
          const rel = Math.max(relTitle, relDesc);
          if (rel > maxRel) maxRel = rel;
        }
        const feedLabel = `${item.feedName} ${item.category}`;
        const categoryBonus = preferredFeeds.some(f => feedLabel.includes(f)) ? 0.15 : 0;
        return { item, relevance: maxRel + categoryBonus };
      })
      .filter((s) => s.relevance > 0.35)
      .sort((a, b) => b.relevance - a.relevance);

    for (const match of scored) {
      if (!skipUrls?.has(match.item.imageUrl)) {
        return { url: match.item.imageUrl, source: match.item.feedName };
      }
    }

    return null;
  } catch {
    return null;
  }
}
