import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { articleSchema } from '@/lib/validations';
import { generateSlug, sanitizeHtml } from '@/lib/utils';
import { canPublishToday, incrementPublishedCount } from '@/lib/daily-limit';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1');
  const pageSize = parseInt(searchParams.get('pageSize') || '20');
  const status = searchParams.get('status');
  const category = searchParams.get('category');
  const search = searchParams.get('search');
  const featured = searchParams.get('featured');

  const where: any = {};

  if (status) where.status = status;
  if (category) where.category = { slug: category };
  if (featured === 'true') where.isFeatured = true;

  if (search) {
    where.OR = [
      { title: { contains: search } },
      { excerpt: { contains: search } },
      { content: { contains: search } },
    ];
  }

  const [data, total] = await Promise.all([
    prisma.article.findMany({
      where,
      include: {
        category: { select: { id: true, name: true, nameUrdu: true, slug: true } },
        author: { select: { id: true, name: true, email: true, image: true } },
        tags: { include: { tag: { select: { id: true, name: true, slug: true } } } },
      },
      orderBy: status === 'PUBLISHED'
        ? { publishedAt: 'desc' }
        : { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.article.count({ where }),
  ]);

  return NextResponse.json({
    data,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'غیر مجاز رسائی' }, { status: 401 });
  }

  const body = await req.json();
  const validation = articleSchema.safeParse(body);

  if (!validation.success) {
    return NextResponse.json({
      error: 'درست ڈیٹا درج کریں',
      details: validation.error.flatten(),
    }, { status: 400 });
  }

  const { title, excerpt, content, categoryId, featuredImage, status, isBreaking, isFeatured, tags, scheduledAt } = validation.data;

  if (status === 'PUBLISHED') {
    const limitCheck = await canPublishToday();
    if (!limitCheck.canPublish) {
      return NextResponse.json({
        error: limitCheck.message,
        limitInfo: limitCheck,
      }, { status: 429 });
    }
  }

  const slug = generateSlug(title);

  const article = await prisma.article.create({
    data: {
      title,
      slug,
      excerpt: excerpt || null,
      content: sanitizeHtml(content),
      categoryId,
      featuredImage: featuredImage || null,
      authorId: (session.user as any).id,
      status,
      isBreaking,
      isFeatured,
      publishedAt: status === 'PUBLISHED' ? new Date() : scheduledAt ? new Date(scheduledAt) : null,
      scheduledAt: status === 'SCHEDULED' && scheduledAt ? new Date(scheduledAt) : null,
      tags: {
        create: tags.map((tagId: string) => ({ tagId })),
      },
    },
    include: {
      category: true,
      author: { select: { id: true, name: true, email: true, image: true } },
      tags: { include: { tag: true } },
    },
  });

  if (status === 'PUBLISHED') {
    await incrementPublishedCount();
  }

  // Auto-fetch image if no featured image provided
  if (!featuredImage && (status === 'PUBLISHED' || status === 'DRAFT')) {
    try {
      const { autoFetchImageForArticle } = await import('@/lib/image-fetcher');
      const cat = await prisma.category.findUnique({ where: { id: categoryId } });
      const imgUrl = await autoFetchImageForArticle(title, cat?.nameUrdu || '');
      if (imgUrl) {
        await prisma.article.update({
          where: { id: article.id },
          data: { featuredImage: imgUrl },
        });
        article.featuredImage = imgUrl;
      }
    } catch {
      // Non-critical - image fetch failure shouldn't block publication
    }
  }

  return NextResponse.json(article, { status: 201 });
}
