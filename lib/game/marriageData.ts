import { createClient } from "@/lib/supabase/server";
import { getCharacterNicknames } from "@/lib/game/household";

export interface MarriageMember {
  userId: string;
  nickname: string;
  signed: boolean;
}

export interface MarriageData {
  isDemo: boolean;
  ready: boolean;
  myUserId: string | null;
  householdId: string | null;
  walletBalance: number;
  hasRing: boolean;
  ringName: string | null;
  marriageStatus: "none" | "pending_signature" | "married";
  marriedAt: string | null;
  members: MarriageMember[];
  mySigned: boolean;
  haenyeoName: string | null;
  haenamName: string | null;
  relationStatus: "dating" | "engaged" | "married" | null;
}

const DEMO: MarriageData = {
  isDemo: true,
  ready: false,
  myUserId: null,
  householdId: null,
  walletBalance: 0,
  hasRing: false,
  ringName: null,
  marriageStatus: "none",
  marriedAt: null,
  members: [],
  mySigned: false,
  haenyeoName: null,
  haenamName: null,
  relationStatus: null,
};

export async function getMarriageData(): Promise<MarriageData> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return DEMO;

    const { data: membership } = await supabase.from("household_users").select("household_id").eq("user_id", user.id).maybeSingle();
    if (!membership) return { ...DEMO, ready: true, myUserId: user.id };

    const householdId = membership.household_id as string;

    const [{ data: household }, { data: wallet }, { data: ringItems }, { data: householdUsers }, { data: pendingEvent }, { data: characters }] =
      await Promise.all([
        supabase.from("households").select("game_marriage_status, game_married_at, relation_status").eq("id", householdId).maybeSingle(),
        supabase.from("wallets").select("cached_balance").eq("household_id", householdId).maybeSingle(),
        supabase.from("inventory_items").select("catalog_item_id, item_catalog(name, subcategory)").eq("household_id", householdId),
        supabase.from("household_users").select("user_id").eq("household_id", householdId),
        supabase
          .from("couple_events")
          .select("id, payload")
          .eq("household_id", householdId)
          .eq("type", "marriage_request")
          .eq("status", "pending")
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle(),
        supabase.from("characters").select("kind, nickname").eq("household_id", householdId).in("kind", ["haenyeo", "haenam"]),
      ]);

    const ringRow = (ringItems ?? [])
      .map((r) => (Array.isArray(r.item_catalog) ? r.item_catalog[0] : r.item_catalog))
      .find((c) => c?.subcategory === "ring");

    const signedBy: string[] = (pendingEvent?.payload as { signed_by?: string[] } | null)?.signed_by ?? [];

    const nicknames = await getCharacterNicknames(
      supabase,
      Array.from(new Set((householdUsers ?? []).map((row) => row.user_id)))
    );

    const members: MarriageMember[] = (householdUsers ?? []).map((row) => ({
      userId: row.user_id,
      nickname: nicknames[row.user_id] ?? "해연인",
      signed: signedBy.includes(row.user_id),
    }));

    return {
      isDemo: false,
      ready: true,
      myUserId: user.id,
      householdId,
      walletBalance: wallet?.cached_balance ?? 0,
      hasRing: !!ringRow,
      ringName: ringRow?.name ?? null,
      marriageStatus: (household?.game_marriage_status as MarriageData["marriageStatus"]) ?? "none",
      marriedAt: household?.game_married_at ?? null,
      members,
      mySigned: signedBy.includes(user.id),
      haenyeoName: characters?.find((c) => c.kind === "haenyeo")?.nickname ?? null,
      haenamName: characters?.find((c) => c.kind === "haenam")?.nickname ?? null,
      relationStatus: (household?.relation_status as MarriageData["relationStatus"]) ?? null,
    };
  } catch {
    return DEMO;
  }
}
