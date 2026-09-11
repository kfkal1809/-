import Link from "next/link";
import { GameIcon } from "@/components/icons/GameIcon";
import { Card } from "@/components/ui/Card";
import { getDateRecommendation } from "@/lib/game/dateRecommendationData";

const DATE_MENU = [
  { href: "/date/topic-card", label: "대화 주제 카드", icon: "heart" as const },
  { href: "/date/gift", label: "선물 보내기", icon: "gift" as const },
  { href: "/date/photo", label: "데이트 스팟 인증샷", icon: "camera" as const },
  { href: "/date/stamps", label: "데이트 스탬프판", icon: "trophy" as const },
  { href: "/date/diary", label: "커플 한 줄 일기", icon: "diary" as const },
  { href: "/date/fortune", label: "오늘의 운세", icon: "fortune" as const },
];

export default async function DatePage() {
  const recommendation = await getDateRecommendation();

  return (
    <div className="flex flex-col gap-4 px-4 pt-5">
      <h1 className="text-lg font-extrabold text-[var(--color-navy)]">데이트</h1>
      <p className="text-[13px] text-[var(--color-navy-soft)]">둘만의 특별한 데이트 콘텐츠예요.</p>

      {recommendation ? (
        <Link href={recommendation.href}>
          <Card tone="cream" className="flex items-center gap-3 !p-4">
            <GameIcon name={recommendation.icon} size={44} withBadge />
            <div className="flex-1">
              <p className="text-[11px] font-bold text-[var(--color-coral)]">오늘의 추천 데이트</p>
              <p className="text-[15px] font-extrabold text-[var(--color-navy)]">{recommendation.label}</p>
              <p className="mt-0.5 text-[12px] text-[var(--color-navy-soft)]">{recommendation.description}</p>
            </div>
          </Card>
        </Link>
      ) : (
        <Card tone="aqua" className="flex items-center gap-3 !p-4">
          <GameIcon name="trophy" size={44} withBadge />
          <div className="flex-1">
            <p className="text-[15px] font-extrabold text-[var(--color-navy)]">오늘의 데이트 콘텐츠를 모두 완료했어요!</p>
            <p className="mt-0.5 text-[12px] text-[var(--color-navy-soft)]">스탬프판에서 올클리어 보너스를 받아보세요.</p>
          </div>
        </Card>
      )}

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
