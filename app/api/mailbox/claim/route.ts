import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { getMyHouseholdId } from "@/lib/game/household";

// 우편함 수령. 조건부 UPDATE(claimed_at IS NULL)로 최초 1회만 성공하게 해서 중복 요청으로
// 재화가 두 번 지급되지 않게 한다. mailboxItemId 하나만 받거나, all:true면 미수령 전체를
// 순서대로 수령 처리한다("모두 받기" 버튼).
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const service = createServiceClient();
  const householdId = await getMyHouseholdId(service, user.id);
  if (!householdId) return NextResponse.json({ error: "no_household" }, { status: 400 });

  const { mailboxItemId, all } = (await request.json()) as { mailboxItemId?: string; all?: boolean };

  let targetIds: string[];
  if (all) {
    const { data: unclaimed } = await service
      .from("mailbox_items")
      .select("id")
      .eq("household_id", householdId)
      .is("claimed_at", null);
    targetIds = (unclaimed ?? []).map((r) => r.id);
  } else {
    if (!mailboxItemId) return NextResponse.json({ error: "invalid_payload" }, { status: 400 });
    targetIds = [mailboxItemId];
  }

  const claimed: { id: string; cashReward: number }[] = [];
  let totalCash = 0;

  for (const id of targetIds) {
    const { data: item } = await service
      .from("mailbox_items")
      .select("id, household_id, cash_reward, catalog_item_id, item_quantity")
      .eq("id", id)
      .maybeSingle();

    if (!item || item.household_id !== householdId) continue;

    const { data: updated } = await service
      .from("mailbox_items")
      .update({ claimed_at: new Date().toISOString(), claimed_by: user.id })
      .eq("id", id)
      .is("claimed_at", null)
      .select("id");

    if (!updated?.length) continue; // 이미 수령됨(동시 요청 등)

    if (item.catalog_item_id) {
      await service.from("inventory_items").insert({
        household_id: householdId,
        catalog_item_id: item.catalog_item_id,
        quantity: item.item_quantity,
      });
    }

    if (item.cash_reward > 0) {
      totalCash += Number(item.cash_reward);
    }

    claimed.push({ id: item.id, cashReward: Number(item.cash_reward) });
  }

  if (totalCash > 0) {
    // 개별 우편마다 idempotency_key를 따로 걸어서, 한 번 지급된 우편은 이후 재시도돼도
    // 다시 지급되지 않는다(apply_wallet_transaction의 unique 제약 재사용).
    for (const c of claimed) {
      if (c.cashReward <= 0) continue;
      await service.rpc("apply_wallet_transaction", {
        p_household_id: householdId,
        p_amount: c.cashReward,
        p_type: "mailbox_reward",
        p_idempotency_key: `mailbox_claim:${c.id}`,
        p_metadata: { mailboxItemId: c.id },
        p_created_by: user.id,
      });
    }
  }

  const { data: wallet } = await service.from("wallets").select("cached_balance").eq("household_id", householdId).maybeSingle();

  return NextResponse.json({ ok: true, claimedCount: claimed.length, balance: wallet?.cached_balance ?? 0 });
}
