import { createClient } from "@/lib/supabase/server";
import { haenyeoPreset, haenamDeckPreset } from "@/lib/domain/characterPresets";
import type { CharacterAppearance } from "@/lib/domain/characterPresets";
import type { CharacterKind } from "@/lib/domain/types";
import type { Facing } from "@/lib/domain/cabinPlacement";

export interface CabinCharacter {
  id: string;
  nickname: string;
  roleLabel: string;
  kind: CharacterKind;
  appearance: CharacterAppearance;
}

export interface CabinPlacedItem {
  id: string;
  sku: string | null;
  name: string;
  x: number;
  y: number;
  scale: number;
  rotation: number;
  flipX: boolean;
  zIndex: number;
  // 방향 전환을 지원하는 가구(vintage_shell_bed 등)의 현재 방향. 지원 안 하는 가구는 항상
  // null이고, 렌더링 쪽에서 getPlacementDef(sku).defaultFacing으로 안전하게 대체된다.
  facing: Facing | null;
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
  wallpaper: string | null;
  floor: string | null;
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
  wallpaper: null,
  floor: null,
  characters: [
    { id: "d1", nickname: "두부", roleLabel: "해녀", kind: "haenyeo", appearance: haenyeoPreset() },
    { id: "d2", nickname: "북극곰", roleLabel: "해남(항해사)", kind: "haenam", appearance: haenamDeckPreset() },
  ],
  placedItems: [
    { id: "f1", sku: "furniture_bed", name: "침대", x: 0.22, y: 0.62, scale: 1, rotation: 0, flipX: false, zIndex: 0, facing: null },
    { id: "f2", sku: "furniture_desk", name: "책상", x: 0.64, y: 0.56, scale: 1, rotation: 0, flipX: false, zIndex: 0, facing: null },
    { id: "f6", sku: "furniture_chair", name: "의자", x: 0.64, y: 0.72, scale: 1, rotation: 0, flipX: false, zIndex: 0, facing: null },
    { id: "f3", sku: "furniture_rug", name: "러그", x: 0.46, y: 0.84, scale: 1, rotation: 0, flipX: false, zIndex: 0, facing: null },
    { id: "f4", sku: "interior_plant_side_table", name: "화분 사이드테이블", x: 0.1, y: 0.76, scale: 1, rotation: 0, flipX: false, zIndex: 0, facing: null },
    { id: "f5", sku: "interior_lighthouse_frame", name: "등대 액자", x: 0.5, y: 0.18, scale: 1, rotation: 0, flipX: false, zIndex: 0, facing: null },
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
      .select("id, name, metadata")
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
      .select("id, x, y, scale, rotation, flip_x, z_index, metadata, item_catalog(sku, name)")
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
      wallpaper: (space.metadata as { wallpaper?: string } | null)?.wallpaper ?? null,
      floor: (space.metadata as { floor?: string } | null)?.floor ?? null,
      characters: (characters ?? []).map((c) => ({
        id: c.id,
        nickname: c.nickname,
        roleLabel: c.kind === "haenam" ? (c.department === "engine" ? "해남(기관사)" : "해남(항해사)") : ROLE_LABEL[c.kind] ?? c.kind,
        kind: c.kind as CharacterKind,
        appearance: (c.appearance_json as CharacterAppearance) ?? haenyeoPreset(),
      })),
      placedItems: (placed ?? []).map((p) => {
        const catalog = Array.isArray(p.item_catalog) ? p.item_catalog[0] : p.item_catalog;
        const metadata = p.metadata as { facing?: Facing } | null;
        return {
          id: p.id,
          sku: catalog?.sku ?? null,
          name: catalog?.name ?? "아이템",
          x: Number(p.x),
          y: Number(p.y),
          scale: Number(p.scale),
          rotation: Number(p.rotation),
          flipX: p.flip_x,
          zIndex: p.z_index,
          facing: metadata?.facing ?? null,
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
