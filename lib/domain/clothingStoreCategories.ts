// 옷가게 카테고리 탭 — "상의·하의·원피스·신발 분리형이 아닌 한 벌 의상 교체 방식으로 전면
// 개편해달라"는 요청에 따라, 예전에 있던 상의/하의/원피스/세트의상/신발 탭 5개를 전부 없애고
// "의상" 단일 탭으로 합쳤다. 헤어는 의상이 아니므로 별도 탭 유지, 모자/악세사리도 그대로 둔다.
//
// item_catalog.category='outfit'인 행은 실제로 어떤 옷이든(오버롤이든 원피스든) 전부 한 장의
// 전신 스프라이트(outfit_full/dress_full)라 애초에 "상의만 갈아입기" 같은 게 불가능하다
// (전수 확인 완료 — design-assets/해녀 의상.png, 기관사 항해사 해남이 의상 (1~4).png,
// 캐릭터 의상 (1~10).png 원본 시트 자체가 상의+하의(+신발)를 한 장으로 그려서 나온다).
// 그래서 DB 스키마는 호환을 위해 기존 category='outfit' 그대로 두되(신·구 상품 마이그레이션
// 없이도 바로 동작), 화면에는 전부 "의상" 한 탭으로만 노출한다.
export type ClothingTabKey = "all" | "outfit" | "hair" | "hat" | "accessory";

export const CLOTHING_TABS: { key: ClothingTabKey; label: string }[] = [
  { key: "all", label: "전체" },
  { key: "outfit", label: "의상" },
  { key: "hair", label: "헤어" },
  { key: "hat", label: "모자" },
  { key: "accessory", label: "악세사리" },
];

export function clothingTabFor(category: "outfit" | "hair" | "hat" | "accessory"): ClothingTabKey {
  return category;
}

// characters.kind/department → item_catalog.subcategory 호환 키. 온보딩 스타터 지급 로직
// (app/api/onboarding/complete/route.ts)과 같은 값을 쓴다.
export type CompatKey = "haenyeo" | "haenam_deck" | "haenam_engine" | "child";

export function compatKeyFor(kind: string, department: string | null): CompatKey {
  if (kind === "haenyeo") return "haenyeo";
  if (kind === "child") return "child";
  return department === "engine" ? "haenam_engine" : "haenam_deck";
}
