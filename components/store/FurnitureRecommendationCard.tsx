import Image from "next/image";
import { itemIconSrc } from "@/lib/domain/itemIcons";
import type { FurnitureStoreProduct } from "@/lib/game/furnitureStoreData";

export function FurnitureRecommendationCard({ product, onClick }: { product: FurnitureStoreProduct; onClick: () => void }) {
  const src = itemIconSrc(product.sku);
  return (
    <button
      onClick={onClick}
      className="flex w-24 shrink-0 flex-col items-center gap-1 rounded-2xl border-2 border-dashed border-[var(--color-gold-deep)]/50 bg-[var(--color-cream)] p-2 text-center"
    >
      <p className="text-[10px] font-extrabold text-[var(--color-gold-deep)]">오늘의 추천</p>
      <div className="flex h-12 w-full items-center justify-center">
        {src && (
          <Image src={src} alt="" width={60} height={60} unoptimized style={{ maxHeight: "100%", width: "auto", objectFit: "contain" }} />
        )}
      </div>
      <p className="line-clamp-1 text-[10px] font-bold text-[var(--color-navy)]">{product.name}</p>
    </button>
  );
}
