import { DateTopicCardWidget } from "@/components/date/DateTopicCardWidget";
import { DATE_TOPIC_CARDS } from "@/lib/domain/constants";

export default function DateTopicCardPage() {
  return (
    <div className="flex flex-col gap-4 px-4 pt-5">
      <h1 className="text-lg font-extrabold text-[var(--color-navy)]">대화 주제 카드</h1>
      <p className="text-[13px] text-[var(--color-navy-soft)]">
        오늘의 카드를 뽑아 서로 이야기 나눠보세요. 하루에 한 번, 둘이 함께 완료할 수 있어요.
      </p>
      <DateTopicCardWidget cards={DATE_TOPIC_CARDS} />
    </div>
  );
}
