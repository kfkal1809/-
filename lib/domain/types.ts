// 해기사와 연인들의 항해일지 — 핵심 도메인 타입
// 기획서 4장(데이터 구조) 기준

export type CharacterKind = "haenyeo" | "haenam" | "child";
export type HaenamDepartment = "deck" | "engine" | "other" | null;
export type ChildGender = "male" | "female" | "unset";
export type ChildStage =
  | "infant" // 영아
  | "toddler" // 유아
  | "kindergarten" // 유치원생
  | "elementary" // 초등학생
  | "middle" // 중학생
  | "high" // 고등학생
  | "university"; // 대학생

export type RelationStatus = "dating" | "engaged" | "married";
export type GameMarriageStatus = "none" | "pending_signature" | "married";

export interface AppearanceJson {
  skinTone: string;
  hair: string;
  outfit: string;
  hat?: string;
  accessory?: string;
}

export interface CharacterRecord {
  id: string;
  household_id: string;
  kind: CharacterKind;
  nickname: string;
  department: HaenamDepartment;
  rank_label: string;
  child_gender: ChildGender | null;
  child_stage: ChildStage | null;
  appearance_json: AppearanceJson;
  created_at: string;
}

export interface VoyageRecord {
  id: string;
  haenam_character_id: string;
  boarded_at: string | null;
  expected_signoff_at: string | null;
  actual_signoff_at: string | null;
  vacation_start_at: string | null;
  next_boarding_at: string | null;
  active: boolean;
}

export interface WalletTransactionType {
  welcome_grant: "welcome_grant";
  app_attendance: "app_attendance";
  kakao_attendance: "kakao_attendance";
  daily_mission: "daily_mission";
  weekly_mission: "weekly_mission";
  fishing_sale: "fishing_sale";
  store_work: "store_work";
  restaurant_purchase: "restaurant_purchase";
  store_purchase: "store_purchase";
  ring_purchase: "ring_purchase";
  marriage_document: "marriage_document";
  restore_cost: "restore_cost";
  restore_reward: "restore_reward";
  interest: "interest";
  duplicate_refund: "duplicate_refund";
  admin_adjustment: "admin_adjustment";
}

export type ItemRarity = "common" | "rare" | "epic" | "legendary";

export const RARITY_LABEL: Record<ItemRarity, string> = {
  common: "일반",
  rare: "희귀",
  epic: "아주 희귀",
  legendary: "전설",
};

export const RARITY_STARS: Record<ItemRarity, string> = {
  common: "★",
  rare: "★★",
  epic: "★★★",
  legendary: "★★★★",
};

export type ItemCategory = "hair" | "outfit" | "hat" | "accessory" | "furniture" | "fishing" | "keepsake" | "special";

export const ROLE_LABEL: Record<string, string> = {
  haenyeo: "해녀",
  haenam_deck: "해남(항해사)",
  haenam_engine: "해남(기관사)",
  child: "새싹",
};
