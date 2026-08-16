"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BOTTOM_TABS } from "@/lib/domain/constants";
import { GameIcon } from "@/components/icons/GameIcon";

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
            className="flex flex-1 flex-col items-center gap-0.5 rounded-2xl py-1.5 text-[12px] font-bold"
          >
            <span
              className={`flex h-9 w-9 items-center justify-center rounded-full ${active ? "bg-white shadow-[0_2px_8px_rgba(15,33,54,0.25)]" : ""}`}
            >
              <GameIcon name={tab.icon as never} size={26} withBadge={false} />
            </span>
            <span className={active ? "text-white" : "text-white/70"}>{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
