// 선실 벽지/바닥재 스와치 목록 — public/images/cabin/{wallpaper,floor}/*.png
// (원본: design-assets/벽지와 바닥재 (1~5).png, Wallpaper/Flooring Set A/B/C 크롭)
export interface DecorSwatch {
  key: string;
  src: string;
}

function buildSet(prefix: string, folder: "wallpaper" | "floor", count: number): DecorSwatch[] {
  return Array.from({ length: count }, (_, i) => {
    const key = `${prefix}_${i + 1}`;
    return { key, src: `/images/cabin/${folder}/${key}.png` };
  });
}

export const WALLPAPER_SWATCHES: DecorSwatch[] = [
  ...buildSet("wallpaper_a", "wallpaper", 10),
  ...buildSet("wallpaper_b", "wallpaper", 10),
  ...buildSet("wallpaper_c", "wallpaper", 10),
];

export const FLOOR_SWATCHES: DecorSwatch[] = [...buildSet("floor_a", "floor", 10), ...buildSet("floor_b", "floor", 10)];

export function wallpaperSrc(key: string | null | undefined): string | null {
  return WALLPAPER_SWATCHES.find((s) => s.key === key)?.src ?? null;
}

export function floorSrc(key: string | null | undefined): string | null {
  return FLOOR_SWATCHES.find((s) => s.key === key)?.src ?? null;
}

// 기본 선실 원본(design-assets/기본 선실.png)의 벽/바닥 색칠 영역을 어림잡아 딴 좌표.
// room-base.png(1473x909) 기준 %— mix-blend-mode:multiply로 벽지/바닥재를 얹을 때 사용.
export const ROOM_CLIP = {
  leftWall: "polygon(0.7% 20.8%, 49.6% 2.1%, 49.6% 33.4%, 0.7% 60.4%)",
  rightWall: "polygon(49.6% 2.1%, 98.4% 20.8%, 98.4% 60.4%, 49.6% 33.4%)",
  floor: "polygon(2.7% 67%, 49.6% 45.6%, 96.4% 67%, 99.1% 71.9%, 49.6% 99.5%, 1% 71.9%)",
};
