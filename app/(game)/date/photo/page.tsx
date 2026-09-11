import { DatePhotoWidget } from "@/components/date/DatePhotoWidget";
import { DATE_SPOT_LOCATIONS } from "@/lib/domain/constants";
import { getDatePhotoData } from "@/lib/game/datePhotoData";

export default async function DatePhotoPage() {
  const data = await getDatePhotoData();

  return (
    <div className="flex flex-col gap-4 px-4 pt-5">
      <h1 className="text-lg font-extrabold text-[var(--color-navy)]">데이트 스팟 인증샷</h1>
      <p className="text-[13px] text-[var(--color-navy-soft)]">
        하루에 한 번, 함께 가고 싶은 장소를 골라 둘만의 인증샷을 남겨보세요.
      </p>
      <DatePhotoWidget
        locations={DATE_SPOT_LOCATIONS}
        haenyeoName={data.haenyeoName}
        haenyeoAppearance={data.haenyeoAppearance}
        haenamName={data.haenamName}
        haenamAppearance={data.haenamAppearance}
        todayPhoto={data.todayPhoto}
        recentPhotos={data.recentPhotos}
      />
    </div>
  );
}
