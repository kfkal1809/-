import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { CharacterSprite } from "@/components/character/CharacterSprite";
import type { HomeVoyageCard } from "@/lib/game/homeData";

export function VoyageInfoCard({ voyage }: { voyage: HomeVoyageCard }) {
  return (
    <Link href="/voyage" className="block">
      <Card className="!p-4">
        <p className="text-[13px] font-extrabold text-[var(--color-navy)]">나의 항해 정보</p>

        <div className="mt-2 flex items-end justify-around">
          <div className="flex flex-col items-center">
            <CharacterSprite appearance={voyage.haenyeoAppearance} size={68} />
            <p className="mt-1 text-[13px] font-bold text-[var(--color-navy)]">{voyage.haenyeoName}</p>
            <p className="text-[10px] text-[var(--color-navy-soft)]">{voyage.haenyeoRole}</p>
          </div>
          <div className="mb-8 text-[var(--color-coral)]" aria-hidden>
            <svg width="18" height="14" viewBox="0 0 24 18">
              <path d="M2 9 C7 2, 17 2, 22 9 C17 16, 7 16, 2 9 Z" fill="currentColor" opacity={0.85} />
            </svg>
          </div>
          <div className="flex flex-col items-center">
            <CharacterSprite appearance={voyage.haenamAppearance} size={68} />
            <p className="mt-1 text-[13px] font-bold text-[var(--color-navy)]">{voyage.haenamName}</p>
            <p className="text-[10px] text-[var(--color-navy-soft)]">{voyage.haenamRole}</p>
          </div>
        </div>

        <div className="mt-3 flex items-stretch justify-between gap-2 rounded-2xl bg-[var(--color-sky)] p-3">
          <div className="flex-1 text-center">
            <p className="text-[10px] font-bold text-[var(--color-navy-soft)]">승선</p>
            <p className="text-[15px] font-extrabold text-[var(--color-coral)]">
              {voyage.boardedDays !== null ? `D+${voyage.boardedDays}` : "정보 없음"}
            </p>
          </div>
          <div className="w-px bg-[var(--color-navy)]/10" />
          <div className="flex-1 text-center">
            <p className="text-[10px] font-bold text-[var(--color-navy-soft)]">하선</p>
            <p className="text-[15px] font-extrabold text-[var(--color-tab-active)]">
              {voyage.signoffDays !== null ? `D-${voyage.signoffDays}` : "정보 없음"}
            </p>
          </div>
        </div>
      </Card>
    </Link>
  );
}
