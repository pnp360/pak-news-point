import { prisma } from '@/lib/prisma';
import slugify from 'slugify';
import { sanitizeUrduPayload } from '@/lib/sanitize-urdu';

export interface IngestInput {
  title: string;
  originalTitle?: string | null;
  sourceUrl?: string | null;
  content: string;
  excerpt?: string | null;
  categoryId: string;
  authorId: string;
  featuredImage?: string | null;
  publishedAt: Date;
  isBreaking?: boolean;
  isFeatured?: boolean;
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
    const sourceUrl = input.sourceUrl?.trim() || null;
    const content = sanitizeUrduPayload(input.content);

    if (sourceUrl) {
      const existing = await prisma.article.findFirst({
        where: { sourceUrl },
        select: { id: true },
      });
      if (existing) return { id: existing.id, created: false };
    }

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
      if (existing) return { id: existing.id, created: false };
    }

    const article = await prisma.article.create({
      data: {
        title,
        originalTitle: originalTitle || title,
        slug: generateSlug(title),
        excerpt: input.excerpt || title.slice(0, 200),
        content,
        sourceUrl,
        featuredImage: input.featuredImage || null,
        categoryId: input.categoryId,
        authorId: input.authorId,
        status: 'PUBLISHED',
        publishedAt: input.publishedAt,
        isBreaking: input.isBreaking ?? false,
        isFeatured: input.isFeatured ?? false,
      },
    });

    return { id: article.id, created: true };
  } catch (err) {
    console.error('[ingestArticle] Failed:', err instanceof Error ? err.message : err);
    return null;
  }
}
