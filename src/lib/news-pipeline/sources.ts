export interface UrduFeedSource {
  url: string;
  name: string;
  language: 'ur' | 'en';
  category: string;
  imageSelector?: string; // CSS selector or regex for image extraction
}

/**
 * Native Urdu RSS feeds — the pipeline will scrape these directly
 * to avoid English→Urdu machine translation.
 */
export const URDU_FEED_SOURCES: UrduFeedSource[] = [
  // ── BBC Urdu ──────────────────────────────────────────────
  {
    url: 'https://www.bbc.com/urdu/topics/c7zp5y8v4y7t.xml',
    name: 'BBC Urdu',
    language: 'ur',
    category: 'Pakistan',
  },
  {
    url: 'https://www.bbc.com/urdu/topics/c405qpnzp4jt.xml',
    name: 'BBC Urdu',
    language: 'ur',
    category: 'World',
  },
  {
    url: 'https://www.bbc.com/urdu/topics/cyx5krnw38vt.xml',
    name: 'BBC Urdu',
    language: 'ur',
    category: 'Sports',
  },
  {
    url: 'https://www.bbc.com/urdu/topics/cvbn4z7edvjt.xml',
    name: 'BBC Urdu',
    language: 'ur',
    category: 'Business',
  },
  {
    url: 'https://www.bbc.com/urdu/topics/c340q0q5zq5t.xml',
    name: 'BBC Urdu',
    language: 'ur',
    category: 'Technology',
  },
  {
    url: 'https://www.bbc.com/urdu/topics/ckl1wvgz3w7t.xml',
    name: 'BBC Urdu',
    language: 'ur',
    category: 'Entertainment',
  },
  {
    url: 'https://www.bbc.com/urdu/topics/c87v0e94q7wt.xml',
    name: 'BBC Urdu',
    language: 'ur',
    category: 'Health',
  },

  // ── Geo News Urdu ─────────────────────────────────────────
  {
    url: 'https://urdu.geo.tv/rss/feed.xml',
    name: 'Geo News Urdu',
    language: 'ur',
    category: 'Pakistan',
  },

  // ── Voice of America (Urdu) ───────────────────────────────
  {
    url: 'https://www.urduvoa.com/rss/',
    name: 'VOA Urdu',
    language: 'ur',
    category: 'World',
  },

  // ── Independent Urdu ──────────────────────────────────────
  {
    url: 'https://www.independenturdu.com/rss.xml',
    name: 'Independent Urdu',
    language: 'ur',
    category: 'World',
  },
];

/**
 * For images, the RSS parser extracts:
 *   - <media:content url="...">
 *   - <media:thumbnail url="...">
 *   - <enclosure url="...">
 *   - First <img> in <content:encoded>
 *
 * These are the actual CDN-hosted images from BBC/Geo/VOA.
 */
export const FALLBACK_IMAGE =
  'https://azadkhabar.vercel.app/fallback-logo.png';

/** Known CDN domains whose images are safe to hotlink */
export const TRUSTED_IMAGE_DOMAINS = [
  'bbc.com',
  'bbci.co.uk',
  'geo.tv',
  'urdu.geo.tv',
  'voanews.com',
  'urduvoa.com',
  'independenturdu.com',
  'aljazeera.com',
];
