import Image from "next/image";
import { getMarriageData } from "@/lib/game/marriageData";
import { MarriageFlow } from "@/components/marriage/MarriageFlow";

export default async function MarriagePage() {
  const data = await getMarriageData();

  return (
    <div className="flex flex-col items-center gap-4 px-4 pt-5">
      <h1 className="self-start text-lg font-extrabold text-[var(--color-navy)]">해연결호 혼인신고</h1>

      <div className="relative w-full max-w-[320px] overflow-hidden rounded-[20px] shadow-[0_8px_24px_rgba(36,54,90,0.18)]">
        <Image
          src="/images/misc/marriage-document.jpg"
          alt="해연결호 혼인신고서"
          width={700}
          height={933}
          unoptimized
          style={{ width: "100%", height: "auto" }}
        />
      </div>

      <div className="w-full max-w-[320px]">
        <MarriageFlow data={data} />
      </div>
    </div>
  );
}
