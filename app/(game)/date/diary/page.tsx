import { DateDiaryForm } from "@/components/date/DateDiaryForm";
import { Card } from "@/components/ui/Card";
import { GameIcon } from "@/components/icons/GameIcon";
import { relativeTimeKorean } from "@/lib/game/relativeTime";
import { getDateDiaryData } from "@/lib/game/dateDiaryData";

export default async function DateDiaryPage() {
  const data = await getDateDiaryData();

  return (
    <div className="flex flex-col gap-4 px-4 pt-5">
      <div className="flex items-center gap-2">
        <GameIcon name="diary" size={36} />
        <h1 className="text-lg font-extrabold text-[var(--color-navy)]">커플 한 줄 일기</h1>
      </div>
      <p className="text-[13px] text-[var(--color-navy-soft)]">
        하루에 한 줄씩, 서로에게만 보이는 우리 둘만의 일기를 남겨보세요.
      </p>

      <DateDiaryForm writtenToday={data.writtenToday} />

      {data.entries.length === 0 ? (
        <Card tone="cream" className="py-8 text-center text-[14px] text-[var(--color-navy-soft)]">
          아직 남긴 일기가 없어요.
        </Card>
      ) : (
        <div className="flex flex-col gap-2">
          {data.entries.map((e) => (
            <Card key={e.id} tone={e.isMine ? "surface" : "cream"} className="!p-3">
              <div className="flex items-center justify-between">
                <p className="text-[13px] font-extrabold text-[var(--color-navy)]">{e.authorNickname}</p>
                <p className="text-[11px] text-[var(--color-navy-soft)]">{relativeTimeKorean(e.createdAt)}</p>
              </div>
              <p className="mt-1 text-[14px] text-[var(--color-navy)]">{e.body}</p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
