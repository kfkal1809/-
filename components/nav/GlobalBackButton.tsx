"use client";

import { useRouter, usePathname } from "next/navigation";
import { playSfx } from "@/lib/audio/audioManager";
import { BOTTOM_TABS } from "@/lib/domain/constants";

// 하단 탭 5개(홈/선실/갑판/가방/메뉴)는 각자 자체적으로 진입하는 최상위 화면이라 뒤로가기가
// 필요 없다 — 그 외 모든 세부 화면(설정/지갑/우편함/선내식당/가구상점 등)에 공통으로 뜨는
// 플로팅 뒤로가기 버튼. 페이지마다 따로 넣지 않고 레이아웃에 한 번만 마운트한다.
const ROOT_PATHS = new Set(BOTTOM_TABS.map((t) => t.href));

// 옷가게/가구상점은 이미 자체 헤더 안에 뒤로가기가 붙어있어(BackButton, 타이틀 배너와 한 줄로
// 묶인 디자인) 전역 플로팅 버튼이 겹쳐 보이지 않도록 여기서만 예외로 뺀다.
const SELF_HANDLED_PATHS = ["/stores/clothing", "/stores/furniture"];

export function GlobalBackButton() {
  const router = useRouter();
  const pathname = usePathname();

  if (ROOT_PATHS.has(pathname)) return null;
  if (SELF_HANDLED_PATHS.some((p) => pathname.startsWith(p))) return null;

  return (
    <button
      onClick={() => {
        playSfx("ui-click");
        router.back();
      }}
      aria-label="뒤로가기"
      className="fixed left-3 top-[max(12px,env(safe-area-inset-top))] z-40 flex h-10 w-10 items-center justify-center rounded-full bg-white text-[var(--color-navy)] shadow-[0_4px_14px_rgba(36,54,90,0.18)]"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 18l-6-6 6-6" />
      </svg>
    </button>
  );
}
