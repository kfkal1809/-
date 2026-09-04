"use client";

import { useState } from "react";
import { COUNTRY_OFFSETS, hourDiffFromKst } from "@/lib/domain/timezones";

// 무거운 타임존 라이브러리나 API 호출 없이, 하드코딩된 UTC 오프셋 테이블(18개국)로만
// 계산하는 순수 클라이언트 컴포넌트라 성능 부담이 거의 없다 — select 변경 시 숫자 뺄셈
// 한 번뿐.
export function CountryTimeDiff() {
  const [code, setCode] = useState(COUNTRY_OFFSETS[1].code);
  const country = COUNTRY_OFFSETS.find((c) => c.code === code) ?? COUNTRY_OFFSETS[1];
  const diff = hourDiffFromKst(country.utcOffsetHours);

  return (
    <div className="flex flex-col gap-1.5 rounded-2xl bg-[var(--color-sky)] p-3">
      <p className="text-[11px] font-bold text-[var(--color-navy-soft)]">국가별 시차</p>
      <select
        value={code}
        onChange={(e) => setCode(e.target.value)}
        className="rounded-full border border-[var(--color-navy-soft)]/30 bg-white px-3 py-1.5 text-[13px] font-bold text-[var(--color-navy)]"
      >
        {COUNTRY_OFFSETS.map((c) => (
          <option key={c.code} value={c.code}>
            {c.label}
          </option>
        ))}
      </select>
      <p className="text-[13px] font-bold text-[var(--color-navy)]">
        {diff === 0 ? "한국과 시차가 없어요" : diff > 0 ? `한국보다 ${diff}시간 빨라요` : `한국보다 ${Math.abs(diff)}시간 느려요`}
      </p>
    </div>
  );
}
