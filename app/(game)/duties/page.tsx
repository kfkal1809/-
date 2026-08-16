import { getDutiesData } from "@/lib/game/dutiesData";
import { Card } from "@/components/ui/Card";
import { GameIcon } from "@/components/icons/GameIcon";
import { MissionClaimButton } from "@/components/duties/MissionClaimButton";
import type { MissionSnapshotItem } from "@/lib/game/missions";

export default async function DutiesPage() {
  const snapshot = await getDutiesData();

  if (!snapshot) {
    return (
      <div className="flex flex-col gap-4 px-4 pt-5">
        <h1 className="text-lg font-extrabold text-[var(--color-navy)]">선내업무</h1>
        <p className="text-center text-[13px] text-[var(--color-navy-soft)]">로그인 후 이용할 수 있어요.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 px-4 pt-5">
      <h1 className="text-lg font-extrabold text-[var(--color-navy)]">선내업무</h1>

      <Section title="데일리" items={snapshot.daily} clear={snapshot.dailyClear} />
      <Section title="주간" items={snapshot.weekly} clear={snapshot.weeklyClear} />
    </div>
  );
}

function Section({ title, items, clear }: { title: string; items: MissionSnapshotItem[]; clear: MissionSnapshotItem }) {
  return (
    <div>
      <p className="mb-2 text-[14px] font-extrabold text-[var(--color-navy)]">{title}</p>
      <div className="flex flex-col gap-2">
        {items.map((m) => (
          <MissionRow key={m.key} item={m} />
        ))}
        <ClearBonusRow item={clear} title={`${title} 올클리어 보너스`} />
      </div>
    </div>
  );
}

function MissionRow({ item }: { item: MissionSnapshotItem }) {
  return (
    <Card className="flex items-center gap-3 !p-3">
      <GameIcon name="clipboard" size={38} />
      <div className="flex-1">
        <p className="text-[14px] font-bold text-[var(--color-navy)]">{item.title}</p>
        <p className="text-[12px] text-[var(--color-navy-soft)]">{item.description}</p>
        <p className="mt-0.5 text-[11px] font-bold text-[var(--color-navy-soft)]">
          {item.progress}/{item.target}
        </p>
      </div>
      <RewardSlot item={item} />
    </Card>
  );
}

function ClearBonusRow({ item, title }: { item: MissionSnapshotItem; title: string }) {
  return (
    <Card tone="cream" className="flex items-center gap-3 !p-3">
      <GameIcon name="trophy" size={38} />
      <div className="flex-1">
        <p className="text-[13px] font-extrabold text-[var(--color-navy)]">{title}</p>
        <p className="mt-0.5 text-[11px] font-bold text-[var(--color-navy-soft)]">
          {item.progress}/{item.target}개 완료
        </p>
      </div>
      <RewardSlot item={item} />
    </Card>
  );
}

function RewardSlot({ item }: { item: MissionSnapshotItem }) {
  if (item.rewarded) {
    return <p className="text-[12px] font-extrabold text-[var(--color-mint-deep)]">수령완료</p>;
  }
  if (item.completed) {
    return <MissionClaimButton missionKey={item.key} reward={item.reward} />;
  }
  return <p className="text-[14px] font-extrabold text-[var(--color-coral)]">+${item.reward}</p>;
}
