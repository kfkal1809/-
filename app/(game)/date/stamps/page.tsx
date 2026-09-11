import { DateStampBoard } from "@/components/date/DateStampBoard";
import { getDateStampData } from "@/lib/game/dateStampData";

export default async function DateStampsPage() {
  const data = await getDateStampData();

  return (
    <div className="flex flex-col gap-4 px-4 pt-5">
      <h1 className="text-lg font-extrabold text-[var(--color-navy)]">데이트 스탬프판</h1>
      <p className="text-[13px] text-[var(--color-navy-soft)]">
        오늘 함께 한 데이트 활동을 모아봐요. 6개를 모두 채우면 보너스를 받을 수 있어요.
      </p>
      <DateStampBoard stamps={data.stamps} allClear={data.allClear} claimed={data.claimed} reward={data.reward} />
    </div>
  );
}
