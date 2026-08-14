import { createClient } from "@/lib/supabase/server";

export interface FishingSessionInfo {
  id: string;
  durationHours: number;
  startedAt: string;
  endsAt: string;
}

export interface FishingData {
  ready: boolean;
  session: FishingSessionInfo | null;
}

export async function getFishingData(): Promise<FishingData> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { ready: false, session: null };

    const { data: membership } = await supabase.from("household_users").select("household_id").eq("user_id", user.id).maybeSingle();
    if (!membership) return { ready: false, session: null };

    const { data: session } = await supabase
      .from("fishing_sessions")
      .select("id, duration_hours, started_at, ends_at")
      .eq("household_id", membership.household_id)
      .eq("state", "running")
      .maybeSingle();

    return {
      ready: true,
      session: session
        ? { id: session.id, durationHours: session.duration_hours, startedAt: session.started_at, endsAt: session.ends_at }
        : null,
    };
  } catch {
    return { ready: false, session: null };
  }
}
