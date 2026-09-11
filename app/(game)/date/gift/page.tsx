import { DateGiftWidget } from "@/components/date/DateGiftWidget";
import { DATE_GIFT_MESSAGES } from "@/lib/domain/constants";

export default function DateGiftPage() {
  return (
    <div className="flex flex-col gap-4 px-4 pt-5">
      <h1 className="text-lg font-extrabold text-[var(--color-navy)]">선물 보내기</h1>
      <p className="text-[13px] text-[var(--color-navy-soft)]">
        하루에 한 번, 파트너에게 다정한 메시지와 작은 선물을 우편함으로 보낼 수 있어요.
      </p>
      <DateGiftWidget messages={DATE_GIFT_MESSAGES} />
    </div>
  );
}
