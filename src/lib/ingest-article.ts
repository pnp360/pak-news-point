import { prisma } from '@/lib/prisma';
import slugify from 'slugify';
import { sanitizeUrduPayload } from '@/lib/sanitize-urdu';

export interface IngestInput {
  title: string;
  originalTitle?: string | null;
  content: string;
  excerpt?: string | null;
  categoryId: string;
  authorId: string;
  featuredImage?: string | null;
  publishedAt: Date;
  isBreaking?: boolean;
  isFeatured?: boolean;
}

/* In-memory dedup set scoped to the current process lifetime.
 * Prevents re-insertion of identical content within the same run. */
const seenHashes = new Set<string>();

function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}

function contentHash(title: string, content: string): string {
  return simpleHash(title + '|' + content);
}

function generateSlug(title: string): string {
  const base = slugify(title, { lower: true, strict: true })
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80);
  return `${base || 'news'}-${Date.now().toString(36)}`;
}

export async function ingestArticle(input: IngestInput): Promise<{ id: string; created: boolean } | null> {
  try {
    const title = sanitizeUrduPayload(input.title);
    const originalTitle = input.originalTitle ? sanitizeUrduPayload(input.originalTitle) : null;
    const content = sanitizeUrduPayload(input.content);

    /* In-memory dedup — skip if identical content already ingested this run */
    const hash = contentHash(title, content);
    if (seenHashes.has(hash)) return null;

    /* DB-level dedup by composite unique key */
    if (originalTitle && input.publishedAt) {
      const existing = await prisma.article.findUnique({
        where: {
          originalTitle_publishedAt: {
            originalTitle,
            publishedAt: input.publishedAt,
          },
        },
        select: { id: true },
      });
      if (existing) {
        seenHashes.add(hash);
        return { id: existing.id, created: false };
      }
    }

    const article = await prisma.article.create({
      data: {
        title,
        originalTitle: originalTitle || title,
        slug: generateSlug(title),
        excerpt: input.excerpt || title.slice(0, 200),
        content,
        featuredImage: input.featuredImage || null,
        categoryId: input.categoryId,
        authorId: input.authorId,
        status: 'PUBLISHED',
        publishedAt: input.publishedAt,
        isBreaking: input.isBreaking ?? false,
        isFeatured: input.isFeatured ?? false,
      },
    });

    seenHashes.add(hash);
    return { id: article.id, created: true };
  } catch (err) {
    console.error('[ingestArticle] Failed:', err instanceof Error ? err.message : err);
    return null;
  }
}
