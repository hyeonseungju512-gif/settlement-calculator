/**
 * 정산 계산기 - Google Sheets 세팅 스크립트
 *
 * 사용법:
 * 1. 새 Google Sheets 생성
 * 2. 확장 프로그램 > Apps Script
 * 3. 이 코드를 붙여넣기
 * 4. setupSheet() 함수 실행
 */

function setupSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // 기존 시트 정리
  const existing = ss.getSheets();

  // 시트 생성
  createSettlementSheet(ss);
  createDailySummarySheet(ss);
  createMonthlySummarySheet(ss);

  // 기본 Sheet1 삭제 (시트가 2개 이상일 때만)
  if (ss.getSheets().length > 1) {
    existing.forEach(s => {
      if (s.getName() === 'Sheet1' || s.getName() === '시트1') {
        try { ss.deleteSheet(s); } catch(e) {}
      }
    });
  }

  SpreadsheetApp.flush();
  ss.getSheetByName('정산표').activate();
}

function createSettlementSheet(ss) {
  let sheet = ss.getSheetByName('정산표');
  if (!sheet) sheet = ss.insertSheet('정산표');
  sheet.clear();

  // 열 너비 설정
  sheet.setColumnWidth(1, 40);   // 완료
  sheet.setColumnWidth(2, 140);  // 일시
  sheet.setColumnWidth(3, 100);  // 닉네임
  sheet.setColumnWidth(4, 80);   // 시세
  sheet.setColumnWidth(5, 120);  // 원화
  sheet.setColumnWidth(6, 100);  // 총 USDT
  sheet.setColumnWidth(7, 80);   // CS%
  sheet.setColumnWidth(8, 80);   // CS
  sheet.setColumnWidth(9, 80);   // 삼국지%
  sheet.setColumnWidth(10, 80);  // 삼국지
  sheet.setColumnWidth(11, 80);  // 소개자%
  sheet.setColumnWidth(12, 80);  // 소개자
  sheet.setColumnWidth(13, 100); // 수익금

  // 헤더
  const headers = ['완료', '일시', '닉네임', '시세', '원화', '총 USDT', 'CS%', 'CS', '삼국지%', '삼국지', '소개자%', '소개자', '수익금'];
  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setValues([headers]);
  headerRange.setBackground('#3182f6');
  headerRange.setFontColor('#ffffff');
  headerRange.setFontWeight('bold');
  headerRange.setHorizontalAlignment('center');
  headerRange.setFontSize(10);

  // 데이터 영역 (2행~201행, 200건)
  const dataRows = 200;
  const startRow = 2;

  // 완료 체크박스
  const checkRange = sheet.getRange(startRow, 1, dataRows, 1);
  checkRange.insertCheckboxes();
  checkRange.setHorizontalAlignment('center');

  // 일시 서식
  sheet.getRange(startRow, 2, dataRows, 1).setNumberFormat('yyyy.mm.dd hh:mm');

  // 원화 서식 (콤마)
  sheet.getRange(startRow, 5, dataRows, 1).setNumberFormat('#,##0');

  // 총 USDT 수식: =IF(D2="","",FLOOR(E2/D2,1))
  for (let r = startRow; r < startRow + dataRows; r++) {
    sheet.getRange(r, 6).setFormula(
      '=IF(D' + r + '="","",FLOOR(E' + r + '/D' + r + ',1))'
    );
  }

  // CS 수식: =IF(F2="","",FLOOR(F2*G2/100,1))
  for (let r = startRow; r < startRow + dataRows; r++) {
    sheet.getRange(r, 8).setFormula(
      '=IF(F' + r + '="","",FLOOR(F' + r + '*G' + r + '/100,1))'
    );
  }

  // 삼국지 수식: =IF(F2="","",FLOOR(F2*I2/100,1))
  for (let r = startRow; r < startRow + dataRows; r++) {
    sheet.getRange(r, 10).setFormula(
      '=IF(F' + r + '="","",FLOOR(F' + r + '*I' + r + '/100,1))'
    );
  }

  // 소개자 수식: =IF(F2="","",FLOOR(F2*K2/100,1))
  for (let r = startRow; r < startRow + dataRows; r++) {
    sheet.getRange(r, 12).setFormula(
      '=IF(F' + r + '="","",FLOOR(F' + r + '*K' + r + '/100,1))'
    );
  }

  // 수익금 수식: =IF(H2="","",H2-J2-L2)
  for (let r = startRow; r < startRow + dataRows; r++) {
    sheet.getRange(r, 13).setFormula(
      '=IF(H' + r + '="","",FLOOR(H' + r + '-J' + r + '-L' + r + ',1))'
    );
  }

  // USDT 관련 열 정수 서식
  [6, 8, 10, 12, 13].forEach(col => {
    sheet.getRange(startRow, col, dataRows, 1).setNumberFormat('#,##0');
  });

  // % 열 서식
  [7, 9, 11].forEach(col => {
    sheet.getRange(startRow, col, dataRows, 1).setNumberFormat('0.0');
  });

  // 누계 행
  const totalRow = startRow + dataRows;
  const totalRange = sheet.getRange(totalRow, 1, 1, 13);
  totalRange.setBackground('#f2f4f6');
  totalRange.setFontWeight('bold');
  sheet.getRange(totalRow, 1).setValue('전체 누계');
  sheet.getRange(totalRow, 1, 1, 4).merge();

  // 누계 수식
  const lastDataRow = startRow + dataRows - 1;
  sheet.getRange(totalRow, 5).setFormula('=SUM(E' + startRow + ':E' + lastDataRow + ')');
  sheet.getRange(totalRow, 6).setFormula('=SUM(F' + startRow + ':F' + lastDataRow + ')');
  sheet.getRange(totalRow, 8).setFormula('=SUM(H' + startRow + ':H' + lastDataRow + ')');
  sheet.getRange(totalRow, 10).setFormula('=SUM(J' + startRow + ':J' + lastDataRow + ')');
  sheet.getRange(totalRow, 12).setFormula('=SUM(L' + startRow + ':L' + lastDataRow + ')');
  sheet.getRange(totalRow, 13).setFormula('=SUM(M' + startRow + ':M' + lastDataRow + ')');

  // 누계 서식
  sheet.getRange(totalRow, 5).setNumberFormat('#,##0');
  [6, 8, 10, 12, 13].forEach(col => {
    sheet.getRange(totalRow, col).setNumberFormat('#,##0');
  });

  // 수익금 열 조건부 서식 (양수: 빨강, 음수: 파랑)
  const profitRange = sheet.getRange(startRow, 13, dataRows + 1, 1);
  const positiveRule = SpreadsheetApp.newConditionalFormatRule()
    .whenNumberGreaterThan(0)
    .setFontColor('#f04452')
    .setRanges([profitRange])
    .build();
  const negativeRule = SpreadsheetApp.newConditionalFormatRule()
    .whenNumberLessThan(0)
    .setFontColor('#1a73e8')
    .setRanges([profitRange])
    .build();

  // 완료 행 회색 처리 조건부 서식
  const dataRange = sheet.getRange(startRow, 1, dataRows, 13);
  const completedRule = SpreadsheetApp.newConditionalFormatRule()
    .whenFormulaSatisfied('=$A' + startRow + '=TRUE')
    .setBackground('#f2f4f6')
    .setFontColor('#b0b8c1')
    .setRanges([dataRange])
    .build();

  sheet.setConditionalFormatRules([positiveRule, negativeRule, completedRule]);

  // 헤더 고정
  sheet.setFrozenRows(1);

  // 닉네임 데이터 검증 (드롭다운) - 나중에 수동 추가
  // 필터 활성화
  if (!sheet.getFilter()) {
    sheet.getRange(1, 1, totalRow, 13).createFilter();
  }
}

function createDailySummarySheet(ss) {
  let sheet = ss.getSheetByName('일별 정산');
  if (!sheet) sheet = ss.insertSheet('일별 정산');
  sheet.clear();

  const headers = ['날짜', '건수', '원화 합계', '총 USDT', 'CS', '삼국지', '소개자', '수익금'];
  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setValues([headers]);
  headerRange.setBackground('#3182f6');
  headerRange.setFontColor('#ffffff');
  headerRange.setFontWeight('bold');
  headerRange.setHorizontalAlignment('center');

  sheet.setColumnWidth(1, 120);
  sheet.setColumnWidth(2, 60);
  sheet.setColumnWidth(3, 120);
  for (let c = 4; c <= 8; c++) sheet.setColumnWidth(c, 100);

  // UNIQUE 날짜 + SUMIFS 수식 (정산표 기준)
  // 2행부터 수동 입력 또는 아래 자동 생성 함수 사용
  const note = '이 시트는 자동 갱신됩니다.\n메뉴 > 정산 도구 > 일별 정산 갱신을 실행하세요.';
  sheet.getRange(2, 1).setNote(note);

  // 서식
  sheet.setFrozenRows(1);

  // 수익금 조건부 서식
  const profitRange = sheet.getRange(2, 8, 365, 1);
  const posRule = SpreadsheetApp.newConditionalFormatRule()
    .whenNumberGreaterThan(0)
    .setFontColor('#f04452')
    .setRanges([profitRange])
    .build();
  const negRule = SpreadsheetApp.newConditionalFormatRule()
    .whenNumberLessThan(0)
    .setFontColor('#1a73e8')
    .setRanges([profitRange])
    .build();
  sheet.setConditionalFormatRules([posRule, negRule]);
}

function createMonthlySummarySheet(ss) {
  let sheet = ss.getSheetByName('월별 정산');
  if (!sheet) sheet = ss.insertSheet('월별 정산');
  sheet.clear();

  const headers = ['월', '건수', '원화 합계', '총 USDT', 'CS', '삼국지', '소개자', '수익금'];
  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setValues([headers]);
  headerRange.setBackground('#3182f6');
  headerRange.setFontColor('#ffffff');
  headerRange.setFontWeight('bold');
  headerRange.setHorizontalAlignment('center');

  sheet.setColumnWidth(1, 100);
  sheet.setColumnWidth(2, 60);
  sheet.setColumnWidth(3, 120);
  for (let c = 4; c <= 8; c++) sheet.setColumnWidth(c, 100);

  sheet.setFrozenRows(1);

  const profitRange = sheet.getRange(2, 8, 60, 1);
  const posRule = SpreadsheetApp.newConditionalFormatRule()
    .whenNumberGreaterThan(0)
    .setFontColor('#f04452')
    .setRanges([profitRange])
    .build();
  const negRule = SpreadsheetApp.newConditionalFormatRule()
    .whenNumberLessThan(0)
    .setFontColor('#1a73e8')
    .setRanges([profitRange])
    .build();
  sheet.setConditionalFormatRules([posRule, negRule]);
}

/**
 * 일별/월별 정산 자동 갱신
 * 정산표 데이터를 읽어서 일별/월별 시트에 집계
 */
function refreshSummaries() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const src = ss.getSheetByName('정산표');
  if (!src) return;

  const lastRow = src.getLastRow();
  if (lastRow < 2) return;

  // 정산표 데이터 읽기 (헤더 제외)
  const dataRange = src.getRange(2, 2, lastRow - 1, 12); // B~M
  const values = dataRange.getValues();

  const daily = {};
  const monthly = {};

  values.forEach(row => {
    const dateVal = row[0]; // 일시
    if (!dateVal) return;

    const d = new Date(dateVal);
    if (isNaN(d)) return;

    const dateKey = Utilities.formatDate(d, Session.getScriptTimeZone(), 'yyyy-MM-dd');
    const monthKey = Utilities.formatDate(d, Session.getScriptTimeZone(), 'yyyy-MM');

    const krw = Number(row[3]) || 0;     // 원화 (E열 = index 3)
    const usdt = Number(row[4]) || 0;    // 총 USDT (F열 = index 4)
    const cs = Number(row[6]) || 0;      // CS (H열 = index 6)
    const samguk = Number(row[8]) || 0;  // 삼국지 (J열 = index 8)
    const ref = Number(row[10]) || 0;    // 소개자 (L열 = index 10)
    const profit = Number(row[11]) || 0; // 수익금 (M열 = index 11)

    if (!daily[dateKey]) daily[dateKey] = { count: 0, krw: 0, usdt: 0, cs: 0, samguk: 0, ref: 0, profit: 0 };
    daily[dateKey].count++;
    daily[dateKey].krw += krw;
    daily[dateKey].usdt += usdt;
    daily[dateKey].cs += cs;
    daily[dateKey].samguk += samguk;
    daily[dateKey].ref += ref;
    daily[dateKey].profit += profit;

    if (!monthly[monthKey]) monthly[monthKey] = { count: 0, krw: 0, usdt: 0, cs: 0, samguk: 0, ref: 0, profit: 0 };
    monthly[monthKey].count++;
    monthly[monthKey].krw += krw;
    monthly[monthKey].usdt += usdt;
    monthly[monthKey].cs += cs;
    monthly[monthKey].samguk += samguk;
    monthly[monthKey].ref += ref;
    monthly[monthKey].profit += profit;
  });

  // 일별 시트 쓰기
  const dailySheet = ss.getSheetByName('일별 정산');
  if (dailySheet) {
    dailySheet.getRange(2, 1, dailySheet.getMaxRows() - 1, 8).clear();
    const dailyRows = Object.entries(daily)
      .sort((a, b) => b[0].localeCompare(a[0]))
      .map(([date, v]) => [date, v.count, Math.floor(v.krw), Math.floor(v.usdt), Math.floor(v.cs), Math.floor(v.samguk), Math.floor(v.ref), Math.floor(v.profit)]);

    if (dailyRows.length) {
      dailySheet.getRange(2, 1, dailyRows.length, 8).setValues(dailyRows);
      dailySheet.getRange(2, 3, dailyRows.length, 1).setNumberFormat('#,##0');
      dailySheet.getRange(2, 4, dailyRows.length, 5).setNumberFormat('#,##0');
    }
  }

  // 월별 시트 쓰기
  const monthlySheet = ss.getSheetByName('월별 정산');
  if (monthlySheet) {
    monthlySheet.getRange(2, 1, monthlySheet.getMaxRows() - 1, 8).clear();
    const monthlyRows = Object.entries(monthly)
      .sort((a, b) => b[0].localeCompare(a[0]))
      .map(([month, v]) => [month, v.count, Math.floor(v.krw), Math.floor(v.usdt), Math.floor(v.cs), Math.floor(v.samguk), Math.floor(v.ref), Math.floor(v.profit)]);

    if (monthlyRows.length) {
      monthlySheet.getRange(2, 1, monthlyRows.length, 8).setValues(monthlyRows);
      monthlySheet.getRange(2, 3, monthlyRows.length, 1).setNumberFormat('#,##0');
      monthlySheet.getRange(2, 4, monthlyRows.length, 5).setNumberFormat('#,##0');
    }
  }

  SpreadsheetApp.getUi().alert('일별/월별 정산이 갱신되었습니다.');
}

/**
 * 커스텀 메뉴 추가
 */
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('정산 도구')
    .addItem('시트 초기 세팅', 'setupSheet')
    .addItem('일별/월별 정산 갱신', 'refreshSummaries')
    .addToUi();
}
