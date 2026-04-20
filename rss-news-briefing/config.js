// RSS 피드 소스 설정
const RSS_FEEDS = [
  // 종합
  { name: '연합뉴스 전체', url: 'https://www.yna.co.kr/rss/news.xml', category: '종합' },
  { name: '연합뉴스 정치', url: 'https://www.yna.co.kr/rss/politics.xml', category: '한국 정치' },
  { name: '조선일보', url: 'https://www.chosun.com/arc/outboundfeeds/rss/?outputType=xml', category: '종합' },
  { name: '경향신문', url: 'https://www.khan.co.kr/rss/rssdata/total_news.xml', category: '종합' },
  // 경제
  { name: '연합뉴스 경제', url: 'https://www.yna.co.kr/rss/economy.xml', category: '한국 경제' },
  { name: '매일경제', url: 'https://www.mk.co.kr/rss/30000001/', category: '한국 경제' },
  { name: '한국경제 경제', url: 'https://www.hankyung.com/feed/economy', category: '한국 경제' },
  // 국제
  { name: '연합뉴스 국제', url: 'https://www.yna.co.kr/rss/international.xml', category: '국제 정치' },
  // 기술/IT
  { name: '한국경제 IT', url: 'https://www.hankyung.com/feed/it', category: '기술/AI' },
  { name: '지디넷코리아', url: 'https://zdnet.co.kr/feed/', category: '기술/AI' },
];

// 카테고리별 키워드 (42개)
const KEYWORDS = {
  '한국 정치': ['추경', '민생지원금', '개헌', '지방선거', '김건희 재판', '이재명 대통령'],
  '한국 경제': ['고유가', '유가 100달러', '경제성장률 하향', '환율 변동성', '부동산', '물가 상승', '삼성전자 노조'],
  '국제 정치': ['호르무즈 해협 봉쇄', '이란 전쟁', '트럼프 2기', '유럽 정치 위기', '헝가리 총선', '물 부족 위기'],
  '글로벌 경제': ['IMF 성장률 하향', 'LNG 가격 급등', '소비자심리 급락', '관세 전쟁', '글로벌 부채 위기'],
  '기술/AI': ['Agentic AI', 'Claude', 'Anthropic', 'AI 반도체', '양자컴퓨팅', 'AI 벤처투자', 'AI 윤리'],
  '스포츠': ['KBO', 'MLB', 'EPL', 'UEFA 챔피언스리그', 'NBA', '2026 월드컵', '손흥민', '이강인', '김민재', 'K리그', 'NFL', 'F1'],
};

// 모든 키워드를 플랫 배열로
const ALL_KEYWORDS = Object.values(KEYWORDS).flat();

// 카테고리 매핑 (RSS 카테고리 → 노션 카테고리)
const CATEGORY_MAP = {
  '종합': null, // 키워드 기반으로 자동 분류
  '한국 정치': '한국 정치',
  '한국 경제': '한국 경제',
  '국제 정치': '국제 정치',
  '글로벌 경제': '글로벌 경제',
  '기술/AI': '기술/AI',
  '스포츠': '스포츠',
};

// 노션 DB ID
const NOTION_DB = {
  newsArchive: '691af808-3e5e-46a0-8675-22cf57554ff3',
  briefingPage: '34301247-be32-8131-81e7-f8f25b2acc7f',
};

// 요일별 심층 브리핑 카테고리
const DAILY_DEEP_DIVE = {
  1: '한국 경제',   // 월요일
  2: '한국 정치',   // 화요일
  3: '기술/AI',     // 수요일
  4: '국제 정치',   // 목요일
  5: '스포츠',      // 금요일
};

module.exports = {
  RSS_FEEDS,
  KEYWORDS,
  ALL_KEYWORDS,
  CATEGORY_MAP,
  NOTION_DB,
  DAILY_DEEP_DIVE,
};
