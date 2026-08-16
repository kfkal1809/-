import Image from "next/image";
import { itemIconSrc } from "@/lib/domain/itemIcons";
import { getPlacementDef } from "@/lib/domain/cabinPlacement";
import type { FurnitureStoreProduct } from "@/lib/game/furnitureStoreData";

// 가구상점 쇼룸 — 실제 선실 배치를 바꾸지 않는 순수 client state 미리보기. 선실과 같은
// getPlacementDef(baseHeightFrac)를 재사용해서 침대/책상/화분의 실제 상대 크기 차이가
// 상점 미리보기에도 그대로 드러나게 한다.
export function FurnitureStorePreview({
  product,
  onPrev,
  onNext,
}: {
  product: FurnitureStoreProduct | null;
  onPrev: () => void;
  onNext: () => void;
}) {
  const def = product ? getPlacementDef(product.sku) : null;
  const src = product ? itemIconSrc(product.sku) : null;

  return (
    <div className="relative flex h-44 items-center justify-center overflow-hidden rounded-[24px] bg-gradient-to-b from-[var(--color-cream)] to-[var(--color-sky)]">
      <button
        onClick={onPrev}
        aria-label="이전 상품"
        className="absolute left-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-[var(--color-navy)] shadow"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>

      <div className="absolute bottom-4 h-3 w-24 rounded-full bg-black/10 blur-[2px]" />

      {product && src && def ? (
        <div style={{ height: `${def.baseHeightFrac * 2.4 * 100}%`, display: "flex", alignItems: "flex-end" }}>
          <Image src={src} alt="" width={400} height={400} unoptimized style={{ height: "100%", width: "auto", objectFit: "contain" }} />
        </div>
      ) : (
        <p className="text-[13px] font-bold text-[var(--color-navy-soft)]">상품을 선택해보세요</p>
      )}

      <button
        onClick={onNext}
        aria-label="다음 상품"
        className="absolute right-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-[var(--color-navy)] shadow"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 18l6-6-6-6" />
        </svg>
      </button>
    </div>
  );
}
