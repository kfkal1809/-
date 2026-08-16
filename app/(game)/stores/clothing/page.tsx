import { getClothingStoreData } from "@/lib/game/clothingStoreData";
import { ClothingStoreScreen } from "@/components/store/ClothingStoreScreen";

export default async function ClothingStorePage({ searchParams }: { searchParams: Promise<{ characterId?: string }> }) {
  const { characterId } = await searchParams;
  const data = await getClothingStoreData(characterId);
  return <ClothingStoreScreen data={data} />;
}
