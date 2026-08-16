import { describe, it, expect } from "vitest";
import { kstDateString, daysSinceKstDate, formatKoreanDate, kstWeekString } from "@/lib/game/kst";

describe("kstDateString", () => {
  it("KST 자정 직전 UTC 시각도 다음 날(KST 기준)로 반환한다", () => {
    // 2026-01-01 15:00 UTC = 2026-01-02 00:00 KST
    const d = new Date("2026-01-01T15:00:00.000Z");
    expect(kstDateString(d)).toBe("2026-01-02");
  });

  it("KST 자정 직후는 같은 날로 반환한다", () => {
    // 2026-01-01 15:00:01 UTC = 2026-01-02 00:00:01 KST
    const d = new Date("2026-01-01T15:00:01.000Z");
    expect(kstDateString(d)).toBe("2026-01-02");
  });

  it("UTC 자정 무렵에도 KST 기준으로 날짜가 하루 앞선다", () => {
    // 2026-06-15 00:30 UTC = 2026-06-15 09:30 KST
    const d = new Date("2026-06-15T00:30:00.000Z");
    expect(kstDateString(d)).toBe("2026-06-15");
  });
});

describe("daysSinceKstDate", () => {
  it("같은 날짜면 0을 반환한다", () => {
    const today = kstDateString();
    expect(daysSinceKstDate(today)).toBe(0);
  });

  it("과거 날짜는 양수를 반환한다", () => {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() - 10);
    expect(daysSinceKstDate(kstDateString(d))).toBeGreaterThanOrEqual(9);
  });
});

describe("formatKoreanDate", () => {
  it("YYYY년 M월 D일 형식으로 변환한다 (0 패딩 없음)", () => {
    expect(formatKoreanDate("2026-08-05")).toBe("2026년 8월 5일");
    expect(formatKoreanDate("2026-12-25")).toBe("2026년 12월 25일");
  });
});

describe("kstWeekString", () => {
  it("같은 ISO 주 안의 날짜는 같은 주차 문자열을 반환한다", () => {
    // 2026-08-10(월) ~ 2026-08-16(일)은 모두 같은 ISO 주
    const mon = new Date("2026-08-10T04:00:00.000Z"); // KST 13:00
    const sun = new Date("2026-08-16T10:00:00.000Z"); // KST 19:00
    expect(kstWeekString(mon)).toBe(kstWeekString(sun));
  });

  it("주가 바뀌면 다른 주차 문자열을 반환한다", () => {
    const thisWeek = new Date("2026-08-10T04:00:00.000Z");
    const nextWeek = new Date("2026-08-17T04:00:00.000Z");
    expect(kstWeekString(thisWeek)).not.toBe(kstWeekString(nextWeek));
  });

  it("연도 경계(ISO 8601 규칙)에서도 올바른 주차를 계산한다", () => {
    // 2025-12-29(월)는 ISO 기준 2026년 1주차
    const d = new Date("2025-12-29T04:00:00.000Z");
    expect(kstWeekString(d)).toBe("2026-W01");
  });
});
