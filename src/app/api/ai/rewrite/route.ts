import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { rewriteArticle } from '@/lib/ai-rewriter';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'غیر مجاز رسائی' }, { status: 401 });
  }

  try {
    const { articleId, title, content, style } = await req.json();

    if (!title || !content) {
      return NextResponse.json({ error: 'عنوان اور مواد درج کریں' }, { status: 400 });
    }

    const result = await rewriteArticle({
      title,
      content,
      style: style || 'standard',
    });

    if (!result) {
      return NextResponse.json(
        { error: 'AI دوبارہ تحریر کرنے میں ناکام۔ براہ کرم بعد میں دوبارہ کوشش کریں۔' },
        { status: 503 }
      );
    }

    if (articleId) {
      await prisma.article.update({
        where: { id: articleId },
        data: {
          title: result.title,
          content: result.content,
          excerpt: result.excerpt || undefined,
        },
      });
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error('Rewrite API error:', err);
    return NextResponse.json({ error: 'کچھ غلط ہو گیا' }, { status: 500 });
  }
}
