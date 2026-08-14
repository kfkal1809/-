import { SpaceStub } from "@/components/ui/SpaceStub";
import { NPC_APPEARANCE } from "@/lib/domain/characterPresets";
import { NPCS, LIRI_WORK_TASKS } from "@/lib/domain/constants";
import { StoreWorkWidget } from "@/components/store/StoreWorkWidget";

export default function LiriGopchangPage() {
  const npc = NPCS.find((n) => n.id === "liri")!;
  return (
    <div className="flex flex-col gap-4">
      <SpaceStub
        title="리리양곱창"
        npcName={npc.name}
        npcTitle={npc.title}
        npcLine={npc.line}
        npcAppearance={NPC_APPEARANCE.liri}
        description="테이블 정리, 반찬 나르기 같은 알바로 선용금과 낮은 확률로 식당 테마 장식을 받을 수 있어요."
      />
      <div className="px-4">
        <StoreWorkWidget storeSlug="liri-gopchang" tasks={LIRI_WORK_TASKS} />
      </div>
    </div>
  );
}
