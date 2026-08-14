import Image from "next/image";
import { MARRIAGE_DOCUMENT_PRICE } from "@/lib/domain/constants";

export default function MarriagePage() {
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

      <p className="max-w-[280px] text-center text-[12px] text-[var(--color-navy-soft)]">
        커플링을 보유하면 혼인신고서(${MARRIAGE_DOCUMENT_PRICE})를 구매할 수 있어요. 상대가 도장을 찍으면 명예의 전당에 등재돼요. 구매·서명 기능은 다음 업데이트에서 열려요.
      </p>
    </div>
  );
}
