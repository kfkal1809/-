import { createClient } from "@/lib/supabase/server";

export interface DateHistoryEntry {
  id: string;
  type: "topic_card" | "fortune";
  text: string;
  date: string;
  createdAt: string;
}

const DEMO: DateHistoryEntry[] = [];

// 대화 주제 카드/오늘의 운세는 매일 하나씩 date_topic_card_logs/date_fortune_logs에 쌓이기만
// 하고 지난 기록을 다시 볼 화면이 없었다 — 새 테이블 없이 두 테이블을 합쳐서 보여준다.
export async function getDateHistory(): Promise<DateHistoryEntry[]> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return DEMO;

    const { data: membership } = await supabase.from("household_users").select("household_id").eq("user_id", user.id).maybeSingle();
    if (!membership) return DEMO;

    const householdId = membership.household_id as string;

    const [{ data: topicCards }, { data: fortunes }] = await Promise.all([
      supabase
        .from("date_topic_card_logs")
        .select("id, card_text, draw_date, completed_at")
        .eq("household_id", householdId)
        .order("completed_at", { ascending: false })
        .limit(30),
      supabase
        .from("date_fortune_logs")
        .select("id, fortune_text, fortune_date, created_at")
        .eq("household_id", householdId)
        .order("created_at", { ascending: false })
        .limit(30),
    ]);

    const entries: DateHistoryEntry[] = [
      ...(topicCards ?? []).map((row) => ({
        id: row.id,
        type: "topic_card" as const,
        text: row.card_text,
        date: row.draw_date,
        createdAt: row.completed_at,
      })),
      ...(fortunes ?? []).map((row) => ({
        id: row.id,
        type: "fortune" as const,
        text: row.fortune_text,
        date: row.fortune_date,
        createdAt: row.created_at,
      })),
    ];

    entries.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return entries.slice(0, 40);
  } catch {
    return DEMO;
  }
}
