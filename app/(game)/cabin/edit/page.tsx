import { getCabinEditData } from "@/lib/game/cabinEditData";
import { CabinEditor } from "@/components/cabin/CabinEditor";
import { Card } from "@/components/ui/Card";

export default async function CabinEditPage() {
  const data = await getCabinEditData();

  if (!data.canEdit || !data.spaceId) {
    return (
      <div className="px-4 pt-5">
        <Card tone="cream" className="py-8 text-center text-[14px] text-[var(--color-navy-soft)]">
          아직 우리 선실이 만들어지지 않았어요. 가입을 완료해주세요.
        </Card>
      </div>
    );
  }

  return (
    <CabinEditor
      spaceId={data.spaceId}
      initialPlaced={data.placed}
      initialUnplaced={data.unplaced}
      initialWallpaper={data.wallpaper}
      initialFloor={data.floor}
    />
  );
}
