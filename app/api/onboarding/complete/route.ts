import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { getMyHouseholdId } from "@/lib/game/household";
import { WELCOME_GRANT_AMOUNT } from "@/lib/domain/constants";

// 좌표는 room-base.png를 실측해서 잡았다(lib/domain/cabinDecor.ts ROOM_CLIP/isInsideFloor로
// 검증 — 바운딩 박스가 아니라 실제 바닥 육각형 폴리곤 안에 들어오는 좌표만 사용, 그 바깥이면
// 벽 위에 뜬 것처럼 보임). 오른쪽 벽에 실제 문(DOOR_X_RANGE ≈ x 0.76~0.93)이 그려져 있어서
// 책상/의자/냉장고를 그 앞이 아니라 왼쪽으로 붙여 문을 가리지 않게 배치했다.
// 침대/책상+의자/냉장고/조명/러그는 바닥 영역에, 현창은 두 벽이 만나는 중앙(기존에 그려진
// 왼쪽 창문·오른쪽 문과 겹치지 않는 유일한 벽면)에 배치.
// ("furniture_lamp"는 item_catalog에 없는 존재하지 않는 sku라 조용히 스킵되던 버그였음 →
// 실제 카탈로그에 있는 "furniture_stand_light"로 교체)
const DEFAULT_FURNITURE_LAYOUT: { sku: string; x: number; y: number; rotation?: number }[] = [
  { sku: "furniture_bed", x: 0.22, y: 0.65 },
  { sku: "furniture_desk", x: 0.68, y: 0.58 },
  { sku: "furniture_chair", x: 0.68, y: 0.72 },
  { sku: "furniture_fridge", x: 0.56, y: 0.5 },
  { sku: "furniture_porthole", x: 0.5, y: 0.18 },
  { sku: "furniture_stand_light", x: 0.16, y: 0.7 },
  { sku: "furniture_rug", x: 0.46, y: 0.86 },
];

// 기획서 3.6: household/cabin/wallet 생성 + $20 웰컴 그랜트 + 기본 아이템 지급을 한 번에 처리.
// idempotency_key로 중복 온보딩 시 $20 재지급을 막는다.
export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const service = createServiceClient();
  const householdId = await getMyHouseholdId(service, user.id);
  if (!householdId) return NextResponse.json({ error: "no_household" }, { status: 400 });

  const idempotencyKey = `welcome_grant:${householdId}`;
  const { data: existingGrant } = await service
    .from("wallet_transactions")
    .select("id")
    .eq("idempotency_key", idempotencyKey)
    .maybeSingle();

  let { data: cabin } = await service
    .from("spaces")
    .select("id")
    .eq("household_id", householdId)
    .eq("type", "cabin")
    .maybeSingle();

  if (!cabin) {
    const { data: newCabin, error: cabinError } = await service
      .from("spaces")
      .insert({ type: "cabin", household_id: householdId, name: "우리 선실", owner_user_id: user.id })
      .select("id")
      .single();
    if (cabinError) return NextResponse.json({ error: cabinError.message }, { status: 500 });
    cabin = newCabin;

    const { data: furnitureCatalog } = await service
      .from("item_catalog")
      .select("id, sku")
      .in("sku", DEFAULT_FURNITURE_LAYOUT.map((f) => f.sku));

    for (const layout of DEFAULT_FURNITURE_LAYOUT) {
      const item = furnitureCatalog?.find((c) => c.sku === layout.sku);
      if (!item) continue;
      const { data: invItem } = await service
        .from("inventory_items")
        .insert({ household_id: householdId, catalog_item_id: item.id, quantity: 1 })
        .select("id")
        .single();
      if (invItem) {
        await service.from("space_items").insert({
          space_id: cabin.id,
          inventory_item_id: invItem.id,
          catalog_item_id: item.id,
          x: layout.x,
          y: layout.y,
          rotation: layout.rotation ?? 0,
        });
      }
    }

    // 인테리어 소품 100종은 가방에 지급하고 배치는 방꾸미기에서 직접 하도록 둔다.
    const { data: interiorPack } = await service.from("item_catalog").select("id").eq("subcategory", "interior_pack");
    if (interiorPack?.length) {
      await service
        .from("inventory_items")
        .insert(interiorPack.map((item) => ({ household_id: householdId, catalog_item_id: item.id, quantity: 1 })));
    }
  }

  if (existingGrant) {
    const { data: wallet } = await service.from("wallets").select("cached_balance").eq("household_id", householdId).maybeSingle();
    return NextResponse.json({ already: true, balance: wallet?.cached_balance ?? 0 });
  }

  const { data: characters } = await service
    .from("characters")
    .select("kind, department")
    .eq("household_id", householdId);

  const subcategories = new Set<string>();
  for (const c of characters ?? []) {
    if (c.kind === "haenyeo") subcategories.add("haenyeo");
    if (c.kind === "haenam") subcategories.add(c.department === "engine" ? "haenam_engine" : "haenam_deck");
    if (c.kind === "child") subcategories.add("child");
  }

  if (subcategories.size > 0) {
    const { data: starterItems } = await service
      .from("item_catalog")
      .select("id")
      .eq("source_label", "기본 지급")
      .in("subcategory", Array.from(subcategories));

    if (starterItems?.length) {
      await service
        .from("inventory_items")
        .insert(starterItems.map((item) => ({ household_id: householdId, catalog_item_id: item.id, quantity: 1 })));
    }
  }

  const { data: rpcResult, error: rpcError } = await service.rpc("apply_wallet_transaction", {
    p_household_id: householdId,
    p_amount: WELCOME_GRANT_AMOUNT,
    p_type: "welcome_grant",
    p_idempotency_key: idempotencyKey,
    p_metadata: { label: "신규 승선자 보급 선용금" },
    p_created_by: user.id,
  });

  if (rpcError) return NextResponse.json({ error: rpcError.message }, { status: 500 });

  const row = Array.isArray(rpcResult) ? rpcResult[0] : rpcResult;
  return NextResponse.json({ already: false, balance: row?.balance ?? WELCOME_GRANT_AMOUNT, grant: WELCOME_GRANT_AMOUNT });
}
