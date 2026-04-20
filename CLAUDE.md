# 프로젝트 개요

한국어 단일 HTML 파일 기반의 금융 도구 웹앱 모음 프로젝트.

## 기술 스택

- 단일 HTML 파일 (HTML + CSS + JS 인라인)
- 외부 라이브러리/CDN 사용 가능 (Chart.js 등)
- 프레임워크 없음 (Vanilla JS)
- 반응형 모바일 우선 디자인

## 디자인 시스템

- **스타일**: 토스(Toss) 앱 스타일의 깔끔한 한국형 핀테크 UI
- **색상 팔레트**:
  - Primary: #3182f6 (토스 블루)
  - Background: #f2f4f6
  - Card: #ffffff, border-radius 20px, box-shadow 0 4px 24px rgba(0,0,0,0.06)
  - Text: #191f28 (주), #8b95a1 (보조)
  - Success/상승: #f04452 (빨강, 한국 주식 관례)
  - Danger/하락: #1a73e8 (파랑, 한국 주식 관례)
- **폰트**: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif
- **카드 기반 레이아웃**: max-width 520px 중앙 정렬, 모바일 우선
- **인터랙션**: 부드러운 트랜지션(0.2s ease), 호버/액티브 피드백

## 코딩 규칙

- 모든 UI 텍스트는 한국어
- 숫자 포맷: 한국식 (1,000원, 12.5%)
- 날짜 포맷: YYYY.MM.DD
- 주석은 최소한으로, 코드가 자명하게 작성
- 접근성: input에 label, 적절한 aria 속성
- 금액 입력 시 콤마 자동 포맷팅

## 파일 구조

- 각 도구는 독립된 단일 HTML 파일
- 파일명: kebab-case (예: loan-calculator.html, crypto-dashboard.html)
