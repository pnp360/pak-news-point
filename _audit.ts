import { PrismaClient } from '@prisma/client';
import { translateToEnglish, extractEnglishKeywords } from '../src/lib/translate';
const p = new PrismaClient();
async function main() {
  const articles = await p.article.findMany({ include: { category: true }, orderBy: { publishedAt: 'asc' } });
  for (const a of articles) {
    const en = translateToEnglish(a.title);
    const kw = extractEnglishKeywords(a.title);
    let src = '?';
    const url = a.featuredImage || '';
    if (url.includes('bbci.co')) src = 'BBC';
    else if (url.includes('guim.co')) src = 'Guardian';
    else if (url.includes('dawn.com')) src = 'Dawn';
    else if (url.includes('pexels')) src = 'Pexels';
    else if (url.includes('unsplash')) src = 'Unsplash';
    console.log(`${a.title.substring(0, 35).padEnd(36)} | ${src.padEnd(9)} | kw: ${kw.slice(0, 4).join(', ').padEnd(35)} | ${en.substring(0, 40)}`);
  }
  await p.$disconnect();
}
main().catch(console.error);
