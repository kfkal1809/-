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

interface ZoneBounds {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
}

// ROOM_CLIP의 폴리곤 좌표(퍼센트 문자열)에서 바운딩 박스를 뽑아 0~1 정규화 좌표로 변환.
// 완전한 폴리곤 충돌판정 대신 "바닥/벽 영역에서 크게 벗어나지 않게"하는 최소한의 배치 제약으로 쓴다.
function boundsFromClip(clip: string): ZoneBounds {
  const points = clip
    .replace(/^polygon\(/, "")
    .replace(/\)$/, "")
    .split(",")
    .map((pair) => {
      const [x, y] = pair.trim().split(/\s+/).map((v) => parseFloat(v) / 100);
      return { x, y };
    });
  return {
    xMin: Math.min(...points.map((p) => p.x)),
    xMax: Math.max(...points.map((p) => p.x)),
    yMin: Math.min(...points.map((p) => p.y)),
    yMax: Math.max(...points.map((p) => p.y)),
  };
}

export const ROOM_ZONES = {
  leftWall: boundsFromClip(ROOM_CLIP.leftWall),
  rightWall: boundsFromClip(ROOM_CLIP.rightWall),
  floor: boundsFromClip(ROOM_CLIP.floor),
};

// wall 폴리곤 두 개(좌/우)를 합친 바운딩 박스 — placementType "wall"용.
export const WALL_BOUNDS: ZoneBounds = {
  xMin: Math.min(ROOM_ZONES.leftWall.xMin, ROOM_ZONES.rightWall.xMin),
  xMax: Math.max(ROOM_ZONES.leftWall.xMax, ROOM_ZONES.rightWall.xMax),
  yMin: Math.min(ROOM_ZONES.leftWall.yMin, ROOM_ZONES.rightWall.yMin),
  yMax: Math.max(ROOM_ZONES.leftWall.yMax, ROOM_ZONES.rightWall.yMax),
};

export function clampToZone(x: number, y: number, bounds: ZoneBounds): { x: number; y: number } {
  return {
    x: Math.min(bounds.xMax, Math.max(bounds.xMin, x)),
    y: Math.min(bounds.yMax, Math.max(bounds.yMin, y)),
  };
}

// room-base.png 오른쪽 벽의 실제 문 위치를 픽셀 단위로 측정해서 뽑은 x 범위(문+여닫이 여유
// 포함). 기본 배치를 고를 때 이 구간을 피해서 가구가 문을 가리지 않게 한다.
export const DOOR_X_RANGE = { min: 0.76, max: 0.93 };

// 문 앞 바닥의 keep-out 영역(자유배치 드래그에서도 회피) — 문 x범위 바로 앞 바닥 구간.
export const DOOR_CLEARANCE: ZoneBounds = { xMin: DOOR_X_RANGE.min, xMax: DOOR_X_RANGE.max, yMin: 0.55, yMax: 0.78 };

// 캐릭터가 서는 중앙 앞쪽 바닥 — CabinRoom의 CHARACTER_Y(0.86)를 기준으로 한 여유 영역.
// 자유배치 드래그에서 가구가 캐릭터 자리를 완전히 덮지 않도록 회피한다.
export const CHARACTER_SPAWN_ZONE: ZoneBounds = { xMin: 0.35, xMax: 0.65, yMin: 0.78, yMax: 0.95 };

export function isInKeepOutZone(x: number, y: number): boolean {
  const inRect = (r: ZoneBounds) => x >= r.xMin && x <= r.xMax && y >= r.yMin && y <= r.yMax;
  return inRect(DOOR_CLEARANCE) || inRect(CHARACTER_SPAWN_ZONE);
}

// floor 폴리곤 위 한 점이 실제로 폴리곤 안에 있는지 검사(ray casting) — 바운딩 박스보다
// 정확하게 "바닥 위에 서 있는지"를 확인할 때 쓴다(기본 배치 좌표를 고를 때 사용).
export function isInsideFloor(x: number, y: number): boolean {
  const points = ROOM_CLIP.floor
    .replace(/^polygon\(/, "")
    .replace(/\)$/, "")
    .split(",")
    .map((pair) => {
      const [px, py] = pair.trim().split(/\s+/).map((v) => parseFloat(v) / 100);
      return [px, py] as [number, number];
    });
  let inside = false;
  for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
    const [xi, yi] = points[i];
    const [xj, yj] = points[j];
    const intersects = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersects) inside = !inside;
  }
  return inside;
}
