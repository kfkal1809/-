import { SpaceStub } from "@/components/ui/SpaceStub";
import { NPC_APPEARANCE } from "@/lib/domain/characterPresets";
import { NPCS, MESS_ROOM_MENU } from "@/lib/domain/constants";
import { Card } from "@/components/ui/Card";

export default function MessRoomPage() {
  const npc = NPCS.find((n) => n.id === "dubu")!;
  return (
    <div className="flex flex-col gap-4">
      <SpaceStub
        title="선내식당"
        npcName={npc.name}
        npcTitle={npc.title}
        npcLine={npc.line}
        npcAppearance={NPC_APPEARANCE.dubu}
        description="주문하고 결제하는 기능은 다음 업데이트에서 열려요. 미리 메뉴만 살펴볼까요?"
      />
      <div className="flex flex-col gap-2 px-4 pb-2">
        {MESS_ROOM_MENU.map((m) => (
          <Card key={m.key} className="flex items-center justify-between !p-3">
            <div>
              <p className="text-[13px] font-bold text-[var(--color-navy)]">{m.name}</p>
              <p className="text-[11px] text-[var(--color-navy-soft)]">{m.description}</p>
            </div>
            <p className="text-[14px] font-extrabold text-[var(--color-coral)]">${m.price}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
