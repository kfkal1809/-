import { createClient } from "@/lib/supabase/server";

// 세션 시작 시점에 이미 확정된 "언제 무엇이 잡히는지" 한 항목(화면 표시용으로 이름/희귀도까지
// 미리 붙여서 내려준다) — FishingScreen이 실시간으로 하나씩 알림을 띄우는 데 쓴다.
export interface FishingScheduledCatch {
  index: number;
  sku: string | null;
  name: string;
  rarity: string;
  offsetMinutes: number;
  tapBonus: boolean;
}

export interface FishingSessionInfo {
  id: string;
  durationHours: number;
  startedAt: string;
  endsAt: string;
  scheduledLoot: FishingScheduledCatch[];
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
      .select("id, duration_hours, started_at, ends_at, scheduled_loot, tap_bonus_indices")
      .eq("household_id", membership.household_id)
      .eq("state", "running")
      .maybeSingle();

    if (!session) return { ready: true, session: null };

    const rawSchedule = (session.scheduled_loot as { catalogItemId: string; offsetMinutes: number }[] | null) ?? [];
    const tapBonusSet = new Set((session.tap_bonus_indices as number[] | null) ?? []);
    const itemIds = Array.from(new Set(rawSchedule.map((c) => c.catalogItemId)));

    const { data: catalogRows } = itemIds.length
      ? await supabase.from("item_catalog").select("id, sku, name, rarity").in("id", itemIds)
      : { data: [] as { id: string; sku: string; name: string; rarity: string }[] };
    const catalogById = new Map((catalogRows ?? []).map((c) => [c.id, c]));

    const scheduledLoot: FishingScheduledCatch[] = rawSchedule.map((c, index) => {
      const item = catalogById.get(c.catalogItemId);
      return {
        index,
        sku: item?.sku ?? null,
        name: item?.name ?? "무언가",
        rarity: item?.rarity ?? "common",
        offsetMinutes: c.offsetMinutes,
        tapBonus: tapBonusSet.has(index),
      };
    });

    return {
      ready: true,
      session: {
        id: session.id,
        durationHours: session.duration_hours,
        startedAt: session.started_at,
        endsAt: session.ends_at,
        scheduledLoot,
      },
    };
  } catch {
    return { ready: false, session: null };
  }
}
