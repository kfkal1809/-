import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { getMyHouseholdId } from "@/lib/game/household";
import { getWalletBalance } from "@/lib/game/wallet";

// 기획서 1.37.2 / 3.18: 가게 상품 구매 — store_products에 실제로 진열된 상품인지 검증 후 차감·지급.
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { storeSlug, catalogItemId } = (await request.json()) as { storeSlug: string; catalogItemId: string };
  if (!storeSlug || !catalogItemId) return NextResponse.json({ error: "invalid_payload" }, { status: 400 });

  const service = createServiceClient();
  const householdId = await getMyHouseholdId(service, user.id);
  if (!householdId) return NextResponse.json({ error: "no_household" }, { status: 400 });

  const { data: store } = await service.from("stores").select("id").eq("slug", storeSlug).maybeSingle();
  if (!store) return NextResponse.json({ error: "store_not_found" }, { status: 404 });

  const { data: listing } = await service
    .from("store_products")
    .select("catalog_item_id, item_catalog(id, name, buy_price, placeable)")
    .eq("store_id", store.id)
    .eq("catalog_item_id", catalogItemId)
    .eq("active", true)
    .maybeSingle();

  if (!listing) return NextResponse.json({ error: "not_listed" }, { status: 404 });
  const catalog = Array.isArray(listing.item_catalog) ? listing.item_catalog[0] : listing.item_catalog;
  if (!catalog) return NextResponse.json({ error: "not_listed" }, { status: 404 });

  const balance = await getWalletBalance(service, householdId);
  if (balance < catalog.buy_price) return NextResponse.json({ error: "insufficient_funds" }, { status: 400 });

  const { error: rpcError } = await service.rpc("apply_wallet_transaction", {
    p_household_id: householdId,
    p_amount: -catalog.buy_price,
    p_type: "store_purchase",
    p_idempotency_key: `purchase:${catalogItemId}:${user.id}:${crypto.randomUUID()}`,
    p_metadata: { name: catalog.name },
    p_created_by: user.id,
  });
  if (rpcError) return NextResponse.json({ error: rpcError.message }, { status: 500 });

  await service.from("inventory_items").insert({ household_id: householdId, catalog_item_id: catalogItemId, quantity: 1 });

  const finalBalance = await getWalletBalance(service, householdId);
  return NextResponse.json({ ok: true, itemName: catalog.name, placeable: catalog.placeable, balance: finalBalance });
}
