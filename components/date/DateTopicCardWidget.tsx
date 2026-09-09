"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { RewardPopup } from "@/components/ui/RewardPopup";
import { playSfx } from "@/lib/audio/audioManager";

export function DateTopicCardWidget({ cards }: { cards: string[] }) {
  const router = useRouter();
  // StoreWorkWidget과 동일한 이유로 서버 렌더링 시점엔 항상 첫 번째 카드로 고정해두고,
  // 마운트 후(클라이언트에서만) 무작위로 뽑아야 hydration mismatch가 나지 않는다.
  const [card, setCard] = useState(cards[0]);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCard(cards[Math.floor(Math.random() * cards.length)]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reward, setReward] = useState<number | null>(null);

  async function handleComplete() {
    if (submitting || reward !== null) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/date/topic-card/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cardText: card }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "failed");
      playSfx("mission-complete");
      setReward(data.reward);
    } catch (e) {
      setError(e instanceof Error && e.message === "already_done_today" ? "오늘은 이미 대화 카드를 완료했어요." : "완료 처리에 실패했어요.");
    } finally {
      setSubmitting(false);
    }
  }

  function handlePopupClose() {
    setReward(null);
    router.refresh();
  }

  return (
    <>
      <Card className="flex flex-col items-center gap-3 !p-5 text-center">
        <p className="text-[13px] font-bold text-[var(--color-navy-soft)]">오늘의 대화 주제 카드</p>
        <p className="text-[17px] font-extrabold leading-snug text-[var(--color-navy)]">{card}</p>
        <button
          onClick={handleComplete}
          disabled={submitting}
          className="mt-1 rounded-full bg-[var(--color-coral)] px-6 py-2.5 text-[14px] font-bold text-white active:scale-95 disabled:opacity-60"
        >
          {submitting ? "처리 중..." : "대화 완료하고 보상받기"}
        </button>
        {error && <p className="text-[12px] font-bold text-[var(--color-danger)]">{error}</p>}
      </Card>
      {reward !== null && (
        <RewardPopup
          title="대화 주제 카드 완료"
          amountLabel={`+$${reward}`}
          description="오늘도 함께 이야기 나눠줘서 고마워요!"
          onClose={handlePopupClose}
        />
      )}
    </>
  );
}
