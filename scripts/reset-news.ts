import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const count = await prisma.article.count();
  console.log('Total articles before delete:', count);

  await prisma.comment.deleteMany();
  await prisma.articleTag.deleteMany();
  const del = await prisma.article.deleteMany();
  console.log('Deleted articles:', del.count);

  const remaining = await prisma.article.count();
  console.log('Total articles after delete:', remaining);
}

main().catch(console.error).finally(() => prisma.$disconnect());
