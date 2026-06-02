import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const slug = searchParams.get('slug');

  try {
    if (id) {
      const column = await prisma.columnArticle.findUnique({
        where: { id },
        include: { category: true },
      });
      if (!column) return NextResponse.json({ error: 'Not found' }, { status: 404 });
      return NextResponse.json(column);
    }
    if (slug) {
      const column = await prisma.columnArticle.findUnique({
        where: { slug },
        include: { category: true },
      });
      if (!column) return NextResponse.json({ error: 'Not found' }, { status: 404 });
      return NextResponse.json(column);
    }
    const columns = await prisma.columnArticle.findMany({
      orderBy: { publishedAt: 'desc' },
      include: { category: { select: { nameUrdu: true, slug: true } } },
    });
    return NextResponse.json(columns);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const data = await request.json();
    const column = await prisma.columnArticle.create({
      data: {
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt || '',
        content: data.content || '',
        featuredImage: data.featuredImage || null,
        columnistName: data.columnistName,
        columnistBio: data.columnistBio || null,
        categoryId: data.categoryId || null,
        status: data.status || 'DRAFT',
        publishedAt: new Date(),
      },
    });
    return NextResponse.json(column);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
