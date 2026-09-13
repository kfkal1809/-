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
        {/* 원본 이미지는 빈칸만 그려져 있는 정적 그림이라, 실제 캐릭터 이름/관계 상태/커플링
            정보를 좌표에 맞춰 텍스트로 겹쳐 그린다(좌표는 700x933 원본 기준 실측). */}
        <div className="absolute inset-0">
          <FieldText topPct={28.9} label={data.haenyeoName} />
          <FieldText topPct={35.4} label={data.haenamName} />
          {data.relationStatus && (
            <span
              className="absolute text-[13px] font-extrabold text-[var(--color-coral)]"
              style={{
                top: "41.6%",
                left: data.relationStatus === "dating" ? "43.3%" : data.relationStatus === "engaged" ? "60.4%" : "77.7%",
                transform: "translate(-50%, -50%)",
              }}
            >
              ✓
            </span>
          )}
          <FieldText topPct={47.7} label={data.ringName} />
        </div>
      </div>

      <div className="w-full max-w-[320px]">
        <MarriageFlow data={data} />
      </div>
    </div>
  );
}

function FieldText({ topPct, label }: { topPct: number; label: string | null }) {
  if (!label) return null;
  return (
    <span
      className="absolute overflow-hidden text-ellipsis whitespace-nowrap text-[13px] font-bold text-[var(--color-navy)]"
      style={{ top: `${topPct}%`, left: "41.5%", width: "45%", transform: "translateY(-50%)" }}
    >
      {label}
    </span>
  );
}
