"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { NewBadge } from "@/components/ui/NewBadge";
import { RARITY_LABEL, RARITY_STARS } from "@/lib/domain/types";
import { EMPTY_STATE_COPY } from "@/lib/domain/constants";
import { itemIconSrc } from "@/lib/domain/itemIcons";
import type { InventoryItemRow } from "@/lib/game/inventoryData";
import type { MyCharacter } from "@/lib/game/myCharacters";
import { LootActions } from "@/components/inventory/LootActions";

const EQUIP_CATEGORIES = new Set(["hair", "outfit", "hat", "accessory"]);

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

export function InventoryTabs({ items, myCharacters }: { items: InventoryItemRow[]; myCharacters: MyCharacter[] }) {
  const [tab, setTab] = useState<(typeof TABS)[number]["key"]>("outfit");
  const [openPickerId, setOpenPickerId] = useState<string | null>(null);
  const [equipping, setEquipping] = useState<string | null>(null);
  const [equippedMsg, setEquippedMsg] = useState<string | null>(null);
  const filtered = items.filter((i) => matchesTab(i, tab));

  async function handleEquip(inventoryItemId: string, characterId: string, characterName: string) {
    setEquipping(inventoryItemId);
    try {
      const res = await fetch("/api/character/equip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ characterId, inventoryItemId }),
      });
      if (!res.ok) throw new Error("failed");
      setEquippedMsg(`${characterName}에게 착용했어요!`);
      setOpenPickerId(null);
    } catch {
      setEquippedMsg("착용에 실패했어요.");
    } finally {
      setEquipping(null);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="scrollbar-none flex gap-2 overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`shrink-0 rounded-full px-4 py-2 text-[13px] font-bold ${
              tab === t.key ? "bg-[var(--color-navy)] text-white" : "bg-white text-[var(--color-navy-soft)]"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {equippedMsg && <p className="text-center text-[13px] font-bold text-[var(--color-navy)]">{equippedMsg}</p>}

      {filtered.length === 0 ? (
        <Card tone="cream" className="py-8 text-center text-[14px] text-[var(--color-navy-soft)]">
          {EMPTY_STATE_COPY.inventory}
        </Card>
      ) : (
        <div className="grid grid-cols-3 gap-2.5">
          {filtered.map((item) => {
            const equipable = EQUIP_CATEGORIES.has(item.category) && myCharacters.length > 0;
            const placeable = item.category === "furniture";
            const isLoot = item.category === "keepsake" && ["fish", "lost", "trash", "legend"].includes(item.subcategory ?? "");
            return (
              <Card key={item.id} className="relative flex flex-col items-center gap-1 !p-2.5 text-center">
                {item.isNew && <NewBadge className="absolute right-1.5 top-1.5" />}
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--color-sky)] text-[12px] text-[var(--color-navy-soft)]">
                  {itemIconSrc(item.sku) ? (
                    <Image src={itemIconSrc(item.sku)!} alt="" width={48} height={48} unoptimized style={{ width: "80%", height: "80%", objectFit: "contain" }} />
                  ) : (
                    RARITY_STARS[item.rarity]
                  )}
                </div>
                <p className="line-clamp-1 text-[12px] font-bold text-[var(--color-navy)]">{item.name}</p>
                <p className="text-[10px] text-[var(--color-navy-soft)]">
                  {RARITY_LABEL[item.rarity]} · x{item.quantity}
                </p>

                {equipable && (
                  <div className="mt-1 w-full">
                    {openPickerId === item.id ? (
                      <div className="flex flex-wrap justify-center gap-1">
                        {myCharacters.map((c) => (
                          <button
                            key={c.id}
                            onClick={() => handleEquip(item.id, c.id, c.nickname)}
                            disabled={equipping === item.id}
                            className="rounded-full bg-[var(--color-mint)] px-2 py-1 text-[11px] font-bold text-[var(--color-navy)]"
                          >
                            {c.nickname}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <button
                        onClick={() => setOpenPickerId(item.id)}
                        className="w-full rounded-full bg-[var(--color-sky)] py-1 text-[11px] font-bold text-[var(--color-navy)]"
                      >
                        착용
                      </button>
                    )}
                  </div>
                )}

                {placeable && (
                  <Link
                    href="/cabin/edit"
                    className="mt-1 w-full rounded-full bg-[var(--color-sky)] py-1 text-[11px] font-bold text-[var(--color-navy)]"
                  >
                    선실에 배치
                  </Link>
                )}

                {isLoot && <LootActions inventoryItemId={item.id} subcategory={item.subcategory} />}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
