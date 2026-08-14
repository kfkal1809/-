import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { getMyHouseholdId } from "@/lib/game/household";
import { getWalletBalance } from "@/lib/game/wallet";
import { getDishCatalog, weightedPickReward } from "@/lib/game/randomReward";

const COOK_FEE = 1;

// 기획서 1.36 / 3.6: 생선 소비 + 소액 조리비 차감 + 랜덤 꾸미기 아이템 지급.
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { inventoryItemId } = (await request.json()) as { inventoryItemId: string };
  if (!inventoryItemId) return NextResponse.json({ error: "invalid_payload" }, { status: 400 });

  const service = createServiceClient();
  const householdId = await getMyHouseholdId(service, user.id);
  if (!householdId) return NextResponse.json({ error: "no_household" }, { status: 400 });

  const { data: item } = await service
    .from("inventory_items")
    .select("id, quantity, item_catalog(category, subcategory)")
    .eq("id", inventoryItemId)
    .eq("household_id", householdId)
    .maybeSingle();

  if (!item) return NextResponse.json({ error: "not_found" }, { status: 404 });
  const catalog = Array.isArray(item.item_catalog) ? item.item_catalog[0] : item.item_catalog;
  if (catalog?.category !== "keepsake" || catalog?.subcategory !== "fish") {
    return NextResponse.json({ error: "not_cookable" }, { status: 400 });
  }

  const balance = await getWalletBalance(service, householdId);
  if (balance < COOK_FEE) return NextResponse.json({ error: "insufficient_funds" }, { status: 400 });

  if (item.quantity > 1) {
    const { data: updated } = await service
      .from("inventory_items")
      .update({ quantity: item.quantity - 1 })
      .eq("id", inventoryItemId)
      .eq("quantity", item.quantity)
      .select("id");
    if (!updated?.length) return NextResponse.json({ error: "conflict" }, { status: 409 });
  } else {
    const { data: deleted } = await service
      .from("inventory_items")
      .delete()
      .eq("id", inventoryItemId)
      .eq("quantity", 1)
      .select("id");
    if (!deleted?.length) return NextResponse.json({ error: "conflict" }, { status: 409 });
  }

  await service.rpc("apply_wallet_transaction", {
    p_household_id: householdId,
    p_amount: -COOK_FEE,
    p_type: "restaurant_purchase",
    p_idempotency_key: `cook:${inventoryItemId}:${crypto.randomUUID()}`,
    p_metadata: { label: "조리비" },
    p_created_by: user.id,
  });

  const dishCatalog = await getDishCatalog(service);
  const reward = weightedPickReward(dishCatalog, Math.random);

  if (reward) {
    await service.from("inventory_items").insert({ household_id: householdId, catalog_item_id: reward.id, quantity: 1 });
  }

  const finalBalance = await getWalletBalance(service, householdId);
  return NextResponse.json({ ok: true, reward: reward ? { name: reward.name, rarity: reward.rarity } : null, balance: finalBalance });
}
