import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { getMyHouseholdId } from "@/lib/game/household";
import { getWalletBalance } from "@/lib/game/wallet";
import { MARRIAGE_DOCUMENT_PRICE } from "@/lib/domain/constants";

// 혼인신고서 구매 — 커플링 보유 households만 가능. 구매 즉시 양쪽 서명 대기 상태로 전환.
export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const service = createServiceClient();
  const householdId = await getMyHouseholdId(service, user.id);
  if (!householdId) return NextResponse.json({ error: "no_household" }, { status: 400 });

  const { data: household } = await service.from("households").select("game_marriage_status").eq("id", householdId).maybeSingle();
  if (!household || household.game_marriage_status !== "none") {
    return NextResponse.json({ error: "already_in_progress" }, { status: 409 });
  }

  const { data: ringItems } = await service
    .from("inventory_items")
    .select("item_catalog(subcategory)")
    .eq("household_id", householdId);
  const hasRing = (ringItems ?? []).some((r) => {
    const catalog = Array.isArray(r.item_catalog) ? r.item_catalog[0] : r.item_catalog;
    return catalog?.subcategory === "ring";
  });
  if (!hasRing) return NextResponse.json({ error: "no_ring" }, { status: 400 });

  const balance = await getWalletBalance(service, householdId);
  if (balance < MARRIAGE_DOCUMENT_PRICE) return NextResponse.json({ error: "insufficient_funds" }, { status: 400 });

  const { data: doc } = await service.from("item_catalog").select("id, name").eq("sku", "special_marriage_document").maybeSingle();
  if (!doc) return NextResponse.json({ error: "not_found" }, { status: 404 });

  // 조건부 UPDATE로 households 상태를 잠가, 동시에 두 번 눌러도 신청이 한 번만 생성되게 한다.
  const { data: locked } = await service
    .from("households")
    .update({ game_marriage_status: "pending_signature" })
    .eq("id", householdId)
    .eq("game_marriage_status", "none")
    .select("id");
  if (!locked?.length) return NextResponse.json({ error: "already_in_progress" }, { status: 409 });

  const { error: rpcError } = await service.rpc("apply_wallet_transaction", {
    p_household_id: householdId,
    p_amount: -MARRIAGE_DOCUMENT_PRICE,
    p_type: "marriage_document",
    p_idempotency_key: `marriage_doc:${householdId}:${crypto.randomUUID()}`,
    p_metadata: {},
    p_created_by: user.id,
  });
  if (rpcError) {
    // 결제가 실패했으면 상태를 되돌린다.
    await service.from("households").update({ game_marriage_status: "none" }).eq("id", householdId);
    return NextResponse.json({ error: rpcError.message }, { status: 500 });
  }

  await service.from("inventory_items").insert({ household_id: householdId, catalog_item_id: doc.id, quantity: 1 });
  await service.from("couple_events").insert({
    household_id: householdId,
    type: "marriage_request",
    status: "pending",
    payload: { signed_by: [] },
  });

  const finalBalance = await getWalletBalance(service, householdId);
  return NextResponse.json({ ok: true, balance: finalBalance });
}
