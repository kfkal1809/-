"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { WORK_TAP_TARGET } from "@/lib/domain/constants";

// 예전엔 태스크 하나를 무작위로 골라 그것만 4번 탭하게 했다 — "다양한 알바를 하고 싶다"는
// 요청으로, 이제 태스크 전체를 작은 버튼으로 나열해서 원하는 걸 직접 골라 탭할 수 있게
// 한다. 실제로는 여전히 하루 1회만 성공한다(store_work_logs unique(store_id,user_id,
// work_date) 게이트는 그대로) — 어떤 버튼을 눌러도 그 하나만 완료되면 나머지는 잠긴다.
export function StoreWorkWidget({ storeSlug, tasks }: { storeSlug: string; tasks: string[] }) {
  const router = useRouter();
  const [activeTask, setActiveTask] = useState<string | null>(null);
  const [taps, setTaps] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ reward: number; propReward: { name: string } | null } | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleTap(task: string) {
    if (submitting || result) return;

    const nextTaps = activeTask === task ? taps + 1 : 1;
    setActiveTask(task);
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
      setActiveTask(null);
      setTaps(0);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card className="flex flex-col items-center gap-2 !p-4 text-center">
      <p className="text-[13px] font-bold text-[var(--color-navy-soft)]">오늘의 알바 — 하고 싶은 일을 골라 탭해보세요</p>

      {result ? (
        <div>
          <p className="text-[14px] font-bold text-[var(--color-mint-deep)]">+${result.reward} 받았어요!</p>
          {result.propReward && <p className="text-[12px] text-[var(--color-navy-soft)]">보너스: {result.propReward.name}</p>}
        </div>
      ) : (
        <div className="grid w-full grid-cols-3 gap-1.5">
          {tasks.map((task) => {
            const isActive = activeTask === task;
            return (
              <button
                key={task}
                onClick={() => handleTap(task)}
                disabled={submitting}
                className={`rounded-xl px-2 py-2 text-[11px] font-bold leading-tight active:scale-95 disabled:opacity-60 ${
                  isActive ? "bg-[var(--color-coral)] text-white" : "bg-[var(--color-cream)] text-[var(--color-navy)]"
                }`}
              >
                {task}
                {isActive && ` (${taps}/${WORK_TAP_TARGET})`}
              </button>
            );
          })}
        </div>
      )}
      {error && <p className="text-[12px] font-bold text-[var(--color-danger)]">{error}</p>}
    </Card>
  );
}
