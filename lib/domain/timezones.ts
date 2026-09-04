// 항해일지의 "국가별 시차" — 무거운 타임존 라이브러리(moment-timezone 등) 없이, 원양상선이
// 자주 오가는 주요 기항국 UTC 오프셋만 하드코딩한 작은 상수 테이블로 계산한다. 서머타임처럼
// 계절에 따라 바뀌는 나라는 대략값(가장 흔한 표준시 기준)만 쓴다 — 항해일지 참고용 재미
// 요소라 초 단위 정확도는 필요 없다는 판단.
export interface CountryOffset {
  code: string;
  label: string;
  utcOffsetHours: number;
}

export const COUNTRY_OFFSETS: CountryOffset[] = [
  { code: "kr", label: "대한민국", utcOffsetHours: 9 },
  { code: "cn", label: "중국", utcOffsetHours: 8 },
  { code: "jp", label: "일본", utcOffsetHours: 9 },
  { code: "sg", label: "싱가포르", utcOffsetHours: 8 },
  { code: "ae", label: "아랍에미리트", utcOffsetHours: 4 },
  { code: "sa", label: "사우디아라비아", utcOffsetHours: 3 },
  { code: "in", label: "인도", utcOffsetHours: 5.5 },
  { code: "au", label: "호주(시드니)", utcOffsetHours: 10 },
  { code: "nl", label: "네덜란드", utcOffsetHours: 1 },
  { code: "de", label: "독일", utcOffsetHours: 1 },
  { code: "gb", label: "영국", utcOffsetHours: 0 },
  { code: "us-west", label: "미국(서부)", utcOffsetHours: -8 },
  { code: "us-east", label: "미국(동부)", utcOffsetHours: -5 },
  { code: "br", label: "브라질", utcOffsetHours: -3 },
  { code: "eg", label: "이집트", utcOffsetHours: 2 },
  { code: "za", label: "남아프리카공화국", utcOffsetHours: 2 },
  { code: "pa", label: "파나마", utcOffsetHours: -5 },
  { code: "my", label: "말레이시아", utcOffsetHours: 8 },
];

export const KST_OFFSET_HOURS = 9;

export function hourDiffFromKst(utcOffsetHours: number): number {
  return utcOffsetHours - KST_OFFSET_HOURS;
}
