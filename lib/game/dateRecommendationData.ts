import { createClient } from "@/lib/supabase/server";
import { kstDateString } from "@/lib/game/kst";
import type { IconName } from "@/components/icons/GameIcon";

export interface DateRecommendation {
  key: string;
  label: string;
  description: string;
  href: string;
  icon: IconName;
}

// 우선순위 고정 순서 — 오늘 아직 안 한 것 중 이 순서에서 가장 앞선 콘텐츠를 추천한다.
// 매번 새로고침할 때마다 추천이 바뀌지 않고, 하나씩 완료할 때마다 다음 항목으로
// 자연스럽게 넘어가는 "오늘의 할 일" 느낌을 준다. 스탬프판은 개별 액티비티가 아니라
// 모아보는 화면이라 추천 후보에서 제외한다.
const CANDIDATES: DateRecommendation[] = [
  { key: "topic_card", label: "대화 주제 카드", description: "오늘의 대화 주제를 뽑아 이야기 나눠보세요", href: "/date/topic-card", icon: "heart" },
  { key: "fortune", label: "오늘의 운세", description: "오늘 우리 커플의 운세를 확인해보세요", href: "/date/fortune", icon: "fortune" },
  { key: "photo", label: "데이트 스팟 인증샷", description: "오늘의 장소에서 인증샷을 남겨보세요", href: "/date/photo", icon: "camera" },
  { key: "gift", label: "선물 보내기", description: "파트너에게 작은 선물을 보내보세요", href: "/date/gift", icon: "gift" },
  { key: "diary", label: "커플 한 줄 일기", description: "오늘 하루를 한 줄로 남겨보세요", href: "/date/diary", icon: "diary" },
];

export async function getDateRecommendation(): Promise<DateRecommendation | null> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return CANDIDATES[0];

    const { data: membership } = await supabase.from("household_users").select("household_id").eq("user_id", user.id).maybeSingle();
    if (!membership) return CANDIDATES[0];

    const householdId = membership.household_id as string;
    const today = kstDateString();

    // gift/diary는 발신자·작성자 본인 단위로 하루 1회 게이트라 user.id로, 나머지는
    // household 단위 게이트라 householdId로 오늘 완료 여부를 확인한다.
    const [{ data: topicCard }, { data: fortune }, { data: photo }, { data: gift }, { data: diary }] = await Promise.all([
      supabase.from("date_topic_card_logs").select("id").eq("household_id", householdId).eq("draw_date", today).maybeSingle(),
      supabase.from("date_fortune_logs").select("id").eq("household_id", householdId).eq("fortune_date", today).maybeSingle(),
      supabase.from("date_photos").select("id").eq("household_id", householdId).eq("photo_date", today).maybeSingle(),
      supabase.from("date_gift_logs").select("id").eq("sender_user_id", user.id).eq("send_date", today).maybeSingle(),
      supabase.from("date_diary_entries").select("id").eq("author_user_id", user.id).eq("entry_date", today).maybeSingle(),
    ]);

    const doneMap: Record<string, boolean> = {
      topic_card: !!topicCard,
      fortune: !!fortune,
      photo: !!photo,
      gift: !!gift,
      diary: !!diary,
    };

    return CANDIDATES.find((c) => !doneMap[c.key]) ?? null;
  } catch {
    return CANDIDATES[0];
  }
}
