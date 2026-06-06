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

/**
 * Keyword-based category classifier for mixed-content feeds (e.g., Geo News Urdu).
 * Checks article titles and overrides the source-level category when international
 * keywords are detected.
 */
const CLASSIFIER_RULES: { category: string; keywords: RegExp[] }[] = [
  {
    category: 'World',
    keywords: [
      /trump|biden|putin|zelensky|netanyahu|modi|ukraine|russia|iran|israel|gaza|hamas|hezbollah|china|india/i,
      /nasa|space|mars|moon\s*(mission|landing)|satellite|telescope/i,
      /prince\s+(william|harry|charles|george)|royal\s+(family|wedding|baby)|king\s+charles|queen/i,
      /european\s+union|brexit|paris|london|washington|moscow|beijing|kabul/i,
      /united\s+nations|nato|imf|world\s+bank|white\s+house|pentagon/i,
      /earthquake|flood|tsunami|hurricane|climate|pandemic|epidemic/i,
    ],
  },
  {
    category: 'Entertainment',
    keywords: [
      /hollywood|bollywood|oscar|grammy|emmy|netflix|disney/i,
      /actor|actress|singer|movie|film|album|concert|celebrity/i,
      /barry\s+keoghan|sabrina\s+carpenter|taylor\s+swift|beyonce/i,
    ],
  },
  {
    category: 'Sports',
    keywords: [
      /cricket|world\s+cup|psl|ipl|tennis|football|soccer|olympics/i,
      /babar\s+azam|shaheen|federer|nadal|djokovic|messi|ronaldo/i,
    ],
  },
  {
    category: 'Technology',
    keywords: [
      /artificial\s+intelligence|ai|chatgpt|gpt|openai|google|apple|microsoft|meta|tesla|twitter|x\.(com|social)/i,
      /smartphone|iphone|android|cyber|hacking|data\s+breach|5g|blockchain|bitcoin/i,
    ],
  },
  {
    category: 'Business',
    keywords: [
      /stock\s+market|wall\s+street|dollar|rupee|inflation|interest\s+rate|gdp|economy/i,
      /petrol|diesel|gold\s+(price|rate)|crude\s+oil|psx|kse|100\s+index/i,
    ],
  },
  {
    category: 'Health',
    keywords: [
      /covid|corona|vaccine|hospital|doctor|disease|health|medical|surgery|treatment/i,
      /dengue|polio|malaria|diabetes|cancer|heart|kidney|liver|transplant/i,
    ],
  },
  {
    category: 'Education',
    keywords: [
      /university|college|school|education|exam|result|student|scholarship/i,
      /board\s+(exam|result)|matric|intermediate|b\.a|b\.sc|m\.a|m\.sc|phd/i,
    ],
  },
];

/**
 * Run the keyword classifier on an article title.
 * Returns the detected category or null if no rule matches.
 */
export function classifyArticleCategory(title: string): string | null {
  for (const rule of CLASSIFIER_RULES) {
    for (const pattern of rule.keywords) {
      if (pattern.test(title)) {
        return rule.category;
      }
    }
  }
  return null;
}
