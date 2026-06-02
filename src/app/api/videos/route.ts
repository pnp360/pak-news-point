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
      const video = await prisma.video.findUnique({ where: { id }, include: { category: true } });
      if (!video) return NextResponse.json({ error: 'Not found' }, { status: 404 });
      return NextResponse.json(video);
    }
    if (slug) {
      const video = await prisma.video.findUnique({ where: { slug }, include: { category: true } });
      if (!video) return NextResponse.json({ error: 'Not found' }, { status: 404 });
      return NextResponse.json(video);
    }
    const videos = await prisma.video.findMany({
      orderBy: { publishedAt: 'desc' },
      include: { category: { select: { nameUrdu: true, slug: true } } },
    });
    return NextResponse.json(videos);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const data = await request.json();
    const video = await prisma.video.create({
      data: {
        title: data.title,
        slug: data.slug,
        description: data.description || '',
        videoUrl: data.videoUrl,
        thumbnail: data.thumbnail || null,
        categoryId: data.categoryId || null,
        reporterName: data.reporterName || null,
        status: data.status || 'DRAFT',
        publishedAt: new Date(),
      },
    });
    return NextResponse.json(video);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
