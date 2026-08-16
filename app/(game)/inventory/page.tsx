import Link from "next/link";
import { getInventoryItems } from "@/lib/game/inventoryData";
import { getMyCharacters } from "@/lib/game/myCharacters";
import { InventoryTabs } from "@/components/inventory/InventoryTabs";

export default async function InventoryPage() {
  const [{ items }, myCharacters] = await Promise.all([getInventoryItems(), getMyCharacters()]);

  return (
    <div className="flex flex-col gap-4 px-4 pt-5">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-extrabold text-[var(--color-navy)]">가방</h1>
        <div className="flex gap-1.5">
          <Link href="/stores/clothing" className="rounded-full bg-[var(--color-coral)] px-3.5 py-2 text-[13px] font-bold text-white">
            옷가게
          </Link>
          <Link href="/stores/furniture" className="rounded-full bg-[var(--color-navy)] px-3.5 py-2 text-[13px] font-bold text-white">
            가구상점
          </Link>
        </div>
      </div>
      <InventoryTabs items={items} myCharacters={myCharacters} />
    </div>
  );
}
