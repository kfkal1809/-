import type { SupabaseClient } from "@supabase/supabase-js";

export async function getMyHouseholdId(service: SupabaseClient, userId: string): Promise<string | null> {
  const { data } = await service.from("household_users").select("household_id").eq("user_id", userId).maybeSingle();
  return data?.household_id ?? null;
}
