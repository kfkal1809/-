import type { SupabaseClient } from "@supabase/supabase-js";

export async function getWalletBalance(service: SupabaseClient, householdId: string): Promise<number> {
  const { data } = await service.from("wallets").select("cached_balance").eq("household_id", householdId).maybeSingle();
  return data?.cached_balance ?? 0;
}
