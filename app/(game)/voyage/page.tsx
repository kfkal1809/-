import Link from "next/link";
import { getVoyagePageData } from "@/lib/game/voyageData";
import { CharacterSprite } from "@/components/character/CharacterSprite";
import { Card } from "@/components/ui/Card";
import { CountryTimeDiff } from "@/components/voyage/CountryTimeDiff";

export default async function VoyagePage() {
  const data = await getVoyagePageData();

  return (
    <div className="flex flex-col gap-4 px-4 pt-5">
      <h1 className="text-lg font-extrabold text-[var(--color-navy)]">항해일지</h1>

      {data.voyages.length === 0 && (
        <Card tone="cream" className="text-center text-[14px] text-[var(--color-navy-soft)]">
          아직 등록된 항해 일정이 없어요.
        </Card>
      )}

      {data.voyages.map((v) => (
        <Card key={v.characterId} className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <CharacterSprite appearance={v.appearance} kind="haenam" size={80} />
            <div>
              <p className="text-[16px] font-extrabold text-[var(--color-navy)]">{v.nickname}</p>
              <p className="text-[12px] text-[var(--color-navy-soft)]">{v.roleLabel}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-center">
            <Stat label="승선" value={v.boardedDays !== null ? `D+${v.boardedDays}` : "-"} color="var(--color-coral)" />
            <Stat label="하선" value={v.signoffDays !== null ? `D-${v.signoffDays}` : "-"} color="var(--color-tab-active)" />
          </div>

          <div className="rounded-2xl bg-[var(--color-cream)] py-2.5 text-center">
            <p className="text-[11px] font-bold text-[var(--color-navy-soft)]">총 승선일수</p>
            <p className="text-[17px] font-extrabold text-[var(--color-navy)]">{v.totalBoardedDays}일</p>
          </div>

          <CountryTimeDiff />

          <dl className="grid grid-cols-2 gap-y-1 text-[13px] text-[var(--color-navy-soft)]">
            <dt>승선일</dt>
            <dd className="text-right font-bold text-[var(--color-navy)]">{v.boardedAt ?? "미등록"}</dd>
            <dt>하선 예정일</dt>
            <dd className="text-right font-bold text-[var(--color-navy)]">{v.expectedSignoffAt ?? "미등록"}</dd>
            <dt>휴가 시작일</dt>
            <dd className="text-right font-bold text-[var(--color-navy)]">{v.vacationStartAt ?? "미등록"}</dd>
            <dt>다음 승선 예정일</dt>
            <dd className="text-right font-bold text-[var(--color-navy)]">{v.nextBoardingAt ?? "미등록"}</dd>
          </dl>

          {data.canEdit && (
            <Link
              href={`/voyage/edit?characterId=${v.characterId}`}
              className="rounded-full bg-[var(--color-navy)] py-2.5 text-center text-[14px] font-bold text-white"
            >
              일정 수정하기
            </Link>
          )}
        </Card>
      ))}
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="rounded-2xl bg-[var(--color-sky)] py-2.5">
      <p className="text-[11px] font-bold text-[var(--color-navy-soft)]">{label}</p>
      <p className="text-[17px] font-extrabold" style={{ color }}>
        {value}
      </p>
    </div>
  );
}
