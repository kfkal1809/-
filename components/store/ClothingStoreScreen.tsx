"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { GameIcon } from "@/components/icons/GameIcon";
import { BackButton } from "@/components/store/BackButton";
import { ClothingFittingRoom } from "@/components/store/ClothingFittingRoom";
import { ClothingTabs } from "@/components/store/ClothingTabs";
import { ClothingProductCard } from "@/components/store/ClothingProductCard";
import { ClothingStoreDetail } from "@/components/store/ClothingStoreDetail";
import { playSfx } from "@/lib/audio/audioManager";
import { bodyPresetKeyFor, resolveAppearancePatch } from "@/lib/domain/itemAppearanceVariants";
import type { ClothingTabKey } from "@/lib/domain/clothingStoreCategories";
import type { ClothingStoreData, ClothingProduct } from "@/lib/game/clothingStoreData";
import type { CharacterAppearance } from "@/lib/domain/characterPresets";

export function ClothingStoreScreen({ data }: { data: ClothingStoreData }) {
  const router = useRouter();
  const [tab, setTab] = useState<ClothingTabKey>("all");
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [previewAppearance, setPreviewAppearance] = useState<CharacterAppearance | null>(data.equippedAppearance);
  const [products, setProducts] = useState(data.products);
  const [balance, setBalance] = useState(data.balance);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  // 렌더 중 이전 data와 비교해서 상태를 맞추는 React 공식 패턴("Adjusting state when a prop
  // changes") — effect를 안 써서 리렌더 캐스케이드가 없다. 서버에서 새 data가 올 때마다
  // (구매 후 router.refresh() 등) products/balance는 항상 동기화하되, "캐릭터를 바꿨을
  // 때만" preview를 리셋한다 — 구매 직후의 refresh로 미리보기가 원래 착용 상태로
  // 되돌아가면 안 되기 때문.
  const [prevData, setPrevData] = useState(data);
  if (data !== prevData) {
    setPrevData(data);
    setProducts(data.products);
    setBalance(data.balance);
    if (data.selectedCharacterId !== prevData.selectedCharacterId) {
      setPreviewAppearance(data.equippedAppearance);
      setSelectedProductId(null);
    }
  }

  const filtered = useMemo(() => (tab === "all" ? products : products.filter((p) => p.tab === tab)), [products, tab]);
  const selected = products.find((p) => p.catalogItemId === selectedProductId) ?? null;
  const bodyPresetKey = useMemo(
    () => bodyPresetKeyFor(data.selectedKind, data.selectedChildGender, data.selectedChildStage),
    [data.selectedKind, data.selectedChildGender, data.selectedChildStage]
  );

  function previewProduct(product: ClothingProduct) {
    playSfx("ui-click");
    // 서버 목록 단계에서 이미 이 캐릭터 체형과 호환되는 상품만 내려오지만, 클라이언트에서도
    // 한 번 더 확인해서 일치하는 variant가 없으면 다른 체형 그림으로 대체하지 않고 안전하게
    // 처리한다.
    const patch = resolveAppearancePatch(product.sku, bodyPresetKey);
    if (patch === null) {
      setMessage("이 체형에서는 착용할 수 없는 아이템이에요.");
      return;
    }
    setSelectedProductId(product.catalogItemId);
    setPreviewAppearance((prev) => (prev ? { ...prev, ...patch } : prev));
  }

  function switchCharacter(characterId: string) {
    playSfx("ui-click");
    router.push(`/stores/clothing?characterId=${characterId}`);
  }

  async function handleEquip() {
    if (!selected || busy || selected.ownedInventoryItemIds.length === 0 || selected.isEquipped || !data.selectedCharacterId) return;
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch("/api/character/equip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ characterId: data.selectedCharacterId, inventoryItemId: selected.ownedInventoryItemIds[0] }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error ?? "failed");
      setPreviewAppearance(result.appearance);
      setProducts((prev) => prev.map((p) => (p.category === selected.category ? { ...p, isEquipped: p.catalogItemId === selected.catalogItemId } : p)));
      playSfx("equip");
      setMessage(`${selected.name}을(를) 착용했어요!`);
      router.refresh();
    } catch {
      setMessage("착용에 실패했어요.");
    } finally {
      setBusy(false);
    }
  }

  async function handleBuy() {
    if (!selected || busy || selected.ownedInventoryItemIds.length > 0) return;
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch("/api/store/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storeSlug: "clothing", catalogItemId: selected.catalogItemId }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error ?? "failed");
      setBalance(result.balance ?? balance - selected.price);
      setMessage(`구매 완료! ${selected.name}을(를) 가방에 넣었어요.`);
      playSfx("purchase");
      router.refresh();
    } catch (e) {
      setMessage(e instanceof Error && e.message === "insufficient_funds" ? "선용금이 부족해요." : "구매에 실패했어요.");
    } finally {
      setBusy(false);
    }
  }

  if (data.characters.length === 0 || !previewAppearance) {
    return (
      <div className="flex flex-col gap-3 px-4 pt-5">
        <div className="flex items-center gap-3">
          <BackButton />
          <div className="flex-1 rounded-full border-2 border-dashed border-[var(--color-navy)]/15 bg-white py-2 text-center text-[16px] font-extrabold text-[var(--color-navy)]">
            옷가게
          </div>
        </div>
        <p className="py-10 text-center text-[13px] text-[var(--color-navy-soft)]">로그인 후 이용할 수 있어요.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 px-4 pt-5">
      <div className="flex items-center gap-3">
        <BackButton />
        <div className="flex-1 rounded-full border-2 border-dashed border-[var(--color-navy)]/15 bg-white py-2 text-center text-[16px] font-extrabold text-[var(--color-navy)]">
          옷가게
        </div>
        <div className="flex shrink-0 items-center gap-1 rounded-full bg-white px-2.5 py-1.5 shadow-[0_4px_14px_rgba(36,54,90,0.1)]">
          <GameIcon name="coin" size={18} />
          <span className="text-[13px] font-extrabold text-[var(--color-navy)]">{balance.toLocaleString()}</span>
        </div>
      </div>

      <ClothingFittingRoom
        appearance={previewAppearance}
        kind={data.selectedKind}
        childGender={data.selectedChildGender}
        childStage={data.selectedChildStage}
        characters={data.characters}
        selectedCharacterId={data.selectedCharacterId}
        onSwitchCharacter={switchCharacter}
      />

      <ClothingTabs active={tab} onChange={setTab} />

      {filtered.length === 0 ? (
        <p className="py-8 text-center text-[13px] text-[var(--color-navy-soft)]">이 카테고리엔 아직 상품이 없어요.</p>
      ) : (
        <div className="grid grid-cols-4 gap-2">
          {filtered.map((p) => (
            <ClothingProductCard key={p.catalogItemId} product={p} previewed={selectedProductId === p.catalogItemId} onClick={() => previewProduct(p)} />
          ))}
        </div>
      )}

      {message && <p className="text-center text-[13px] font-bold text-[var(--color-navy)]">{message}</p>}

      <div className="pb-4">
        <ClothingStoreDetail product={selected} balance={balance} busy={busy} onEquip={handleEquip} onBuy={handleBuy} />
      </div>
    </div>
  );
}
