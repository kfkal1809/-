"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";

// 낚시 실시간 타이밍 미니게임: 막대 위를 왕복하는 커서가 목표 구간을 지나는 순간 탭하면 성공.
// 목표 구간 폭(TARGET_WIDTH_PCT)과 왕복 주기(PERIOD_MS)로 난이도를 조절한다 — 너무 쉽지
// 않도록 목표 구간을 좁게, 그렇다고 반응이 불가능할 만큼 빠르지는 않게 잡았다. 목표 구간
// 위치는 시행마다 무작위라 위치를 외워서 풀 수 없다.
const PERIOD_MS = 1300;
const TARGET_WIDTH_PCT = 16;
const TIME_LIMIT_MS = 4500;

function indicatorPosition(elapsedMs: number): number {
  const t = (elapsedMs % PERIOD_MS) / PERIOD_MS;
  return t < 0.5 ? t * 2 * 100 : (1 - t) * 2 * 100;
}

export function FishingCatchGame({ label, onResult }: { label: string; onResult: (success: boolean) => void }) {
  const [targetStart] = useState(() => 6 + Math.random() * (100 - TARGET_WIDTH_PCT - 12));
  const [position, setPosition] = useState(0);
  const startRef = useRef<number | null>(null);
  const doneRef = useRef(false);
  const frameRef = useRef(0);

  useEffect(() => {
    function tick(now: number) {
      if (startRef.current === null) startRef.current = now;
      const elapsed = now - startRef.current;
      setPosition(indicatorPosition(elapsed));
      if (elapsed >= TIME_LIMIT_MS) {
        finish(false);
        return;
      }
      frameRef.current = requestAnimationFrame(tick);
    }
    frameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function finish(success: boolean) {
    if (doneRef.current) return;
    doneRef.current = true;
    cancelAnimationFrame(frameRef.current);
    onResult(success);
  }

  function handleTap() {
    if (doneRef.current || startRef.current === null) return;
    const elapsed = performance.now() - startRef.current;
    const pos = indicatorPosition(elapsed);
    const success = pos >= targetStart && pos <= targetStart + TARGET_WIDTH_PCT;
    finish(success);
  }

  return (
    <div className="fixed inset-x-0 bottom-24 z-50 flex justify-center px-4">
      <div className="w-full max-w-sm rounded-2xl border border-[var(--color-navy)]/10 bg-white/95 p-4 shadow-[0_8px_24px_rgba(36,54,90,0.25)] backdrop-blur">
        <p className="mb-2 text-center text-[13px] font-bold text-[var(--color-navy)]">{label} 입질이 왔어요! 표시 구간에서 당겨보세요</p>
        <div className="relative h-6 w-full overflow-hidden rounded-full bg-[var(--color-sky-deep)]">
          <div className="absolute inset-y-0 rounded-full bg-[var(--color-mint)]" style={{ left: `${targetStart}%`, width: `${TARGET_WIDTH_PCT}%` }} />
          <div
            className="absolute top-1/2 h-6 w-[3px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--color-coral-deep)]"
            style={{ left: `${position}%` }}
          />
        </div>
        <Button tone="coral" full className="mt-3" onClick={handleTap}>
          지금 당기기!
        </Button>
      </div>
    </div>
  );
}
