import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();
async function main() {
  const articles = await p.article.findMany({ take: 5, orderBy: { publishedAt: 'desc' } });
  for (const a of articles) {
    console.log(a.slug.substring(0, 30) + ' | ' + (a.featuredImage?.substring(0, 70) || 'NO IMAGE'));
  }
  await p.$disconnect();
}
main().catch(console.error);
