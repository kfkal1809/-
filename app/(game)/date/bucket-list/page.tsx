import { DateBucketList } from "@/components/date/DateBucketList";
import { getDateBucketListItems } from "@/lib/game/dateBucketListData";

export default async function DateBucketListPage() {
  const items = await getDateBucketListItems();

  return (
    <div className="flex flex-col gap-4 px-4 pt-5">
      <h1 className="text-lg font-extrabold text-[var(--color-navy)]">커플 버킷리스트</h1>
      <p className="text-[13px] text-[var(--color-navy-soft)]">함께 해보고 싶은 일들을 적고, 하나씩 완료해보세요.</p>
      <DateBucketList items={items} />
    </div>
  );
}
