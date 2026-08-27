// 옷가게 카테고리 탭 — 디자인 시안의 7개 탭(전체/상의/하의/원피스/모자/신발/악세사리)을 그대로
// 유지하되, 현재 MVP 카탈로그가 지원하지 않는 하의/신발은 매핑 대상이 없어 항상 empty 상태다
// (가짜 상품을 채우지 않음). outfit 카테고리는 실제 옷 종류(outfitKind, 예: "dress"/"tank"/
// "hoodie")가 있으면 그걸로 원피스 여부를 정확히 가르고, 없는 구식 상품은 예전처럼 sku에
// "dress"가 들어간 것만 원피스로 분리한다(회귀 없음).
export type ClothingTabKey = "all" | "top" | "bottom" | "dress" | "hat" | "shoes" | "accessory";

export const CLOTHING_TABS: { key: ClothingTabKey; label: string }[] = [
  { key: "all", label: "전체" },
  { key: "top", label: "상의" },
  { key: "bottom", label: "하의" },
  { key: "dress", label: "원피스" },
  { key: "hat", label: "모자" },
  { key: "shoes", label: "신발" },
  { key: "accessory", label: "악세사리" },
];

export function clothingTabFor(category: "outfit" | "hat" | "accessory", sku: string, outfitKind?: string): ClothingTabKey {
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
