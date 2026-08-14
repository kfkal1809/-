import { getCabinData } from "@/lib/game/cabinData";
import { CabinRoom } from "@/components/cabin/CabinRoom";

export default async function VisitCabinPage({ params }: PageProps<"/cabin/[householdId]">) {
  const { householdId } = await params;
  const data = await getCabinData(householdId);
  return <CabinRoom data={data} />;
}
