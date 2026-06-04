import { fetchAllFeeds } from '../src/lib/fetch-news';

async function main() {
  console.log('Fetching news from all RSS feeds...');
  const result = await fetchAllFeeds();
  console.log('Result:', JSON.stringify(result, null, 2));
}

main().catch(console.error);
