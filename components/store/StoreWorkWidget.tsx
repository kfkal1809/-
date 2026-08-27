"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { WORK_TAP_TARGET } from "@/lib/domain/constants";

export function StoreWorkWidget({ storeSlug, tasks }: { storeSlug: string; tasks: string[] }) {
  const router = useRouter();
  // 서버 렌더링 시점엔 항상 첫 번째 task로 고정해두고, 마운트 후(클라이언트에서만)
  // 무작위로 골라야 한다 — 서버/클라이언트가 각자 다른 난수로 다른 문구를 렌더링하면
  // React hydration mismatch가 나서 트리 전체가 버려지고 다시 렌더링된다.
  const [task, setTask] = useState(tasks[0]);
  useEffect(() => {
    // 마운트 후 1회만 무작위로 바꾼다 — 캐스케이딩 렌더 경고 대상인 "매 렌더마다 갱신"이
    // 아니라 hydration을 깨지 않기 위해 의도적으로 초기값(tasks[0])을 유지했다가 딱 한 번만
    // 클라이언트에서 바꾸는 것이다.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTask(tasks[Math.floor(Math.random() * tasks.length)]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [taps, setTaps] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ reward: number; propReward: { name: string } | null } | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleTap() {
    if (submitting || result) return;
    const nextTaps = taps + 1;
    setTaps(nextTaps);
    if (nextTaps < WORK_TAP_TARGET) return;

    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/store/work", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storeSlug, taskLabel: task }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "failed");
      setResult({ reward: data.reward, propReward: data.propReward });
      router.refresh();
    } catch (e) {
      setError(e instanceof Error && e.message === "already_worked_today" ? "오늘은 이미 알바를 했어요." : "알바에 실패했어요.");
      setTaps(0);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card className="flex flex-col items-center gap-2 !p-4 text-center">
      <p className="text-[13px] font-bold text-[var(--color-navy-soft)]">오늘의 알바</p>
      <p className="text-[16px] font-extrabold text-[var(--color-navy)]">{task}</p>

      {result ? (
        <div>
          <p className="text-[14px] font-bold text-[var(--color-mint-deep)]">+${result.reward} 받았어요!</p>
          {result.propReward && <p className="text-[12px] text-[var(--color-navy-soft)]">보너스: {result.propReward.name}</p>}
        </div>
      ) : (
        <button
          onClick={handleTap}
          disabled={submitting}
          className="mt-1 rounded-full bg-[var(--color-coral)] px-6 py-2.5 text-[14px] font-bold text-white active:scale-95"
        >
          {submitting ? "처리 중..." : `탭하기 (${taps}/${WORK_TAP_TARGET})`}
        </button>
      )}
      {error && <p className="text-[12px] font-bold text-[var(--color-danger)]">{error}</p>}
    </Card>
  );
}
