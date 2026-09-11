import { DateFortuneWidget } from "@/components/date/DateFortuneWidget";
import { DATE_FORTUNE_MESSAGES } from "@/lib/domain/constants";

export default function DateFortunePage() {
  return (
    <div className="flex flex-col gap-4 px-4 pt-5">
      <h1 className="text-lg font-extrabold text-[var(--color-navy)]">오늘의 운세</h1>
      <p className="text-[13px] text-[var(--color-navy-soft)]">하루에 한 번, 오늘 우리 커플에게 어떤 하루가 기다리고 있을지 점쳐보세요.</p>
      <DateFortuneWidget messages={DATE_FORTUNE_MESSAGES} />
    </div>
  );
}
