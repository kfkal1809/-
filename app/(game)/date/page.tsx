import Link from "next/link";
import { GameIcon } from "@/components/icons/GameIcon";

const DATE_MENU = [
  { href: "/date/topic-card", label: "대화 주제 카드", icon: "heart" as const },
  { href: "/date/gift", label: "선물 보내기", icon: "gift" as const },
  { href: "/date/photo", label: "데이트 스팟 인증샷", icon: "camera" as const },
];

export default function DatePage() {
  return (
    <div className="flex flex-col gap-4 px-4 pt-5">
      <h1 className="text-lg font-extrabold text-[var(--color-navy)]">데이트</h1>
      <p className="text-[13px] text-[var(--color-navy-soft)]">둘만의 특별한 데이트 콘텐츠예요.</p>

      <div className="grid grid-cols-2 gap-2.5">
        {DATE_MENU.map((m) => (
          <Link
            key={m.href}
            href={m.href}
            className="flex flex-col items-center gap-1.5 rounded-2xl bg-white p-4 shadow-[0_4px_14px_rgba(36,54,90,0.08)]"
          >
            <GameIcon name={m.icon} size={40} withBadge />
            <span className="text-[13px] font-bold text-[var(--color-navy)]">{m.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
