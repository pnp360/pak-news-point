import { prisma } from '@/lib/prisma';
import { scrapeAllSources, ScrapedArticle } from './scraper';
import { rewriteArticle } from './rewriter';
import { FALLBACK_IMAGE } from './sources';
import slugify from 'slugify';

const PIPELINE_LOCK_KEY = 'newsPipelineLock';
const PIPELINE_LAST_RUN_KEY = 'pipelineLastRun';
const THIRTY_MINUTES_MS = 30 * 60 * 1000;

export interface PipelineResult {
  success: boolean;
  scraped: number;
  rewritten: number;
  created: number;
  errors: number;
  durationMs: number;
  skipped: number;
}

/**
 * Check if the pipeline already ran within the last 30 minutes.
 */
export async function shouldRunPipeline(): Promise<boolean> {
  const setting = await prisma.setting.findUnique({
    where: { key: PIPELINE_LAST_RUN_KEY },
  });
  if (setting?.value) {
    const elapsed = Date.now() - new Date(setting.value).getTime();
    return elapsed >= THIRTY_MINUTES_MS;
  }
  return true;
}

/**
 * Acquire a distributed lock so concurrent cron triggers don't overlap.
 */
async function acquireLock(): Promise<boolean> {
  const lock = await prisma.setting.findUnique({
    where: { key: PIPELINE_LOCK_KEY },
  });
  if (lock?.value === 'locked') return false;

  await prisma.setting.upsert({
    where: { key: PIPELINE_LOCK_KEY },
    update: { value: 'locked' },
    create: { key: PIPELINE_LOCK_KEY, value: 'locked' },
  });
  return true;
}

async function releaseLock(): Promise<void> {
  await prisma.setting.upsert({
    where: { key: PIPELINE_LOCK_KEY },
    update: { value: '' },
    create: { key: PIPELINE_LOCK_KEY, value: '' },
  });
}

function generateSlug(title: string): string {
  const base = slugify(title, { lower: true, strict: true })
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80);
  return `${base || 'news'}-${Date.now().toString(36)}`;
}

/**
 * Map scraped category slug to a database Category.
 */
async function resolveCategory(categoryName: string): Promise<string | null> {
  const slugMap: Record<string, string> = {
    Pakistan: 'pakistan',
    World: 'world',
    Sports: 'sports',
    Business: 'business',
    Entertainment: 'entertainment',
    Technology: 'technology',
    Health: 'health',
    Education: 'education',
  };

  const slug = slugMap[categoryName];
  if (!slug) return null;

  const cat = await prisma.category.findUnique({ where: { slug } });
  return cat?.id || null;
}

/**
 * Check if an article with a similar title already exists.
 */
async function isDuplicate(title: string): Promise<boolean> {
  const normalized = title.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 50);
  if (!normalized) return true;

  const existing = await prisma.article.findFirst({
    where: { title: { contains: normalized.slice(0, 30) } },
    select: { id: true },
  });
  return !!existing;
}

/**
 * Main pipeline orchestrator.
 * 1. Scrape all Urdu RSS sources
 * 2. Deduplicate
 * 3. Rewrite via LLM
 * 4. Store in DB
 */
export async function runPipeline(): Promise<PipelineResult> {
  const start = Date.now();
  const result: PipelineResult = {
    success: false,
    scraped: 0,
    rewritten: 0,
    created: 0,
    errors: 0,
    durationMs: 0,
    skipped: 0,
  };

  const locked = await acquireLock();
  if (!locked) {
    result.success = true;
    result.durationMs = Date.now() - start;
    return result;
  }

  try {
    // 1) Scrape
    const scraped: ScrapedArticle[] = await scrapeAllSources();
    result.scraped = scraped.length;

    // 2) Deduplicate & filter
    const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' }, select: { id: true } });
    if (!admin?.id) {
      result.errors = 1;
      return result;
    }

    let created = 0;
    let errors = 0;
    let rewritten = 0;

    // Take top 15 most recent to stay within rate limits
    const batch = scraped.sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime()).slice(0, 15);

    for (const article of batch) {
      try {
        // Check DB duplicate
        const dup = await isDuplicate(article.originalTitle);
        if (dup) {
          result.skipped++;
          continue;
        }

        // 3) Rewrite via LLM
        let title = article.originalTitle;
        let body = article.originalBody;

        if (process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY) {
          const rewrittenResult = await rewriteArticle(article.originalTitle, article.originalBody);
          title = rewrittenResult.rewrittenTitle;
          body = rewrittenResult.rewrittenBody;
          rewritten++;
        }

        // 4) Resolve category
        const categoryId = await resolveCategory(article.category);
        if (!categoryId) {
          result.skipped++;
          continue;
        }

        // Build final content as HTML paragraphs
        const cleanBody = body
          .replace(/\[!\[.*?\]\(.*?\)\]/g, '')
          .replace(/!\[.*?\]\(.*?\)/g, '')
          .replace(/\[.*?\]\(.*?\)/g, '')
          .replace(/<[^>]+>/g, '');
        const paragraphs = cleanBody
          .split(/[.!?]\s*/)
          .filter(Boolean)
          .map((s) => `<p>${s.trim()}۔</p>`)
          .join('\n');

        // 5) Store
        await prisma.article.create({
          data: {
            title,
            originalTitle: article.originalTitle,
            slug: generateSlug(title),
            excerpt: body.slice(0, 200),
            content: paragraphs || `<p>${title}</p>`,
            featuredImage: article.imageUrl || FALLBACK_IMAGE,
            categoryId,
            authorId: admin.id,
            status: 'PUBLISHED',
            publishedAt: article.publishedAt,
            isBreaking: false,
            isFeatured: false,
          },
        });

        created++;
      } catch {
        errors++;
      }
    }

    result.created = created;
    result.rewritten = rewritten;
    result.errors = errors;
    result.success = true;
  } catch (e) {
    console.error('Pipeline error:', e);
    result.errors++;
  } finally {
    // Record run time & release lock
    await prisma.setting.upsert({
      where: { key: PIPELINE_LAST_RUN_KEY },
      update: { value: new Date().toISOString() },
      create: { key: PIPELINE_LAST_RUN_KEY, value: new Date().toISOString() },
    });
    await releaseLock();
    result.durationMs = Date.now() - start;
  }

  return result;
}
