"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function RingBuyButton({ sku, price }: { sku: string; price: number }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleBuy() {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/jewelry/buy-ring", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sku }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "failed");
      setMessage("구매 완료!");
      router.refresh();
    } catch (e) {
      setMessage(e instanceof Error && e.message === "insufficient_funds" ? "선용금이 부족해요." : "구매에 실패했어요.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={handleBuy}
        disabled={loading}
        className="rounded-full bg-[var(--color-coral)] px-3 py-1.5 text-[13px] font-extrabold text-white disabled:opacity-50"
      >
        {loading ? "구매 중..." : `$${price} 구매`}
      </button>
      {message && <p className="text-[11px] font-bold text-[var(--color-navy-soft)]">{message}</p>}
    </div>
  );
}
