import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { getMyHouseholdId } from "@/lib/game/household";
import { getWalletBalance } from "@/lib/game/wallet";

// 커플링 구매 — 귀금속점 카드에서 직접 구매. 진열대(store_products) 검증 없이
// item_catalog에서 subcategory='ring'인 항목만 허용한다(가게 소속이 아니라 귀금속점 전용).
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { sku } = (await request.json()) as { sku: string };
  if (!sku) return NextResponse.json({ error: "invalid_payload" }, { status: 400 });

  const service = createServiceClient();
  const householdId = await getMyHouseholdId(service, user.id);
  if (!householdId) return NextResponse.json({ error: "no_household" }, { status: 400 });

  const { data: catalog } = await service
    .from("item_catalog")
    .select("id, name, buy_price, subcategory")
    .eq("sku", sku)
    .eq("active", true)
    .maybeSingle();

  if (!catalog || catalog.subcategory !== "ring") return NextResponse.json({ error: "not_found" }, { status: 404 });

  const balance = await getWalletBalance(service, householdId);
  if (balance < catalog.buy_price) return NextResponse.json({ error: "insufficient_funds" }, { status: 400 });

  const { error: rpcError } = await service.rpc("apply_wallet_transaction", {
    p_household_id: householdId,
    p_amount: -catalog.buy_price,
    p_type: "ring_purchase",
    p_idempotency_key: `ring_purchase:${catalog.id}:${user.id}:${crypto.randomUUID()}`,
    p_metadata: { name: catalog.name },
    p_created_by: user.id,
  });
  if (rpcError) return NextResponse.json({ error: rpcError.message }, { status: 500 });

  await service.from("inventory_items").insert({ household_id: householdId, catalog_item_id: catalog.id, quantity: 1 });
  await service.from("couple_events").insert({
    household_id: householdId,
    type: "ring_purchase",
    status: "complete",
    payload: { sku, name: catalog.name },
    completed_at: new Date().toISOString(),
  });

  const finalBalance = await getWalletBalance(service, householdId);
  return NextResponse.json({ ok: true, name: catalog.name, balance: finalBalance });
}
