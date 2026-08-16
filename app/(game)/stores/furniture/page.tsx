import { getFurnitureStoreData } from "@/lib/game/furnitureStoreData";
import { FurnitureStoreScreen } from "@/components/store/FurnitureStoreScreen";

export default async function FurnitureStorePage() {
  const data = await getFurnitureStoreData();
  return <FurnitureStoreScreen data={data} />;
}
