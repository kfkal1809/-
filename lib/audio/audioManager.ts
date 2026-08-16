"use client";

// 전역 SFX/BGM 매니저 — 컴포넌트에서 <audio>를 각자 만들지 않고 이 모듈 하나를 통해서만
// 소리를 재생한다. 브라우저(특히 모바일 Safari/Chrome)의 autoplay 제약, 음원 파일이 아직
// 없는 상태, 짧은 효과음의 겹쳐 재생 등을 모두 여기서 한 번에 처리한다.
//
// 왜 Web Audio API/Howler.js가 아니라 HTMLAudioElement인가: 이 프로젝트에 필요한 건
// "여러 개 겹쳐 재생 가능한 짧은 효과음 pool" + "루프 재생되는 배경음악 한 트랙" 정도이고,
// 둘 다 <audio> 엘리먹트 여러 개로 충분히 구현된다. Web Audio API는 AudioContext
// suspend/resume, 디코딩 등 신경 쓸 게 늘어나고, Howler.js는 이 정도 요구사항에 비해
// 새 의존성을 들일 이유가 부족하다고 판단했다(package.json에 오디오 라이브러리 없음).

import { SFX_MANIFEST, SFX_PRELOAD, BGM_MANIFEST, type SfxKey, type BgmKey } from "./manifest";

const STORAGE_KEY = "hgs-audio-settings-v1";
const SFX_POOL_SIZE = 4; // 같은 효과음이 빠르게 여러 번 겹쳐도 끊기지 않도록 각 키마다 인스턴스 여러 개
const BGM_FADE_MS = 260;

export interface AudioSettings {
  sfxEnabled: boolean;
  sfxVolume: number; // 0..1
  bgmEnabled: boolean;
  bgmVolume: number; // 0..1
}

const DEFAULT_SETTINGS: AudioSettings = {
  sfxEnabled: true,
  sfxVolume: 0.7, // 기본값은 너무 크지 않게
  bgmEnabled: true,
  bgmVolume: 0.5,
};

function loadSettings(): AudioSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw) as Partial<AudioSettings>;
    return {
      sfxEnabled: parsed.sfxEnabled ?? DEFAULT_SETTINGS.sfxEnabled,
      sfxVolume: clamp01(parsed.sfxVolume ?? DEFAULT_SETTINGS.sfxVolume),
      bgmEnabled: parsed.bgmEnabled ?? DEFAULT_SETTINGS.bgmEnabled,
      bgmVolume: clamp01(parsed.bgmVolume ?? DEFAULT_SETTINGS.bgmVolume),
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

function clamp01(n: number): number {
  return Math.min(1, Math.max(0, n));
}

class AudioManager {
  private settings: AudioSettings = DEFAULT_SETTINGS;
  private listeners = new Set<() => void>();
  private sfxPools = new Map<SfxKey, HTMLAudioElement[]>();
  private sfxCursor = new Map<SfxKey, number>();
  private unavailable = new Set<string>(); // 로드/재생 실패가 확인된 키(파일 없음 등) — 재시도 안 함
  private bgmEl: HTMLAudioElement | null = null;
  private currentBgmKey: BgmKey | null = null;
  private bgmFadeTimer: ReturnType<typeof setInterval> | null = null;
  private unlocked = false;
  private unlockListenerAttached = false;

  constructor() {
    if (typeof window !== "undefined") {
      this.settings = loadSettings();
    }
  }

  getSettings(): AudioSettings {
    return this.settings;
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((l) => l());
  }

  private persist() {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(this.settings));
    } catch {
      // localStorage 접근 불가(프라이빗 모드 등) — 설정 저장만 실패, 앱 동작에는 영향 없음
    }
  }

  setSfxEnabled(enabled: boolean) {
    this.settings = { ...this.settings, sfxEnabled: enabled };
    this.persist();
    this.notify();
  }

  setSfxVolume(volume0to100: number) {
    this.settings = { ...this.settings, sfxVolume: clamp01(volume0to100 / 100) };
    this.persist();
    this.notify();
  }

  setBgmEnabled(enabled: boolean) {
    this.settings = { ...this.settings, bgmEnabled: enabled };
    this.persist();
    this.notify();
    if (!enabled) {
      this.stopBgm();
    } else if (this.currentBgmKey) {
      this.playBgm(this.currentBgmKey);
    }
  }

  setBgmVolume(volume0to100: number) {
    this.settings = { ...this.settings, bgmVolume: clamp01(volume0to100 / 100) };
    this.persist();
    this.notify();
    if (this.bgmEl) this.bgmEl.volume = this.settings.bgmVolume;
  }

  /** 첫 사용자 제스처(pointerdown/click/touchstart/keydown) 이후 한 번만 호출됨.
   * 모바일 브라우저의 autoplay 제한을 풀기 위해, 이미 만들어둔 오디오 엘리먼트를
   * 조용히 한 번 재생/정지해 "이 페이지는 오디오 재생 허가를 받았다"는 상태를 만든다. */
  private unlock = () => {
    if (this.unlocked) return;
    this.unlocked = true;
    for (const pool of this.sfxPools.values()) {
      const el = pool[0];
      if (!el) continue;
      const prevVolume = el.volume;
      el.volume = 0;
      el.play()
        .then(() => {
          el.pause();
          el.currentTime = 0;
          el.volume = prevVolume;
        })
        .catch(() => {
          el.volume = prevVolume;
        });
    }
  };

  /** 앱 시작 시(루트에서) 한 번 호출 — 제스처 리스너 등록 + 자주 쓰는 효과음 프리로드. */
  init() {
    if (typeof window === "undefined") return;
    if (!this.unlockListenerAttached) {
      this.unlockListenerAttached = true;
      const handler = () => {
        this.unlock();
        window.removeEventListener("pointerdown", handler);
        window.removeEventListener("touchstart", handler);
        window.removeEventListener("keydown", handler);
      };
      window.addEventListener("pointerdown", handler, { once: true });
      window.addEventListener("touchstart", handler, { once: true });
      window.addEventListener("keydown", handler, { once: true });

      // 백그라운드→포그라운드 복귀 시에도 정상 동작하도록, 탭이 다시 보일 때 BGM이 멈춰
      // 있으면(브라우저가 임의로 정지시킨 경우) 다시 재생 시도.
      document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "visible" && this.currentBgmKey && this.settings.bgmEnabled) {
          this.bgmEl?.play().catch(() => {});
        }
      });
    }
    for (const key of SFX_PRELOAD) {
      this.ensureSfxPool(key);
    }
  }

  private ensureSfxPool(key: SfxKey): HTMLAudioElement[] {
    let pool = this.sfxPools.get(key);
    if (pool) return pool;
    const src = SFX_MANIFEST[key];
    pool = Array.from({ length: SFX_POOL_SIZE }, () => {
      const el = new Audio(src);
      el.preload = "auto";
      el.addEventListener("error", () => {
        // 실제 음원 파일이 아직 없는 경우 등 — 이후로는 이 키에 대해 재생 시도를 조용히 건너뛴다.
        this.unavailable.add(`sfx:${key}`);
      });
      return el;
    });
    this.sfxPools.set(key, pool);
    this.sfxCursor.set(key, 0);
    return pool;
  }

  /** 짧은 효과음 재생. 실패해도 절대 throw하지 않는다(파일 없음/autoplay 차단 등 모두 무시). */
  playSfx(key: SfxKey) {
    if (typeof window === "undefined") return;
    if (!this.settings.sfxEnabled) return;
    if (this.unavailable.has(`sfx:${key}`)) return;
    try {
      const pool = this.ensureSfxPool(key);
      const cursor = this.sfxCursor.get(key) ?? 0;
      const el = pool[cursor];
      this.sfxCursor.set(key, (cursor + 1) % pool.length);
      el.volume = this.settings.sfxVolume;
      el.currentTime = 0;
      el.play().catch(() => {
        // autoplay 차단/디코딩 실패 등 — 게임 로직에 영향 없이 조용히 무시
      });
    } catch {
      // 어떤 이유로든 재생 준비 자체가 실패해도 호출부에는 영향 없음
    }
  }

  /** 화면에 맞는 배경음악을 재생 — 이미 같은 트랙이 재생 중이면 아무 것도 안 한다. */
  playBgm(key: BgmKey) {
    if (typeof window === "undefined") return;
    this.currentBgmKey = key;
    if (!this.settings.bgmEnabled) return;
    if (this.unavailable.has(`bgm:${key}`)) return;
    if (this.bgmEl && this.currentBgmKey === key && !this.bgmEl.paused) return;

    const nextEl = new Audio(BGM_MANIFEST[key]);
    nextEl.loop = true;
    nextEl.volume = 0;
    nextEl.addEventListener("error", () => {
      this.unavailable.add(`bgm:${key}`);
    });

    const prevEl = this.bgmEl;
    this.bgmEl = nextEl;
    nextEl.play().catch(() => {
      // 재생 실패(파일 없음/autoplay 차단) — 조용히 무시, 다음 화면 이동 시 다시 시도됨
    });
    this.fadeTo(nextEl, this.settings.bgmVolume);
    if (prevEl) this.fadeOutAndStop(prevEl);
  }

  stopBgm() {
    this.currentBgmKey = null;
    if (this.bgmEl) {
      this.fadeOutAndStop(this.bgmEl);
      this.bgmEl = null;
    }
  }

  private fadeTo(el: HTMLAudioElement, target: number) {
    if (this.bgmFadeTimer) clearInterval(this.bgmFadeTimer);
    const steps = 10;
    const start = el.volume;
    let i = 0;
    this.bgmFadeTimer = setInterval(() => {
      i++;
      el.volume = clamp01(start + ((target - start) * i) / steps);
      if (i >= steps && this.bgmFadeTimer) {
        clearInterval(this.bgmFadeTimer);
        this.bgmFadeTimer = null;
      }
    }, BGM_FADE_MS / steps);
  }

  private fadeOutAndStop(el: HTMLAudioElement) {
    const steps = 10;
    const start = el.volume;
    let i = 0;
    const timer = setInterval(() => {
      i++;
      el.volume = clamp01(start * (1 - i / steps));
      if (i >= steps) {
        clearInterval(timer);
        el.pause();
        el.src = "";
      }
    }, BGM_FADE_MS / steps);
  }
}

export const audioManager = new AudioManager();

export function playSfx(key: SfxKey) {
  audioManager.playSfx(key);
}

export function playBgm(key: BgmKey) {
  audioManager.playBgm(key);
}

export function stopBgm() {
  audioManager.stopBgm();
}
