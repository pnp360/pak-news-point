import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { sanitizeHtml } from '@/lib/utils';
import { canPublishToday, incrementPublishedCount } from '@/lib/daily-limit';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'غیر مجاز رسائی' }, { status: 401 });
  }

  const body = await req.json();
  const existing = await prisma.article.findUnique({ where: { id: params.id } });
  if (!existing) {
    return NextResponse.json({ error: 'خبر نہیں ملی' }, { status: 404 });
  }

  const newStatus = body.status || existing.status;

  if (newStatus === 'PUBLISHED' && existing.status !== 'PUBLISHED') {
    const limitCheck = await canPublishToday();
    if (!limitCheck.canPublish) {
      return NextResponse.json({
        error: limitCheck.message,
        limitInfo: limitCheck,
      }, { status: 429 });
    }
  }

  const article = await prisma.article.update({
    where: { id: params.id },
    data: {
      title: body.title,
      excerpt: body.excerpt,
      content: body.content ? sanitizeHtml(body.content) : undefined,
      categoryId: body.categoryId,
      featuredImage: body.featuredImage,
      status: newStatus,
      isBreaking: body.isBreaking,
      isFeatured: body.isFeatured,
      publishedAt: newStatus === 'PUBLISHED' && existing.status !== 'PUBLISHED'
        ? new Date() : existing.publishedAt,
      tags: body.tags ? {
        deleteMany: {},
        create: body.tags.map((tagId: string) => ({ tagId })),
      } : undefined,
    },
    include: {
      category: true,
      author: { select: { id: true, name: true } },
      tags: { include: { tag: true } },
    },
  });

  if (newStatus === 'PUBLISHED' && existing.status !== 'PUBLISHED') {
    await incrementPublishedCount();
  }

  return NextResponse.json(article);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'غیر مجاز رسائی' }, { status: 401 });
  }

  await prisma.article.delete({ where: { id: params.id } });

  return NextResponse.json({ success: true });
}
