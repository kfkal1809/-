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
        <Link href="/stores/furniture" className="rounded-full bg-[var(--color-navy)] px-4 py-2 text-[13px] font-bold text-white">
          가구상점
        </Link>
      </div>
      <InventoryTabs items={items} myCharacters={myCharacters} />
    </div>
  );
}
