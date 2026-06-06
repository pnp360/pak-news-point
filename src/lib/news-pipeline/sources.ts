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
    category: 'Pakistan',
    keywords: [
      // Urdu keywords that anchor a story to Pakistan
      /پاکستان|اسلام\s?آباد|کراچی|لاہور|پشاور|کوئٹہ|ملتان|فیصل\s?آباد/i,
      /وزیر\s?اعظم|صدر\s?پاکستان|آرمی\s?چیف|چیف\s?جسٹس/i,
      /قومی\s?اسمبلی|سینیٹ|پنجاب|سندھ|خیبر|بلوچستان/i,
      /روپے|پی\s?ایس\s?ایل|سی\s?پیک/i,
    ],
  },
  {
    category: 'World',
    keywords: [
      // English keywords
      /trump|biden|putin|zelensky|netanyahu|modi|ukraine|russia|iran|israel|gaza|hamas|hezbollah|china|india/i,
      /nasa|space|mars|moon\s*(mission|landing)|satellite|telescope/i,
      /prince\s+(william|harry|charles|george)|royal\s+(family|wedding|baby)|king\s+charles|queen/i,
      /european\s+union|brexit|paris|london|washington|moscow|beijing|kabul/i,
      /united\s+nations|nato|imf|world\s+bank|white\s+house|pentagon/i,
      /earthquake|flood|tsunami|hurricane|climate|pandemic|epidemic/i,
      // Urdu keywords
      /ٹرمپ|بائیڈن|پیوٹن|زیلنسکی|نیتن\s?یاہو|مودی/i,
      /یوکرین|روس|ایران|غزہ|حماس|حزب\s?اللہ|چین|بھارت/i,
      /ناسا|خلاء|مریخ|سیٹلائٹ|دوربین/i,
      /برطانیہ|فرانس|جرمنی|یورپ|واشنگٹن|لندن|ماسکو/i,
      /اقوام\s?متحدہ|نیٹو|آئی\s?ایم\s?ایف/i,
      /زلزلہ|سیلاب|سمندری\s?طوفان|وبا/i,
      /شہزادہ\s+(ولیم|ہیری|چارلس)|ملکہ|کنگ\s+چارلس/i,
    ],
  },
  {
    category: 'Entertainment',
    keywords: [
      // English
      /hollywood|bollywood|oscar|grammy|emmy|netflix|disney|hbo/i,
      /actor|actress|singer|movie|film|album|concert|celebrity/i,
      /barry\s+keoghan|sabrina\s+carpenter|taylor\s+swift|beyonce/i,
      /jennifer\s+aniston|prince\s+william|kate\s+middleton/i,
      // Urdu
      /بالی\s?وڈ|ہالی\s?وڈ|شوبز|اداکار|اداکارہ|گلوکار|فلم|ڈرامہ/i,
      /نیٹ\s?فلکس|ڈزنی|اسکار|گریمی|ایمی/i,
      /صابرینا\s?کارپینٹر|ٹیلر\s?سوئفٹ|بیونسے/i,
    ],
  },
  {
    category: 'Sports',
    keywords: [
      // English
      /cricket|world\s+cup|psl|ipl|tennis|football|soccer|olympics/i,
      /babar\s+azam|shaheen|federer|nadal|djokovic|messi|ronaldo/i,
      // Urdu
      /کرکٹ|ورلڈ\s?کپ|ٹینس|فٹ\s?بال|اولمپک/i,
      /بابر\s?اعظم|شاہین|فیڈرر|نڈال|جاکووچ|میسی|رونالڈو/i,
      /کھیل|میچ|ٹیم|کپتان|وکٹ|رن|گیند/i,
    ],
  },
  {
    category: 'Technology',
    keywords: [
      // English
      /artificial\s+intelligence|ai|chatgpt|gpt|openai|google|apple|microsoft|meta|tesla|twitter|x\.(com|social)/i,
      /smartphone|iphone|android|cyber|hacking|data\s+breach|5g|blockchain|bitcoin/i,
      // Urdu
      /مصنوعی\s?ذہانت|گوگل|ایپل|مائیکروسافٹ|میٹا|ٹیسلا/i,
      /سمارٹ\s?فون|آئی\s?فون|اینڈرائڈ|سائبر|ہیکنگ/i,
      /ٹیکنالوجی|انٹرنیٹ|سافٹ\s?ویئر|ایپ|ڈیٹا/i,
    ],
  },
  {
    category: 'Business',
    keywords: [
      // English
      /stock\s+market|wall\s+street|dollar|rupee|inflation|interest\s+rate|gdp|economy/i,
      /petrol|diesel|gold\s+(price|rate)|crude\s+oil|psx|kse|100\s+index/i,
      // Urdu
      /اسٹاک\s?مارکیٹ|وال\s?اسٹریٹ|ڈالر|روپے|مہنگائی/i,
      /پیٹرول|ڈیزل|سونے\s?(کی\s?)?(قیمت|نرخ)|خام\s?تیل/i,
      /کاروبار|معیشت|بجٹ|منافع|ٹیکس|قرض/i,
    ],
  },
  {
    category: 'Health',
    keywords: [
      // English
      /covid|corona|vaccine|hospital|doctor|disease|health|medical|surgery|treatment/i,
      /dengue|polio|malaria|diabetes|cancer|heart|kidney|liver|transplant/i,
      // Urdu
      /کووڈ|کورونا|ویکسین|ہسپتال|ڈاکٹر|بیماری|صحت/i,
      /ڈینگی|پولیو|ملیریا|ذیابیطس|کینسر|دل|گردہ|جگر/i,
      /علاج|سرجری|ٹرانسپلانٹ|مریض|دوا/i,
    ],
  },
  {
    category: 'Education',
    keywords: [
      // English
      /university|college|school|education|exam|result|student|scholarship/i,
      /board\s+(exam|result)|matric|intermediate|b\.a|b\.sc|m\.a|m\.sc|phd/i,
      // Urdu
      /یونیورسٹی|کالج|سکول|تعلیم|امتحان|نتیجہ|طالب\s?علم/i,
      /طلبہ|اساتذہ|اسکالرشپ|ڈگری|داخلہ/i,
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
