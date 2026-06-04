import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const total = await prisma.article.count();
  const withImages = await prisma.article.count({ where: { featuredImage: { not: null } } });
  const breaking = await prisma.article.count({ where: { isBreaking: true } });
  const featured = await prisma.article.count({ where: { isFeatured: true } });
  const byStatus = await prisma.article.groupBy({ by: ['status'], _count: true });
  const byCategory = await prisma.article.groupBy({ by: ['categoryId'], _count: true });
  console.log('Total articles:', total);
  console.log('With images:', withImages);
  console.log('Breaking:', breaking);
  console.log('Featured:', featured);
  console.log('Statuses:', JSON.stringify(byStatus));
  console.log('Categories with articles:', byCategory.length);
  const sample = await prisma.article.findFirst({ include: { category: true } });
  if (sample) {
    console.log('Sample title:', sample.title?.slice(0, 60));
    console.log('Sample category:', sample.category?.nameUrdu);
    console.log('Has image:', !!sample.featuredImage);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
