import { getCabinData } from "@/lib/game/cabinData";
import { CabinRoom } from "@/components/cabin/CabinRoom";
import { MissionPing } from "@/components/duties/MissionPing";

export default async function VisitCabinPage({ params }: PageProps<"/cabin/[householdId]">) {
  const { householdId } = await params;
  const data = await getCabinData(householdId);
  return (
    <>
      <MissionPing space="cabin" cabinHouseholdId={householdId} />
      <CabinRoom data={data} />
    </>
  );
}
