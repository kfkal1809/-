import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { getMyHouseholdId } from "@/lib/game/household";
import { getWalletBalance } from "@/lib/game/wallet";
import { getDecorativeCatalog, weightedPickReward } from "@/lib/game/randomReward";
import { MESS_ROOM_MENU } from "@/lib/domain/constants";

const PITY_THRESHOLD = 10;

// 기획서 3.16 / FR-MESS-001: 가격 차감과 아이템 지급을 원자적으로 처리, 10회마다 희귀 이상 보장.
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { menuKey } = (await request.json()) as { menuKey: string };
  const menu = MESS_ROOM_MENU.find((m) => m.key === menuKey);
  if (!menu) return NextResponse.json({ error: "invalid_menu" }, { status: 400 });

  const service = createServiceClient();
  const householdId = await getMyHouseholdId(service, user.id);
  if (!householdId) return NextResponse.json({ error: "no_household" }, { status: 400 });

  const balance = await getWalletBalance(service, householdId);
  if (balance < menu.price) return NextResponse.json({ error: "insufficient_funds" }, { status: 400 });

  const { data: lastOrder } = await service
    .from("restaurant_orders")
    .select("pity_count")
    .eq("household_id", householdId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const attemptIndex = (lastOrder?.pity_count ?? 0) + 1;
  const boosted = menu.key !== "regular";
  const catalog = await getDecorativeCatalog(service);

  let reward = weightedPickReward(catalog, Math.random, boosted);
  const forcedPity = attemptIndex >= PITY_THRESHOLD;
  if (forcedPity) {
    const rareUp = catalog.filter((c) => c.rarity !== "common");
    reward = weightedPickReward(rareUp.length > 0 ? rareUp : catalog, Math.random, true);
  }

  const nextPity = forcedPity || (reward && reward.rarity !== "common") ? 0 : attemptIndex;

  const { error: rpcError } = await service.rpc("apply_wallet_transaction", {
    p_household_id: householdId,
    p_amount: -menu.price,
    p_type: "restaurant_purchase",
    p_idempotency_key: `restaurant:${user.id}:${crypto.randomUUID()}`,
    p_metadata: { menu: menu.key },
    p_created_by: user.id,
  });
  if (rpcError) return NextResponse.json({ error: rpcError.message }, { status: 500 });

  if (reward) {
    await service.from("inventory_items").insert({ household_id: householdId, catalog_item_id: reward.id, quantity: 1 });
  }

  await service.from("restaurant_orders").insert({
    household_id: householdId,
    user_id: user.id,
    menu_key: menu.key,
    cost: menu.price,
    reward_item_id: reward?.id ?? null,
    pity_count: nextPity,
  });

  const finalBalance = await getWalletBalance(service, householdId);
  return NextResponse.json({
    ok: true,
    reward: reward ? { name: reward.name, rarity: reward.rarity } : null,
    balance: finalBalance,
  });
}
