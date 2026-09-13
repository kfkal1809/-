import type { SupabaseClient } from "@supabase/supabase-js";

export async function getMyHouseholdId(service: SupabaseClient, userId: string): Promise<string | null> {
  const { data } = await service.from("household_users").select("household_id").eq("user_id", userId).maybeSingle();
  return data?.household_id ?? null;
}

// 방명록/일기/혼인신고 등 "누가 썼는지"를 보여주는 화면에서 profiles.nickname(계정 가입 시
// 적은 닉네임 — 사람에 따라 실명을 적기도 함)을 그대로 노출하면 실명이 뜰 수 있다.
// 게임 안에서 실제로 통용되는 이름은 항상 캐릭터 닉네임(해녀 두부/해남 아랍처럼 홈 화면 등
// 다른 모든 화면에서 쓰는 이름)이므로, user_id → 캐릭터 닉네임으로 일괄 변환해서 쓴다.
// managed_only(아직 안 온 파트너 대신 관리하는 플레이스홀더) 캐릭터는 제외한다.
export async function getCharacterNicknames(
  client: SupabaseClient,
  userIds: string[]
): Promise<Record<string, string>> {
  if (userIds.length === 0) return {};
  const { data } = await client
    .from("character_managers")
    .select("user_id, characters!inner(nickname, managed_only)")
    .in("user_id", userIds)
    .eq("characters.managed_only", false);

  const map: Record<string, string> = {};
  for (const row of data ?? []) {
    const character = Array.isArray(row.characters) ? row.characters[0] : row.characters;
    if (character?.nickname && !map[row.user_id]) map[row.user_id] = character.nickname;
  }
  return map;
}
