// 서버 기준 KST(UTC+9) 날짜 문자열 — 출석/승선 계산은 전부 이 기준을 따른다.
export function kstDateString(date: Date = new Date()): string {
  const utcMs = date.getTime() + date.getTimezoneOffset() * 60000;
  const kst = new Date(utcMs + 9 * 60 * 60 * 1000);
  return kst.toISOString().slice(0, 10);
}

// KST 기준 date 문자열(YYYY-MM-DD)로부터 오늘까지 지난 일수. 컴포넌트 렌더 본문에서
// Date.now()를 직접 호출하지 않도록 헬퍼로 분리한다.
export function daysSinceKstDate(dateStr: string): number {
  const start = new Date(dateStr + "T00:00:00+09:00");
  return Math.floor((Date.now() - start.getTime()) / 86400000);
}
