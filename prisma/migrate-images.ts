import { PrismaClient } from '@prisma/client';
import { autoFetchImageForArticle, resetUsedUrls } from '../src/lib/image-fetcher';

const prisma = new PrismaClient();

async function migrateImages() {
  resetUsedUrls();

  const articles = await prisma.article.findMany({
    orderBy: { publishedAt: 'desc' },
    include: { category: true },
  });

  console.log(`Found ${articles.length} articles. Fetching images via full pipeline...\n`);
  let updated = 0;
  let skipped = 0;

  for (let i = 0; i < articles.length; i++) {
    const article = articles[i];
    console.log(`[${i + 1}/${articles.length}] ${article.title.slice(0, 45)}`);
    if (article.featuredImage) {
      console.log(`  Old: ${article.featuredImage.slice(0, 70)}`);
    }

    try {
      const newImage = await autoFetchImageForArticle(
        article.title,
        article.category?.nameUrdu || ''
      );

      if (newImage) {
        await prisma.article.update({
          where: { id: article.id },
          data: { featuredImage: newImage },
        });
        console.log(`  ✅ ${newImage.slice(0, 80)}`);
        updated++;
      } else {
        console.log(`  ⏭ No image found`);
        skipped++;
      }
    } catch (err) {
      console.error(`  ❌ Failed:`, (err as Error).message.slice(0, 80));
      skipped++;
    }
    console.log('');
  }

  console.log(`Done! ${updated} updated, ${skipped} skipped`);
}

migrateImages()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
