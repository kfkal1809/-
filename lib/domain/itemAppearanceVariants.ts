// 시트 2/3/4/5/6/8/9(캐릭터 의상 정규화 파이프라인, scripts/asset-tools/normalize_dress_overlays.py)로
// 생성한 63벌의 새싹 체형별 전신 합성 이미지(dress_full/*.png) — 논리적 상품(sku)과 실제 렌더링
// 자산(bodyPresetKey별 assetKey)을 분리해서 관리한다. item_catalog.kind='child'가 새싹 8체형을
// 전부 하나로 묶어 관리하는데, 이 자산들은 전부 특정 체형 전용으로 이미 합성된 그림이라 범용
// SKU에 그대로 연결하면 다른 체형이 착용했을 때 그림이 안 맞는 문제가 있어 이 구조를 도입했다.
import type { CharacterKind, ChildGender, ChildStage } from "@/lib/domain/types";
import { characterPortraitKeyFor } from "@/lib/domain/characterPortrait";
import { ITEM_APPEARANCE_PATCH } from "@/lib/domain/itemAppearance";
import type { CharacterAppearance } from "@/lib/domain/characterPresets";

// public/images/character/base/*.png / head/*.png 실측 자산이 실제로 존재하는 8개 체형 preset
// key(lib/domain/characterPortrait.ts PORTRAIT_SIZE/HEAD_SIZE와 동일 — 새 체형 체계를 따로 만들지
// 않고 재사용). 해녀/해남은 체형이 각 1종이라 사실상 항상 변형 없이 그 키 하나만 쓰인다.
export type BodyPresetKey =
  | "haenyeo"
  | "haenam"
  | "child_toddler_male"
  | "child_toddler_female"
  | "child_kindergarten_male"
  | "child_kindergarten_female"
  | "child_elementary_male"
  | "child_elementary_female";

// characters 테이블의 kind/child_gender/child_stage로부터 실제 렌더링 자산이 묶여있는 체형 키를
// 계산한다 — characterPortraitKeyFor(기존, base 이미지 경로 계산용)와 완전히 같은 규칙을 그대로
// 재사용해 "같은 캐릭터인데 체형 키가 서로 다르게 계산되는" 불일치를 원천적으로 막는다.
export function bodyPresetKeyFor(
  kind: CharacterKind,
  childGender: ChildGender | null | undefined,
  childStage: ChildStage | null | undefined
): BodyPresetKey {
  return characterPortraitKeyFor({ kind, childGender, childStage }) as BodyPresetKey;
}

export interface AppearanceVariant {
  bodyPresetKey: BodyPresetKey;
  assetKey: string;
  patch: Partial<CharacterAppearance>;
}

// 검수 매니페스트 — 각 asset을 어느 시트/셀에서 가져왔는지, 어떤 체형용으로 확정했는지 기록.
// reviewStatus: "verified"는 실제 합성 결과를 전체 해상도로 열어 눈으로 확인했다는 뜻
// (docs/PROGRESS.md "캐릭터 의상 시트 2/4/6/9 추가 처리" 절 참고).
export interface OutfitVariantManifestEntry {
  sourceSheet: string;
  cellIndex: number;
  logicalItemKey: string;
  bodyPresetKey: BodyPresetKey;
  assetKey: string;
  slot: "outfit";
  reviewStatus: "verified";
}

export const OUTFIT_VARIANT_MANIFEST: OutfitVariantManifestEntry[] = [
  { sourceSheet: "캐릭터 의상 (3).png", cellIndex: 1, logicalItemKey: "child_dress_s3_01", bodyPresetKey: "child_toddler_male", assetKey: "child_toddler_male_dress_s3_01", slot: "outfit", reviewStatus: "verified" },
  { sourceSheet: "캐릭터 의상 (3).png", cellIndex: 2, logicalItemKey: "child_dress_s3_02", bodyPresetKey: "child_toddler_male", assetKey: "child_toddler_male_dress_s3_02", slot: "outfit", reviewStatus: "verified" },
  { sourceSheet: "캐릭터 의상 (3).png", cellIndex: 3, logicalItemKey: "child_dress_s3_03", bodyPresetKey: "child_toddler_male", assetKey: "child_toddler_male_dress_s3_03", slot: "outfit", reviewStatus: "verified" },
  { sourceSheet: "캐릭터 의상 (3).png", cellIndex: 4, logicalItemKey: "child_dress_s3_04", bodyPresetKey: "child_toddler_male", assetKey: "child_toddler_male_dress_s3_04", slot: "outfit", reviewStatus: "verified" },
  { sourceSheet: "캐릭터 의상 (3).png", cellIndex: 5, logicalItemKey: "child_dress_s3_05", bodyPresetKey: "child_toddler_male", assetKey: "child_toddler_male_dress_s3_05", slot: "outfit", reviewStatus: "verified" },
  { sourceSheet: "캐릭터 의상 (3).png", cellIndex: 6, logicalItemKey: "child_dress_s3_06", bodyPresetKey: "child_toddler_male", assetKey: "child_toddler_male_dress_s3_06", slot: "outfit", reviewStatus: "verified" },
  { sourceSheet: "캐릭터 의상 (3).png", cellIndex: 7, logicalItemKey: "child_dress_s3_07", bodyPresetKey: "child_toddler_male", assetKey: "child_toddler_male_dress_s3_07", slot: "outfit", reviewStatus: "verified" },
  { sourceSheet: "캐릭터 의상 (3).png", cellIndex: 8, logicalItemKey: "child_dress_s3_08", bodyPresetKey: "child_toddler_male", assetKey: "child_toddler_male_dress_s3_08", slot: "outfit", reviewStatus: "verified" },
  { sourceSheet: "캐릭터 의상 (3).png", cellIndex: 9, logicalItemKey: "child_dress_s3_09", bodyPresetKey: "child_toddler_male", assetKey: "child_toddler_male_dress_s3_09", slot: "outfit", reviewStatus: "verified" },
  { sourceSheet: "캐릭터 의상 (5).png", cellIndex: 1, logicalItemKey: "child_dress_s5_01", bodyPresetKey: "child_toddler_male", assetKey: "child_toddler_male_dress_s5_01", slot: "outfit", reviewStatus: "verified" },
  { sourceSheet: "캐릭터 의상 (5).png", cellIndex: 2, logicalItemKey: "child_dress_s5_02", bodyPresetKey: "child_toddler_male", assetKey: "child_toddler_male_dress_s5_02", slot: "outfit", reviewStatus: "verified" },
  { sourceSheet: "캐릭터 의상 (5).png", cellIndex: 3, logicalItemKey: "child_dress_s5_03", bodyPresetKey: "child_toddler_male", assetKey: "child_toddler_male_dress_s5_03", slot: "outfit", reviewStatus: "verified" },
  { sourceSheet: "캐릭터 의상 (5).png", cellIndex: 4, logicalItemKey: "child_dress_s5_04", bodyPresetKey: "child_toddler_male", assetKey: "child_toddler_male_dress_s5_04", slot: "outfit", reviewStatus: "verified" },
  { sourceSheet: "캐릭터 의상 (5).png", cellIndex: 5, logicalItemKey: "child_dress_s5_05", bodyPresetKey: "child_toddler_male", assetKey: "child_toddler_male_dress_s5_05", slot: "outfit", reviewStatus: "verified" },
  { sourceSheet: "캐릭터 의상 (5).png", cellIndex: 6, logicalItemKey: "child_dress_s5_06", bodyPresetKey: "child_toddler_male", assetKey: "child_toddler_male_dress_s5_06", slot: "outfit", reviewStatus: "verified" },
  { sourceSheet: "캐릭터 의상 (5).png", cellIndex: 7, logicalItemKey: "child_dress_s5_07", bodyPresetKey: "child_toddler_male", assetKey: "child_toddler_male_dress_s5_07", slot: "outfit", reviewStatus: "verified" },
  { sourceSheet: "캐릭터 의상 (5).png", cellIndex: 8, logicalItemKey: "child_dress_s5_08", bodyPresetKey: "child_toddler_male", assetKey: "child_toddler_male_dress_s5_08", slot: "outfit", reviewStatus: "verified" },
  { sourceSheet: "캐릭터 의상 (5).png", cellIndex: 9, logicalItemKey: "child_dress_s5_09", bodyPresetKey: "child_toddler_male", assetKey: "child_toddler_male_dress_s5_09", slot: "outfit", reviewStatus: "verified" },
  { sourceSheet: "캐릭터 의상 (8).png", cellIndex: 1, logicalItemKey: "child_dress_s8_01", bodyPresetKey: "child_toddler_male", assetKey: "child_toddler_male_dress_s8_01", slot: "outfit", reviewStatus: "verified" },
  { sourceSheet: "캐릭터 의상 (8).png", cellIndex: 2, logicalItemKey: "child_dress_s8_02", bodyPresetKey: "child_toddler_male", assetKey: "child_toddler_male_dress_s8_02", slot: "outfit", reviewStatus: "verified" },
  { sourceSheet: "캐릭터 의상 (8).png", cellIndex: 3, logicalItemKey: "child_dress_s8_03", bodyPresetKey: "child_toddler_male", assetKey: "child_toddler_male_dress_s8_03", slot: "outfit", reviewStatus: "verified" },
  { sourceSheet: "캐릭터 의상 (8).png", cellIndex: 4, logicalItemKey: "child_dress_s8_04", bodyPresetKey: "child_toddler_male", assetKey: "child_toddler_male_dress_s8_04", slot: "outfit", reviewStatus: "verified" },
  { sourceSheet: "캐릭터 의상 (8).png", cellIndex: 5, logicalItemKey: "child_dress_s8_05", bodyPresetKey: "child_toddler_male", assetKey: "child_toddler_male_dress_s8_05", slot: "outfit", reviewStatus: "verified" },
  { sourceSheet: "캐릭터 의상 (8).png", cellIndex: 6, logicalItemKey: "child_dress_s8_06", bodyPresetKey: "child_toddler_male", assetKey: "child_toddler_male_dress_s8_06", slot: "outfit", reviewStatus: "verified" },
  { sourceSheet: "캐릭터 의상 (8).png", cellIndex: 7, logicalItemKey: "child_dress_s8_07", bodyPresetKey: "child_toddler_male", assetKey: "child_toddler_male_dress_s8_07", slot: "outfit", reviewStatus: "verified" },
  { sourceSheet: "캐릭터 의상 (8).png", cellIndex: 8, logicalItemKey: "child_dress_s8_08", bodyPresetKey: "child_toddler_male", assetKey: "child_toddler_male_dress_s8_08", slot: "outfit", reviewStatus: "verified" },
  { sourceSheet: "캐릭터 의상 (8).png", cellIndex: 9, logicalItemKey: "child_dress_s8_09", bodyPresetKey: "child_toddler_male", assetKey: "child_toddler_male_dress_s8_09", slot: "outfit", reviewStatus: "verified" },
  { sourceSheet: "캐릭터 의상 (4).png", cellIndex: 1, logicalItemKey: "child_dress_s4_01", bodyPresetKey: "child_toddler_male", assetKey: "child_toddler_male_dress_s4_01", slot: "outfit", reviewStatus: "verified" },
  { sourceSheet: "캐릭터 의상 (4).png", cellIndex: 2, logicalItemKey: "child_dress_s4_02", bodyPresetKey: "child_toddler_male", assetKey: "child_toddler_male_dress_s4_02", slot: "outfit", reviewStatus: "verified" },
  { sourceSheet: "캐릭터 의상 (4).png", cellIndex: 3, logicalItemKey: "child_dress_s4_03", bodyPresetKey: "child_toddler_male", assetKey: "child_toddler_male_dress_s4_03", slot: "outfit", reviewStatus: "verified" },
  { sourceSheet: "캐릭터 의상 (4).png", cellIndex: 4, logicalItemKey: "child_dress_s4_04", bodyPresetKey: "child_toddler_male", assetKey: "child_toddler_male_dress_s4_04", slot: "outfit", reviewStatus: "verified" },
  { sourceSheet: "캐릭터 의상 (4).png", cellIndex: 5, logicalItemKey: "child_dress_s4_05", bodyPresetKey: "child_toddler_male", assetKey: "child_toddler_male_dress_s4_05", slot: "outfit", reviewStatus: "verified" },
  { sourceSheet: "캐릭터 의상 (4).png", cellIndex: 6, logicalItemKey: "child_dress_s4_06", bodyPresetKey: "child_toddler_male", assetKey: "child_toddler_male_dress_s4_06", slot: "outfit", reviewStatus: "verified" },
  { sourceSheet: "캐릭터 의상 (4).png", cellIndex: 7, logicalItemKey: "child_dress_s4_07", bodyPresetKey: "child_toddler_male", assetKey: "child_toddler_male_dress_s4_07", slot: "outfit", reviewStatus: "verified" },
  { sourceSheet: "캐릭터 의상 (4).png", cellIndex: 8, logicalItemKey: "child_dress_s4_08", bodyPresetKey: "child_toddler_male", assetKey: "child_toddler_male_dress_s4_08", slot: "outfit", reviewStatus: "verified" },
  { sourceSheet: "캐릭터 의상 (4).png", cellIndex: 9, logicalItemKey: "child_dress_s4_09", bodyPresetKey: "child_toddler_male", assetKey: "child_toddler_male_dress_s4_09", slot: "outfit", reviewStatus: "verified" },
  { sourceSheet: "캐릭터 의상 (6).png", cellIndex: 1, logicalItemKey: "child_dress_s6_01", bodyPresetKey: "child_toddler_female", assetKey: "child_toddler_female_dress_s6_01", slot: "outfit", reviewStatus: "verified" },
  { sourceSheet: "캐릭터 의상 (6).png", cellIndex: 2, logicalItemKey: "child_dress_s6_02", bodyPresetKey: "child_toddler_female", assetKey: "child_toddler_female_dress_s6_02", slot: "outfit", reviewStatus: "verified" },
  { sourceSheet: "캐릭터 의상 (6).png", cellIndex: 3, logicalItemKey: "child_dress_s6_03", bodyPresetKey: "child_toddler_female", assetKey: "child_toddler_female_dress_s6_03", slot: "outfit", reviewStatus: "verified" },
  { sourceSheet: "캐릭터 의상 (6).png", cellIndex: 4, logicalItemKey: "child_dress_s6_04", bodyPresetKey: "child_toddler_female", assetKey: "child_toddler_female_dress_s6_04", slot: "outfit", reviewStatus: "verified" },
  { sourceSheet: "캐릭터 의상 (6).png", cellIndex: 5, logicalItemKey: "child_dress_s6_05", bodyPresetKey: "child_toddler_female", assetKey: "child_toddler_female_dress_s6_05", slot: "outfit", reviewStatus: "verified" },
  { sourceSheet: "캐릭터 의상 (6).png", cellIndex: 6, logicalItemKey: "child_dress_s6_06", bodyPresetKey: "child_toddler_female", assetKey: "child_toddler_female_dress_s6_06", slot: "outfit", reviewStatus: "verified" },
  { sourceSheet: "캐릭터 의상 (6).png", cellIndex: 7, logicalItemKey: "child_dress_s6_07", bodyPresetKey: "child_toddler_female", assetKey: "child_toddler_female_dress_s6_07", slot: "outfit", reviewStatus: "verified" },
  { sourceSheet: "캐릭터 의상 (6).png", cellIndex: 8, logicalItemKey: "child_dress_s6_08", bodyPresetKey: "child_toddler_female", assetKey: "child_toddler_female_dress_s6_08", slot: "outfit", reviewStatus: "verified" },
  { sourceSheet: "캐릭터 의상 (6).png", cellIndex: 9, logicalItemKey: "child_dress_s6_09", bodyPresetKey: "child_toddler_female", assetKey: "child_toddler_female_dress_s6_09", slot: "outfit", reviewStatus: "verified" },
  { sourceSheet: "캐릭터 의상 (2).png", cellIndex: 1, logicalItemKey: "child_dress_s2_01", bodyPresetKey: "child_toddler_female", assetKey: "child_toddler_female_dress_s2_01", slot: "outfit", reviewStatus: "verified" },
  { sourceSheet: "캐릭터 의상 (2).png", cellIndex: 2, logicalItemKey: "child_dress_s2_02", bodyPresetKey: "child_toddler_female", assetKey: "child_toddler_female_dress_s2_02", slot: "outfit", reviewStatus: "verified" },
  { sourceSheet: "캐릭터 의상 (2).png", cellIndex: 3, logicalItemKey: "child_dress_s2_03", bodyPresetKey: "child_toddler_female", assetKey: "child_toddler_female_dress_s2_03", slot: "outfit", reviewStatus: "verified" },
  { sourceSheet: "캐릭터 의상 (2).png", cellIndex: 4, logicalItemKey: "child_dress_s2_04", bodyPresetKey: "child_toddler_female", assetKey: "child_toddler_female_dress_s2_04", slot: "outfit", reviewStatus: "verified" },
  { sourceSheet: "캐릭터 의상 (2).png", cellIndex: 5, logicalItemKey: "child_dress_s2_05", bodyPresetKey: "child_toddler_female", assetKey: "child_toddler_female_dress_s2_05", slot: "outfit", reviewStatus: "verified" },
  { sourceSheet: "캐릭터 의상 (2).png", cellIndex: 6, logicalItemKey: "child_dress_s2_06", bodyPresetKey: "child_toddler_female", assetKey: "child_toddler_female_dress_s2_06", slot: "outfit", reviewStatus: "verified" },
  { sourceSheet: "캐릭터 의상 (2).png", cellIndex: 7, logicalItemKey: "child_dress_s2_07", bodyPresetKey: "child_toddler_female", assetKey: "child_toddler_female_dress_s2_07", slot: "outfit", reviewStatus: "verified" },
  { sourceSheet: "캐릭터 의상 (2).png", cellIndex: 8, logicalItemKey: "child_dress_s2_08", bodyPresetKey: "child_toddler_female", assetKey: "child_toddler_female_dress_s2_08", slot: "outfit", reviewStatus: "verified" },
  { sourceSheet: "캐릭터 의상 (2).png", cellIndex: 9, logicalItemKey: "child_dress_s2_09", bodyPresetKey: "child_toddler_female", assetKey: "child_toddler_female_dress_s2_09", slot: "outfit", reviewStatus: "verified" },
  { sourceSheet: "캐릭터 의상 (9).png", cellIndex: 1, logicalItemKey: "child_dress_s9_01", bodyPresetKey: "child_elementary_male", assetKey: "child_elementary_male_dress_s9_01", slot: "outfit", reviewStatus: "verified" },
  { sourceSheet: "캐릭터 의상 (9).png", cellIndex: 2, logicalItemKey: "child_dress_s9_02", bodyPresetKey: "child_elementary_male", assetKey: "child_elementary_male_dress_s9_02", slot: "outfit", reviewStatus: "verified" },
  { sourceSheet: "캐릭터 의상 (9).png", cellIndex: 3, logicalItemKey: "child_dress_s9_03", bodyPresetKey: "child_elementary_male", assetKey: "child_elementary_male_dress_s9_03", slot: "outfit", reviewStatus: "verified" },
  { sourceSheet: "캐릭터 의상 (9).png", cellIndex: 4, logicalItemKey: "child_dress_s9_04", bodyPresetKey: "child_elementary_male", assetKey: "child_elementary_male_dress_s9_04", slot: "outfit", reviewStatus: "verified" },
  { sourceSheet: "캐릭터 의상 (9).png", cellIndex: 5, logicalItemKey: "child_dress_s9_05", bodyPresetKey: "child_elementary_male", assetKey: "child_elementary_male_dress_s9_05", slot: "outfit", reviewStatus: "verified" },
  { sourceSheet: "캐릭터 의상 (9).png", cellIndex: 6, logicalItemKey: "child_dress_s9_06", bodyPresetKey: "child_elementary_male", assetKey: "child_elementary_male_dress_s9_06", slot: "outfit", reviewStatus: "verified" },
  { sourceSheet: "캐릭터 의상 (9).png", cellIndex: 7, logicalItemKey: "child_dress_s9_07", bodyPresetKey: "child_elementary_male", assetKey: "child_elementary_male_dress_s9_07", slot: "outfit", reviewStatus: "verified" },
  { sourceSheet: "캐릭터 의상 (9).png", cellIndex: 8, logicalItemKey: "child_dress_s9_08", bodyPresetKey: "child_elementary_male", assetKey: "child_elementary_male_dress_s9_08", slot: "outfit", reviewStatus: "verified" },
  { sourceSheet: "캐릭터 의상 (9).png", cellIndex: 9, logicalItemKey: "child_dress_s9_09", bodyPresetKey: "child_elementary_male", assetKey: "child_elementary_male_dress_s9_09", slot: "outfit", reviewStatus: "verified" },
];

// sku -> 체형별 appearance variant. 한 상품(sku)이 여러 체형 variant를 가질 수 있는 구조로
// 설계했지만(향후 같은 디자인을 여러 체형으로 반복 제작할 경우 대비), 지금 있는 63개 자산은
// 시트 하나당 체형 하나라 실제로는 상품마다 variant가 1개씩이다.
export const ITEM_APPEARANCE_VARIANTS: Record<string, AppearanceVariant[]> = {
  child_dress_s3_01: [{ bodyPresetKey: "child_toddler_male", assetKey: "child_toddler_male_dress_s3_01", patch: { outfit: "tank", outfitColor: "#dbe6f5", fullPortraitKey: "child_toddler_male_dress_s3_01" } }],
  child_dress_s3_02: [{ bodyPresetKey: "child_toddler_male", assetKey: "child_toddler_male_dress_s3_02", patch: { outfit: "child_overalls", outfitColor: "#cfe0f7", fullPortraitKey: "child_toddler_male_dress_s3_02" } }],
  child_dress_s3_03: [{ bodyPresetKey: "child_toddler_male", assetKey: "child_toddler_male_dress_s3_03", patch: { outfit: "cardigan", outfitColor: "#f3ecdc", fullPortraitKey: "child_toddler_male_dress_s3_03" } }],
  child_dress_s3_04: [{ bodyPresetKey: "child_toddler_male", assetKey: "child_toddler_male_dress_s3_04", patch: { outfit: "hoodie", outfitColor: "#d8c3a5", fullPortraitKey: "child_toddler_male_dress_s3_04" } }],
  child_dress_s3_05: [{ bodyPresetKey: "child_toddler_male", assetKey: "child_toddler_male_dress_s3_05", patch: { outfit: "tank", outfitColor: "#c8cf9e", fullPortraitKey: "child_toddler_male_dress_s3_05" } }],
  child_dress_s3_06: [{ bodyPresetKey: "child_toddler_male", assetKey: "child_toddler_male_dress_s3_06", patch: { outfit: "child_overalls", outfitColor: "#a9b58c", fullPortraitKey: "child_toddler_male_dress_s3_06" } }],
  child_dress_s3_07: [{ bodyPresetKey: "child_toddler_male", assetKey: "child_toddler_male_dress_s3_07", patch: { outfit: "cardigan", outfitColor: "#e7ddc4", fullPortraitKey: "child_toddler_male_dress_s3_07" } }],
  child_dress_s3_08: [{ bodyPresetKey: "child_toddler_male", assetKey: "child_toddler_male_dress_s3_08", patch: { outfit: "tank", outfitColor: "#eef1e2", fullPortraitKey: "child_toddler_male_dress_s3_08" } }],
  child_dress_s3_09: [{ bodyPresetKey: "child_toddler_male", assetKey: "child_toddler_male_dress_s3_09", patch: { outfit: "tank", outfitColor: "#dce8f5", fullPortraitKey: "child_toddler_male_dress_s3_09" } }],
  child_dress_s5_01: [{ bodyPresetKey: "child_toddler_male", assetKey: "child_toddler_male_dress_s5_01", patch: { outfit: "sweatshirt", outfitColor: "#e6d9c2", fullPortraitKey: "child_toddler_male_dress_s5_01" } }],
  child_dress_s5_02: [{ bodyPresetKey: "child_toddler_male", assetKey: "child_toddler_male_dress_s5_02", patch: { outfit: "child_overalls", outfitColor: "#a9876a", fullPortraitKey: "child_toddler_male_dress_s5_02" } }],
  child_dress_s5_03: [{ bodyPresetKey: "child_toddler_male", assetKey: "child_toddler_male_dress_s5_03", patch: { outfit: "sweatshirt", outfitColor: "#2f3f5c", fullPortraitKey: "child_toddler_male_dress_s5_03" } }],
  child_dress_s5_04: [{ bodyPresetKey: "child_toddler_male", assetKey: "child_toddler_male_dress_s5_04", patch: { outfit: "pajama", outfitColor: "#cfe0f5", fullPortraitKey: "child_toddler_male_dress_s5_04" } }],
  child_dress_s5_05: [{ bodyPresetKey: "child_toddler_male", assetKey: "child_toddler_male_dress_s5_05", patch: { outfit: "child_overalls", outfitColor: "#5b7699", fullPortraitKey: "child_toddler_male_dress_s5_05" } }],
  child_dress_s5_06: [{ bodyPresetKey: "child_toddler_male", assetKey: "child_toddler_male_dress_s5_06", patch: { outfit: "cardigan", outfitColor: "#efe6d2", fullPortraitKey: "child_toddler_male_dress_s5_06" } }],
  child_dress_s5_07: [{ bodyPresetKey: "child_toddler_male", assetKey: "child_toddler_male_dress_s5_07", patch: { outfit: "tank", outfitColor: "#e9edf3", fullPortraitKey: "child_toddler_male_dress_s5_07" } }],
  child_dress_s5_08: [{ bodyPresetKey: "child_toddler_male", assetKey: "child_toddler_male_dress_s5_08", patch: { outfit: "tank", outfitColor: "#f2eee0", fullPortraitKey: "child_toddler_male_dress_s5_08" } }],
  child_dress_s5_09: [{ bodyPresetKey: "child_toddler_male", assetKey: "child_toddler_male_dress_s5_09", patch: { outfit: "hoodie", outfitColor: "#c9a77f", fullPortraitKey: "child_toddler_male_dress_s5_09" } }],
  child_dress_s8_01: [{ bodyPresetKey: "child_toddler_male", assetKey: "child_toddler_male_dress_s8_01", patch: { outfit: "tank", outfitColor: "#eef1e6", fullPortraitKey: "child_toddler_male_dress_s8_01" } }],
  child_dress_s8_02: [{ bodyPresetKey: "child_toddler_male", assetKey: "child_toddler_male_dress_s8_02", patch: { outfit: "tank", outfitColor: "#e7edf5", fullPortraitKey: "child_toddler_male_dress_s8_02" } }],
  child_dress_s8_03: [{ bodyPresetKey: "child_toddler_male", assetKey: "child_toddler_male_dress_s8_03", patch: { outfit: "cardigan", outfitColor: "#efe7d6", fullPortraitKey: "child_toddler_male_dress_s8_03" } }],
  child_dress_s8_04: [{ bodyPresetKey: "child_toddler_male", assetKey: "child_toddler_male_dress_s8_04", patch: { outfit: "hoodie", outfitColor: "#cfe0f2", fullPortraitKey: "child_toddler_male_dress_s8_04" } }],
  child_dress_s8_05: [{ bodyPresetKey: "child_toddler_male", assetKey: "child_toddler_male_dress_s8_05", patch: { outfit: "cardigan", outfitColor: "#e4ddd0", fullPortraitKey: "child_toddler_male_dress_s8_05" } }],
  child_dress_s8_06: [{ bodyPresetKey: "child_toddler_male", assetKey: "child_toddler_male_dress_s8_06", patch: { outfit: "child_overalls", outfitColor: "#5f7fa3", fullPortraitKey: "child_toddler_male_dress_s8_06" } }],
  child_dress_s8_07: [{ bodyPresetKey: "child_toddler_male", assetKey: "child_toddler_male_dress_s8_07", patch: { outfit: "tank", outfitColor: "#e9e7d5", fullPortraitKey: "child_toddler_male_dress_s8_07" } }],
  child_dress_s8_08: [{ bodyPresetKey: "child_toddler_male", assetKey: "child_toddler_male_dress_s8_08", patch: { outfit: "tank", outfitColor: "#eef1e6", fullPortraitKey: "child_toddler_male_dress_s8_08" } }],
  child_dress_s8_09: [{ bodyPresetKey: "child_toddler_male", assetKey: "child_toddler_male_dress_s8_09", patch: { outfit: "tank", outfitColor: "#dbe6f5", fullPortraitKey: "child_toddler_male_dress_s8_09" } }],
  child_dress_s4_01: [{ bodyPresetKey: "child_toddler_male", assetKey: "child_toddler_male_dress_s4_01", patch: { outfit: "sweatshirt", outfitColor: "#233350", fullPortraitKey: "child_toddler_male_dress_s4_01" } }],
  child_dress_s4_02: [{ bodyPresetKey: "child_toddler_male", assetKey: "child_toddler_male_dress_s4_02", patch: { outfit: "child_overalls", outfitColor: "#e08a3c", fullPortraitKey: "child_toddler_male_dress_s4_02" } }],
  child_dress_s4_03: [{ bodyPresetKey: "child_toddler_male", assetKey: "child_toddler_male_dress_s4_03", patch: { outfit: "hoodie", outfitColor: "#e9c85a", fullPortraitKey: "child_toddler_male_dress_s4_03" } }],
  child_dress_s4_04: [{ bodyPresetKey: "child_toddler_male", assetKey: "child_toddler_male_dress_s4_04", patch: { outfit: "cardigan", outfitColor: "#e7ddc4", fullPortraitKey: "child_toddler_male_dress_s4_04" } }],
  child_dress_s4_05: [{ bodyPresetKey: "child_toddler_male", assetKey: "child_toddler_male_dress_s4_05", patch: { outfit: "sweatshirt", outfitColor: "#ece3cf", fullPortraitKey: "child_toddler_male_dress_s4_05" } }],
  child_dress_s4_06: [{ bodyPresetKey: "child_toddler_male", assetKey: "child_toddler_male_dress_s4_06", patch: { outfit: "sweatshirt", outfitColor: "#e9e4d3", fullPortraitKey: "child_toddler_male_dress_s4_06" } }],
  child_dress_s4_07: [{ bodyPresetKey: "child_toddler_male", assetKey: "child_toddler_male_dress_s4_07", patch: { outfit: "hoodie", outfitColor: "#e5ddcf", fullPortraitKey: "child_toddler_male_dress_s4_07" } }],
  child_dress_s4_08: [{ bodyPresetKey: "child_toddler_male", assetKey: "child_toddler_male_dress_s4_08", patch: { outfit: "pajama", outfitColor: "#efe9db", fullPortraitKey: "child_toddler_male_dress_s4_08" } }],
  child_dress_s4_09: [{ bodyPresetKey: "child_toddler_male", assetKey: "child_toddler_male_dress_s4_09", patch: { outfit: "tank", outfitColor: "#eef1e0", fullPortraitKey: "child_toddler_male_dress_s4_09" } }],
  child_dress_s6_01: [{ bodyPresetKey: "child_toddler_female", assetKey: "child_toddler_female_dress_s6_01", patch: { outfit: "dress", outfitColor: "#e7edf5", fullPortraitKey: "child_toddler_female_dress_s6_01" } }],
  child_dress_s6_02: [{ bodyPresetKey: "child_toddler_female", assetKey: "child_toddler_female_dress_s6_02", patch: { outfit: "dress", outfitColor: "#5f7fa3", fullPortraitKey: "child_toddler_female_dress_s6_02" } }],
  child_dress_s6_03: [{ bodyPresetKey: "child_toddler_female", assetKey: "child_toddler_female_dress_s6_03", patch: { outfit: "dress", outfitColor: "#f3ddd9", fullPortraitKey: "child_toddler_female_dress_s6_03" } }],
  child_dress_s6_04: [{ bodyPresetKey: "child_toddler_female", assetKey: "child_toddler_female_dress_s6_04", patch: { outfit: "hoodie", outfitColor: "#f2ece2", fullPortraitKey: "child_toddler_female_dress_s6_04" } }],
  child_dress_s6_05: [{ bodyPresetKey: "child_toddler_female", assetKey: "child_toddler_female_dress_s6_05", patch: { outfit: "dress", outfitColor: "#eed98a", fullPortraitKey: "child_toddler_female_dress_s6_05" } }],
  child_dress_s6_06: [{ bodyPresetKey: "child_toddler_female", assetKey: "child_toddler_female_dress_s6_06", patch: { outfit: "dress", outfitColor: "#f2ece0", fullPortraitKey: "child_toddler_female_dress_s6_06" } }],
  child_dress_s6_07: [{ bodyPresetKey: "child_toddler_female", assetKey: "child_toddler_female_dress_s6_07", patch: { outfit: "dress", outfitColor: "#f4dee3", fullPortraitKey: "child_toddler_female_dress_s6_07" } }],
  child_dress_s6_08: [{ bodyPresetKey: "child_toddler_female", assetKey: "child_toddler_female_dress_s6_08", patch: { outfit: "pajama", outfitColor: "#f4e3d8", fullPortraitKey: "child_toddler_female_dress_s6_08" } }],
  child_dress_s6_09: [{ bodyPresetKey: "child_toddler_female", assetKey: "child_toddler_female_dress_s6_09", patch: { outfit: "dress", outfitColor: "#7fa0c9", fullPortraitKey: "child_toddler_female_dress_s6_09" } }],
  child_dress_s2_01: [{ bodyPresetKey: "child_toddler_female", assetKey: "child_toddler_female_dress_s2_01", patch: { outfit: "dress", outfitColor: "#f6dfe6", fullPortraitKey: "child_toddler_female_dress_s2_01" } }],
  child_dress_s2_02: [{ bodyPresetKey: "child_toddler_female", assetKey: "child_toddler_female_dress_s2_02", patch: { outfit: "dress", outfitColor: "#f0c3c6", fullPortraitKey: "child_toddler_female_dress_s2_02" } }],
  child_dress_s2_03: [{ bodyPresetKey: "child_toddler_female", assetKey: "child_toddler_female_dress_s2_03", patch: { outfit: "dress", outfitColor: "#7295c2", fullPortraitKey: "child_toddler_female_dress_s2_03" } }],
  child_dress_s2_04: [{ bodyPresetKey: "child_toddler_female", assetKey: "child_toddler_female_dress_s2_04", patch: { outfit: "hoodie", outfitColor: "#eed98a", fullPortraitKey: "child_toddler_female_dress_s2_04" } }],
  child_dress_s2_05: [{ bodyPresetKey: "child_toddler_female", assetKey: "child_toddler_female_dress_s2_05", patch: { outfit: "dress", outfitColor: "#f2ece0", fullPortraitKey: "child_toddler_female_dress_s2_05" } }],
  child_dress_s2_06: [{ bodyPresetKey: "child_toddler_female", assetKey: "child_toddler_female_dress_s2_06", patch: { outfit: "dress", outfitColor: "#f4dee3", fullPortraitKey: "child_toddler_female_dress_s2_06" } }],
  child_dress_s2_07: [{ bodyPresetKey: "child_toddler_female", assetKey: "child_toddler_female_dress_s2_07", patch: { outfit: "dress", outfitColor: "#f6dfe6", fullPortraitKey: "child_toddler_female_dress_s2_07" } }],
  child_dress_s2_08: [{ bodyPresetKey: "child_toddler_female", assetKey: "child_toddler_female_dress_s2_08", patch: { outfit: "hoodie", outfitColor: "#f4e6ea", fullPortraitKey: "child_toddler_female_dress_s2_08" } }],
  child_dress_s2_09: [{ bodyPresetKey: "child_toddler_female", assetKey: "child_toddler_female_dress_s2_09", patch: { outfit: "dress", outfitColor: "#f2ece0", fullPortraitKey: "child_toddler_female_dress_s2_09" } }],
  child_dress_s9_01: [{ bodyPresetKey: "child_elementary_male", assetKey: "child_elementary_male_dress_s9_01", patch: { outfit: "sweatshirt", outfitColor: "#233350", fullPortraitKey: "child_elementary_male_dress_s9_01" } }],
  child_dress_s9_02: [{ bodyPresetKey: "child_elementary_male", assetKey: "child_elementary_male_dress_s9_02", patch: { outfit: "child_overalls", outfitColor: "#e08a3c", fullPortraitKey: "child_elementary_male_dress_s9_02" } }],
  child_dress_s9_03: [{ bodyPresetKey: "child_elementary_male", assetKey: "child_elementary_male_dress_s9_03", patch: { outfit: "hoodie", outfitColor: "#e9c85a", fullPortraitKey: "child_elementary_male_dress_s9_03" } }],
  child_dress_s9_04: [{ bodyPresetKey: "child_elementary_male", assetKey: "child_elementary_male_dress_s9_04", patch: { outfit: "sweatshirt", outfitColor: "#ece3cf", fullPortraitKey: "child_elementary_male_dress_s9_04" } }],
  child_dress_s9_05: [{ bodyPresetKey: "child_elementary_male", assetKey: "child_elementary_male_dress_s9_05", patch: { outfit: "pajama", outfitColor: "#cfe0f2", fullPortraitKey: "child_elementary_male_dress_s9_05" } }],
  child_dress_s9_06: [{ bodyPresetKey: "child_elementary_male", assetKey: "child_elementary_male_dress_s9_06", patch: { outfit: "sweatshirt", outfitColor: "#ece3cf", fullPortraitKey: "child_elementary_male_dress_s9_06" } }],
  child_dress_s9_07: [{ bodyPresetKey: "child_elementary_male", assetKey: "child_elementary_male_dress_s9_07", patch: { outfit: "sweatshirt", outfitColor: "#233350", fullPortraitKey: "child_elementary_male_dress_s9_07" } }],
  child_dress_s9_08: [{ bodyPresetKey: "child_elementary_male", assetKey: "child_elementary_male_dress_s9_08", patch: { outfit: "tank", outfitColor: "#eef1e0", fullPortraitKey: "child_elementary_male_dress_s9_08" } }],
  child_dress_s9_09: [{ bodyPresetKey: "child_elementary_male", assetKey: "child_elementary_male_dress_s9_09", patch: { outfit: "sweatshirt", outfitColor: "#f4e3d8", fullPortraitKey: "child_elementary_male_dress_s9_09" } }],
};

// sku + 현재 캐릭터의 bodyPresetKey로 실제 적용할 appearance patch를 구한다.
// - ITEM_APPEARANCE_VARIANTS에 등록된(체형별로 다른 그림이 필요한) 상품은 정확히 일치하는
//   체형의 variant만 반환하고, 없으면 null(다른 체형 그림으로 강제 대체하지 않음).
// - 그 외(기존 해녀/해남/범용 새싹 outfitAssetKey 상품, 체형에 상관없이 같은 렌더링 방식이
//   이미 동작하던 것들)는 기존 ITEM_APPEARANCE_PATCH로 폴백한다(회귀 없음).
export function resolveAppearancePatch(
  sku: string,
  bodyPresetKey: BodyPresetKey
): Partial<CharacterAppearance> | null {
  const variants = ITEM_APPEARANCE_VARIANTS[sku];
  if (variants) {
    const match = variants.find((v) => v.bodyPresetKey === bodyPresetKey);
    return match ? match.patch : null;
  }
  return ITEM_APPEARANCE_PATCH[sku] ?? {};
}

// 상품 목록/미리보기에서 "이 캐릭터가 이 상품을 착용할 수 있는가" 판정.
export function isCompatibleWithBody(sku: string, bodyPresetKey: BodyPresetKey): boolean {
  const variants = ITEM_APPEARANCE_VARIANTS[sku];
  if (!variants) return true; // 체형 제약이 없는 기존 상품(항상 호환)
  return variants.some((v) => v.bodyPresetKey === bodyPresetKey);
}

