"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BOTTOM_TABS } from "@/lib/domain/constants";
import { playSfx } from "@/lib/audio/audioManager";

// 5개 탭 전부 GitHub에 새로 올라온 home-ui/*.png 실제 그림으로 교체 — 홈 화면 전용 매핑이라
// 다른 화면에서 쓰는 GameIcon("home" 등)의 실제 파일은 건드리지 않는다.
const HOME_UI_ICON: Record<string, string> = {
  home: "/images/home-ui/home-icon.png",
  cabin: "/images/home-ui/bed.png",
  deck: "/images/home-ui/ship-wheel.png",
  bag: "/images/home-ui/backpack-bear.png",
  menu: "/images/home-ui/menu-lines.png",
};

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-1/2 z-30 flex w-full max-w-[460px] -translate-x-1/2 items-stretch justify-between px-2 pb-[max(8px,env(safe-area-inset-bottom))] pt-6"
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
            className="flex flex-1 flex-col items-center gap-0.5 rounded-2xl py-1 text-[12px] font-bold transition-transform active:scale-90"
          >
            <span
              className={`flex h-[54px] w-[54px] items-center justify-center rounded-full bg-white ${active ? "shadow-[0_2px_10px_rgba(15,33,54,0.3)] ring-2 ring-[var(--color-coral)]" : "shadow-[0_1px_4px_rgba(15,33,54,0.18)]"}`}
            >
              <Image src={HOME_UI_ICON[tab.icon]} alt="" aria-hidden width={1254} height={1254} unoptimized className="w-10" style={{ height: "auto" }} />
            </span>
            <span className={`text-[13px] ${active ? "text-white" : "text-white/90"}`}>{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
