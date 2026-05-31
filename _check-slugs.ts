import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();
async function main() {
  const articles = await p.article.findMany({ take: 5, orderBy: { publishedAt: 'desc' } });
  for (const a of articles) {
    console.log(a.slug);
  }
  await p.$disconnect();
}
main().catch(console.error);
