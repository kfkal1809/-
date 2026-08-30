// 옷가게 카테고리 탭 — 디자인 시안의 7개 탭(전체/상의/하의/원피스/모자/신발/악세사리)에서
// "상의"를 "세트의상"으로 바꿔 8개 키를 정의한다. 상의/하의/신발이 여전히 항상 empty인 이유는
// 실제 캐릭터 렌더러(CharacterSprite, lib/domain/characterFullBody.ts)에 상의·하의·신발을
// 따로 갈아입는 레이어가 아예 없기 때문이다 — outfit_full/dress_full 에셋은 원본 디자인
// 시트(design-assets/해녀 의상.png, 기관사 항해사 해남이 의상 (1~4).png 등)부터 이미
// 상의+하의(+신발)가 한 장으로 합쳐진 "전신 의상" 일러스트라, 상의만/하의만/신발만 갈아입는
// 기능 자체가 있을 수 없다(전수 확인 완료, 원본 시트 자체에 분리된 그림이 없음). 그래서
// 기존에 "상의" 탭에 넣던 오버롤/후드티 같은 전신 의상들은 실제로는 상의가 아니라
// "세트의상"(구매하면 상하의+신발이 통째로 바뀜)이라 "set" 탭으로 재분류했다 — "상의" 탭에
// 두면 하의는 안 바뀌는 것처럼 오해하게 만든다. "상의"/"하의"/"신발" 탭 키 자체는 향후 진짜
// 독립 레이어 에셋이 생기면 쓸 수 있도록 남겨두되, 지금은 항상 비어 있으므로
// ClothingStoreScreen에서 상품이 0개인 탭은 노출하지 않는다(가짜로 채우는 대신 탭을 숨김).
// 헤어(hair)는 item_catalog.category='hair' 그대로 사용 — outfit 카테고리와 달리 상의/원피스
// 구분이 필요 없어 매핑이 단순하다.
// outfit 카테고리는 실제 옷 종류(outfitKind, 예: "dress"/"tank"/"hoodie")가 있으면 그걸로
// 원피스 여부를 정확히 가르고, 없는 구식 상품은 예전처럼 sku에 "dress"가 들어간 것만
// 원피스로 분리한다(회귀 없음).
export type ClothingTabKey = "all" | "top" | "bottom" | "dress" | "set" | "hair" | "hat" | "shoes" | "accessory";

export const CLOTHING_TABS: { key: ClothingTabKey; label: string }[] = [
  { key: "all", label: "전체" },
  { key: "set", label: "세트의상" },
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
  if (outfitKind) return outfitKind === "dress" ? "dress" : "set";
  return sku.includes("dress") ? "dress" : "set";
}

// characters.kind/department → item_catalog.subcategory 호환 키. 온보딩 스타터 지급 로직
// (app/api/onboarding/complete/route.ts)과 같은 값을 쓴다.
export type CompatKey = "haenyeo" | "haenam_deck" | "haenam_engine" | "child";

export function compatKeyFor(kind: string, department: string | null): CompatKey {
  if (kind === "haenyeo") return "haenyeo";
  if (kind === "child") return "child";
  return department === "engine" ? "haenam_engine" : "haenam_deck";
}
