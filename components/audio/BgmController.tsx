"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { playBgm, stopBgm } from "@/lib/audio/audioManager";
import { bgmKeyForPath } from "@/lib/audio/manifest";

// 현재 경로에 맞는 배경음악을 자동으로 재생/전환 — 앱 셸에 한 번만 마운트하면 된다.
// 화면 전환할 때마다 각 페이지가 직접 BGM을 신경 쓸 필요가 없다.
export function BgmController() {
  const pathname = usePathname();

  useEffect(() => {
    const key = bgmKeyForPath(pathname);
    if (key) playBgm(key);
    else stopBgm();
  }, [pathname]);

  return null;
}
