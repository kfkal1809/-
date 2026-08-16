"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { playSfx } from "@/lib/audio/audioManager";

export function MissionClaimButton({ missionKey, reward }: { missionKey: string; reward: number }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(false);

  async function handleClaim() {
    if (submitting) return;
    setSubmitting(true);
    setError(false);
    try {
      const res = await fetch("/api/duties/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ missionKey }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "failed");
      // 서버가 지급을 확정한 뒤에만 재생 — 실패/중복 요청 시 소리가 울리지 않게 한다.
      playSfx("mission-complete");
      router.refresh();
    } catch {
      setError(true);
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={handleClaim}
        disabled={submitting}
        className="rounded-full bg-[var(--color-coral)] px-4 py-1.5 text-[13px] font-extrabold text-white active:scale-95 disabled:opacity-60"
      >
        {submitting ? "수령 중..." : `+$${reward} 받기`}
      </button>
      {error && <p className="text-[11px] font-bold text-[var(--color-danger)]">수령 실패</p>}
    </div>
  );
}
