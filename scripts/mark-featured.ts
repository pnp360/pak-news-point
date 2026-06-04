import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // Mark 5 most recent as featured
  const recent = await prisma.article.findMany({
    orderBy: { publishedAt: 'desc' },
    take: 5,
    select: { id: true, title: true },
  });
  for (const a of recent) {
    await prisma.article.update({ where: { id: a.id }, data: { isFeatured: true } });
    console.log('Featured:', a.title?.slice(0, 60));
  }

  // Mark 10 most recent Urdu-only as breaking
  const urduOnly = await prisma.article.findMany({
    where: { originalTitle: null },
    orderBy: { publishedAt: 'desc' },
    take: 10,
    select: { id: true, title: true, originalTitle: true },
  });
  for (const a of urduOnly) {
    await prisma.article.update({ where: { id: a.id }, data: { isBreaking: true } });
    console.log('Breaking:', a.title?.slice(0, 60));
  }

  console.log('Done');
}

main().catch(console.error).finally(() => prisma.$disconnect());
