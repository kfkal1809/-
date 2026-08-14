import { createClient } from "@/lib/supabase/server";
import { haenyeoPreset, haenamDeckPreset } from "@/lib/domain/characterPresets";
import type { CharacterAppearance } from "@/lib/domain/characterPresets";
import { daysSinceKstDate } from "@/lib/game/kst";

export interface HomeVoyageCard {
  haenyeoName: string;
  haenyeoRole: string;
  haenyeoAppearance: CharacterAppearance;
  haenamName: string;
  haenamRole: string;
  haenamAppearance: CharacterAppearance;
  boardedDays: number | null;
  signoffDays: number | null;
}

export interface HomeData {
  isDemo: boolean;
  nickname: string;
  walletBalance: number;
  attendedToday: boolean;
  voyage: HomeVoyageCard;
  activeEventTitle: string | null;
  activeEventId: string | null;
}

const DEMO_HOME_DATA: HomeData = {
  isDemo: true,
  nickname: "두부",
  walletBalance: 43.5,
  attendedToday: false,
  voyage: {
    haenyeoName: "두부",
    haenyeoRole: "해녀",
    haenyeoAppearance: haenyeoPreset(),
    haenamName: "북극곰",
    haenamRole: "해남(항해사)",
    haenamAppearance: haenamDeckPreset(),
    boardedDays: 74,
    signoffDays: 27,
  },
  activeEventTitle: "해남이 분실물 회수 대작전",
  activeEventId: "demo-event",
};

export async function getHomeData(): Promise<HomeData> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return DEMO_HOME_DATA;

    const { data: profile } = await supabase.from("profiles").select("nickname").eq("id", user.id).maybeSingle();
    const { data: membership } = await supabase
      .from("household_users")
      .select("household_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!membership) return { ...DEMO_HOME_DATA, nickname: profile?.nickname ?? DEMO_HOME_DATA.nickname };

    const householdId = membership.household_id as string;

    const [{ data: wallet }, { data: characters }, { data: attendanceToday }, { data: activeEvent }] = await Promise.all([
      supabase.from("wallets").select("cached_balance").eq("household_id", householdId).maybeSingle(),
      supabase.from("characters").select("*").eq("household_id", householdId),
      supabase
        .from("attendance")
        .select("id")
        .eq("user_id", user.id)
        .eq("type", "app")
        .eq("date", new Date().toISOString().slice(0, 10))
        .maybeSingle(),
      supabase
        .from("posts")
        .select("id, title")
        .eq("type", "event")
        .eq("status", "open")
        .order("start_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);

    const haenyeo = characters?.find((c) => c.kind === "haenyeo");
    const haenam = characters?.find((c) => c.kind === "haenam");

    let boardedDays: number | null = null;
    let signoffDays: number | null = null;
    if (haenam) {
      const { data: voyage } = await supabase
        .from("voyages")
        .select("boarded_at, expected_signoff_at")
        .eq("haenam_character_id", haenam.id)
        .eq("active", true)
        .maybeSingle();
      if (voyage?.boarded_at) boardedDays = daysSinceKstDate(voyage.boarded_at);
      if (voyage?.expected_signoff_at) signoffDays = -daysSinceKstDate(voyage.expected_signoff_at);
    }

    return {
      isDemo: false,
      nickname: profile?.nickname ?? "해녀",
      walletBalance: wallet?.cached_balance ?? 0,
      attendedToday: !!attendanceToday,
      voyage: {
        haenyeoName: haenyeo?.nickname ?? "해녀",
        haenyeoRole: "해녀",
        haenyeoAppearance: (haenyeo?.appearance_json as CharacterAppearance) ?? haenyeoPreset(),
        haenamName: haenam?.nickname ?? "해남",
        haenamRole: haenam?.department === "engine" ? "해남(기관사)" : "해남(항해사)",
        haenamAppearance: (haenam?.appearance_json as CharacterAppearance) ?? haenamDeckPreset(),
        boardedDays,
        signoffDays,
      },
      activeEventTitle: activeEvent?.title ?? null,
      activeEventId: activeEvent?.id ?? null,
    };
  } catch {
    return DEMO_HOME_DATA;
  }
}
