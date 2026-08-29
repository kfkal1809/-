import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import type { CharacterAppearance, HairStyle } from "@/lib/domain/characterPresets";

// 온보딩 때 고른 피부톤/헤어컬러/헤어스타일/의상컬러를 나중에 다시 바꿀 수 있는 화면이
// 없었다 — 캐릭터 꾸미기 화면(/character/[id]/customize)은 가방 아이템 착용만 가능했음.
// 이 라우트는 그 기본 외형(온보딩 스와치 값들)만 character_managers 권한 검증 후 병합한다.
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { characterId, skinTone, hairColor, hairStyle, outfitColor, outfitAssetKey } = (await request.json()) as {
    characterId: string;
    skinTone: string;
    hairColor: string;
    hairStyle: HairStyle;
    outfitColor: string;
    outfitAssetKey: string;
  };
  if (!characterId || !skinTone || !hairColor || !hairStyle || !outfitColor || !outfitAssetKey) {
    return NextResponse.json({ error: "invalid_payload" }, { status: 400 });
  }

  const service = createServiceClient();

  const { data: manager } = await service
    .from("character_managers")
    .select("character_id")
    .eq("character_id", characterId)
    .eq("user_id", user.id)
    .maybeSingle();
  if (!manager) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const { data: character } = await service
    .from("characters")
    .select("appearance_json, kind")
    .eq("id", characterId)
    .maybeSingle();
  if (!character) return NextResponse.json({ error: "not_found" }, { status: 404 });
  if (character.kind === "child") return NextResponse.json({ error: "unsupported_kind" }, { status: 400 });

  const nextAppearance: CharacterAppearance = {
    ...(character.appearance_json as CharacterAppearance),
    skinTone,
    hairColor,
    hairStyle,
    outfitColor,
    outfitAssetKey,
  };

  await service.from("characters").update({ appearance_json: nextAppearance }).eq("id", characterId);

  return NextResponse.json({ appearance: nextAppearance });
}
