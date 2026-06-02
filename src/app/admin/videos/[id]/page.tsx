import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import VideoEditor from '../VideoEditor';

export const dynamic = 'force-dynamic';

export default async function EditVideoPage({ params }: { params: { id: string } }) {
  const video = await prisma.video.findUnique({ where: { id: params.id }, include: { category: true } });
  if (!video) notFound();

  return <VideoEditor video={video} />;
}
