import { getFishingData } from "@/lib/game/fishingData";
import { FishingScreen } from "@/components/fishing/FishingScreen";

export default async function FishingPage() {
  const data = await getFishingData();
  return <FishingScreen data={data} />;
}
