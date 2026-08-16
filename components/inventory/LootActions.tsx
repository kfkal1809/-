"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function LootActions({ inventoryItemId, subcategory }: { inventoryItemId: string; subcategory: string | null }) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function call(action: "sell" | "cook" | "restore") {
    setLoading(action);
    setMessage(null);
    try {
      const res = await fetch(`/api/loot/${action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inventoryItemId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error === "insufficient_funds" ? "선용금이 부족해요." : "처리에 실패했어요.");
        return;
      }
      if (action === "sell") setMessage(`+$${data.earned}`);
      else if (action === "cook") setMessage(data.reward ? `${data.reward.name} 획득!` : "조리 완료");
      else if (action === "restore") setMessage(data.message);
      router.refresh();
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="mt-1 flex w-full flex-col gap-1">
      {message && <p className="text-center text-[10px] font-bold text-[var(--color-navy)]">{message}</p>}
      <div className="flex w-full gap-1">
        <button
          onClick={() => call("sell")}
          disabled={loading !== null}
          className="flex-1 rounded-full bg-[var(--color-sky)] py-1 text-[11px] font-bold text-[var(--color-navy)]"
        >
          판매
        </button>
        {subcategory === "fish" && (
          <button
            onClick={() => call("cook")}
            disabled={loading !== null}
            className="flex-1 rounded-full bg-[var(--color-mint)] py-1 text-[11px] font-bold text-[var(--color-navy)]"
          >
            조리
          </button>
        )}
        {subcategory === "lost" && (
          <button
            onClick={() => call("restore")}
            disabled={loading !== null}
            className="flex-1 rounded-full bg-[var(--color-gold)] py-1 text-[11px] font-bold text-white"
          >
            복원
          </button>
        )}
      </div>
    </div>
  );
}
