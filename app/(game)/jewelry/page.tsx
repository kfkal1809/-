import { RING_SETS } from "@/lib/domain/constants";
import { Card } from "@/components/ui/Card";
import { GameIcon } from "@/components/icons/GameIcon";

export default function JewelryPage() {
  return (
    <div className="flex flex-col gap-4 px-4 pt-5">
      <h1 className="text-lg font-extrabold text-[var(--color-navy)]">귀금속점</h1>
      <p className="text-[12px] text-[var(--color-navy-soft)]">커플링을 함께 맞추면 혼인신고서를 구매할 수 있어요.</p>

      <div className="flex flex-col gap-2.5">
        {RING_SETS.map((r) => (
          <Card key={r.key} className="flex items-center gap-3 !p-4">
            <GameIcon name="ring" size={44} />
            <div className="flex-1">
              <p className="text-[13px] font-bold text-[var(--color-navy)]">{r.name}</p>
              <p className="text-[11px] text-[var(--color-navy-soft)]">구매 기능은 다음 업데이트에서 열려요</p>
            </div>
            <p className="text-[14px] font-extrabold text-[var(--color-coral)]">${r.price}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
