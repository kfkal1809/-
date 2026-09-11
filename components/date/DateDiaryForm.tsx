"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { playSfx } from "@/lib/audio/audioManager";

export function DateDiaryForm({ writtenToday }: { writtenToday: boolean }) {
  const router = useRouter();
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(writtenToday);

  async function handleSubmit() {
    if (!text.trim() || done) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/date/diary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: text.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error === "already_written_today" ? "오늘은 이미 일기를 썼어요." : "작성에 실패했어요.");
      setText("");
      setDone(true);
      playSfx("guestbook");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "작성에 실패했어요.");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return <p className="text-center text-[13px] font-bold text-[var(--color-mint-deep)]">오늘의 일기를 남겼어요!</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        maxLength={140}
        rows={2}
        placeholder="오늘 하루를 한 줄로 남겨보세요"
        className="w-full resize-none rounded-2xl border-2 border-[var(--color-navy)]/10 bg-white px-4 py-2.5 text-[14px] outline-none focus:border-[var(--color-tab-active)]"
      />
      <div className="flex items-center justify-between">
        <p className="text-[12px] text-[var(--color-navy-soft)]">{text.length}/140</p>
        {error && <p className="text-[12px] font-bold text-[var(--color-danger)]">{error}</p>}
        <Button tone="mint" onClick={handleSubmit} disabled={submitting || !text.trim()} className="!px-4 !py-2 text-[13px]">
          등록
        </Button>
      </div>
    </div>
  );
}
