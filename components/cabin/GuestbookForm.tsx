"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

export function GuestbookForm({ cabinSpaceId }: { cabinSpaceId: string }) {
  const router = useRouter();
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (!text.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/guestbook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cabinSpaceId, body: text.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error === "rate_limited" ? "잠시 후 다시 작성해주세요." : "작성에 실패했어요.");
      setText("");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "작성에 실패했어요.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        maxLength={300}
        rows={2}
        placeholder="따뜻한 말 한마디를 남겨주세요"
        className="w-full resize-none rounded-2xl border-2 border-[var(--color-navy)]/10 bg-white px-4 py-2.5 text-[14px] outline-none focus:border-[var(--color-tab-active)]"
      />
      <div className="flex items-center justify-between">
        <p className="text-[12px] text-[var(--color-navy-soft)]">{text.length}/300</p>
        {error && <p className="text-[12px] font-bold text-[var(--color-danger)]">{error}</p>}
        <Button tone="mint" onClick={handleSubmit} disabled={submitting || !text.trim()} className="!px-4 !py-2 text-[13px]">
          등록
        </Button>
      </div>
    </div>
  );
}
