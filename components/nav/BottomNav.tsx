"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BOTTOM_TABS } from "@/lib/domain/constants";
import { GameIcon } from "@/components/icons/GameIcon";
import { playSfx } from "@/lib/audio/audioManager";

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="sticky bottom-0 z-30 mx-auto flex w-full max-w-[460px] items-stretch justify-between px-2 pb-[max(8px,env(safe-area-inset-bottom))] pt-6"
      style={{
        backgroundImage: "url(/images/home/wave-navbar-bg.png)",
        backgroundSize: "100% 100%",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "top",
      }}
      aria-label="하단 메뉴"
    >
      {BOTTOM_TABS.map((tab) => {
        const active = pathname === tab.href || (tab.href !== "/home" && pathname.startsWith(tab.href));
        return (
          <Link
            key={tab.key}
            href={tab.href}
            onClick={() => {
              if (!active) playSfx("ui-click");
            }}
            className="flex flex-1 flex-col items-center gap-0.5 rounded-2xl py-1.5 text-[12px] font-bold"
          >
            <span
              className={`flex h-12 w-12 items-center justify-center rounded-full bg-white ${active ? "shadow-[0_2px_10px_rgba(15,33,54,0.3)] ring-2 ring-[var(--color-coral)]" : "shadow-[0_1px_4px_rgba(15,33,54,0.18)]"}`}
            >
              <GameIcon name={tab.icon as never} size={34} withBadge={false} />
            </span>
            <span className={`text-[13px] ${active ? "text-white" : "text-white/90"}`}>{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
