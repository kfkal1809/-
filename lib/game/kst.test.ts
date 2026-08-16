import { describe, it, expect } from "vitest";
import { kstDateString, daysSinceKstDate, formatKoreanDate } from "@/lib/game/kst";

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
