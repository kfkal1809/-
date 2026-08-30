import type { ClothingTabKey } from "@/lib/domain/clothingStoreCategories";

// tabs는 호출부(ClothingStoreScreen)가 실제 상품이 1개 이상 있는 탭만 걸러서 넘긴다 — 하의/
// 신발처럼 독립 레이어 에셋이 없어 영원히 비어 있는 탭을 사용자에게 클릭하게 해놓고 "아직
// 상품이 없어요"만 보여주는 대신, 애초에 탭 자체를 노출하지 않는다.
export function ClothingTabs({
  tabs,
  active,
  onChange,
}: {
  tabs: { key: ClothingTabKey; label: string }[];
  active: ClothingTabKey;
  onChange: (tab: ClothingTabKey) => void;
}) {
  return (
    <div className="scrollbar-none -mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          className={`shrink-0 rounded-full px-3.5 py-1.5 text-[13px] font-bold ${
            active === tab.key ? "bg-[var(--color-tab-active)] text-white" : "bg-white text-[var(--color-navy-soft)]"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
