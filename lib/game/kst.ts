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

// KST 기준 ISO 8601 주차 문자열("2026-W33") — 주간 미션(mission_progress.period_key)에 사용.
// kstDateString과 마찬가지로 서버 로컬 타임존에 영향받는 Date 로컬 getter(.getDate() 등)는
// 쓰지 않고, "Z" 접미사로 고정한 UTC 기준 getter(.getUTCDate() 등)만 사용해 배포 환경(UTC)에서도
// 항상 같은 결과가 나오게 한다.
export function kstWeekString(date: Date = new Date()): string {
  const d = new Date(kstDateString(date) + "T00:00:00Z");
  const dayNum = (d.getUTCDay() + 6) % 7; // 월요일=0 ~ 일요일=6
  d.setUTCDate(d.getUTCDate() - dayNum + 3); // 해당 주의 목요일로 이동(ISO 8601 규칙)
  const isoYear = d.getUTCFullYear();
  const jan4 = new Date(Date.UTC(isoYear, 0, 4));
  const jan4DayNum = (jan4.getUTCDay() + 6) % 7;
  const week1Monday = new Date(jan4);
  week1Monday.setUTCDate(jan4.getUTCDate() - jan4DayNum);
  const diffDays = Math.round((d.getTime() - week1Monday.getTime()) / 86400000);
  const weekNum = Math.floor(diffDays / 7) + 1;
  return `${isoYear}-W${String(weekNum).padStart(2, "0")}`;
}

// "2026년 8월 16일" 형식으로 표시 (승선확인증 등 인쇄용 문구에 사용).
// dateStr(YYYY-MM-DD)은 이미 KST 기준 날짜이므로, Date 객체의 로컬 getter를 거치지 않고
// 문자열에서 바로 값을 뽑는다 — 서버가 UTC로 도는 배포 환경(Vercel 기본값)에서
// new Date(...).getDate() 등을 쓰면 KST 00~09시 사이에 하루 밀려 나오는 버그가 있었음.
export function formatKoreanDate(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  return `${y}년 ${m}월 ${d}일`;
}
