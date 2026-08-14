import { getInventoryItems } from "@/lib/game/inventoryData";
import { InventoryTabs } from "@/components/inventory/InventoryTabs";

export default async function InventoryPage() {
  const { items } = await getInventoryItems();

  return (
    <div className="flex flex-col gap-4 px-4 pt-5">
      <h1 className="text-lg font-extrabold text-[var(--color-navy)]">가방</h1>
      <InventoryTabs items={items} />
    </div>
  );
}
