import { Card } from "@/components/ui/Card";
import { CharacterSprite } from "@/components/character/CharacterSprite";
import type { CharacterAppearance } from "@/lib/domain/characterPresets";

export function SpaceStub({
  title,
  npcName,
  npcTitle,
  npcLine,
  npcAppearance,
  description,
}: {
  title: string;
  npcName?: string;
  npcTitle?: string;
  npcLine?: string;
  npcAppearance?: CharacterAppearance;
  description: string;
}) {
  return (
    <div className="flex flex-col gap-4 px-4 pt-5">
      <h1 className="text-lg font-extrabold text-[var(--color-navy)]">{title}</h1>

      <Card tone="cream" className="flex flex-col items-center gap-3 py-8 text-center">
        {npcAppearance && (
          <div className="flex flex-col items-center">
            <CharacterSprite appearance={npcAppearance} size={104} />
            <p className="mt-1 text-[14px] font-extrabold text-[var(--color-navy)]">{npcName}</p>
            <p className="text-[10px] text-[var(--color-navy-soft)]">{npcTitle}</p>
          </div>
        )}
        {npcLine && (
          <p className="max-w-[240px] rounded-2xl bg-white px-4 py-2.5 text-[13px] font-bold text-[var(--color-navy)] shadow-[0_4px_14px_rgba(36,54,90,0.08)]">
            {npcLine}
          </p>
        )}
        <p className="max-w-[260px] text-[12px] text-[var(--color-navy-soft)]">{description}</p>
      </Card>
    </div>
  );
}
