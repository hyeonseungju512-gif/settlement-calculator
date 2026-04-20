/**
 * 노션 동기화 스크립트
 *
 * Claude Code에서 실행할 프롬프트를 생성합니다.
 * 노션 MCP를 통해 기사를 노션 DB에 저장합니다.
 *
 * 사용법:
 *   node notion-sync.js articles   → 기사를 노션 DB에 저장
 *   node notion-sync.js newsletter → 뉴스레터 초안을 노션 페이지로 생성
 *   node notion-sync.js weekly     → 주간 리포트를 노션 페이지로 생성
 *   node notion-sync.js deep       → 심층 브리핑을 노션 페이지로 생성
 */

const fs = require('fs');
const path = require('path');
const { NOTION_DB } = require('./config');

const OUTPUT_DIR = path.join(__dirname, 'output');
const today = new Date().toISOString().split('T')[0];

function loadJSON(filename) {
  const filepath = path.join(OUTPUT_DIR, filename);
  if (!fs.existsSync(filepath)) {
    console.error(`파일 없음: ${filepath}`);
    console.error('먼저 "node run.js daily" 를 실행하세요.');
    process.exit(1);
  }
  return JSON.parse(fs.readFileSync(filepath, 'utf-8'));
}

function loadMarkdown(filename) {
  const filepath = path.join(OUTPUT_DIR, filename);
  if (!fs.existsSync(filepath)) return null;
  return fs.readFileSync(filepath, 'utf-8');
}

// 기사 → 노션 DB 저장 프롬프트 생성
function generateArticlePrompt() {
  const articles = loadJSON(`${today}-articles.json`);
  const surges = fs.existsSync(path.join(OUTPUT_DIR, `${today}-surges.json`))
    ? loadJSON(`${today}-surges.json`)
    : [];

  const surgeKeywords = new Set(surges.map(s => s.keyword));

  console.log(`\n=== 노션 저장 프롬프트 (${articles.length}건) ===\n`);
  console.log(`다음 ${articles.length}건의 뉴스를 노션 데이터베이스(ID: ${NOTION_DB.newsArchive})에 저장해주세요.\n`);
  console.log('각 기사의 속성:');
  console.log('- 제목 (Title): 기사 제목');
  console.log('- 날짜 (Date): 발행일');
  console.log('- 카테고리 (Select): 한국 정치/한국 경제/국제 정치/글로벌 경제/기술·AI/스포츠');
  console.log('- 중요도 (Select): 속보/주요/일반');
  console.log('- 키워드 (Multi Select): 매칭된 키워드');
  console.log('- 요약 (Rich Text): 기사 내용 요약');
  console.log('- 출처 (URL): 기사 링크');
  console.log('');

  // 속보/주요 먼저 출력
  const priority = articles.filter(a => a.importance !== '일반');
  const normal = articles.filter(a => a.importance === '일반');

  for (const a of [...priority, ...normal]) {
    const surgeTag = a.isSurge ? ' [급상승]' : '';
    console.log(`---`);
    console.log(`제목: ${a.title}${surgeTag}`);
    console.log(`날짜: ${a.date}`);
    console.log(`카테고리: ${a.category}`);
    console.log(`중요도: ${a.importance}`);
    console.log(`키워드: ${a.keywords.join(', ')}`);
    console.log(`요약: ${a.summary}`);
    console.log(`출처: ${a.source}`);
  }

  if (surges.length > 0) {
    console.log('\n=== 급상승 키워드 ===');
    for (const s of surges) {
      console.log(`  🔥 ${s.keyword}: 오늘 ${s.todayCount}회 (7일 평균 ${s.weeklyAvg}회, ${s.ratio}배)`);
    }
  }
}

// 뉴스레터 → 노션 페이지 생성 프롬프트
function generateNewsletterPrompt() {
  const newsletter = loadMarkdown(`${today}-newsletter.md`);
  if (!newsletter) {
    console.error('뉴스레터 파일 없음. 먼저 "node run.js daily"를 실행하세요.');
    return;
  }
  console.log(`\n=== 뉴스레터 노션 페이지 생성 ===\n`);
  console.log(`노션 뉴스 브리핑 페이지(ID: ${NOTION_DB.briefingPage}) 하위에`);
  console.log(`"${today} 뉴스레터" 제목으로 새 페이지를 생성하고 아래 내용을 넣어주세요:\n`);
  console.log(newsletter);
}

// 주간 리포트 → 노션 페이지 생성 프롬프트
function generateWeeklyPrompt() {
  const report = loadMarkdown(`${today}-weekly-report.md`);
  if (!report) {
    console.error('주간 리포트 파일 없음. 먼저 "node run.js weekly"를 실행하세요.');
    return;
  }
  console.log(`\n=== 주간 리포트 노션 페이지 생성 ===\n`);
  console.log(`노션 뉴스 브리핑 페이지(ID: ${NOTION_DB.briefingPage}) 하위에`);
  console.log(`"${today} 주간 트렌드 리포트" 제목으로 새 페이지를 생성하고 아래 내용을 넣어주세요:\n`);
  console.log(report);
}

// 심층 브리핑 → 노션 페이지 생성 프롬프트
function generateDeepPrompt() {
  const files = fs.readdirSync(OUTPUT_DIR).filter(f => f.startsWith(`${today}-deep-`));
  if (files.length === 0) {
    console.error('심층 브리핑 파일 없음. 먼저 "node run.js daily"를 실행하세요.');
    return;
  }
  const briefing = fs.readFileSync(path.join(OUTPUT_DIR, files[0]), 'utf-8');
  console.log(`\n=== 심층 브리핑 노션 페이지 생성 ===\n`);
  console.log(`노션 뉴스 브리핑 페이지(ID: ${NOTION_DB.briefingPage}) 하위에`);
  console.log(`"${today} 심층 브리핑" 제목으로 새 페이지를 생성하고 아래 내용을 넣어주세요:\n`);
  console.log(briefing);
}

const mode = process.argv[2] || 'articles';
switch (mode) {
  case 'articles': generateArticlePrompt(); break;
  case 'newsletter': generateNewsletterPrompt(); break;
  case 'weekly': generateWeeklyPrompt(); break;
  case 'deep': generateDeepPrompt(); break;
  default:
    console.log('사용법: node notion-sync.js [articles|newsletter|weekly|deep]');
}
