import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const settings = await prisma.setting.findMany();
  const settingsMap: Record<string, string> = {};
  settings.forEach((s) => { settingsMap[s.key] = s.value; });

  return NextResponse.json(settingsMap);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as { role: string }).role !== 'ADMIN') {
    return NextResponse.json({ error: 'غیر مجاز رسائی' }, { status: 401 });
  }

  const body = await req.json();
  const { key, value } = body;

  if (!key) {
    return NextResponse.json({ error: 'کلید درج کریں' }, { status: 400 });
  }

  const setting = await prisma.setting.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  });

  return NextResponse.json(setting);
}
