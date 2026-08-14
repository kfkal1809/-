import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { getMyHouseholdId } from "@/lib/game/household";

// 기획서 3.14: 소유 확인 → 판매가 조회 → 인벤토리 감소 → 선용금 증가를 원자적으로 처리.
// 먼저 조건부 delete로 소유권을 재검증해 더블클릭으로 두 번 판매되지 않게 한다.
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
    .select("id, quantity, item_catalog(name, sell_price)")
    .eq("id", inventoryItemId)
    .eq("household_id", householdId)
    .maybeSingle();

  if (!item) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const { data: deleted } = await service
    .from("inventory_items")
    .delete()
    .eq("id", inventoryItemId)
    .eq("household_id", householdId)
    .select("id");

  if (!deleted?.length) return NextResponse.json({ error: "already_sold" }, { status: 409 });

  const catalog = Array.isArray(item.item_catalog) ? item.item_catalog[0] : item.item_catalog;
  const total = (catalog?.sell_price ?? 0) * item.quantity;

  const { data: rpcResult } = await service.rpc("apply_wallet_transaction", {
    p_household_id: householdId,
    p_amount: total,
    p_type: "fishing_sale",
    p_idempotency_key: `sell:${inventoryItemId}:${crypto.randomUUID()}`,
    p_metadata: { name: catalog?.name, quantity: item.quantity },
    p_created_by: user.id,
  });

  const row = Array.isArray(rpcResult) ? rpcResult[0] : rpcResult;
  return NextResponse.json({ ok: true, earned: total, balance: row?.balance ?? 0 });
}
