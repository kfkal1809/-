"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { GameIcon } from "@/components/icons/GameIcon";
import { playSfx } from "@/lib/audio/audioManager";

export function DateGiftWidget({ messages }: { messages: string[] }) {
  const router = useRouter();
  // DateTopicCardWidget과 동일한 이유로 서버 렌더링 시점엔 항상 첫 번째 문구로 고정해두고,
  // 마운트 후(클라이언트에서만) 무작위로 뽑아야 hydration mismatch가 나지 않는다.
  const [message, setMessage] = useState(messages[0]);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMessage(messages[Math.floor(Math.random() * messages.length)]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function handleSend() {
    if (submitting || sent) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/date/gift/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "failed");
      playSfx("item-get");
      setSent(true);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error && e.message === "already_sent_today" ? "오늘은 이미 선물을 보냈어요." : "선물 보내기에 실패했어요.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card className="flex flex-col items-center gap-3 !p-5 text-center">
      <GameIcon name="gift" size={56} />
      <p className="text-[13px] font-bold text-[var(--color-navy-soft)]">오늘의 선물 메시지</p>
      <p className="text-[16px] font-extrabold leading-snug text-[var(--color-navy)]">&ldquo;{message}&rdquo;</p>
      {sent ? (
        <p className="text-[13px] font-bold text-[var(--color-mint-deep)]">선물을 보냈어요! 우편함에서 확인할 수 있어요.</p>
      ) : (
        <button
          onClick={handleSend}
          disabled={submitting}
          className="mt-1 rounded-full bg-[var(--color-coral)] px-6 py-2.5 text-[14px] font-bold text-white active:scale-95 disabled:opacity-60"
        >
          {submitting ? "보내는 중..." : "이 마음 보내기"}
        </button>
      )}
      {error && <p className="text-[12px] font-bold text-[var(--color-danger)]">{error}</p>}
    </Card>
  );
}
