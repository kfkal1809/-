// 가구상점 카테고리 탭 — cabinPlacement.ts의 FurnitureKind(가구 분류)를 상점 UI 탭으로 묶어서
// 보여준다. 상품을 UI에 하드코딩하지 않고, 실제 카탈로그 아이템의 sku로부터 분류된 종류를
// 여기서 탭 라벨로 매핑만 한다.
import { classify, type FurnitureKind } from "@/lib/domain/cabinPlacement";

export type StoreTabKey = "all" | "bed" | "table" | "seat" | "storage" | "decor" | "surface";

export const STORE_TABS: { key: StoreTabKey; label: string }[] = [
  { key: "all", label: "전체" },
  { key: "bed", label: "침대" },
  { key: "table", label: "책상" },
  { key: "seat", label: "의자" },
  { key: "storage", label: "수납" },
  { key: "decor", label: "장식" },
  { key: "surface", label: "벽/바닥" },
];

const CATEGORY_TO_TAB: Record<FurnitureKind, StoreTabKey> = {
  bed: "bed",
  table: "table",
  seat: "seat",
  storage: "storage",
  lamp: "decor",
  smallDeco: "decor",
  appliance: "decor",
  wallDeco: "surface",
  rug: "surface",
};

export function storeTabForSku(sku: string): StoreTabKey {
  return CATEGORY_TO_TAB[classify(sku)];
}
