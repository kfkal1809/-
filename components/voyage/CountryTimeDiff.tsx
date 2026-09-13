"use client";

import { useEffect, useState } from "react";
import { COUNTRY_OFFSETS, KST_OFFSET_HOURS, hourDiffFromKst } from "@/lib/domain/timezones";

const STORAGE_KEY = "voyage_country_time_diff_code";

// 헤비한 타임존 라이브러리 없이, 진짜 UTC ms에 오프셋(시간)만 더해 "그 나라 지금 몇 시"를
// 계산한다 — 브라우저 로컬 타임존과 무관하게 항상 같은 결과가 나온다.
function timeStringForOffset(now: Date, offsetHours: number): string {
  const utcMs = now.getTime() + now.getTimezoneOffset() * 60000;
  const target = new Date(utcMs + offsetHours * 3600000);
  const hh = String(target.getUTCHours()).padStart(2, "0");
  const mm = String(target.getUTCMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

export function CountryTimeDiff() {
  const [code, setCode] = useState(COUNTRY_OFFSETS[1].code);
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    // 서버 렌더링 시점엔 항상 기본값(중국)으로 고정해두고, 마운트 후에만 이전에 골라둔
    // 나라를 localStorage에서 복원한다 — 페이지를 오갈 때마다 기본값으로 되돌아가던 버그.
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && COUNTRY_OFFSETS.some((c) => c.code === saved)) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setCode(saved);
      }
    } catch {
      // localStorage 접근 불가(프라이빗 모드 등) — 기본값 유지
    }

    setNow(new Date());
    const timer = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(timer);
  }, []);

  function handleChange(nextCode: string) {
    setCode(nextCode);
    try {
      localStorage.setItem(STORAGE_KEY, nextCode);
    } catch {
      // 저장 실패해도 이번 세션 선택은 그대로 유지된다
    }
  }

  const country = COUNTRY_OFFSETS.find((c) => c.code === code) ?? COUNTRY_OFFSETS[1];
  const diff = hourDiffFromKst(country.utcOffsetHours);

  return (
    <div className="flex flex-col gap-1.5 rounded-2xl bg-[var(--color-sky)] p-3">
      <p className="text-[11px] font-bold text-[var(--color-navy-soft)]">국가별 시차</p>
      <select
        value={code}
        onChange={(e) => handleChange(e.target.value)}
        className="rounded-full border border-[var(--color-navy-soft)]/30 bg-white px-3 py-1.5 text-[13px] font-bold text-[var(--color-navy)]"
      >
        {COUNTRY_OFFSETS.map((c) => (
          <option key={c.code} value={c.code}>
            {c.label}
          </option>
        ))}
      </select>

      <div className="mt-0.5 grid grid-cols-2 gap-2 text-center">
        <div className="rounded-xl bg-white/70 py-1.5">
          <p className="text-[10px] font-bold text-[var(--color-navy-soft)]">대한민국</p>
          <p className="text-[15px] font-extrabold text-[var(--color-navy)]">{now ? timeStringForOffset(now, KST_OFFSET_HOURS) : "--:--"}</p>
        </div>
        <div className="rounded-xl bg-white/70 py-1.5">
          <p className="text-[10px] font-bold text-[var(--color-navy-soft)]">{country.label}</p>
          <p className="text-[15px] font-extrabold text-[var(--color-navy)]">{now ? timeStringForOffset(now, country.utcOffsetHours) : "--:--"}</p>
        </div>
      </div>

      <p className="text-[13px] font-bold text-[var(--color-navy)]">
        {diff === 0 ? "한국과 시차가 없어요" : diff > 0 ? `한국보다 ${diff}시간 빨라요` : `한국보다 ${Math.abs(diff)}시간 느려요`}
      </p>
    </div>
  );
}
