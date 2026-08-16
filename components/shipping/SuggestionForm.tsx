"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";

export function SuggestionForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (!title.trim() || !body.trim()) {
      setError("제목과 내용을 모두 입력해주세요.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("로그인이 필요해요.");

      const { error: insertError } = await supabase
        .from("posts")
        .insert({ type: "suggestion", author_user_id: user.id, title: title.trim(), body: body.trim(), status: "접수" });
      if (insertError) throw insertError;

      setTitle("");
      setBody("");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "등록에 실패했어요.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-2 rounded-[24px] border-2 border-white bg-white p-4">
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="제목"
        className="rounded-xl border-2 border-[var(--color-navy)]/10 px-3 py-2 text-[14px] outline-none focus:border-[var(--color-tab-active)]"
      />
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={3}
        placeholder="선주 아랍에게 전할 내용을 적어주세요"
        className="resize-none rounded-xl border-2 border-[var(--color-navy)]/10 px-3 py-2 text-[14px] outline-none focus:border-[var(--color-tab-active)]"
      />
      {error && <p className="text-[12px] font-bold text-[var(--color-danger)]">{error}</p>}
      <Button tone="mint" onClick={handleSubmit} disabled={submitting}>
        건의하기
      </Button>
    </div>
  );
}
