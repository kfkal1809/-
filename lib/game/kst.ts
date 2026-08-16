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

// "2026년 8월 16일" 형식으로 표시 (승선확인증 등 인쇄용 문구에 사용).
// dateStr(YYYY-MM-DD)은 이미 KST 기준 날짜이므로, Date 객체의 로컬 getter를 거치지 않고
// 문자열에서 바로 값을 뽑는다 — 서버가 UTC로 도는 배포 환경(Vercel 기본값)에서
// new Date(...).getDate() 등을 쓰면 KST 00~09시 사이에 하루 밀려 나오는 버그가 있었음.
export function formatKoreanDate(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  return `${y}년 ${m}월 ${d}일`;
}
