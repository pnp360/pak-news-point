import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { autoFetchImageForArticle } from '@/lib/image-fetcher';

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'غیر مجاز رسائی' }, { status: 401 });
  }

  const articles = await prisma.article.findMany({
    where: {
      featuredImage: { contains: 'picsum.photos' },
    },
    include: { category: true },
  });

  let updated = 0;
  for (const article of articles) {
    try {
      const newImage = await autoFetchImageForArticle(
        article.title,
        article.category?.nameUrdu || ''
      );
      if (newImage) {
        await prisma.article.update({
          where: { id: article.id },
          data: { featuredImage: newImage },
        });
        updated++;
      }
    } catch {
      // skip individual failures
    }
  }

  return NextResponse.json({ updated, total: articles.length });
}
