"use client";

import { useRouter } from "next/navigation";
import { playSfx } from "@/lib/audio/audioManager";

export function BackButton() {
  const router = useRouter();
  return (
    <button
      onClick={() => {
        playSfx("ui-click");
        router.back();
      }}
      aria-label="뒤로가기"
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-[var(--color-navy)] shadow-[0_4px_14px_rgba(36,54,90,0.12)]"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 18l-6-6 6-6" />
      </svg>
    </button>
  );
}
