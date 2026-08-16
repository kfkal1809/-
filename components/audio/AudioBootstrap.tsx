"use client";

import { useEffect } from "react";
import { audioManager } from "@/lib/audio/audioManager";

// 루트 레이아웃에서 한 번만 마운트 — 첫 사용자 제스처 리스너 등록 + 자주 쓰는 효과음 프리로드.
// 화면에는 아무 것도 그리지 않는다.
export function AudioBootstrap() {
  useEffect(() => {
    audioManager.init();
  }, []);
  return null;
}
