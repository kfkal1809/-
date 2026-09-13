import { createClient } from "@/lib/supabase/server";
import { kstDateString } from "@/lib/game/kst";
import { getCharacterNicknames } from "@/lib/game/household";

export interface DateDiaryEntry {
  id: string;
  authorNickname: string;
  isMine: boolean;
  body: string;
  createdAt: string;
}

export interface DateDiaryData {
  entries: DateDiaryEntry[];
  writtenToday: boolean;
}

const DEMO_DATA: DateDiaryData = { entries: [], writtenToday: false };

export async function getDateDiaryData(): Promise<DateDiaryData> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return DEMO_DATA;

    const { data: membership } = await supabase.from("household_users").select("household_id").eq("user_id", user.id).maybeSingle();
    if (!membership) return DEMO_DATA;

    const householdId = membership.household_id as string;
    const today = kstDateString();

    const { data } = await supabase
      .from("date_diary_entries")
      .select("id, author_user_id, body, created_at, entry_date")
      .eq("household_id", householdId)
      .order("created_at", { ascending: false })
      .limit(30);

    const nicknames = await getCharacterNicknames(
      supabase,
      Array.from(new Set((data ?? []).map((row) => row.author_user_id)))
    );

    const entries = (data ?? []).map((row) => ({
      id: row.id,
      authorNickname: nicknames[row.author_user_id] ?? "익명",
      isMine: row.author_user_id === user.id,
      body: row.body,
      createdAt: row.created_at,
    }));

    const writtenToday = (data ?? []).some((row) => row.author_user_id === user.id && row.entry_date === today);

    return { entries, writtenToday };
  } catch {
    return DEMO_DATA;
  }
}
