"use client";

import { useSyncExternalStore } from "react";
import { audioManager, type AudioSettings } from "./audioManager";

const emptySettings: AudioSettings = { sfxEnabled: true, sfxVolume: 0.7, bgmEnabled: true, bgmVolume: 0.5 };

// 설정 화면(음향 ON/OFF, 볼륨 슬라이더)이 audioManager의 상태를 반응형으로 읽을 수 있게 하는 훅.
export function useAudioSettings(): AudioSettings {
  return useSyncExternalStore(
    (onStoreChange) => audioManager.subscribe(onStoreChange),
    () => audioManager.getSettings(),
    () => emptySettings
  );
}
