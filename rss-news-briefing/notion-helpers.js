// 노션 MCP 연동 헬퍼 - Claude Code에서 직접 실행하는 프롬프트 생성용
const { NOTION_DB, DAILY_DEEP_DIVE } = require('./config');

// 기사를 노션 DB에 저장할 형식으로 변환
function formatForNotion(article) {
  return {
    title: article.title,
    date: new Date(article.pubDate).toISOString().split('T')[0],
    category: article.category,
    importance: article.importance,
    keywords: article.matchedKeywords,
    summary: article.content.substring(0, 200),
    source: article.link,
    isSurge: false,
  };
}

// 일일 뉴스레터 초안 생성 (마크다운)
function generateNewsletterDraft(articles, grouped) {
  const today = new Date().toLocaleDateString('ko-KR', {
    year: 'numeric', month: 'long', day: 'numeric', weekday: 'long'
  });

  let draft = `# 오늘의 뉴스 브리핑\n`;
  draft += `**${today}**\n\n`;
  draft += `---\n\n`;

  // 속보/주요 먼저
  const breaking = articles.filter(a => a.importance === '속보');
  const major = articles.filter(a => a.importance === '주요');

  if (breaking.length > 0) {
    draft += `## 속보\n\n`;
    for (const a of breaking) {
      draft += `- **${a.title}** (${a.source})\n`;
      draft += `  키워드: ${a.matchedKeywords.join(', ')}\n\n`;
    }
  }

  if (major.length > 0) {
    draft += `## 주요 뉴스\n\n`;
    for (const a of major) {
      draft += `- **${a.title}** (${a.source})\n`;
    }
    draft += '\n';
  }

  // 카테고리별 1줄 요약
  draft += `## 카테고리별 요약\n\n`;
  for (const [category, items] of Object.entries(grouped)) {
    const topItem = items[0];
    draft += `### ${category} (${items.length}건)\n`;
    draft += `> ${topItem.title}\n\n`;
    if (items.length > 1) {
      for (const item of items.slice(1, 4)) {
        draft += `- ${item.title}\n`;
      }
      if (items.length > 4) {
        draft += `- _외 ${items.length - 4}건_\n`;
      }
      draft += '\n';
    }
  }

  draft += `---\n`;
  draft += `_총 ${articles.length}건 | RSS 자동 수집 + 키워드 필터링_\n`;

  return draft;
}

// 키워드 급상승 감지
function detectSurgeKeywords(todayArticles, weeklyKeywordCounts) {
  // 오늘 키워드 빈도 계산
  const todayCounts = {};
  for (const article of todayArticles) {
    for (const kw of article.matchedKeywords) {
      todayCounts[kw] = (todayCounts[kw] || 0) + 1;
    }
  }

  const surges = [];
  for (const [keyword, todayCount] of Object.entries(todayCounts)) {
    const weeklyAvg = (weeklyKeywordCounts[keyword] || 0) / 7;
    const ratio = weeklyAvg > 0 ? todayCount / weeklyAvg : todayCount;

    if (ratio >= 2 && todayCount >= 2) {
      surges.push({
        keyword,
        todayCount,
        weeklyAvg: weeklyAvg.toFixed(1),
        ratio: ratio.toFixed(1),
      });
    }
  }

  return surges.sort((a, b) => b.ratio - a.ratio);
}

// 주간 트렌드 리포트 생성
function generateWeeklyReport(weekArticles, grouped) {
  const now = new Date();
  const weekStart = new Date(now - 7 * 24 * 60 * 60 * 1000);
  const period = `${weekStart.toLocaleDateString('ko-KR')} ~ ${now.toLocaleDateString('ko-KR')}`;

  let report = `# 주간 트렌드 리포트\n`;
  report += `**${period}**\n\n`;
  report += `---\n\n`;

  // 전체 키워드 빈도
  const keywordCounts = {};
  for (const article of weekArticles) {
    for (const kw of (article.matchedKeywords || article.keywords || [])) {
      keywordCounts[kw] = (keywordCounts[kw] || 0) + 1;
    }
  }

  // Top 5 키워드
  const topKeywords = Object.entries(keywordCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  report += `## Top 5 키워드\n\n`;
  for (const [i, [kw, count]] of topKeywords.entries()) {
    const bar = '█'.repeat(Math.min(count, 20));
    report += `${i + 1}. **${kw}** — ${count}회 ${bar}\n`;
  }
  report += '\n';

  // 카테고리별 핵심 이슈 (최대 3개)
  report += `## 카테고리별 핵심 이슈\n\n`;
  for (const [category, items] of Object.entries(grouped)) {
    report += `### ${category}\n`;
    for (const item of items.slice(0, 3)) {
      report += `- ${item.title}\n`;
    }
    report += '\n';
  }

  report += `---\n`;
  report += `_총 ${weekArticles.length}건 분석 | 자동 생성_\n`;

  return { report, topKeywords, keywordCounts };
}

// 요일별 심층 브리핑 생성
function generateDeepDive(dayOfWeek, articles, grouped) {
  const category = DAILY_DEEP_DIVE[dayOfWeek];
  if (!category) return null;

  const dayNames = { 1: '월요일', 2: '화요일', 3: '수요일', 4: '목요일', 5: '금요일' };
  const categoryArticles = grouped[category] || [];

  let briefing = `# ${dayNames[dayOfWeek]} 심층 브리핑: ${category}\n\n`;
  briefing += `**${new Date().toLocaleDateString('ko-KR')}**\n\n`;
  briefing += `---\n\n`;

  if (categoryArticles.length === 0) {
    briefing += `> 오늘 "${category}" 관련 키워드 매칭 기사가 없습니다.\n`;
    return { briefing, category, count: 0 };
  }

  briefing += `## 오늘의 ${category} 뉴스 (${categoryArticles.length}건)\n\n`;

  for (const [i, article] of categoryArticles.entries()) {
    briefing += `### ${i + 1}. ${article.title}\n`;
    briefing += `- **출처**: ${article.source}\n`;
    briefing += `- **키워드**: ${article.matchedKeywords.join(', ')}\n`;
    briefing += `- **중요도**: ${article.importance}\n`;
    if (article.content) {
      briefing += `- **내용**: ${article.content.substring(0, 150)}...\n`;
    }
    briefing += `- **링크**: ${article.link}\n\n`;
  }

  // 키워드 분포
  const kwCounts = {};
  for (const a of categoryArticles) {
    for (const kw of a.matchedKeywords) {
      kwCounts[kw] = (kwCounts[kw] || 0) + 1;
    }
  }

  briefing += `## 키워드 분포\n\n`;
  for (const [kw, count] of Object.entries(kwCounts).sort((a, b) => b[1] - a[1])) {
    briefing += `- ${kw}: ${count}건\n`;
  }

  briefing += `\n---\n`;
  briefing += `_${category} 심층 분석 | 자동 생성_\n`;

  return { briefing, category, count: categoryArticles.length };
}

module.exports = {
  formatForNotion,
  generateNewsletterDraft,
  detectSurgeKeywords,
  generateWeeklyReport,
  generateDeepDive,
};
