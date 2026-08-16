"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { MESS_ROOM_MENU } from "@/lib/domain/constants";
import { RARITY_LABEL } from "@/lib/domain/types";
import { playSfx } from "@/lib/audio/audioManager";

export function MessRoomOrder() {
  const router = useRouter();
  const [ordering, setOrdering] = useState<string | null>(null);
  const [result, setResult] = useState<{ name: string; rarity: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleOrder(menuKey: string) {
    setOrdering(menuKey);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/restaurant/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ menuKey }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "failed");
      setResult(data.reward);
      playSfx("food");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error && e.message === "insufficient_funds" ? "선용금이 부족해요." : "주문에 실패했어요.");
    } finally {
      setOrdering(null);
    }
  }

  return (
    <div className="flex flex-col gap-2.5 px-4 pb-2">
      {result && (
        <Card tone="cream" className="text-center !py-3">
          <p className="text-[14px] font-bold text-[var(--color-navy)]">
            {result.name} 획득! ({RARITY_LABEL[result.rarity as keyof typeof RARITY_LABEL] ?? result.rarity})
          </p>
        </Card>
      )}
      {error && <p className="text-center text-[13px] font-bold text-[var(--color-danger)]">{error}</p>}

      {MESS_ROOM_MENU.map((m) => (
        <Card key={m.key} className="flex items-center justify-between !p-3">
          <div>
            <p className="text-[14px] font-bold text-[var(--color-navy)]">{m.name}</p>
            <p className="text-[12px] text-[var(--color-navy-soft)]">{m.description}</p>
          </div>
          <button
            onClick={() => handleOrder(m.key)}
            disabled={ordering !== null}
            className="rounded-full bg-[var(--color-coral)] px-4 py-2 text-[13px] font-bold text-white disabled:opacity-50"
          >
            {ordering === m.key ? "먹는 중..." : `$${m.price}`}
          </button>
        </Card>
      ))}
    </div>
  );
}
