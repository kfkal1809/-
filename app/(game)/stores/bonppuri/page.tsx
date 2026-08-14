import { SpaceStub } from "@/components/ui/SpaceStub";
import { NPC_APPEARANCE } from "@/lib/domain/characterPresets";
import { NPCS, BONPPURI_PRODUCTS } from "@/lib/domain/constants";
import { Card } from "@/components/ui/Card";
import { GameIcon } from "@/components/icons/GameIcon";

export default function BonppuriPage() {
  const npc = NPCS.find((n) => n.id === "mami")!;
  return (
    <div className="flex flex-col gap-4">
      <SpaceStub
        title="본뿌리"
        npcName={npc.name}
        npcTitle={npc.title}
        npcLine={npc.line}
        npcAppearance={NPC_APPEARANCE.mami}
        description="시들지 않는 꽃과 화병은 선실에 영구히 놓을 수 있는 감성 사치품이에요. 구매 기능은 다음 업데이트에서 열려요."
      />
      <div className="grid grid-cols-2 gap-2.5 px-4 pb-2">
        {BONPPURI_PRODUCTS.map((p) => (
          <Card key={p.key} className="flex flex-col items-center gap-1.5 !p-3 text-center">
            <GameIcon name="flower" size={44} />
            <p className="text-[12px] font-bold text-[var(--color-navy)]">{p.name}</p>
            <p className="text-[13px] font-extrabold text-[var(--color-coral)]">${p.price}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
