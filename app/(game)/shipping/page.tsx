import Link from "next/link";
import { NPCS } from "@/lib/domain/constants";
import { SpaceStub } from "@/components/ui/SpaceStub";
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
    <div className="flex flex-col gap-4">
      <SpaceStub title="(주)해녀해운" npcName={npc.name} npcTitle={npc.title} npcLine={npc.line} npcId="arab" bgId="shipping-office" />

      <div className="grid grid-cols-2 gap-2.5 px-4 pb-2">
        {MENU.map((m) => (
          <Link key={m.href} href={m.href} className="flex flex-col items-center gap-1.5 rounded-2xl bg-white p-4 shadow-[0_4px_14px_rgba(36,54,90,0.08)]">
            <GameIcon name={m.icon} size={40} withBadge />
            <span className="text-[12px] font-bold text-[var(--color-navy)]">{m.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
