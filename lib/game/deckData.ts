import { createClient } from "@/lib/supabase/server";
import { haenyeoPreset } from "@/lib/domain/characterPresets";
import type { CharacterAppearance } from "@/lib/domain/characterPresets";

export interface DeckSelf {
  ready: boolean;
  userId: string | null;
  nickname: string;
  characterId: string | null;
  appearance: CharacterAppearance;
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
    if (!user) return { ready: false, userId: null, nickname: "", characterId: null, appearance: haenyeoPreset() };

    const [{ data: profile }, { data: managed }] = await Promise.all([
      supabase.from("profiles").select("nickname").eq("id", user.id).maybeSingle(),
      supabase.from("character_managers").select("characters(id, appearance_json)").eq("user_id", user.id).limit(1).maybeSingle(),
    ]);

    const character = managed ? (Array.isArray(managed.characters) ? managed.characters[0] : managed.characters) : null;

    return {
      ready: true,
      userId: user.id,
      nickname: profile?.nickname ?? "해녀",
      characterId: character?.id ?? null,
      appearance: (character?.appearance_json as CharacterAppearance) ?? haenyeoPreset(),
    };
  } catch {
    return { ready: false, userId: null, nickname: "", characterId: null, appearance: haenyeoPreset() };
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
