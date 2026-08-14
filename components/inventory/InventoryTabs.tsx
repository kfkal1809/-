"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { NewBadge } from "@/components/ui/NewBadge";
import { RARITY_LABEL, RARITY_STARS } from "@/lib/domain/types";
import { EMPTY_STATE_COPY } from "@/lib/domain/constants";
import type { InventoryItemRow } from "@/lib/game/inventoryData";

const TABS = [
  { key: "outfit", label: "옷" },
  { key: "furniture", label: "가구" },
  { key: "fishing", label: "낚시" },
  { key: "keepsake", label: "소장품" },
  { key: "special", label: "특별" },
] as const;

function matchesTab(item: InventoryItemRow, tabKey: (typeof TABS)[number]["key"]): boolean {
  if (tabKey === "outfit") return ["hair", "outfit", "hat", "accessory"].includes(item.category);
  if (tabKey === "furniture") return item.category === "furniture";
  if (tabKey === "fishing") return item.category === "keepsake" && ["fish", "lost", "trash", "legend"].includes(item.subcategory ?? "");
  if (tabKey === "keepsake") return item.category === "keepsake" && !["fish", "lost", "trash", "legend"].includes(item.subcategory ?? "");
  return item.category === "special";
}

export function InventoryTabs({ items }: { items: InventoryItemRow[] }) {
  const [tab, setTab] = useState<(typeof TABS)[number]["key"]>("outfit");
  const filtered = items.filter((i) => matchesTab(i, tab));

  return (
    <div className="flex flex-col gap-3">
      <div className="scrollbar-none flex gap-2 overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`shrink-0 rounded-full px-4 py-2 text-[12px] font-bold ${
              tab === t.key ? "bg-[var(--color-navy)] text-white" : "bg-white text-[var(--color-navy-soft)]"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <Card tone="cream" className="py-8 text-center text-[13px] text-[var(--color-navy-soft)]">
          {EMPTY_STATE_COPY.inventory}
        </Card>
      ) : (
        <div className="grid grid-cols-3 gap-2.5">
          {filtered.map((item) => (
            <Card key={item.id} className="relative flex flex-col items-center gap-1 !p-2.5 text-center">
              {item.isNew && <NewBadge className="absolute right-1.5 top-1.5" />}
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--color-sky)] text-[11px] text-[var(--color-navy-soft)]">
                {RARITY_STARS[item.rarity]}
              </div>
              <p className="line-clamp-1 text-[11px] font-bold text-[var(--color-navy)]">{item.name}</p>
              <p className="text-[9px] text-[var(--color-navy-soft)]">
                {RARITY_LABEL[item.rarity]} · x{item.quantity}
              </p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
