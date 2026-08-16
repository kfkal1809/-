import Image from "next/image";
import { itemIconSrc } from "@/lib/domain/itemIcons";
import type { ClothingProduct } from "@/lib/game/clothingStoreData";

export function ClothingProductCard({
  product,
  previewed,
  onClick,
}: {
  product: ClothingProduct;
  previewed: boolean;
  onClick: () => void;
}) {
  const src = itemIconSrc(product.sku);
  const owned = product.ownedInventoryItemIds.length > 0;

  return (
    <button
      onClick={onClick}
      className={`relative flex flex-col items-center gap-1 rounded-2xl border-2 bg-white p-2.5 text-center ${
        previewed ? "border-[var(--color-tab-active)]" : "border-transparent"
      }`}
    >
      {product.isNew && (
        <span className="absolute left-1.5 top-1.5 rounded-full bg-[var(--color-sky-new)] px-1.5 py-0.5 text-[9px] font-extrabold text-white">
          NEW
        </span>
      )}
      {product.isEquipped && (
        <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--color-mint-deep)] text-white">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </span>
      )}
      <div className="flex h-14 w-full items-center justify-center">
        {src ? (
          <Image src={src} alt="" width={80} height={80} unoptimized style={{ maxHeight: "100%", width: "auto", objectFit: "contain" }} />
        ) : (
          <div className="flex h-full w-full items-center justify-center rounded-xl bg-[var(--color-sky)] text-[10px] font-bold text-[var(--color-navy)]">
            {product.name.slice(0, 2)}
          </div>
        )}
      </div>
      <p className="line-clamp-1 text-[11px] font-bold text-[var(--color-navy)]">{product.name}</p>
      <p className="text-[12px] font-extrabold text-[var(--color-coral)]">${product.price}</p>
      {owned && !product.isEquipped && <p className="text-[9px] font-bold text-[var(--color-navy-soft)]">보유중</p>}
    </button>
  );
}
