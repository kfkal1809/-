import { createClient } from "@/lib/supabase/server";
import { haenyeoPreset, haenamDeckPreset } from "@/lib/domain/characterPresets";
import type { CharacterAppearance } from "@/lib/domain/characterPresets";

export interface CabinCharacter {
  id: string;
  nickname: string;
  roleLabel: string;
  appearance: CharacterAppearance;
}

export interface CabinPlacedItem {
  id: string;
  sku: string | null;
  name: string;
  x: number;
  y: number;
  rotation: number;
}

export interface GuestbookEntryRow {
  id: string;
  authorNickname: string;
  body: string;
  createdAt: string;
}

export interface CabinData {
  isDemo: boolean;
  householdId: string | null;
  spaceId: string | null;
  isOwner: boolean;
  cabinName: string;
  characters: CabinCharacter[];
  placedItems: CabinPlacedItem[];
  guestbook: GuestbookEntryRow[];
}

const ROLE_LABEL: Record<string, string> = { haenyeo: "해녀", child: "새싹" };

const DEMO: CabinData = {
  isDemo: true,
  householdId: null,
  spaceId: null,
  isOwner: false,
  cabinName: "우리 선실",
  characters: [
    { id: "d1", nickname: "두부", roleLabel: "해녀", appearance: haenyeoPreset() },
    { id: "d2", nickname: "북극곰", roleLabel: "해남(항해사)", appearance: haenamDeckPreset() },
  ],
  placedItems: [
    { id: "f1", sku: "furniture_bed", name: "침대", x: 0.24, y: 0.62, rotation: 0 },
    { id: "f2", sku: "furniture_desk", name: "책상", x: 0.72, y: 0.58, rotation: 0 },
    { id: "f3", sku: "furniture_rug", name: "러그", x: 0.42, y: 0.82, rotation: 0 },
  ],
  guestbook: [],
};

export async function getCabinData(targetHouseholdId?: string): Promise<CabinData> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return DEMO;

    let householdId = targetHouseholdId ?? null;
    const { data: myMembership } = await supabase.from("household_users").select("household_id").eq("user_id", user.id).maybeSingle();

    if (!householdId) householdId = myMembership?.household_id ?? null;
    if (!householdId) return DEMO;

    const isOwner = myMembership?.household_id === householdId;

    const { data: space } = await supabase
      .from("spaces")
      .select("id, name")
      .eq("household_id", householdId)
      .eq("type", "cabin")
      .maybeSingle();

    if (!space) return { ...DEMO, isDemo: false, householdId, isOwner, characters: [], placedItems: [], guestbook: [] };

    const { data: characters } = await supabase
      .from("characters")
      .select("id, kind, nickname, department, appearance_json")
      .eq("household_id", householdId)
      .neq("kind", "child")
      .order("kind");

    const { data: placed } = await supabase
      .from("space_items")
      .select("id, x, y, rotation, item_catalog(sku, name)")
      .eq("space_id", space.id);

    const { data: guestbookRows } = await supabase
      .from("guestbook_entries")
      .select("id, body, created_at, profiles(nickname)")
      .eq("cabin_space_id", space.id)
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(5);

    return {
      isDemo: false,
      householdId,
      spaceId: space.id,
      isOwner,
      cabinName: space.name ?? "우리 선실",
      characters: (characters ?? []).map((c) => ({
        id: c.id,
        nickname: c.nickname,
        roleLabel: c.kind === "haenam" ? (c.department === "engine" ? "해남(기관사)" : "해남(항해사)") : ROLE_LABEL[c.kind] ?? c.kind,
        appearance: (c.appearance_json as CharacterAppearance) ?? haenyeoPreset(),
      })),
      placedItems: (placed ?? []).map((p) => {
        const catalog = Array.isArray(p.item_catalog) ? p.item_catalog[0] : p.item_catalog;
        return {
          id: p.id,
          sku: catalog?.sku ?? null,
          name: catalog?.name ?? "아이템",
          x: Number(p.x),
          y: Number(p.y),
          rotation: Number(p.rotation),
        };
      }),
      guestbook: (guestbookRows ?? []).map((g) => {
        const profile = Array.isArray(g.profiles) ? g.profiles[0] : g.profiles;
        return { id: g.id, authorNickname: profile?.nickname ?? "익명", body: g.body, createdAt: g.created_at };
      }),
    };
  } catch {
    return DEMO;
  }
}
