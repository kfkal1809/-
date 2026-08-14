import { createClient } from "@/lib/supabase/server";

export interface MyCharacter {
  id: string;
  nickname: string;
}

// 인벤토리에서 "착용" 버튼을 눌렀을 때 고를 수 있는, 현재 사용자가 관리하는 캐릭터 목록.
export async function getMyCharacters(): Promise<MyCharacter[]> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return [];

    const { data } = await supabase
      .from("character_managers")
      .select("characters(id, nickname)")
      .eq("user_id", user.id);

    return (data ?? [])
      .map((row) => {
        const character = Array.isArray(row.characters) ? row.characters[0] : row.characters;
        return character ? { id: character.id, nickname: character.nickname } : null;
      })
      .filter((c): c is MyCharacter => !!c);
  } catch {
    return [];
  }
}
