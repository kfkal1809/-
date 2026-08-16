import Image from "next/image";
import { itemIconSrc } from "@/lib/domain/itemIcons";
import type { ClothingProduct } from "@/lib/game/clothingStoreData";

const FALLBACK_DESCRIPTION = "캐릭터를 꾸며줄 아이템이에요.";

export function ClothingStoreDetail({
  product,
  balance,
  busy,
  onEquip,
  onBuy,
}: {
  product: ClothingProduct | null;
  balance: number;
  busy: boolean;
  onEquip: () => void;
  onBuy: () => void;
}) {
  if (!product) {
    return (
      <div className="flex items-center justify-center rounded-[24px] border-2 border-white bg-white p-4 text-[13px] text-[var(--color-navy-soft)] shadow-[0_6px_20px_rgba(36,54,90,0.08)]">
        상품을 선택해보세요.
      </div>
    );
  }

  const src = itemIconSrc(product.sku);
  const owned = product.ownedInventoryItemIds.length > 0;
  const canAfford = balance >= product.price;

  return (
    <div className="flex items-center gap-3 rounded-[24px] border-2 border-white bg-white p-3 shadow-[0_6px_20px_rgba(36,54,90,0.08)]">
      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[var(--color-sky)]">
        {src && <Image src={src} alt="" width={48} height={48} unoptimized style={{ maxHeight: "80%", width: "auto", objectFit: "contain" }} />}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[14px] font-extrabold text-[var(--color-navy)]">{product.name}</p>
        <p className="line-clamp-1 text-[11px] text-[var(--color-navy-soft)]">{product.description || FALLBACK_DESCRIPTION}</p>
        <div className="mt-0.5 flex items-center gap-2 text-[11px] text-[var(--color-navy-soft)]">
          <span>보유량 {product.ownedInventoryItemIds.length}</span>
          <span className="font-extrabold text-[var(--color-coral)]">${product.price}</span>
        </div>
      </div>
      <div className="flex shrink-0 flex-col gap-1.5">
        <button
          onClick={onEquip}
          disabled={busy || !owned || product.isEquipped}
          className="rounded-full bg-[var(--color-tab-active)] px-3 py-1.5 text-[12px] font-extrabold text-white disabled:opacity-40"
        >
          {product.isEquipped ? "착용중" : "착용하기"}
        </button>
        {!owned && (
          <button
            onClick={onBuy}
            disabled={busy || !canAfford}
            className="rounded-full bg-[var(--color-coral)] px-3 py-1.5 text-[12px] font-extrabold text-white disabled:opacity-50"
          >
            {busy ? "처리 중..." : canAfford ? "구매하기" : "잔액부족"}
          </button>
        )}
      </div>
    </div>
  );
}
