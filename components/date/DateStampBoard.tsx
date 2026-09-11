"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { GameIcon, type IconName } from "@/components/icons/GameIcon";
import { RewardPopup } from "@/components/ui/RewardPopup";
import { playSfx } from "@/lib/audio/audioManager";
import type { DateStampStatus } from "@/lib/game/dateStampData";

const STAMP_ICONS: Record<string, IconName> = {
  topic_card: "heart",
  gift: "gift",
  photo: "camera",
  fishing: "fishing",
  deck: "deck",
  mess: "chef",
};

export function DateStampBoard({
  stamps,
  allClear,
  claimed,
  reward,
}: {
  stamps: DateStampStatus[];
  allClear: boolean;
  claimed: boolean;
  reward: number;
}) {
  const router = useRouter();
  const doneCount = stamps.filter((s) => s.done).length;
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [justClaimed, setJustClaimed] = useState(false);

  async function handleClaim() {
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/date/stamps/claim", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "failed");
      playSfx("mission-complete");
      setJustClaimed(true);
    } catch {
      setError("수령에 실패했어요.");
    } finally {
      setSubmitting(false);
    }
  }

  function handlePopupClose() {
    setJustClaimed(false);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-4">
      <Card tone="cream" className="flex items-center justify-between !p-4">
        <p className="text-[14px] font-extrabold text-[var(--color-navy)]">오늘의 데이트 스탬프</p>
        <p className="text-[16px] font-extrabold text-[var(--color-coral)]">{doneCount}/{stamps.length}</p>
      </Card>

      <div className="grid grid-cols-3 gap-2.5">
        {stamps.map((s) => (
          <Card
            key={s.key}
            tone={s.done ? "aqua" : "surface"}
            className={`flex flex-col items-center gap-1 !p-3 text-center ${s.done ? "" : "opacity-50"}`}
          >
            <GameIcon name={STAMP_ICONS[s.key] ?? "heart"} size={32} />
            <span className="text-[11px] font-bold leading-tight text-[var(--color-navy)]">{s.label}</span>
            <span className="text-[10px] font-extrabold text-[var(--color-mint-deep)]">{s.done ? "완료" : "미완료"}</span>
          </Card>
        ))}
      </div>

      <Card tone="cream" className="flex items-center gap-3 !p-3">
        <GameIcon name="trophy" size={38} />
        <div className="flex-1">
          <p className="text-[13px] font-extrabold text-[var(--color-navy)]">스탬프 올클리어 보너스</p>
          <p className="mt-0.5 text-[11px] font-bold text-[var(--color-navy-soft)]">{doneCount}/{stamps.length}개 완료</p>
        </div>
        {claimed ? (
          <p className="text-[12px] font-extrabold text-[var(--color-mint-deep)]">수령완료</p>
        ) : allClear ? (
          <button
            onClick={handleClaim}
            disabled={submitting}
            className="rounded-full bg-[var(--color-coral)] px-4 py-1.5 text-[13px] font-extrabold text-white active:scale-95 disabled:opacity-60"
          >
            {submitting ? "수령 중..." : `+$${reward} 받기`}
          </button>
        ) : (
          <p className="text-[14px] font-extrabold text-[var(--color-coral)]">+${reward}</p>
        )}
      </Card>
      {error && <p className="text-center text-[12px] font-bold text-[var(--color-danger)]">{error}</p>}

      {justClaimed && (
        <RewardPopup
          title="데이트 스탬프판 올클리어"
          amountLabel={`+$${reward}`}
          description="오늘 하루도 알차게 데이트했네요!"
          onClose={handlePopupClose}
        />
      )}
    </div>
  );
}
