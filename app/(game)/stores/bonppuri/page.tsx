import { SpaceStub } from "@/components/ui/SpaceStub";
import { NPCS, BONPPURI_WORK_TASKS } from "@/lib/domain/constants";
import { getStoreProducts } from "@/lib/game/storeData";
import { StoreProductGrid } from "@/components/store/StoreProductGrid";
import { StoreWorkWidget } from "@/components/store/StoreWorkWidget";
import { MissionPing } from "@/components/duties/MissionPing";

export default async function BonppuriPage() {
  const npc = NPCS.find((n) => n.id === "mami")!;
  const products = await getStoreProducts("bonppuri");

  return (
    <div className="flex flex-col gap-4">
      <MissionPing space="bonppuri" />
      <SpaceStub
        title="본뿌리"
        npcName={npc.name}
        npcTitle={npc.title}
        npcLine={npc.line}
        npcId="mami"
        bgId="bonppuri"
        description="시들지 않는 꽃과 화병은 선실에 영구히 놓을 수 있는 감성 사치품이에요."
      />
      <div className="px-4">
        <StoreWorkWidget storeSlug="bonppuri" tasks={BONPPURI_WORK_TASKS} />
      </div>
      <StoreProductGrid storeSlug="bonppuri" products={products} />
    </div>
  );
}
