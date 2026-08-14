import { getCabinData } from "@/lib/game/cabinData";
import { CabinRoom } from "@/components/cabin/CabinRoom";

export default async function CabinPage() {
  const data = await getCabinData();
  return <CabinRoom data={data} />;
}
