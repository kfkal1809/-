import Image from "next/image";
import { RING_SETS } from "@/lib/domain/constants";
import { Card } from "@/components/ui/Card";
import { RingBuyButton } from "@/components/jewelry/RingBuyButton";

const RING_IMAGE: Record<string, string> = {
  wave_ring: "ring-wave",
  shell_ring: "ring-shell",
  lighthouse_ring: "ring-lighthouse",
};

export default function JewelryPage() {
  return (
    <div className="flex flex-col gap-4 px-4 pt-5">
      <h1 className="text-lg font-extrabold text-[var(--color-navy)]">귀금속점</h1>

      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[26px] border-2 border-white shadow-[0_6px_20px_rgba(36,54,90,0.10)]">
        <Image src="/images/backgrounds/jewelry.jpg" alt="" fill unoptimized style={{ objectFit: "cover" }} />
      </div>

      <p className="text-[13px] text-[var(--color-navy-soft)]">커플링을 함께 맞추면 혼인신고서를 구매할 수 있어요.</p>

      <div className="flex flex-col gap-2.5">
        {RING_SETS.map((r) => (
          <Card key={r.key} className="flex items-center gap-3 !p-3">
            <Image
              src={`/images/rings/${RING_IMAGE[r.key]}.png`}
              alt={r.name}
              width={72}
              height={54}
              unoptimized
              style={{ width: 72, height: "auto" }}
            />
            <div className="flex-1">
              <p className="text-[14px] font-bold text-[var(--color-navy)]">{r.name}</p>
              <p className="text-[12px] text-[var(--color-navy-soft)]">{r.description}</p>
            </div>
            <RingBuyButton sku={r.sku} price={r.price} />
          </Card>
        ))}
      </div>
    </div>
  );
}
