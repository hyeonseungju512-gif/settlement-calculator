const fs = require('fs');
const path = require('path');
const { fetchAndFilter, groupByCategory } = require('./rss-fetcher');
const {
  formatForNotion,
  generateNewsletterDraft,
  detectSurgeKeywords,
  generateWeeklyReport,
  generateDeepDive,
} = require('./notion-helpers');

const OUTPUT_DIR = path.join(__dirname, 'output');

// 출력 디렉토리 생성
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// 날짜 포맷
function dateStr() {
  return new Date().toISOString().split('T')[0];
}

// 과거 데이터 로드 (주간 키워드 빈도용)
function loadWeeklyData() {
  const historyFile = path.join(OUTPUT_DIR, 'history.json');
  if (!fs.existsSync(historyFile)) return { days: {}, keywordCounts: {} };
  return JSON.parse(fs.readFileSync(historyFile, 'utf-8'));
}

// 데이터 저장
function saveHistory(history) {
  const historyFile = path.join(OUTPUT_DIR, 'history.json');
  fs.writeFileSync(historyFile, JSON.stringify(history, null, 2), 'utf-8');
}

// 메인 실행
async function main() {
  const mode = process.argv[2] || 'daily';
  console.log(`\n모드: ${mode}\n`);

  // 1. RSS 수집 + 키워드 필터링
  const articles = await fetchAndFilter();
  const grouped = groupByCategory(articles);

  // 히스토리 로드
  const history = loadWeeklyData();
  const today = dateStr();

  // 오늘 데이터 히스토리에 저장
  history.days[today] = articles.map(a => ({
    title: a.title,
    keywords: a.matchedKeywords,
    category: a.category,
    importance: a.importance,
  }));

  // 7일 이전 데이터 정리
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  for (const day of Object.keys(history.days)) {
    if (day < sevenDaysAgo) delete history.days[day];
  }

  // 주간 키워드 빈도 계산
  const weeklyKeywordCounts = {};
  for (const [day, dayArticles] of Object.entries(history.days)) {
    if (day === today) continue;
    for (const a of dayArticles) {
      for (const kw of a.keywords) {
        weeklyKeywordCounts[kw] = (weeklyKeywordCounts[kw] || 0) + 1;
      }
    }
  }

  saveHistory(history);

  // 2. 노션 저장용 데이터
  const notionData = articles.map(formatForNotion);
  fs.writeFileSync(
    path.join(OUTPUT_DIR, `${today}-articles.json`),
    JSON.stringify(notionData, null, 2), 'utf-8'
  );
  console.log(`\n노션 저장용: ${notionData.length}건 → output/${today}-articles.json`);

  // === [A] 일일 뉴스레터 초안 ===
  if (mode === 'daily' || mode === 'newsletter') {
    const newsletter = generateNewsletterDraft(articles, grouped);
    const nlPath = path.join(OUTPUT_DIR, `${today}-newsletter.md`);
    fs.writeFileSync(nlPath, newsletter, 'utf-8');
    console.log(`\n[A] 뉴스레터 초안 → output/${today}-newsletter.md`);
    console.log('--- 미리보기 ---');
    console.log(newsletter.substring(0, 500) + '...\n');
  }

  // === [D] 키워드 급상승 알림 ===
  if (mode === 'daily' || mode === 'surge') {
    const surges = detectSurgeKeywords(articles, weeklyKeywordCounts);
    if (surges.length > 0) {
      console.log(`\n[D] 급상승 키워드 감지!`);
      for (const s of surges) {
        console.log(`  🔥 "${s.keyword}" — 오늘 ${s.todayCount}회 (7일 평균 ${s.weeklyAvg}회, ${s.ratio}배)`);
      }
      // 급상승 기사에 태그
      for (const article of notionData) {
        if (article.keywords.some(kw => surges.find(s => s.keyword === kw))) {
          article.isSurge = true;
        }
      }
      fs.writeFileSync(
        path.join(OUTPUT_DIR, `${today}-surges.json`),
        JSON.stringify(surges, null, 2), 'utf-8'
      );
    } else {
      console.log(`\n[D] 급상승 키워드 없음 (데이터 축적 중...)`);
    }
  }

  // === [C] 주간 트렌드 리포트 (일요일 또는 수동) ===
  if (mode === 'weekly') {
    const allWeekArticles = Object.values(history.days).flat();
    const weekGrouped = {};
    for (const a of allWeekArticles) {
      if (!weekGrouped[a.category]) weekGrouped[a.category] = [];
      weekGrouped[a.category].push(a);
    }
    const { report } = generateWeeklyReport(allWeekArticles, weekGrouped);
    const wrPath = path.join(OUTPUT_DIR, `${today}-weekly-report.md`);
    fs.writeFileSync(wrPath, report, 'utf-8');
    console.log(`\n[C] 주간 리포트 → output/${today}-weekly-report.md`);
    console.log('--- 미리보기 ---');
    console.log(report.substring(0, 500) + '...\n');
  }

  // === [G] 요일별 심층 브리핑 (평일) ===
  if (mode === 'daily' || mode === 'deep') {
    const dayOfWeek = new Date().getDay();
    const result = generateDeepDive(dayOfWeek, articles, grouped);
    if (result) {
      const ddPath = path.join(OUTPUT_DIR, `${today}-deep-${result.category.replace('/', '-')}.md`);
      fs.writeFileSync(ddPath, result.briefing, 'utf-8');
      console.log(`\n[G] 심층 브리핑 (${result.category}) → ${path.basename(ddPath)}`);
      console.log(`    ${result.count}건 분석 완료`);
    } else {
      console.log(`\n[G] 오늘은 주말 — 심층 브리핑 스킵`);
    }
  }

  console.log('\n=== 완료 ===\n');
}

main().catch(console.error);
