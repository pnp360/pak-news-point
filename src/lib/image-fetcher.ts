import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { findRssImage } from './rss-fetcher';
import { translateToEnglish, extractEnglishKeywords } from './translate';

interface FetchedImage {
  url: string;
  alt: string;
  photographer: string;
  source: string;
}

const HF_IMAGE_MODEL = 'black-forest-labs/FLUX.1-dev';

const CATEGORY_SCENE_MAP: Record<string, string> = {
  'Pakistan': 'Pakistani government building, officials, national flag, press conference',
  'World': 'international diplomacy, global summit, world map background',
  'Sports': 'sports stadium, athletes in action, cheering crowd, sporting event',
  'Business': 'corporate office, stock exchange screen, business meeting, financial charts',
  'Entertainment': 'red carpet, movie premiere, celebrity, stage performance',
  'Technology': 'modern tech lab, smartphone, computer, innovative technology, digital display',
  'Health': 'modern hospital, doctor, medical equipment, healthcare',
  'Education': 'university campus, classroom, students studying, books',
  'Politics': 'parliament building, political rally, podium, government officials',
};

const CATEGORY_URDU_MAP: Record<string, string> = {
  'پاکستان': 'Pakistan',
  'دنیا': 'World',
  'کھیل': 'Sports',
  'کاروبار': 'Business',
  'شوبز': 'Entertainment',
  'سائنس و ٹیکنالوجی': 'Technology',
  'صحت': 'Health',
  'تعلیم': 'Education',
};

function buildNewsPrompt(title: string, categoryName?: string): string {
  const englishTitle = translateToEnglish(title);

  const categoryKey = categoryName
    ? (CATEGORY_URDU_MAP[categoryName] || categoryName)
    : '';
  const sceneHint = categoryKey
    ? CATEGORY_SCENE_MAP[categoryKey] || ''
    : '';

  return [
    `Professional photojournalism photograph of ${englishTitle}.`,
    sceneHint && `${sceneHint}.`,
    'High quality press photography, 4K resolution, sharp focus, natural lighting,',
    '16:9 landscape aspect ratio, realistic colors, news media style, highly detailed.',
  ]
    .filter(Boolean)
    .join(' ');
}

function buildSearchQueries(title: string, categoryName?: string, englishTitle?: string): string[] {
  const textForKeywords = englishTitle || translateToEnglish(title);

  const categoryKey = categoryName
    ? (CATEGORY_URDU_MAP[categoryName] || categoryName)
    : '';
  const sceneHint = categoryKey ? CATEGORY_SCENE_MAP[categoryKey] || '' : '';

  const GENERIC = new Set([
    'announcement','announced','announces','expected','soon',
    'new','latest','update','today','year','month','week','day',
    'first','last','next','previous','current','ongoing','future',
    'major','significant','important','key','top','main',
    'meeting','session','event','program','project','plan','scheme',
    'campaign','increase','decrease','decline','growth','rise','fall',
    'drop','improvement','reduction','development','progress',
    'start','begin','continue','launch','introduce','release',
    'hold','held','take','make','made','set','see','show',
    'include','provide','report','review','study','area','focus',
    'work','also','preparation','preparations','preventive','prevention',
    'arrival','departure','purpose','effort','bid','step','move',
    'call','planning','aim','target','goal','feature','special',
    'total','overall','general','various','several','number',
  ]);

  const keywords = extractEnglishKeywords(textForKeywords)
    .filter((k) => !GENERIC.has(k))
    .slice(0, 3);

  const queries: string[] = [];

  if (keywords.length >= 2) {
    const kw = [...keywords, categoryKey].filter(Boolean);
    queries.push(kw.join(' '));
  }
  if (keywords.length >= 1) {
    const kw = [...keywords, categoryKey].filter(Boolean);
    queries.push(kw.join(' '));
  }

  if (categoryKey) {
    if (sceneHint) queries.push(`${categoryKey} ${sceneHint.split(',')[0]}`);
    queries.push(categoryKey);
  }

  return Array.from(new Set(queries));
}

export async function fetchRelevantImage(
  title: string,
  categoryName?: string,
  skipUrls?: Set<string>,
  englishTitle?: string
): Promise<FetchedImage | null> {
  const hfToken = process.env.HF_API_TOKEN;

  if (hfToken) {
    try {
      const img = await fetchFromHuggingFace(title, categoryName, hfToken);
      if (img) return img;
    } catch {
      // HF unavailable - fall through
    }
  }

  const queries = buildSearchQueries(title, categoryName, englishTitle);
  const pexelsKey = process.env.PEXELS_API_KEY;
  const unsplashKey = process.env.UNSPLASH_ACCESS_KEY;

  for (const query of queries) {
    if (pexelsKey) {
      const img = await fetchFromPexels(query, pexelsKey, skipUrls);
      if (img) return img;
    }

    if (unsplashKey) {
      const img = await fetchFromUnsplash(query, unsplashKey);
      if (img) return img;
    }
  }

  try {
    const rssImg = await findRssImage(title, categoryName, skipUrls, englishTitle);
    if (rssImg?.url) {
      skipUrls?.add(rssImg.url);
      return {
        url: rssImg.url,
        alt: title,
        photographer: rssImg.source,
        source: 'rss',
      };
    }
  } catch {
    // RSS unavailable - fall through
  }

  return null;
}

async function fetchFromHuggingFace(
  title: string,
  categoryName: string | undefined,
  token: string
): Promise<FetchedImage | null> {
  try {
    const prompt = buildNewsPrompt(title, categoryName);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60000);

    const res = await fetch(
      `https://api-inference.huggingface.co/models/${HF_IMAGE_MODEL}`,
      {
        signal: controller.signal,
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            num_inference_steps: 28,
            guidance_scale: 8.0,
            width: 1024,
            height: 576,
          },
        }),
      }
    );

    clearTimeout(timeout);

    if (!res.ok) {
      const errText = await res.text();
      console.error('HF image API error:', res.status, errText);
      return null;
    }

    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const seed = title.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 50);
    const filename = `news-${Date.now()}-${seed}.webp`;
    const uploadDir = path.join(process.cwd(), 'public/uploads');
    await mkdir(uploadDir, { recursive: true });
    const filepath = path.join(uploadDir, filename);
    await writeFile(filepath, buffer);

    return {
      url: `/uploads/${filename}`,
      alt: title,
      photographer: 'AI Generated',
      source: 'huggingface',
    };
    } catch {
      return null;
    }
}

async function fetchFromPexels(
  query: string,
  apiKey: string,
  skipUrls?: Set<string>
): Promise<FetchedImage | null> {
  try {
    const res = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=5&orientation=landscape&size=large`,
      { headers: { Authorization: apiKey } }
    );

    if (!res.ok) return null;

    const data = await res.json();
    if (!data.photos?.length) return null;

    for (const photo of data.photos) {
      const url = photo.src.large2x || photo.src.original;
      if (skipUrls && skipUrls.has(url)) continue;
      return {
        url,
        alt: photo.alt || query,
        photographer: photo.photographer,
        source: 'pexels',
      };
    }

    return null;
  } catch {
    return null;
  }
}

async function fetchFromUnsplash(
  query: string,
  accessKey: string
): Promise<FetchedImage | null> {
  try {
    const res = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=5&orientation=landscape`,
      { headers: { Authorization: `Client-ID ${accessKey}` } }
    );

    if (!res.ok) return null;

    const data = await res.json();
    if (!data.results?.length) return null;

    const photo = data.results[0];
    return {
      url: photo.urls.full,
      alt: photo.alt_description || query,
      photographer: photo.user.name,
      source: 'unsplash',
    };
  } catch {
    return null;
  }
}

const _usedUrls = new Set<string>();

export function resetUsedUrls() {
  _usedUrls.clear();
}

export async function autoFetchImageForArticle(
  title: string,
  englishTitle?: string,
  categoryName?: string
): Promise<string | null> {
  const image = await fetchRelevantImage(title, categoryName, _usedUrls, englishTitle);
  if (image?.url) {
    _usedUrls.add(image.url);
    return image.url;
  }
  return null;
}
