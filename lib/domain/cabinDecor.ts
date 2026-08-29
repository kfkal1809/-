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
  // 바닥은 원근감 있는 마름모라 좌/우 절반을 나눠서 각각 다른 각도로 타일을 회전시켜야
  // 원화의 대각선 나무 바닥판 방향과 맞는다(RoomBackground 참고).
  leftFloor: "polygon(1% 71.9%, 2.7% 67%, 49.6% 45.6%, 49.6% 99.5%)",
  rightFloor: "polygon(49.6% 45.6%, 96.4% 67%, 99.1% 71.9%, 49.6% 99.5%)",
};

// room-base.png(1473x909) 실측 기준 좌/우 바닥판 방향 각도(도) — 원화의 나무 바닥판이
// 대각선으로 깔려 있어서, 타일 배경을 이 각도로 회전시켜야 원근과 맞는다.
export const FLOOR_TILE_ANGLE = { left: -15.7, right: 15.7 };

// 가구 배치용 바닥 경계 — ROOM_CLIP.floor(벽지/바닥재 틴트 마스크용, 손대면 그 기능이
// 깨짐)와는 별도로 둔, 가구 드래그 클램프 전용 폴리곤. room-base.png를 실측해보면 진짜
// 벽-바닥 경계선(굽도리널 아래)은 ROOM_CLIP.floor의 뒤쪽 변보다 화면상 더 위쪽(더 작은 y)에
// 있다 — anchor(가구 이미지의 bottom-center)가 ROOM_CLIP.floor 경계에 정확히 닿아도, 가구는
// 입체(헤드보드처럼 anchor보다 더 뒤로 뻗어 있는 부분)라 그 뒤쪽이 여전히 벽에서 몇 % 띄어져
// 보이는 걸 픽셀 실측(scipy 없이 RGB warmth 임계값)과 실제 침대/책상 렌더링으로 확인했다.
// 그래서 가구 클램프 경계만 뒤쪽으로 더 밀어서(각 꼭짓점 y를 8%p씩 줄여서) 가구를 더 뒤로
// 끌 수 있게 하고, 실측한 진짜 벽 경계에 거의 붙어 보이도록 맞췄다(0% 뒤로 밀면 실측 결과와
// 거의 같은 값). 뒤쪽 변(꼭짓점 3개)만 조정하고 앞쪽 변(문/캐릭터 쪽)은 원래 값 그대로 둔다.
const FURNITURE_FLOOR_CLIP =
  "polygon(2.7% 59%, 49.6% 37.6%, 96.4% 59%, 99.1% 71.9%, 49.6% 99.5%, 1% 71.9%)";

interface ZoneBounds {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
}

// ROOM_CLIP의 CSS polygon() 문자열(퍼센트 좌표)을 0~1 정규화 좌표 점 배열로 파싱한다.
// boundsFromClip(바운딩 박스)와 pointInPolygon/nearestPointOnPolygon(실제 폴리곤 판정) 양쪽에서 재사용.
function parsePolygon(clip: string): { x: number; y: number }[] {
  return clip
    .replace(/^polygon\(/, "")
    .replace(/\)$/, "")
    .split(",")
    .map((pair) => {
      const [x, y] = pair.trim().split(/\s+/).map((v) => parseFloat(v) / 100);
      return { x, y };
    });
}

// ROOM_CLIP의 폴리곤 좌표(퍼센트 문자열)에서 바운딩 박스를 뽑아 0~1 정규화 좌표로 변환.
// 드래그 중 좌표가 너무 멀리 튀지 않게 잡는 1차 안전망으로 쓴다(정밀한 경계는 폴리곤 클램프가 처리).
function boundsFromClip(clip: string): ZoneBounds {
  const points = parsePolygon(clip);
  return {
    xMin: Math.min(...points.map((p) => p.x)),
    xMax: Math.max(...points.map((p) => p.x)),
    yMin: Math.min(...points.map((p) => p.y)),
    yMax: Math.max(...points.map((p) => p.y)),
  };
}

// 점(x,y)가 폴리곤(points, 0~1 정규화) 안에 있는지 ray-casting으로 판정.
export function pointInPolygon(x: number, y: number, points: { x: number; y: number }[]): boolean {
  let inside = false;
  for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
    const { x: xi, y: yi } = points[i];
    const { x: xj, y: yj } = points[j];
    const intersects = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersects) inside = !inside;
  }
  return inside;
}

// 점(x,y)에서 선분(a,b)까지 가장 가까운 점을 구한다(표준 투영, t를 [0,1]로 clamp).
function closestPointOnSegment(x: number, y: number, a: { x: number; y: number }, b: { x: number; y: number }) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const lenSq = dx * dx + dy * dy;
  const t = lenSq === 0 ? 0 : Math.max(0, Math.min(1, ((x - a.x) * dx + (y - a.y) * dy) / lenSq));
  return { x: a.x + t * dx, y: a.y + t * dy };
}

// 점(x,y)가 폴리곤 밖이면 폴리곤 테두리(변) 중 가장 가까운 점으로 스냅한다 — "바닥/벽처럼
// 보이는 마름모 밖으로 가구를 못 끌고 나가게" 하는 실제 폴리곤 충돌판정. 바운딩 박스 클램프와
// 달리 isometric 모서리(예: 바닥 육각형의 뾰족한 앞/뒤 꼭짓점 옆 빈 삼각형 구간)도 정확히 막는다.
export function clampToPolygon(x: number, y: number, points: { x: number; y: number }[]): { x: number; y: number } {
  if (pointInPolygon(x, y, points)) return { x, y };
  let best = closestPointOnSegment(x, y, points[points.length - 1], points[0]);
  let bestDist = (best.x - x) ** 2 + (best.y - y) ** 2;
  for (let i = 0; i < points.length - 1; i++) {
    const candidate = closestPointOnSegment(x, y, points[i], points[i + 1]);
    const dist = (candidate.x - x) ** 2 + (candidate.y - y) ** 2;
    if (dist < bestDist) {
      best = candidate;
      bestDist = dist;
    }
  }
  return best;
}

export const ROOM_ZONES = {
  leftWall: boundsFromClip(ROOM_CLIP.leftWall),
  rightWall: boundsFromClip(ROOM_CLIP.rightWall),
  // 가구 배치 바운딩 박스는 ROOM_CLIP.floor(텍스처 틴트용)가 아니라 FURNITURE_FLOOR_CLIP에서
  // 뽑는다 — 그래야 뒤쪽으로 늘어난 폴리곤 범위까지 1차 바운딩 박스 클램프가 자르지 않는다.
  floor: boundsFromClip(FURNITURE_FLOOR_CLIP),
};

// 실제 폴리곤 충돌판정(clampToPolygon/pointInPolygon)에 쓰는 점 배열 — 가구 배치 전용
// FURNITURE_FLOOR_CLIP에서 파싱한다(좌표를 따로 손으로 옮겨 적지 않음).
export const FLOOR_POLYGON = parsePolygon(FURNITURE_FLOOR_CLIP);
export const LEFT_WALL_POLYGON = parsePolygon(ROOM_CLIP.leftWall);
export const RIGHT_WALL_POLYGON = parsePolygon(ROOM_CLIP.rightWall);

// 벽면 자체가 원근으로 기울어져 있는데(room-base.png 실측), 액자/시계 같은 벽 장식 소품은
// 전부 정면에서 본 평평한 그림이라 그냥 얹으면 벽 기울기와 안 맞아 붕 떠 보인다("벽 각도
// 미스얼라인" 버그). 벽 폴리곤 위쪽 모서리 기울기를 실측한 값 — 벽 장식을 놓을 때 기본
// 회전값으로 더해준다(furnitureWrapperStyleForItem 참고). 사용자가 회전 버튼으로 그 위에
// 추가 조정도 계속 할 수 있다.
export const WALL_TILT_DEG = { left: -13.3, right: 13.3 };

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

// floor 폴리곤 위 한 점이 실제로 폴리곤 안에 있는지 검사 — 바운딩 박스보다 정확하게
// "바닥 위에 서 있는지"를 확인할 때 쓴다(기본 배치 좌표를 고를 때 사용).
export function isInsideFloor(x: number, y: number): boolean {
  return pointInPolygon(x, y, FLOOR_POLYGON);
}

// 바닥 위 드래그 좌표를 실제 바닥 육각형 폴리곤 안으로 스냅한다 — 바운딩 박스만으로는
// 막지 못하던 "육각형 뾰족한 앞/뒤 꼭짓점 옆 빈 삼각형 구간"까지 정확히 막는다.
export function clampToFloorPolygon(x: number, y: number): { x: number; y: number } {
  return clampToPolygon(x, y, FLOOR_POLYGON);
}

// 벽 드래그 좌표를 실제 좌/우 벽 평행사변형 폴리곤 안으로 스냅한다 — x가 방 중앙(0.5) 기준
// 왼쪽/오른쪽 중 어디 있는지로 어느 벽 폴리곤을 쓸지 고른다(WALL_TILT_DEG의 좌우 판정과 동일 기준).
export function clampToWallPolygon(x: number, y: number): { x: number; y: number } {
  const polygon = x < 0.5 ? LEFT_WALL_POLYGON : RIGHT_WALL_POLYGON;
  return clampToPolygon(x, y, polygon);
}
