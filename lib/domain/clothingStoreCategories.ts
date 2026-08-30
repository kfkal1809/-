// 옷가게 카테고리 탭 — 디자인 시안의 7개 탭(전체/상의/하의/원피스/모자/신발/악세사리)을 그대로
// 유지하되, 하의/신발은 여전히 항상 empty 상태다(가짜 상품을 채우지 않음) — 실제 캐릭터
// 렌더러(CharacterSprite, lib/domain/characterFullBody.ts)에는 하의나 신발만 따로 갈아입는
// 레이어가 아예 없다. outfit_full/dress_full 에셋은 상의+하의(+신발)가 한 장으로 합쳐진
// "전신 의상" 스프라이트라, 상의를 사면 자동으로 하의·신발도 함께 바뀐다(하의만/신발만
// 갈아입는 기능 자체가 없음) — 그래서 별도 판매할 "하의"/"신발" 상품이 존재할 수 없다.
// 새로운 레이어 시스템을 만들지 않는 한 이 두 탭에 진짜 상품을 채울 방법이 없어 그대로
// 비워둔다(정직하게 기록, docs/PROGRESS.md 참고).
// 헤어(hair)는 item_catalog.category='hair' 그대로 사용 — outfit 카테고리와 달리 상의/원피스
// 구분이 필요 없어 매핑이 단순하다.
// outfit 카테고리는 실제 옷 종류(outfitKind, 예: "dress"/"tank"/"hoodie")가 있으면 그걸로
// 원피스 여부를 정확히 가르고, 없는 구식 상품은 예전처럼 sku에 "dress"가 들어간 것만
// 원피스로 분리한다(회귀 없음).
export type ClothingTabKey = "all" | "top" | "bottom" | "dress" | "hair" | "hat" | "shoes" | "accessory";

export const CLOTHING_TABS: { key: ClothingTabKey; label: string }[] = [
  { key: "all", label: "전체" },
  { key: "top", label: "상의" },
  { key: "bottom", label: "하의" },
  { key: "dress", label: "원피스" },
  { key: "hair", label: "헤어" },
  { key: "hat", label: "모자" },
  { key: "shoes", label: "신발" },
  { key: "accessory", label: "악세사리" },
];

export function clothingTabFor(category: "outfit" | "hair" | "hat" | "accessory", sku: string, outfitKind?: string): ClothingTabKey {
  if (category === "hair") return "hair";
  if (category === "hat") return "hat";
  if (category === "accessory") return "accessory";
  if (outfitKind) return outfitKind === "dress" ? "dress" : "top";
  return sku.includes("dress") ? "dress" : "top";
}

// characters.kind/department → item_catalog.subcategory 호환 키. 온보딩 스타터 지급 로직
// (app/api/onboarding/complete/route.ts)과 같은 값을 쓴다.
export type CompatKey = "haenyeo" | "haenam_deck" | "haenam_engine" | "child";

export function compatKeyFor(kind: string, department: string | null): CompatKey {
  if (kind === "haenyeo") return "haenyeo";
  if (kind === "child") return "child";
  return department === "engine" ? "haenam_engine" : "haenam_deck";
}
