import { getFishingData } from "@/lib/game/fishingData";
import { getDeckSelf } from "@/lib/game/deckData";
import { FishingScreen } from "@/components/fishing/FishingScreen";

export default async function FishingPage() {
  const [data, self] = await Promise.all([getFishingData(), getDeckSelf()]);
  return <FishingScreen data={data} self={self} />;
}
