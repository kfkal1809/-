"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { WORK_TAP_TARGET } from "@/lib/domain/constants";

export function StoreWorkWidget({ storeSlug, tasks }: { storeSlug: string; tasks: string[] }) {
  const router = useRouter();
  const [task] = useState(() => tasks[Math.floor(Math.random() * tasks.length)]);
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
