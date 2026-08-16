"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { GameIcon } from "@/components/icons/GameIcon";
import { BackButton } from "@/components/store/BackButton";
import { FurnitureStorePreview } from "@/components/store/FurnitureStorePreview";
import { FurnitureRecommendationCard } from "@/components/store/FurnitureRecommendationCard";
import { FurnitureStoreTabs } from "@/components/store/FurnitureStoreTabs";
import { FurnitureProductCard } from "@/components/store/FurnitureProductCard";
import { FurnitureStoreDetail } from "@/components/store/FurnitureStoreDetail";
import { playSfx } from "@/lib/audio/audioManager";
import type { StoreTabKey } from "@/lib/domain/furnitureStoreCategories";
import type { FurnitureStoreData } from "@/lib/game/furnitureStoreData";

export function FurnitureStoreScreen({ data }: { data: FurnitureStoreData }) {
  const router = useRouter();
  const [tab, setTab] = useState<StoreTabKey>("all");
  const [selectedId, setSelectedId] = useState<string | null>(data.recommendedCatalogItemId ?? data.products[0]?.catalogItemId ?? null);
  const [previewId, setPreviewId] = useState<string | null>(selectedId);
  const [buying, setBuying] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [balance, setBalance] = useState(data.balance);
  const [products, setProducts] = useState(data.products);

  const filtered = useMemo(() => (tab === "all" ? products : products.filter((p) => p.tab === tab)), [products, tab]);
  const selected = products.find((p) => p.catalogItemId === selectedId) ?? null;
  const previewed = products.find((p) => p.catalogItemId === previewId) ?? null;
  const recommended = products.find((p) => p.catalogItemId === data.recommendedCatalogItemId) ?? null;

  function selectProduct(id: string) {
    playSfx("ui-click");
    setSelectedId(id);
  }

  function cyclePreview(direction: 1 | -1) {
    const list = filtered.length > 0 ? filtered : products;
    if (list.length === 0) return;
    const idx = list.findIndex((p) => p.catalogItemId === (previewId ?? selectedId));
    const nextIdx = ((idx < 0 ? 0 : idx) + direction + list.length) % list.length;
    const next = list[nextIdx];
    setPreviewId(next.catalogItemId);
    setSelectedId(next.catalogItemId);
  }

  async function handleBuy() {
    if (!selected || buying) return;
    setBuying(true);
    setMessage(null);
    try {
      const res = await fetch("/api/store/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storeSlug: "furniture", catalogItemId: selected.catalogItemId }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error ?? "failed");
      setBalance(result.balance ?? balance - selected.price);
      setProducts((prev) =>
        prev.map((p) => (p.catalogItemId === selected.catalogItemId ? { ...p, ownedQuantity: p.ownedQuantity + 1 } : p))
      );
      setMessage(`구매 완료! ${selected.name}을(를) 가방에 넣었어요.`);
      playSfx("purchase");
      router.refresh();
    } catch (e) {
      setMessage(e instanceof Error && e.message === "insufficient_funds" ? "선용금이 부족해요." : "구매에 실패했어요.");
    } finally {
      setBuying(false);
    }
  }

  return (
    <div className="flex flex-col gap-3 px-4 pt-5">
      <div className="flex items-center gap-3">
        <BackButton />
        <div className="flex-1 rounded-full border-2 border-dashed border-[var(--color-navy)]/15 bg-white py-2 text-center text-[16px] font-extrabold text-[var(--color-navy)]">
          가구상점
        </div>
        <div className="flex shrink-0 items-center gap-1 rounded-full bg-white px-2.5 py-1.5 shadow-[0_4px_14px_rgba(36,54,90,0.1)]">
          <GameIcon name="coin" size={18} />
          <span className="text-[13px] font-extrabold text-[var(--color-navy)]">{balance.toLocaleString()}</span>
        </div>
      </div>

      <div className="flex gap-2">
        <div className="flex-1">
          <FurnitureStorePreview product={previewed} onPrev={() => cyclePreview(-1)} onNext={() => cyclePreview(1)} />
        </div>
        {recommended && (
          <FurnitureRecommendationCard
            product={recommended}
            onClick={() => {
              selectProduct(recommended.catalogItemId);
              setPreviewId(recommended.catalogItemId);
            }}
          />
        )}
      </div>

      <FurnitureStoreTabs active={tab} onChange={setTab} />

      {filtered.length === 0 ? (
        <p className="py-8 text-center text-[13px] text-[var(--color-navy-soft)]">이 카테고리엔 아직 상품이 없어요.</p>
      ) : (
        <div className="grid grid-cols-4 gap-2">
          {filtered.map((p) => (
            <FurnitureProductCard key={p.catalogItemId} product={p} selected={selectedId === p.catalogItemId} onClick={() => selectProduct(p.catalogItemId)} />
          ))}
        </div>
      )}

      {message && <p className="text-center text-[13px] font-bold text-[var(--color-navy)]">{message}</p>}

      <div className="pb-4">
        <FurnitureStoreDetail
          product={selected}
          balance={balance}
          buying={buying}
          onPreview={() => selected && setPreviewId(selected.catalogItemId)}
          onBuy={handleBuy}
        />
      </div>
    </div>
  );
}
