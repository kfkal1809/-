"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { GameIcon } from "@/components/icons/GameIcon";
import { RewardPopup } from "@/components/ui/RewardPopup";
import { playSfx } from "@/lib/audio/audioManager";

export function DateFortuneWidget({ messages }: { messages: string[] }) {
  const router = useRouter();
  // DateTopicCardWidget과 동일한 이유로 서버 렌더링 시점엔 항상 첫 번째 문구로 고정해두고,
  // 마운트 후(클라이언트에서만) 무작위로 뽑아야 hydration mismatch가 나지 않는다.
  const [fortune, setFortune] = useState(messages[0]);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFortune(messages[Math.floor(Math.random() * messages.length)]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reward, setReward] = useState<number | null>(null);

  async function handleClaim() {
    if (submitting || reward !== null) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/date/fortune/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fortuneText: fortune }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "failed");
      playSfx("mission-complete");
      setReward(data.reward);
    } catch (e) {
      setError(e instanceof Error && e.message === "already_done_today" ? "오늘의 운세는 이미 확인했어요." : "운세 확인에 실패했어요.");
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
        <GameIcon name="fortune" size={56} />
        <p className="text-[13px] font-bold text-[var(--color-navy-soft)]">오늘의 커플 운세</p>
        <p className="text-[16px] font-extrabold leading-snug text-[var(--color-navy)]">{fortune}</p>
        <button
          onClick={handleClaim}
          disabled={submitting}
          className="mt-1 rounded-full bg-[var(--color-coral)] px-6 py-2.5 text-[14px] font-bold text-white active:scale-95 disabled:opacity-60"
        >
          {submitting ? "확인 중..." : "오늘의 운세 받기"}
        </button>
        {error && <p className="text-[12px] font-bold text-[var(--color-danger)]">{error}</p>}
      </Card>
      {reward !== null && (
        <RewardPopup title="오늘의 운세" amountLabel={`+$${reward}`} description="오늘도 좋은 하루 보내세요!" onClose={handlePopupClose} />
      )}
    </>
  );
}
