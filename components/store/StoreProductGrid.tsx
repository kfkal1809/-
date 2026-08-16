"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { GameIcon } from "@/components/icons/GameIcon";
import { itemIconSrc } from "@/lib/domain/itemIcons";
import type { StoreProduct } from "@/lib/game/storeData";

export function StoreProductGrid({ storeSlug, products }: { storeSlug: string; products: StoreProduct[] }) {
  const router = useRouter();
  const [buying, setBuying] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function handleBuy(product: StoreProduct) {
    setBuying(product.catalogItemId);
    setMessage(null);
    try {
      const res = await fetch("/api/store/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storeSlug, catalogItemId: product.catalogItemId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "failed");
      setMessage(`${product.name}을(를) 구매했어요! 선실에 배치할 수 있어요.`);
      router.refresh();
    } catch (e) {
      setMessage(e instanceof Error && e.message === "insufficient_funds" ? "선용금이 부족해요." : "구매에 실패했어요.");
    } finally {
      setBuying(null);
    }
  }

  if (products.length === 0) {
    return <p className="px-4 text-center text-[13px] text-[var(--color-navy-soft)]">아직 진열된 상품이 없어요.</p>;
  }

  return (
    <div className="flex flex-col gap-2 px-4 pb-2">
      {message && <p className="text-center text-[13px] font-bold text-[var(--color-navy)]">{message}</p>}
      <div className="grid grid-cols-2 gap-2.5">
        {products.map((p) => (
          <Card key={p.catalogItemId} className="flex flex-col items-center gap-1.5 !p-3 text-center">
            {itemIconSrc(p.sku) ? (
              <Image src={itemIconSrc(p.sku)!} alt="" width={56} height={56} unoptimized style={{ width: 56, height: 56, objectFit: "contain" }} />
            ) : (
              <GameIcon name="flower" size={44} />
            )}
            <p className="text-[13px] font-bold text-[var(--color-navy)]">{p.name}</p>
            <button
              onClick={() => handleBuy(p)}
              disabled={buying !== null}
              className="w-full rounded-full bg-[var(--color-coral)] py-1.5 text-[13px] font-extrabold text-white disabled:opacity-50"
            >
              {buying === p.catalogItemId ? "구매 중..." : `$${p.price}`}
            </button>
          </Card>
        ))}
      </div>
    </div>
  );
}
