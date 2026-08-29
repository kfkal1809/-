"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChildCharacterForm, type ChildPayload } from "@/components/onboarding/ChildCharacterForm";
import { playSfx } from "@/lib/audio/audioManager";

// 온보딩 때 새싹을 안 만들었거나 나중에 더 만들고 싶을 때를 위한 진입점 — 기존
// /onboarding/children과 완전히 같은 폼(ChildCharacterForm)과 API(/api/onboarding/children)를
// 재사용한다(온보딩 전용 로직이 아니라 그냥 "household에 새싹 추가"라 그대로 재사용 가능).
// 선실 캐릭터 열 안에 다른 캐릭터와 같은 자리에 놓이는 "+" 버튼 → 누르면 모달로 폼이 뜬다.
export function AddChildButton({ canAdd }: { canAdd: boolean }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!canAdd) return null;

  async function handleAdd(payload: ChildPayload) {
    setError(null);
    const res = await fetch("/api/onboarding/children", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error === "child_limit_reached" ? "새싹은 최대 3명까지 만들 수 있어요." : "저장에 실패했어요. 다시 시도해주세요.");
      throw new Error("failed");
    }
    playSfx("equip");
    setOpen(false);
    router.refresh();
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className="flex flex-col items-center gap-1">
        <span className="flex h-[92px] w-[70px] items-center justify-center rounded-2xl border-2 border-dashed border-white/70 bg-white/25 text-2xl font-bold text-white">
          +
        </span>
        <p className="rounded-full bg-white/85 px-2 text-[11px] font-bold text-[var(--color-navy)]">새싹 추가</p>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="max-h-[85vh] w-full max-w-[300px] overflow-y-auto rounded-[20px] bg-white p-3 shadow-[0_10px_40px_rgba(0,0,0,0.3)]">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-[14px] font-extrabold text-[var(--color-navy)]">새싹 추가하기</p>
              <button onClick={() => setOpen(false)} className="text-[12px] font-bold text-[var(--color-navy-soft)]">
                닫기
              </button>
            </div>
            <ChildCharacterForm onSubmit={handleAdd} compact />
            {error && <p className="mt-2 text-center text-[13px] font-bold text-[var(--color-danger)]">{error}</p>}
          </div>
        </div>
      )}
    </>
  );
}
