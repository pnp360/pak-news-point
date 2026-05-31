import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import slugify from 'slugify';

export async function GET() {
  const categories = await prisma.category.findMany({
    orderBy: { order: 'asc' },
    include: { _count: { select: { articles: true } } },
  });

  return NextResponse.json(categories);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'غیر مجاز رسائی' }, { status: 401 });
  }

  const body = await req.json();
  const { name, nameUrdu, description, order } = body;

  if (!name || !nameUrdu) {
    return NextResponse.json({ error: 'نام اور اردو نام درج کریں' }, { status: 400 });
  }

  const slug = slugify(name, { lower: true, strict: true });

  const existing = await prisma.category.findUnique({ where: { slug } });
  if (existing) {
    return NextResponse.json({ error: 'یہ زمرہ پہلے سے موجود ہے' }, { status: 400 });
  }

  const category = await prisma.category.create({
    data: { name, nameUrdu, slug, description, order: order || 0 },
  });

  return NextResponse.json(category, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'غیر مجاز رسائی' }, { status: 401 });
  }

  const body = await req.json();
  const { id, name, nameUrdu, description, order } = body;

  if (!id) {
    return NextResponse.json({ error: 'ID درج کریں' }, { status: 400 });
  }

  const category = await prisma.category.update({
    where: { id },
    data: { name, nameUrdu, description, order },
  });

  return NextResponse.json(category);
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'غیر مجاز رسائی' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'ID درج کریں' }, { status: 400 });
  }

  await prisma.category.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
