"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export function AttendanceCard({
  initialAttended,
  isDemo,
  onBalanceChange,
}: {
  initialAttended: boolean;
  isDemo: boolean;
  onBalanceChange?: (balance: number) => void;
}) {
  const [attended, setAttended] = useState(initialAttended);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  async function handleBoard() {
    if (attended || loading) return;
    setLoading(true);
    setToast(null);

    if (isDemo) {
      setTimeout(() => {
        setAttended(true);
        setToast("금일 정상 승선 완료 · 선용금 지급 완료 +$1");
        setLoading(false);
      }, 400);
      return;
    }

    try {
      const res = await fetch("/api/attendance/app", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "출항 실패");
      setAttended(true);
      onBalanceChange?.(data.balance);
      setToast(
        data.already ? "이미 오늘 출항했어요." : "금일 정상 승선 완료 · 선용금 지급 완료 +$1"
      );
    } catch {
      setToast("출항에 실패했어요. 잠시 후 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card tone="cream" className="relative flex items-center justify-between !p-3.5">
      <div>
        <p className="text-[13px] font-bold text-[var(--color-navy)]">오늘도 출항할까요?</p>
        {toast && <p className="mt-0.5 text-[11px] text-[var(--color-navy-soft)]">{toast}</p>}
      </div>
      <Button
        tone={attended ? "outline" : "mint"}
        onClick={handleBoard}
        disabled={attended || loading}
        className="!px-4 !py-2 text-[13px]"
      >
        {attended ? "출항 완료" : "출항하기 +$1"}
      </Button>
    </Card>
  );
}
