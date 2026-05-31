import { NextRequest, NextResponse } from 'next/server';
import { processImage, isValidImageUrl } from '@/lib/watermark';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url');
  if (!url) {
    return new NextResponse('Missing url parameter', { status: 400 });
  }

  if (!isValidImageUrl(url)) {
    return new NextResponse('Invalid or disallowed image URL', { status: 403 });
  }

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Azad Khabar/1.0',
        'Accept': 'image/*',
      },
    });

    if (!response.ok) {
      return new NextResponse('Failed to fetch image', { status: 502 });
    }

    const contentType = response.headers.get('content-type') || 'image/jpeg';
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const processed = await processImage(buffer);

    return new NextResponse(new Uint8Array(processed), {
      status: 200,
      headers: {
        'Content-Type': 'image/jpeg',
        'Content-Length': processed.length.toString(),
        'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
        'X-Original-Url': url,
      },
    });
  } catch (error) {
    console.error('Image proxy error:', error);
    return new NextResponse('Image processing failed', { status: 500 });
  }
}
