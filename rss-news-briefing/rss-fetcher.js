const Parser = require('rss-parser');
const { RSS_FEEDS, KEYWORDS, ALL_KEYWORDS } = require('./config');

const parser = new Parser({
  timeout: 10000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (compatible; NewsBot/1.0)',
    'Accept': 'application/rss+xml, application/xml, text/xml',
  },
});

// 기사에서 매칭되는 키워드 찾기
function findMatchingKeywords(title, content) {
  const text = `${title} ${content || ''}`;
  return ALL_KEYWORDS.filter(keyword =>
    text.includes(keyword)
  );
}

// 키워드 기반 카테고리 자동 분류
function classifyCategory(matchedKeywords, feedCategory) {
  if (feedCategory && feedCategory !== '종합') {
    return feedCategory;
  }
  for (const [category, keywords] of Object.entries(KEYWORDS)) {
    if (matchedKeywords.some(kw => keywords.includes(kw))) {
      return category;
    }
  }
  return '종합';
}

// 중요도 판정 (키워드 매칭 수 기반)
function classifyImportance(matchedKeywords) {
  if (matchedKeywords.length >= 3) return '속보';
  if (matchedKeywords.length >= 2) return '주요';
  return '일반';
}

// 단일 RSS 피드 수집
async function fetchFeed(feed) {
  try {
    const result = await parser.parseURL(feed.url);
    const articles = (result.items || []).map(item => ({
      title: (item.title || '').trim(),
      link: item.link || '',
      pubDate: item.pubDate || item.isoDate || new Date().toISOString(),
      content: (item.contentSnippet || item.content || '').substring(0, 500),
      source: feed.name,
      feedCategory: feed.category,
    }));
    console.log(`  [OK] ${feed.name}: ${articles.length}건`);
    return articles;
  } catch (err) {
    console.error(`  [FAIL] ${feed.name}: ${err.message}`);
    return [];
  }
}

// 전체 RSS 수집 + 키워드 필터링
async function fetchAndFilter() {
  console.log('\n=== RSS 피드 수집 시작 ===\n');

  const allArticles = [];
  for (const feed of RSS_FEEDS) {
    const articles = await fetchFeed(feed);
    allArticles.push(...articles);
  }

  console.log(`\n총 수집: ${allArticles.length}건`);

  // 오늘 날짜 기사만 필터 (24시간 이내)
  const now = new Date();
  const oneDayAgo = new Date(now - 24 * 60 * 60 * 1000);

  const recentArticles = allArticles.filter(a => {
    const pubDate = new Date(a.pubDate);
    return pubDate >= oneDayAgo;
  });

  console.log(`24시간 이내: ${recentArticles.length}건`);

  // 키워드 필터링
  const filtered = recentArticles
    .map(article => {
      const matchedKeywords = findMatchingKeywords(article.title, article.content);
      if (matchedKeywords.length === 0) return null;

      const category = classifyCategory(matchedKeywords, article.feedCategory);
      const importance = classifyImportance(matchedKeywords);

      return {
        ...article,
        matchedKeywords,
        category,
        importance,
      };
    })
    .filter(Boolean);

  // 중복 제거 (제목 유사도 기반)
  const deduplicated = deduplicateArticles(filtered);

  console.log(`키워드 매칭: ${filtered.length}건`);
  console.log(`중복 제거 후: ${deduplicated.length}건\n`);

  return deduplicated;
}

// 제목 기반 중복 제거
function deduplicateArticles(articles) {
  const seen = new Set();
  return articles.filter(article => {
    // 제목에서 공백/특수문자 제거 후 앞 30자로 비교
    const key = article.title.replace(/[\s\-·…""'']/g, '').substring(0, 30);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

// 카테고리별 그룹핑
function groupByCategory(articles) {
  const groups = {};
  for (const article of articles) {
    if (!groups[article.category]) {
      groups[article.category] = [];
    }
    groups[article.category].push(article);
  }
  return groups;
}

module.exports = { fetchAndFilter, groupByCategory };
