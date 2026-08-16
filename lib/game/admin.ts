import type { SupabaseClient } from "@supabase/supabase-js";

export async function isAdmin(service: SupabaseClient, userId: string): Promise<boolean> {
  const { data } = await service.from("profiles").select("role").eq("id", userId).maybeSingle();
  return data?.role === "admin";
}
