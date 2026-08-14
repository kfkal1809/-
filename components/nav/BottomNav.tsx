"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BOTTOM_TABS } from "@/lib/domain/constants";
import { GameIcon } from "@/components/icons/GameIcon";

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="sticky bottom-0 z-30 mx-auto flex w-full max-w-[460px] items-stretch justify-between border-t-2 border-white bg-white/95 px-2 pb-[max(8px,env(safe-area-inset-bottom))] pt-2 backdrop-blur"
      aria-label="하단 메뉴"
    >
      {BOTTOM_TABS.map((tab) => {
        const active = pathname === tab.href || (tab.href !== "/home" && pathname.startsWith(tab.href));
        return (
          <Link
            key={tab.key}
            href={tab.href}
            className="flex flex-1 flex-col items-center gap-0.5 rounded-2xl py-1.5 text-[11px] font-bold"
          >
            <GameIcon name={tab.icon as never} size={30} withBadge={false} />
            <span className={active ? "text-[var(--color-tab-active)]" : "text-[var(--color-tab-inactive)]"}>
              {tab.label}
            </span>
            <span
              className={`h-1 w-1 rounded-full ${active ? "bg-[var(--color-tab-active)]" : "bg-transparent"}`}
            />
          </Link>
        );
      })}
    </nav>
  );
}
