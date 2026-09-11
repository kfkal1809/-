import { createClient } from "@/lib/supabase/server";
import { haenyeoPreset, haenamDeckPreset } from "@/lib/domain/characterPresets";
import type { CharacterAppearance } from "@/lib/domain/characterPresets";
import { kstDateString } from "@/lib/game/kst";

export interface DatePhotoRow {
  id: string;
  bgId: string;
  createdAt: string;
}

export interface DatePhotoData {
  haenyeoName: string;
  haenyeoAppearance: CharacterAppearance;
  haenamName: string;
  haenamAppearance: CharacterAppearance;
  todayPhoto: DatePhotoRow | null;
  recentPhotos: DatePhotoRow[];
}

const DEMO_DATA: DatePhotoData = {
  haenyeoName: "두부",
  haenyeoAppearance: haenyeoPreset(),
  haenamName: "북극곰",
  haenamAppearance: haenamDeckPreset(),
  todayPhoto: null,
  recentPhotos: [],
};

export async function getDatePhotoData(): Promise<DatePhotoData> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return DEMO_DATA;

    const { data: membership } = await supabase.from("household_users").select("household_id").eq("user_id", user.id).maybeSingle();
    if (!membership) return DEMO_DATA;

    const householdId = membership.household_id as string;
    const today = kstDateString();

    const [{ data: characters }, { data: photos }] = await Promise.all([
      supabase.from("characters").select("kind, nickname, appearance_json").eq("household_id", householdId),
      supabase
        .from("date_photos")
        .select("id, bg_id, photo_date, created_at")
        .eq("household_id", householdId)
        .order("created_at", { ascending: false })
        .limit(9),
    ]);

    const haenyeo = characters?.find((c) => c.kind === "haenyeo");
    const haenam = characters?.find((c) => c.kind === "haenam");
    const recentPhotos = (photos ?? []).map((p) => ({ id: p.id, bgId: p.bg_id, createdAt: p.created_at }));
    const todayPhoto = (photos ?? []).find((p) => p.photo_date === today);

    return {
      haenyeoName: haenyeo?.nickname ?? "해녀",
      haenyeoAppearance: (haenyeo?.appearance_json as CharacterAppearance) ?? haenyeoPreset(),
      haenamName: haenam?.nickname ?? "해남",
      haenamAppearance: (haenam?.appearance_json as CharacterAppearance) ?? haenamDeckPreset(),
      todayPhoto: todayPhoto ? { id: todayPhoto.id, bgId: todayPhoto.bg_id, createdAt: todayPhoto.created_at } : null,
      recentPhotos,
    };
  } catch {
    return DEMO_DATA;
  }
}
