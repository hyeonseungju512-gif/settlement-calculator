const { fetchAndFilter, groupByCategory } = require('./rss-fetcher');

async function main() {
  const articles = await fetchAndFilter();
  const grouped = groupByCategory(articles);

  console.log('=== 카테고리별 결과 ===\n');
  for (const [category, items] of Object.entries(grouped)) {
    console.log(`\n📂 ${category} (${items.length}건)`);
    for (const item of items.slice(0, 3)) {
      console.log(`  [${item.importance}] ${item.title}`);
      console.log(`    키워드: ${item.matchedKeywords.join(', ')}`);
      console.log(`    출처: ${item.source} | ${item.link}`);
    }
    if (items.length > 3) {
      console.log(`  ... 외 ${items.length - 3}건`);
    }
  }

  // JSON 출력 (파이프라인 연결용)
  const outputPath = './latest-articles.json';
  require('fs').writeFileSync(outputPath, JSON.stringify(articles, null, 2), 'utf-8');
  console.log(`\n결과 저장: ${outputPath} (${articles.length}건)`);
}

main().catch(console.error);
