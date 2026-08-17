import type { Facing } from "@/lib/domain/cabinPlacement";
import { getPlacementDef } from "@/lib/domain/cabinPlacement";
import { itemIconSrc } from "@/lib/domain/itemIcons";

// 가구 방향 전환 — sku + facing → 실제로 그 방향을 보여주는 asset 파일명(확장자 제외).
// 대부분의 가구는 원본 시트에 방향별 그림이 따로 없어서(단일 각도로만 그려짐) 여기 등록되지
// 않는다 — 등록 안 된 sku는 방향과 무관하게 항상 sku 자체를 그림으로 쓴다(기존 동작 그대로).
// 방향별 그림이 실제로 있는 아이템만, 그 그림들을 어느 Facing 값에 연결할지 여기서 명시한다.
//
// vintage_shell_bed: design-assets/빈티지 가구 시리즈.png 원본 시트에 이 침대만 좌/우로 튼
// 3/4 각도 그림이 진짜로 따로 있었다(나머지 "각도 변형"들은 눈으로 직접 비교해보니 카메라
// 각도가 아니라 그냥 비슷한 그림을 다시 그린 것이라 방향 전환에 못 쓴다 — 억지로 연결하면
// 버튼을 눌러도 그림이 거의 안 바뀌는 것처럼 보이는 가짜 기능이 된다).
const FURNITURE_FACING_ASSETS: Record<string, Partial<Record<Facing, string>>> = {
  vintage_shell_bed: {
    front: "vintage_shell_bed",
    "front-left": "vintage_shell_bed_left",
    "front-right": "vintage_shell_bed_right",
  },
};

// 이 sku가 실제로 지원하는 방향 목록. getPlacementDef().supportedFacings와 항상 같은 값을
// 반환하지만("어떤 방향이 배치상 자연스러운가"의 원천은 여전히 cabinPlacement.ts), 여기서는
// "그 방향의 그림이 실제로 존재하는가"까지 함께 확인해서 그림 없는 방향이 목록에 섞이지 않게
// 한다(둘은 항상 같이 채워 넣는 게 원칙이라 실전에서 갈릴 일은 없지만, 방어적으로 교차 확인).
export function availableFacings(sku: string): Facing[] {
  const def = getPlacementDef(sku);
  const assets = FURNITURE_FACING_ASSETS[sku];
  if (!assets) return [def.defaultFacing];
  return def.supportedFacings.filter((f) => assets[f] !== undefined);
}

// 다음 방향으로 순환 — 편집기의 "방향 전환" 버튼이 호출한다. 지원 방향이 1개 이하면 그대로
// 반환(버튼 자체가 안 보이지만, 방어적으로 no-op 처리).
export function cycleFacing(sku: string, current: Facing): Facing {
  const facings = availableFacings(sku);
  if (facings.length <= 1) return current;
  const idx = facings.indexOf(current);
  return facings[(idx + 1) % facings.length];
}

// 실제 렌더링에 쓸 이미지 경로. itemIconSrc와 같은 화이트리스트 규칙을 그대로 따른다(sku가
// ITEM_ICON_SKUS에 없으면 null — 호출부는 기존과 동일하게 이니셜 배지로 폴백해야 함).
// facing에 대응하는 그림이 실제로 등록돼 있을 때만 파일명을 바꿔치기하고, 그 외(방향 전환
// 미지원 가구, 알 수 없는 facing 값)에는 sku 기본 그림을 그대로 쓴다. 바닥/벽 anchor 계산
// (furnitureWrapperStyle)은 이 함수와 완전히 분리되어 있어서, 그림만 바뀌고 위치는 그대로
// 유지된다.
export function furnitureImageSrc(sku: string, facing: Facing | null | undefined): string | null {
  const base = itemIconSrc(sku);
  if (!base) return null;
  const assetKey = facing ? FURNITURE_FACING_ASSETS[sku]?.[facing] : undefined;
  return assetKey ? `/images/items/${assetKey}.png` : base;
}
