import { CLOTHING_TABS, type ClothingTabKey } from "@/lib/domain/clothingStoreCategories";

export function ClothingTabs({ active, onChange }: { active: ClothingTabKey; onChange: (tab: ClothingTabKey) => void }) {
  return (
    <div className="scrollbar-none -mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1">
      {CLOTHING_TABS.map((tab) => (
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
