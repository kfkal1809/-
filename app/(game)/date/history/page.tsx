import { Card } from "@/components/ui/Card";
import { GameIcon } from "@/components/icons/GameIcon";
import { formatKoreanDate } from "@/lib/game/kst";
import { getDateHistory } from "@/lib/game/dateHistoryData";

const TYPE_LABEL: Record<string, string> = {
  topic_card: "대화 주제 카드",
  fortune: "오늘의 운세",
};

export default async function DateHistoryPage() {
  const entries = await getDateHistory();

  return (
    <div className="flex flex-col gap-4 px-4 pt-5">
      <h1 className="text-lg font-extrabold text-[var(--color-navy)]">지난 기록 다시보기</h1>
      <p className="text-[13px] text-[var(--color-navy-soft)]">뽑았던 대화 주제 카드와 오늘의 운세를 모아봤어요.</p>

      {entries.length === 0 ? (
        <Card tone="cream" className="py-8 text-center text-[14px] text-[var(--color-navy-soft)]">
          아직 쌓인 기록이 없어요.
        </Card>
      ) : (
        <div className="flex flex-col gap-2">
          {entries.map((e) => (
            <Card key={`${e.type}-${e.id}`} className="flex items-center gap-3 !p-3">
              <GameIcon name={e.type === "topic_card" ? "heart" : "fortune"} size={32} />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-bold text-[var(--color-coral)]">{TYPE_LABEL[e.type]}</p>
                  <p className="text-[11px] text-[var(--color-navy-soft)]">{formatKoreanDate(e.date)}</p>
                </div>
                <p className="mt-0.5 text-[14px] font-bold text-[var(--color-navy)]">{e.text}</p>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
