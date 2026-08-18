import Image from "next/image";

export function SpaceStub({
  title,
  npcName,
  npcTitle,
  npcLine,
  npcId,
  bgId,
  description,
}: {
  title: string;
  npcName?: string;
  npcTitle?: string;
  npcLine?: string;
  npcId?: string;
  bgId?: string;
  description?: string;
}) {
  return (
    <div className="flex flex-col gap-4">
      {bgId ? (
        <div className="relative w-full">
          {/* 배경은 화면 폭에 꽉 차게(풀블리드) — 카드처럼 여백/모서리를 두지 않는다. */}
          <div className="relative aspect-[4/3] w-full overflow-hidden">
            <Image src={`/images/backgrounds/${bgId}.jpg`} alt="" fill unoptimized style={{ objectFit: "cover" }} />
          </div>
          <h1 className="absolute left-4 top-4 text-lg font-extrabold text-white drop-shadow-[0_2px_6px_rgba(36,54,90,0.55)]">
            {title}
          </h1>
          {npcId && (
            <div className="relative -mt-14 flex flex-col items-center px-4">
              <Image
                src={`/images/npcs/${npcId}.png`}
                alt={npcName ?? ""}
                width={110}
                height={190}
                unoptimized
                style={{ width: 110, height: "auto", filter: "drop-shadow(0 6px 10px rgba(36,54,90,0.25))" }}
              />
            </div>
          )}
        </div>
      ) : (
        <div className="px-4 pt-5">
          <h1 className="text-lg font-extrabold text-[var(--color-navy)]">{title}</h1>
          {npcId && (
            <Image
              src={`/images/npcs/${npcId}.png`}
              alt={npcName ?? ""}
              width={120}
              height={200}
              unoptimized
              style={{ width: 120, height: "auto" }}
            />
          )}
        </div>
      )}

      <div className="flex flex-col items-center px-4">
        {npcId && (
          <div className="text-center">
            <p className="text-[15px] font-extrabold text-[var(--color-navy)]">{npcName}</p>
            <p className="text-[11px] text-[var(--color-navy-soft)]">{npcTitle}</p>
          </div>
        )}

        {npcLine && (
          // 말풍선: 위쪽 흰 박스 + 아래로 향하는 꼬리(뾰족한 삼각형)로 NPC가 말하는 것처럼 보이게 함.
          <div className="relative mt-2 max-w-[280px]">
            <p className="break-keep rounded-2xl bg-white px-4 py-2.5 text-center text-[14px] font-bold leading-relaxed text-[var(--color-navy)] shadow-[0_4px_14px_rgba(36,54,90,0.08)]">
              {npcLine}
            </p>
            <span
              aria-hidden
              className="absolute left-1/2 top-full h-3 w-3 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-white shadow-[2px_2px_2px_-1px_rgba(36,54,90,0.06)]"
            />
          </div>
        )}
        {description && (
          <p className="mt-3 max-w-[280px] break-keep text-center text-[13px] leading-relaxed text-[var(--color-navy-soft)]">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}
