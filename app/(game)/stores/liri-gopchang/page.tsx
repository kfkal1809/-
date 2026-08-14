import { SpaceStub } from "@/components/ui/SpaceStub";
import { NPC_APPEARANCE } from "@/lib/domain/characterPresets";
import { NPCS } from "@/lib/domain/constants";

export default function LiriGopchangPage() {
  const npc = NPCS.find((n) => n.id === "liri")!;
  return (
    <SpaceStub
      title="리리양곱창"
      npcName={npc.name}
      npcTitle={npc.title}
      npcLine={npc.line}
      npcAppearance={NPC_APPEARANCE.liri}
      description="테이블 닦기, 반찬 나르기 같은 알바로 선용금과 식당 테마 장식을 얻는 기능은 다음 업데이트에서 열려요."
    />
  );
}
