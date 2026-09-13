import { createClient } from "@/lib/supabase/server";

export interface DateBucketListItem {
  id: string;
  text: string;
  completed: boolean;
  createdAt: string;
}

const DEMO: DateBucketListItem[] = [];

export async function getDateBucketListItems(): Promise<DateBucketListItem[]> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return DEMO;

    const { data: membership } = await supabase.from("household_users").select("household_id").eq("user_id", user.id).maybeSingle();
    if (!membership) return DEMO;

    const { data } = await supabase
      .from("date_bucket_list_items")
      .select("id, text, completed, created_at")
      .eq("household_id", membership.household_id)
      .order("created_at", { ascending: true });

    return (data ?? []).map((row) => ({ id: row.id, text: row.text, completed: row.completed, createdAt: row.created_at }));
  } catch {
    return DEMO;
  }
}
