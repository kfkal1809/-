import { createClient } from "@/lib/supabase/server";
import { haenyeoPreset } from "@/lib/domain/characterPresets";
import type { CharacterAppearance } from "@/lib/domain/characterPresets";
import type { CharacterKind, ChildGender, ChildStage } from "@/lib/domain/types";

export interface DeckSelf {
  ready: boolean;
  userId: string | null;
  nickname: string;
  characterId: string | null;
  appearance: CharacterAppearance;
  kind: CharacterKind;
  childGender: ChildGender | null;
  childStage: ChildStage | null;
}

export interface DeckChatMessage {
  id: string;
  userId: string;
  nickname: string;
  body: string;
  mentions: string[];
  createdAt: string;
}

export async function getDeckSelf(): Promise<DeckSelf> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user)
      return { ready: false, userId: null, nickname: "", characterId: null, appearance: haenyeoPreset(), kind: "haenyeo", childGender: null, childStage: null };

    // character_managers에는 내 캐릭터 말고도, 아직 가입 안 한 파트너를 대신 관리하는
    // managed_only=true 플레이스홀더 캐릭터가 같이 들어있을 수 있다(온보딩 "상대 캐릭터
    // 먼저 만들기") — order 없는 .limit(1)이 어느 쪽을 돌려줄지 보장이 안 돼서, 실제로
    // 파트너 캐릭터가 "나"인 것처럼 갑판/낚시터에 뜨는 버그가 있었다. managed_only=false인
    // 진짜 내 캐릭터만 골라서 이 문제를 없앤다.
    const { data: managed } = await supabase
      .from("character_managers")
      .select("characters!inner(id, nickname, kind, child_gender, child_stage, appearance_json)")
      .eq("user_id", user.id)
      .eq("characters.managed_only", false)
      .limit(1)
      .maybeSingle();

    const character = managed ? (Array.isArray(managed.characters) ? managed.characters[0] : managed.characters) : null;

    return {
      ready: true,
      userId: user.id,
      // 갑판 채팅은 계정 실명(profiles.nickname, 카카오 로그인 정보)이 아니라 캐릭터 별명을
      // 써야 한다 — 예전엔 profiles.nickname을 썼는데, 그게 카카오 계정의 실제 이름/닉네임이라
      // 채팅에 실명이 뜨는 버그였다.
      nickname: character?.nickname ?? "해녀",
      characterId: character?.id ?? null,
      appearance: (character?.appearance_json as CharacterAppearance) ?? haenyeoPreset(),
      kind: (character?.kind as CharacterKind) ?? "haenyeo",
      childGender: (character?.child_gender as ChildGender | null) ?? null,
      childStage: (character?.child_stage as ChildStage | null) ?? null,
    };
  } catch {
    return { ready: false, userId: null, nickname: "", characterId: null, appearance: haenyeoPreset(), kind: "haenyeo", childGender: null, childStage: null };
  }
}

export async function getRecentChatMessages(): Promise<DeckChatMessage[]> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("chat_messages")
      .select("id, user_id, nickname_snapshot, body, mentions, created_at")
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(50);

    return (data ?? [])
      .map((m) => ({
        id: m.id,
        userId: m.user_id,
        nickname: m.nickname_snapshot,
        body: m.body,
        mentions: m.mentions ?? [],
        createdAt: m.created_at,
      }))
      .reverse();
  } catch {
    return [];
  }
}
