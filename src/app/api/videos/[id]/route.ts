import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const data = await request.json();
    const updateData: any = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.slug !== undefined) updateData.slug = data.slug;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.videoUrl !== undefined) updateData.videoUrl = data.videoUrl;
    if (data.thumbnail !== undefined) updateData.thumbnail = data.thumbnail;
    if (data.categoryId !== undefined) updateData.categoryId = data.categoryId;
    if (data.reporterName !== undefined) updateData.reporterName = data.reporterName;
    if (data.status !== undefined) {
      updateData.status = data.status;
      if (data.status === 'PUBLISHED') updateData.publishedAt = new Date();
    }

    const video = await prisma.video.update({ where: { id: params.id }, data: updateData });
    return NextResponse.json(video);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    await prisma.video.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
