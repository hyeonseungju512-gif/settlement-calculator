# 📰 데일리 뉴스 브리핑 시스템

Claude Code + Notion MCP를 활용한 자동 뉴스 수집 및 Notion 데이터베이스 관리 시스템.

## 프로젝트 구조

```
claude-lecture/
├── CLAUDE.md                          # 프로젝트 규칙 및 설계 지침
├── loan-calculator.html               # 대출 계산기 (865줄)
├── settlement-calculator.html         # 정산 계산기 (600줄)
├── neon-dodge/                        # 게임 플랫폼 (Next.js + TypeScript)
│   ├── package.json
│   ├── tsconfig.json
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx              # 게임 목록 페이지
│   │   │   ├── layout.tsx
│   │   │   └── game/[id]/page.tsx    # 게임 플레이 페이지
│   │   ├── components/
│   │   │   └── GameShell.tsx         # 공통 게임 쉘
│   │   └── games/                    # 12개 게임 구현
│   │       ├── registry.ts           # 게임 정보 레지스트리
│   │       ├── neon-dodge.ts
│   │       ├── reaction-tap.ts
│   │       ├── brick-breaker.ts
│   │       ├── memory-flip.ts
│   │       ├── speed-stack.ts
│   │       ├── endless-runner.ts
│   │       ├── bubble-pop.ts
│   │       ├── space-invader.ts
│   │       ├── snake-game.ts
│   │       ├── flappy-jump.ts
│   │       ├── color-match.ts
│   │       └── aim-trainer.ts
│   └── public/
├── .claude/
│   ├── settings.local.json            # Claude Code 로컬 설정
│   ├── agents/
│   │   └── kr-loan-expert.md          # 대출 규제 분석 에이전트
│   └── skills/
│       └── pdf-handler/               # PDF 처리 스킬
└── daily-news-briefing/               # 본 문서
```

## 각 파일/프로젝트 분석 요약

### 1. loan-calculator.html (대출 계산기)
- **규모**: 865줄의 단일 HTML 파일
- **기능**:
  - 대출금액, 금리, 상환기간 입력
  - 원리금균등상환/원금균등상환 방식 선택
  - 월별 상환액, 총이자, 총상환액 계산
  - 결과 시각화 (차트/그래프)
  - 빠른 선택 칩 (100만/500만/1000만 등 사전설정값)
- **UI 특징**:
  - 토스 스타일 핀테크 UI (블루 #3182f6 기준)
  - 카드 기반 레이아웃 (최대 너비 520px)
  - 반응형 모바일 우선 디자인
  - 부드러운 애니메이션 및 트랜지션

### 2. settlement-calculator.html (정산 계산기)
- **규모**: 600줄의 단일 HTML 파일
- **기능**:
  - 탭 인터페이스 (정산 작성 / 통계 조회)
  - 매입처별 정산 기록 추가/삭제
  - 매입가/판매가 입력으로 손익 계산
  - 이체 수수료, 카드 수수료 등 부비용 자동 계산
  - 일별 정산 통계 표시
  - LocalStorage로 데이터 영속성
- **UI 특징**:
  - 같은 토스 스타일 디자인 시스템
  - 탭 전환 (활성/비활성 상태)
  - 수익/손실 색상 구분 (빨강/파랑)
  - 테이블 형식의 기록 관리

### 3. neon-dodge (게임 플랫폼)
- **기술 스택**: Next.js 16.2.3, React 19.2.4, TypeScript 5, Tailwind CSS 4
- **아키텍처**: 게임별 모듈화 구현, GameEngine 인터페이스 기반 표준화, Canvas API 렌더링
- **12개 게임**:
  1. Neon Dodge (⚡ Arcade) — 네온 장애물 피하기
  2. Reaction Tap (🎯 Reflex) — 빠른 반응 테스트
  3. Brick Breaker (🧱 Classic) — 벽돌 깨기
  4. Memory Flip (🃏 Puzzle) — 카드 매칭
  5. Speed Stack (🏗️ Timing) — 블록 쌓기
  6. Endless Runner (🏃 Action) — 무한 달리기
  7. Bubble Pop (🫧 Casual) — 버블 터뜨리기
  8. Space Invader (🚀 Shooter) — 우주 침략자
  9. Snake (🐍 Classic) — 뱀 게임
  10. Flappy Jump (🐤 Action) — 플래피 버드
  11. Color Match (🎨 Brain) — 색상 매칭
  12. Aim Trainer (🔫 Precision) — 30초 조준 연습

## 사용된 기술 스택

### 프론트엔드
| 프로젝트 | 기술 |
|----------|------|
| 계산기 | Vanilla HTML5 + CSS3 + JavaScript (단일 파일) |
| 게임 플랫폼 | Next.js 16.2.3, React 19.2.4, TypeScript 5, Tailwind CSS 4, Canvas API |

### AI / 자동화
| 도구 | 용도 |
|------|------|
| Claude Code | AI 페어 프로그래밍, 파일 생성/수정 |
| Notion MCP | Notion 워크스페이스 연동 (페이지/DB 생성) |
| WebSearch | 실시간 뉴스 수집 |
| CronCreate | 매일 자동 뉴스 업데이트 스케줄 |

### 디자인 시스템
- 토스(Toss) 앱 UI 준용
- Primary: `#3182f6` / Background: `#f2f4f6`
- Success/상승: `#f04452` (빨강) / Danger/하락: `#1a73e8` (파랑) — 한국 주식 관례
- Card shadow: `0 4px 24px rgba(0,0,0,0.06)`
- 모든 UI 텍스트: 한국어 / 숫자: 한국식 포맷

## Notion 연동 정보

### 생성된 페이지 및 데이터베이스

| 항목 | Notion ID | 설명 |
|------|-----------|------|
| 📚 학습 기록 페이지 | `34301247-be32-81a0-99d4-f5fffa1cfe71` | 학습 내용 상위 페이지 |
| 학습 기록 DB | `8cdf8ea2-37b3-4842-b123-f5a6c4e41f95` | 8개 학습 항목 |
| 📰 뉴스 브리핑 페이지 | `34301247-be32-8131-81e7-f8f25b2acc7f` | 뉴스 브리핑 상위 페이지 |
| 뉴스 아카이브 DB | `691af808-3e5e-46a0-8675-22cf57554ff3` | 카테고리별 뉴스 아카이브 |

### 학습 기록 DB 항목 (8건)
1. 대출 계산기 (Loan Calculator)
2. 정산 계산기 (Settlement Calculator)
3. Neon Dodge 게임 플랫폼 (Next.js)
4. 토스(Toss) 스타일 UI 디자인 시스템
5. Claude Code & MCP 도구 활용
6. Vanilla JavaScript 기초
7. Next.js & TypeScript 기초
8. Canvas API & 게임 개발 기초

### 뉴스 아카이브 DB 스키마
| 속성 | 타입 | 옵션 |
|------|------|------|
| 제목 | Title | — |
| 날짜 | Date | — |
| 카테고리 | Select | 한국 정치, 한국 경제, 국제 정치, 글로벌 경제, 기술/AI, 스포츠 |
| 중요도 | Select | 속보, 주요, 일반 |
| 키워드 | Multi Select | 42개 키워드 (아래 참조) |
| 요약 | Rich Text | — |
| 출처 | URL | — |

## 자동화 설정

### 매일 오전 7:03 자동 뉴스 수집
- **스케줄**: `3 7 * * *` (매일 오전 7:03)
- **대상 DB**: `691af808-3e5e-46a0-8675-22cf57554ff3`
- **수집 방식**: WebSearch → 카테고리별 1~2건 선별 → Notion 페이지 등록

### 6개 카테고리 × 42개 키워드

| 카테고리 | 키워드 |
|----------|--------|
| 한국 정치 | 추경, 민생지원금, 개헌, 지방선거, 김건희 재판, 이재명 대통령 |
| 한국 경제 | 고유가, 유가 100달러, 경제성장률 하향, 환율 변동성, 부동산, 물가 상승, 삼성전자 노조 |
| 국제 정치 | 호르무즈 해협 봉쇄, 이란 전쟁, 트럼프 2기, 유럽 정치 위기, 헝가리 총선, 물 부족 위기 |
| 글로벌 경제 | IMF 성장률 하향, LNG 가격 급등, 소비자심리 급락, 관세 전쟁, 글로벌 부채 위기 |
| 기술/AI | Agentic AI, Claude/Anthropic, AI 반도체, 양자컴퓨팅, AI 벤처투자, AI 윤리 |
| 스포츠 | KBO, MLB, EPL, UEFA 챔피언스리그, NBA, 2026 월드컵, 손흥민, 이강인, 김민재, K리그, NFL, F1 |

### 커스텀 에이전트
- **kr-loan-expert.md**: 대한민국 대출 규제 및 금융 규정 분석 전문 에이전트
  - DSR/LTV/DTI 규제 분석
  - 상환 방식별 규정 (원리금균등, 원금균등, 만기일시 등)
  - 정책 대출 종류 (디딤돌대출, 보금자리론 등)

## 참고사항
- 크론 스케줄은 Claude Code 세션 활성 중에만 작동 (7일 후 자동 만료)
- Notion ID/URL은 Notion 워크스페이스 내에서 직접 조회 가능
- 메인 프로젝트는 git 미초기화 상태, neon-dodge는 별도 git 관리
