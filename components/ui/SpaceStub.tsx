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
    <div className="flex flex-col gap-4 px-4 pt-5">
      <h1 className="text-lg font-extrabold text-[var(--color-navy)]">{title}</h1>

      <div className="flex flex-col items-center">
        {bgId ? (
          <div className="relative w-full">
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[26px] border-2 border-white shadow-[0_6px_20px_rgba(36,54,90,0.10)]">
              <Image src={`/images/backgrounds/${bgId}.jpg`} alt="" fill unoptimized style={{ objectFit: "cover" }} />
            </div>
            {npcId && (
              <div className="relative -mt-14 flex flex-col items-center">
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
          npcId && (
            <Image
              src={`/images/npcs/${npcId}.png`}
              alt={npcName ?? ""}
              width={120}
              height={200}
              unoptimized
              style={{ width: 120, height: "auto" }}
            />
          )
        )}

        {npcId && (
          <div className="mt-1 text-center">
            <p className="text-[15px] font-extrabold text-[var(--color-navy)]">{npcName}</p>
            <p className="text-[11px] text-[var(--color-navy-soft)]">{npcTitle}</p>
          </div>
        )}

        {npcLine && (
          <p className="mt-2 max-w-[260px] rounded-2xl bg-white px-4 py-2.5 text-center text-[14px] font-bold text-[var(--color-navy)] shadow-[0_4px_14px_rgba(36,54,90,0.08)]">
            {npcLine}
          </p>
        )}
        {description && <p className="mt-2 max-w-[280px] text-center text-[13px] text-[var(--color-navy-soft)]">{description}</p>}
      </div>
    </div>
  );
}
