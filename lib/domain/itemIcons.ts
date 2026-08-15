// item_catalog.sku → public/images/items/<sku>.png 로 실제 일러스트가 있는 아이템만 등록.
// 목록에 없는 sku는 인벤토리/낚시 결과에서 기존 희귀도 배지 플레이스홀더로 자연스럽게 대체된다.
export const ITEM_ICON_SKUS = new Set([
  "fish_mackerel",
  "fish_squid",
  "fish_tuna",
  "fish_octopus",
  "fish_pufferfish",
  "lost_old_phone",
  "lost_glove",
  "lost_notebook",
  "lost_earphone",
  "lost_leave_form",
  "lost_photo",
  "trash_boots",
  "trash_tire",
  "trash_can",
  "trash_slipper",
  "trash_sock",
  "furniture_bed",
  "furniture_desk",
  "furniture_chair",
  "furniture_shelf",
  "furniture_fridge",
  "furniture_rug",
  "furniture_porthole",
  "furniture_stand_light",
  "bonppuri_season_bouquet",
  "bonppuri_peony_bouquet",
  "bonppuri_mini_vase",
  "bonppuri_peony_vase",
  "bonppuri_wedding_bouquet",
  "bonppuri_premium_bouquet",
  "bonppuri_season_deco",
  "fish_crab",
  "lost_mug",
  "lost_boarding_pass",
  "child_outfit_hoodie",
  "child_outfit_overalls",
  "child_outfit_dress",
]);

export function itemIconSrc(sku: string | null | undefined): string | null {
  if (!sku || !ITEM_ICON_SKUS.has(sku)) return null;
  return `/images/items/${sku}.png`;
}
