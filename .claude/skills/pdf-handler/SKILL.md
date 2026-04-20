---
name: pdf-handler
description: PDF 파일을 읽고, 생성하고, 수정하는 스킬. 사용자가 PDF에서 텍스트/표/이미지를 추출하거나, 새 PDF를 만들거나, 기존 PDF를 편집(페이지 병합, 분할, 회전, 워터마크 추가 등)하려 할 때 사용한다. PDF, 문서 변환, 텍스트 추출, 페이지 조작, PDF 생성 등의 키워드가 나오면 이 스킬을 적극 활용할 것.
---

# PDF Handler

PDF 파일의 읽기, 생성, 수정을 위한 종합 스킬.

## 의존성 설치

작업 시작 전 필요한 Python 패키지가 설치되어 있는지 확인하고, 없으면 설치한다:

```bash
pip install pypdf reportlab pdfplumber
```

- **pypdf**: PDF 읽기, 병합, 분할, 페이지 조작 (경량, 순수 Python)
- **reportlab**: PDF 생성 (텍스트, 표, 그래프, 이미지 등)
- **pdfplumber**: PDF에서 텍스트/표 정밀 추출 (위치 정보 포함)

## PDF 읽기

### 텍스트 추출

Claude Code의 `Read` 도구로 PDF를 직접 읽을 수 있다 (20페이지 이하). 하지만 다음 경우에는 Python 스크립트를 사용한다:

- 표(table) 데이터를 구조화해서 추출할 때
- 텍스트의 위치(좌표) 정보가 필요할 때
- 20페이지 이상의 대용량 PDF를 처리할 때
- 여러 PDF를 일괄 처리할 때

**텍스트 추출 (pdfplumber)**:
```python
import pdfplumber

with pdfplumber.open("input.pdf") as pdf:
    for page in pdf.pages:
        text = page.extract_text()
        print(text)
```

**표 추출 (pdfplumber)**:
```python
import pdfplumber

with pdfplumber.open("input.pdf") as pdf:
    for page in pdf.pages:
        tables = page.extract_tables()
        for table in tables:
            for row in table:
                print(row)
```

### 메타데이터 읽기

```python
from pypdf import PdfReader

reader = PdfReader("input.pdf")
info = reader.metadata
print(f"제목: {info.title}")
print(f"작성자: {info.author}")
print(f"페이지 수: {len(reader.pages)}")
```

## PDF 생성

### reportlab 기본 패턴

한글을 포함하는 PDF를 생성할 때는 폰트 설정이 핵심이다.

**한글 폰트 설정 (macOS)**:
```python
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors

# macOS 기본 한글 폰트 등록
pdfmetrics.registerFont(TTFont('AppleGothic', '/System/Library/Fonts/Supplemental/AppleGothic.ttf'))

# 한글 스타일 정의
styles = getSampleStyleSheet()
korean_style = ParagraphStyle(
    'Korean',
    parent=styles['Normal'],
    fontName='AppleGothic',
    fontSize=11,
    leading=16,
)
```

**문서 생성 기본 흐름**:
```python
doc = SimpleDocTemplate("output.pdf", pagesize=A4)
elements = []

# 제목
title_style = ParagraphStyle('Title_KR', parent=styles['Title'], fontName='AppleGothic')
elements.append(Paragraph("문서 제목", title_style))
elements.append(Spacer(1, 12))

# 본문
elements.append(Paragraph("본문 내용입니다.", korean_style))

# 표
data = [['이름', '나이', '직업'], ['홍길동', '30', '개발자'], ['김영희', '25', '디자이너']]
table = Table(data)
table.setStyle(TableStyle([
    ('FONTNAME', (0, 0), (-1, -1), 'AppleGothic'),
    ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
    ('GRID', (0, 0), (-1, -1), 1, colors.black),
]))
elements.append(table)

doc.build(elements)
```

## PDF 수정 (페이지 조작)

### 페이지 병합

```python
from pypdf import PdfWriter

writer = PdfWriter()
for pdf_path in ["file1.pdf", "file2.pdf"]:
    writer.append(pdf_path)
writer.write("merged.pdf")
```

### 페이지 분할 (특정 페이지 추출)

```python
from pypdf import PdfReader, PdfWriter

reader = PdfReader("input.pdf")
writer = PdfWriter()

# 1, 3, 5번째 페이지만 추출 (0-indexed)
for page_num in [0, 2, 4]:
    writer.add_page(reader.pages[page_num])
writer.write("extracted.pdf")
```

### 페이지 회전

```python
from pypdf import PdfReader, PdfWriter

reader = PdfReader("input.pdf")
writer = PdfWriter()

for page in reader.pages:
    page.rotate(90)  # 시계방향 90도
    writer.add_page(page)
writer.write("rotated.pdf")
```

### 워터마크 추가

```python
from pypdf import PdfReader, PdfWriter

reader = PdfReader("input.pdf")
watermark = PdfReader("watermark.pdf")
writer = PdfWriter()

for page in reader.pages:
    page.merge_page(watermark.pages[0])
    writer.add_page(page)
writer.write("watermarked.pdf")
```

### PDF 암호화

```python
from pypdf import PdfWriter

writer = PdfWriter()
writer.append("input.pdf")
writer.encrypt("password123")
writer.write("encrypted.pdf")
```

## 작업 흐름 가이드

1. 사용자가 원하는 작업 유형을 파악한다 (읽기 / 생성 / 수정)
2. 필요한 패키지가 설치되어 있는지 확인한다
3. 위 패턴을 참고하여 Python 스크립트를 작성하고 실행한다
4. 결과 PDF를 `open` 명령으로 열어서 사용자가 확인할 수 있게 한다

## 주의사항

- 한글 PDF 생성 시 반드시 한글 폰트를 등록해야 한다. macOS에서는 AppleGothic, Linux에서는 NanumGothic 등을 사용한다.
- 스캔된 PDF(이미지 기반)는 pdfplumber로 텍스트 추출이 안 된다. 이 경우 OCR(pytesseract 등)이 필요하며, 사용자에게 안내한다.
- 대용량 PDF 처리 시 메모리를 고려하여 페이지 단위로 처리한다.
- 생성된 PDF는 항상 `open` 명령으로 열어 결과를 확인한다.
