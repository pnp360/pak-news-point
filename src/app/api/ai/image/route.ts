import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { fetchRelevantImage } from '@/lib/image-fetcher';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'غیر مجاز رسائی' }, { status: 401 });
  }

  try {
    const { title, content, category } = await req.json();

    if (!title && !content) {
      return NextResponse.json({ error: 'عنوان یا مواد درج کریں' }, { status: 400 });
    }

    const image = await fetchRelevantImage(title || 'news', category);

    return NextResponse.json({
      image: image?.url || null,
      alt: image?.alt || title,
      source: image?.source || null,
    });
  } catch (err) {
    console.error('Image fetch API error:', err);
    return NextResponse.json({ error: 'تصویر حاصل کرنے میں ناکام' }, { status: 500 });
  }
}
