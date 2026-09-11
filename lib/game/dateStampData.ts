import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { kstDateString } from "@/lib/game/kst";
import { DATE_STAMP_DEFS, DATE_STAMP_CLEAR_BONUS } from "@/lib/domain/constants";

export interface DateStampStatus {
  key: string;
  label: string;
  done: boolean;
}

export interface DateStampSnapshot {
  stamps: DateStampStatus[];
  allClear: boolean;
}

// 스탬프 6종의 "오늘 완료 여부"를 계산한다. mission_progress는 본인 행만 보이는 RLS라
// (user_id = auth.uid()) 커플 중 한쪽이 한 것도 인정하려면 반드시 서비스 롤 클라이언트로
// 조회해야 한다 — 쿠키 클라이언트로는 파트너 행이 안 보여서 낚시/갑판 스탬프가 항상
// 비어 보이는 버그가 난다.
export async function getDateStampStatus(service: SupabaseClient, householdId: string): Promise<DateStampSnapshot> {
  const today = kstDateString();
  const now = new Date();
  const tomorrow = kstDateString(new Date(now.getTime() + 24 * 60 * 60 * 1000));
  const startIso = `${today}T00:00:00+09:00`;
  const endIso = `${tomorrow}T00:00:00+09:00`;

  const { data: members } = await service.from("household_users").select("user_id").eq("household_id", householdId);
  const memberIds = (members ?? []).map((m) => m.user_id as string);

  const [{ data: topicCard }, { data: gift }, { data: photo }, { data: fishing }, { data: deck }, { data: mess }] = await Promise.all([
    service.from("date_topic_card_logs").select("id").eq("household_id", householdId).eq("draw_date", today).maybeSingle(),
    service.from("date_gift_logs").select("id").eq("household_id", householdId).eq("send_date", today).limit(1),
    service.from("date_photos").select("id").eq("household_id", householdId).eq("photo_date", today).maybeSingle(),
    memberIds.length
      ? service
          .from("mission_progress")
          .select("user_id")
          .in("user_id", memberIds)
          .eq("mission_key", "fishing")
          .eq("period_key", today)
          .eq("completed", true)
          .limit(1)
      : Promise.resolve({ data: [] }),
    memberIds.length
      ? service
          .from("mission_progress")
          .select("user_id")
          .in("user_id", memberIds)
          .eq("mission_key", "visit_deck")
          .eq("period_key", today)
          .eq("completed", true)
          .limit(1)
      : Promise.resolve({ data: [] }),
    service.from("restaurant_orders").select("id").eq("household_id", householdId).gte("created_at", startIso).lt("created_at", endIso).limit(1),
  ]);

  const doneMap: Record<string, boolean> = {
    topic_card: !!topicCard,
    gift: !!gift?.length,
    photo: !!photo,
    fishing: !!fishing?.length,
    deck: !!deck?.length,
    mess: !!mess?.length,
  };

  const stamps = DATE_STAMP_DEFS.map((d) => ({ key: d.key, label: d.label, done: doneMap[d.key] ?? false }));
  return { stamps, allClear: stamps.every((s) => s.done) };
}

export interface DateStampData extends DateStampSnapshot {
  claimed: boolean;
  reward: number;
}

const DEMO_DATA: DateStampData = {
  stamps: DATE_STAMP_DEFS.map((d) => ({ ...d, done: false })),
  allClear: false,
  claimed: false,
  reward: DATE_STAMP_CLEAR_BONUS,
};

export async function getDateStampData(): Promise<DateStampData> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return DEMO_DATA;

    const service = createServiceClient();
    const { data: membership } = await service.from("household_users").select("household_id").eq("user_id", user.id).maybeSingle();
    if (!membership) return DEMO_DATA;

    const householdId = membership.household_id as string;
    const today = kstDateString();

    const [{ stamps, allClear }, { data: claim }] = await Promise.all([
      getDateStampStatus(service, householdId),
      service.from("date_stamp_claims").select("reward").eq("household_id", householdId).eq("claim_date", today).maybeSingle(),
    ]);

    return { stamps, allClear, claimed: !!claim, reward: claim?.reward ?? DATE_STAMP_CLEAR_BONUS };
  } catch {
    return DEMO_DATA;
  }
}
