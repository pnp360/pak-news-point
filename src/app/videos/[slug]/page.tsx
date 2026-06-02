export const dynamic = 'force-dynamic';

import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getWatermarkedUrl } from '@/lib/watermark';
import { getUrduDate } from '@/lib/urdu';

export default async function VideoDetailPage({ params }: { params: { slug: string } }) {
  const video = await prisma.video.findUnique({
    where: { slug: params.slug },
    include: { category: true },
  });
  if (!video || video.status !== 'PUBLISHED') notFound();

  function getYouTubeId(url: string) {
    const m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    return m ? m[1] : null;
  }

  const youtubeId = getYouTubeId(video.videoUrl);
  const embedUrl = youtubeId ? `https://www.youtube.com/embed/${youtubeId}` : video.videoUrl;

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <nav className="flex items-center gap-2 text-sm text-gray-400 mb-4">
        <Link href="/" className="hover:text-primary-600">صفحہ اول</Link>
        <span>/</span>
        <span className="text-gray-600">{video.title}</span>
      </nav>

      <div className="aspect-video rounded-2xl overflow-hidden bg-gray-100 mb-6">
        <iframe src={embedUrl} className="w-full h-full" allowFullScreen title={video.title} />
      </div>

      <h1 className="text-2xl md:text-3xl font-bold leading-[2.25] mb-4 text-gray-900">
        {video.title}
      </h1>

      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-6">
        {video.reporterName && (
          <span className="flex items-center gap-1">
            <span className="font-medium text-gray-700">رپورٹ:</span> {video.reporterName}
          </span>
        )}
        <span>{getUrduDate(video.publishedAt)}</span>
        <span>{video.views.toLocaleString('en-US')} ملاحظات</span>
      </div>

      {video.description && (
        <p className="text-gray-700 leading-[2.25]">{video.description}</p>
      )}
    </div>
  );
}
