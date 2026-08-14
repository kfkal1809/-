import { SpaceStub } from "@/components/ui/SpaceStub";
import { NPCS } from "@/lib/domain/constants";
import { MessRoomOrder } from "@/components/mess/MessRoomOrder";

export default function MessRoomPage() {
  const npc = NPCS.find((n) => n.id === "dubu")!;
  return (
    <div className="flex flex-col gap-4">
      <SpaceStub
        title="선내식당"
        npcName={npc.name}
        npcTitle={npc.title}
        npcLine={npc.line}
        npcId="dubu"
        bgId="mess-room"
        description="메뉴를 주문하면 선용금이 차감되고 랜덤 꾸미기 아이템을 하나 받아요. 10번 주문하면 최소 한 번은 희귀 이상이 보장돼요."
      />
      <MessRoomOrder />
    </div>
  );
}
