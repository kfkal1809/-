import { DAILY_MISSIONS, WEEKLY_MISSIONS, DAILY_CLEAR_BONUS, WEEKLY_CLEAR_BONUS } from "@/lib/domain/constants";
import { Card } from "@/components/ui/Card";
import { GameIcon } from "@/components/icons/GameIcon";

export default function DutiesPage() {
  return (
    <div className="flex flex-col gap-4 px-4 pt-5">
      <h1 className="text-lg font-extrabold text-[var(--color-navy)]">선내업무</h1>

      <Section title="데일리" items={DAILY_MISSIONS} clearBonus={DAILY_CLEAR_BONUS} />
      <Section title="주간" items={WEEKLY_MISSIONS} clearBonus={WEEKLY_CLEAR_BONUS} />

      <p className="text-center text-[11px] text-[var(--color-navy-soft)]">
        미션 진행도 자동 집계 기능은 각 공간이 열리는 대로 순차 연동돼요.
      </p>
    </div>
  );
}

function Section({
  title,
  items,
  clearBonus,
}: {
  title: string;
  items: { key: string; title: string; description: string; target: number; reward: number }[];
  clearBonus: number;
}) {
  return (
    <div>
      <p className="mb-2 text-[13px] font-extrabold text-[var(--color-navy)]">{title}</p>
      <div className="flex flex-col gap-2">
        {items.map((m) => (
          <Card key={m.key} className="flex items-center gap-3 !p-3">
            <GameIcon name="clipboard" size={38} />
            <div className="flex-1">
              <p className="text-[13px] font-bold text-[var(--color-navy)]">{m.title}</p>
              <p className="text-[11px] text-[var(--color-navy-soft)]">{m.description}</p>
            </div>
            <p className="text-[13px] font-extrabold text-[var(--color-coral)]">+${m.reward}</p>
          </Card>
        ))}
        <Card tone="cream" className="flex items-center justify-between !p-3">
          <p className="text-[12px] font-extrabold text-[var(--color-navy)]">{title} 올클리어 보너스</p>
          <p className="text-[13px] font-extrabold text-[var(--color-gold-deep)]">+${clearBonus}</p>
        </Card>
      </div>
    </div>
  );
}
