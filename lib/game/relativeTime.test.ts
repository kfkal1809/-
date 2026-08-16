import { describe, it, expect } from "vitest";
import { relativeTimeKorean } from "@/lib/game/relativeTime";

describe("relativeTimeKorean", () => {
  const now = new Date("2026-08-16T12:00:00.000Z").getTime();

  it("1분 미만은 방금 전", () => {
    expect(relativeTimeKorean(new Date(now - 30_000).toISOString(), now)).toBe("방금 전");
  });

  it("분 단위로 표시한다", () => {
    expect(relativeTimeKorean(new Date(now - 5 * 60_000).toISOString(), now)).toBe("5분 전");
  });

  it("시간 단위로 표시한다", () => {
    expect(relativeTimeKorean(new Date(now - 2 * 3_600_000).toISOString(), now)).toBe("2시간 전");
  });

  it("일 단위로 표시한다", () => {
    expect(relativeTimeKorean(new Date(now - 3 * 86_400_000).toISOString(), now)).toBe("3일 전");
  });
});
