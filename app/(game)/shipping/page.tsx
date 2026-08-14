import Link from "next/link";
import { NPC_APPEARANCE } from "@/lib/domain/characterPresets";
import { NPCS } from "@/lib/domain/constants";
import { CharacterSprite } from "@/components/character/CharacterSprite";
import { Card } from "@/components/ui/Card";
import { GameIcon } from "@/components/icons/GameIcon";

const MENU = [
  { href: "/shipping/notices", label: "공지사항", icon: "book" as const },
  { href: "/shipping/suggestions", label: "건의사항", icon: "clipboard" as const },
  { href: "/shipping/events", label: "이벤트", icon: "trophy" as const },
  { href: "/shipping/store-application", label: "가게 입점 신청", icon: "company" as const },
];

export default function ShippingPage() {
  const npc = NPCS.find((n) => n.id === "arab")!;
  return (
    <div className="flex flex-col gap-4 px-4 pt-5">
      <h1 className="text-lg font-extrabold text-[var(--color-navy)]">(주)해녀쉽핑</h1>

      <Card tone="cream" className="flex flex-col items-center gap-2 py-6 text-center">
        <CharacterSprite appearance={NPC_APPEARANCE.arab} size={100} />
        <p className="text-[14px] font-extrabold text-[var(--color-navy)]">{npc.name}</p>
        <p className="text-[10px] text-[var(--color-navy-soft)]">{npc.title}</p>
        <p className="mt-1 rounded-2xl bg-white px-4 py-2 text-[12px] font-bold text-[var(--color-navy)] shadow-[0_4px_14px_rgba(36,54,90,0.08)]">
          {npc.line}
        </p>
      </Card>

      <div className="grid grid-cols-2 gap-2.5">
        {MENU.map((m) => (
          <Link key={m.href} href={m.href} className="flex flex-col items-center gap-1.5 rounded-2xl bg-white p-4 shadow-[0_4px_14px_rgba(36,54,90,0.08)]">
            <GameIcon name={m.icon} size={40} />
            <span className="text-[12px] font-bold text-[var(--color-navy)]">{m.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
