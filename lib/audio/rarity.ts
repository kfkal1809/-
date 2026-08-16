import { playSfx } from "./audioManager";

// 아이템 획득 효과음은 희귀도에 따라 다르게(과하지 않게) — 낚시/조리/복원 등 여러 곳에서 재사용.
export function playItemGetSfx(rarity: string | null | undefined) {
  if (rarity === "legendary") playSfx("fishing-legendary");
  else if (rarity === "rare" || rarity === "epic") playSfx("rare-item");
  else playSfx("item-get");
}
