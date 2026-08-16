// 효과음/배경음악 중앙 매니페스트 — 코드에서는 이 키로만 재생을 요청하고, 실제 파일 경로는
// 여기서만 관리한다(components/*.tsx가 직접 파일 경로를 다루지 않도록).
//
// 실제 음원 파일은 아래 경로에 그대로 넣으면 된다. 파일이 없어도 앱은 깨지지 않는다
// (AudioManager가 로드 실패를 조용히 무시하고 이후 재생 요청도 없는 파일로 표시해 재시도하지
// 않는다 — lib/audio/audioManager.ts 참고).

export type SfxKey =
  | "ui-click"
  | "attendance"
  | "coin"
  | "purchase"
  | "item-get"
  | "rare-item"
  | "equip"
  | "furniture-place"
  | "furniture-pickup"
  | "fishing-start"
  | "fishing-result"
  | "fishing-legendary"
  | "food"
  | "mission-complete"
  | "guestbook"
  | "marriage"
  | "notification";

export const SFX_MANIFEST: Record<SfxKey, string> = {
  "ui-click": "/audio/sfx/ui-click.mp3",
  attendance: "/audio/sfx/attendance.mp3",
  coin: "/audio/sfx/coin.mp3",
  purchase: "/audio/sfx/purchase.mp3",
  "item-get": "/audio/sfx/item-get.mp3",
  "rare-item": "/audio/sfx/rare-item.mp3",
  equip: "/audio/sfx/equip.mp3",
  "furniture-place": "/audio/sfx/furniture-place.mp3",
  "furniture-pickup": "/audio/sfx/furniture-pickup.mp3",
  "fishing-start": "/audio/sfx/fishing-start.mp3",
  "fishing-result": "/audio/sfx/fishing-result.mp3",
  "fishing-legendary": "/audio/sfx/fishing-legendary.mp3",
  food: "/audio/sfx/food.mp3",
  "mission-complete": "/audio/sfx/mission-complete.mp3",
  guestbook: "/audio/sfx/guestbook.mp3",
  marriage: "/audio/sfx/marriage.mp3",
  notification: "/audio/sfx/notification.mp3",
};

// 게임 시작 직후(첫 사용자 제스처) 바로 필요할 가능성이 높은 짧고 자주 쓰는 효과음만
// 미리 로드한다 — 나머지는 처음 재생 요청이 올 때 그때 로드(lazy)한다.
export const SFX_PRELOAD: SfxKey[] = ["ui-click", "coin", "attendance"];

export type BgmKey = "home" | "cabin" | "deck" | "bonppuri" | "liri-gopchang" | "fishing";

export const BGM_MANIFEST: Record<BgmKey, string> = {
  home: "/audio/bgm/home.mp3",
  cabin: "/audio/bgm/cabin.mp3",
  deck: "/audio/bgm/deck.mp3",
  bonppuri: "/audio/bgm/bonppuri.mp3",
  "liri-gopchang": "/audio/bgm/liri-gopchang.mp3",
  fishing: "/audio/bgm/fishing.mp3",
};

// 경로(pathname) → 재생할 BGM. 여기 없는 화면(온보딩, 지갑, 승선확인증 등)은 지정된 분위기가
// 없어서 재생 중이던 BGM을 자연스럽게 멈춘다(엉뚱한 분위기 음악이 계속 나오는 것보다 무음이 낫다).
export const BGM_ROUTE_MAP: { test: (pathname: string) => boolean; key: BgmKey }[] = [
  { test: (p) => p === "/home", key: "home" },
  { test: (p) => p.startsWith("/cabin"), key: "cabin" },
  { test: (p) => p === "/deck", key: "deck" },
  { test: (p) => p.startsWith("/stores/bonppuri"), key: "bonppuri" },
  { test: (p) => p.startsWith("/stores/liri-gopchang"), key: "liri-gopchang" },
  { test: (p) => p === "/fishing", key: "fishing" },
];

export function bgmKeyForPath(pathname: string): BgmKey | null {
  return BGM_ROUTE_MAP.find((r) => r.test(pathname))?.key ?? null;
}
