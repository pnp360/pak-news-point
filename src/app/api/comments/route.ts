import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const articleId = req.nextUrl.searchParams.get('articleId');
  const all = req.nextUrl.searchParams.get('all');

  if (all === 'true') {
    const comments = await prisma.comment.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        article: { select: { id: true, title: true, slug: true } },
      },
    });
    return NextResponse.json(comments);
  }

  if (!articleId) return NextResponse.json({ error: 'articleId required' }, { status: 400 });
  const comments = await prisma.comment.findMany({
    where: { articleId, isApproved: true, parentId: null },
    orderBy: { createdAt: 'desc' },
    include: {
      replies: {
        where: { isApproved: true },
        orderBy: { createdAt: 'asc' },
        select: { id: true, authorName: true, content: true, createdAt: true },
      },
    },
  });
  return NextResponse.json(comments);
}

export async function POST(req: Request) {
  try {
    const { articleId, authorName, authorEmail, content, parentId } = await req.json();
    if (!articleId || !authorName || !content) {
      return NextResponse.json({ error: 'articleId, authorName, and content required' }, { status: 400 });
    }
    if (authorName.length > 50 || content.length > 2000) {
      return NextResponse.json({ error: 'Name too long or comment too long (max 2000 chars)' }, { status: 400 });
    }
    const comment = await prisma.comment.create({
      data: { articleId, authorName, authorEmail, content, parentId: parentId || null },
    });
    return NextResponse.json(comment, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create comment' }, { status: 500 });
  }
}
