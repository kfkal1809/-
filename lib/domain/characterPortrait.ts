import type { CharacterKind, ChildGender, ChildStage } from "@/lib/domain/types";

// 사용자가 그려준 실제 캐릭터 일러스트(public/images/character/base/*.png) 매핑.
// 해녀/해남은 성인 1종, 새싹은 (연령대 3단계 × 성별 2종) 6종.
export interface CharacterPortraitKey {
  kind: CharacterKind;
  childGender?: ChildGender | null;
  childStage?: ChildStage | null;
}

type ChildStageGroup = "toddler" | "kindergarten" | "elementary";

// 그림으로 받은 3단계(유아/유치원/초등학생) 바깥의 연령(영아/중고생/대학생)은
// 가장 가까운 단계로 근사한다 — 새 연령대 그림이 오면 이 매핑만 넓히면 됨.
function toStageGroup(stage: ChildStage | null | undefined): ChildStageGroup {
  switch (stage) {
    case "infant":
    case "toddler":
      return "toddler";
    case "kindergarten":
      return "kindergarten";
    case "elementary":
    case "middle":
    case "high":
    case "university":
    default:
      return "elementary";
  }
}

// PORTRAIT_SIZE: 실측 픽셀 크기(가로x세로) — CharacterSprite가 비율 계산에 사용.
export const PORTRAIT_SIZE: Record<string, { w: number; h: number }> = {
  haenyeo: { w: 357, h: 772 },
  haenam: { w: 395, h: 700 },
  child_toddler_male: { w: 409, h: 700 },
  child_toddler_female: { w: 452, h: 635 },
  child_kindergarten_male: { w: 440, h: 694 },
  child_kindergarten_female: { w: 507, h: 684 },
  child_elementary_male: { w: 411, h: 697 },
  child_elementary_female: { w: 407, h: 650 },
};

export function characterPortraitKeyFor({ kind, childGender, childStage }: CharacterPortraitKey): string {
  if (kind === "haenyeo") return "haenyeo";
  if (kind === "haenam") return "haenam";
  const gender = childGender === "female" ? "female" : "male"; // unset/미지정 -> male 기본
  const stageGroup = toStageGroup(childStage);
  return `child_${stageGroup}_${gender}`;
}

export function characterPortraitSrc(key: CharacterPortraitKey): string {
  return `/images/character/base/${characterPortraitKeyFor(key)}.png`;
}

// 흰색 기본 의상(탱크탑+반바지) 영역만 골라낸 마스크 — outfitColor로 물들이는 데 사용.
// (자세한 생성 방식은 docs/ASSET_PIPELINE.md)
export function characterOutfitMaskSrc(key: CharacterPortraitKey): string {
  return `/images/character/base/masks/${characterPortraitKeyFor(key)}_outfit_mask.png`;
}
