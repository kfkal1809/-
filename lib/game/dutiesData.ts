import { createClient } from "@/lib/supabase/server";
import { getMissionSnapshot, type MissionSnapshot } from "@/lib/game/missions";

export async function getDutiesData(): Promise<MissionSnapshot | null> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;
    // mission_progress_select RLS가 user_id = auth.uid()만 허용하므로 쿠키 기반 클라이언트로 충분하다.
    return await getMissionSnapshot(supabase, user.id);
  } catch {
    return null;
  }
}
