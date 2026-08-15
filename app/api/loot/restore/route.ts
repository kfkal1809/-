import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { getMyHouseholdId } from "@/lib/game/household";
import { getWalletBalance } from "@/lib/game/wallet";

const RESTORE_COST = 2;

// 해남이 쪽지 — 랜덤 문자 (1.34 "해남이 랜덤 문자")
const HAENAM_NOTES = [
  "오늘도 수고했어! 항상 고마워 :)",
  "보고 싶다. 조금만 기다려줘.",
  "오늘 파도가 잔잔해서 네 생각 났어.",
  "하선하면 제일 먼저 너한테 갈게.",
];

// 기획서 1.34 / 3.15: 복원가능 아이템 확인 → 비용 차감 → RNG 결과 → 지급.
// "해남이가 떨어뜨린 낡은 휴대폰" 등 lost 서브카테고리 아이템에 적용된다.
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
    .select("id, quantity, item_catalog(sku, category, subcategory, name)")
    .eq("id", inventoryItemId)
    .eq("household_id", householdId)
    .maybeSingle();

  if (!item) return NextResponse.json({ error: "not_found" }, { status: 404 });
  const catalog = Array.isArray(item.item_catalog) ? item.item_catalog[0] : item.item_catalog;
  if (catalog?.category !== "keepsake" || catalog?.subcategory !== "lost") {
    return NextResponse.json({ error: "not_restorable" }, { status: 400 });
  }
  const isPhone = catalog?.sku === "lost_old_phone";

  const balance = await getWalletBalance(service, householdId);
  if (balance < RESTORE_COST) return NextResponse.json({ error: "insufficient_funds" }, { status: 400 });

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
    p_amount: -RESTORE_COST,
    p_type: "restore_cost",
    p_idempotency_key: `restore-cost:${inventoryItemId}:${crypto.randomUUID()}`,
    p_metadata: { name: catalog?.name },
    p_created_by: user.id,
  });

  // 기획서 1.34: 해남이 랜덤 문자 / 선용금 $2~5 / 희귀 소품 / 사진 조각 / 복원 실패
  const roll = Math.random();
  let outcome: "fail" | "note" | "cash" | "photo" | "headline";
  if (roll < 0.25) outcome = "fail";
  else if (roll < 0.5) outcome = "note";
  else if (roll < 0.75) outcome = "cash";
  else if (roll < 0.9) outcome = "photo";
  else outcome = "headline";

  let message = "복원에 실패했어요...";
  let cashReward = 0;
  let itemReward: { name: string; rarity: string } | null = null;

  if (outcome === "note") {
    message = HAENAM_NOTES[Math.floor(Math.random() * HAENAM_NOTES.length)];
  } else if (outcome === "cash") {
    cashReward = 2 + Math.floor(Math.random() * 4); // $2~5
    await service.rpc("apply_wallet_transaction", {
      p_household_id: householdId,
      p_amount: cashReward,
      p_type: "restore_reward",
      p_idempotency_key: `restore-cash:${inventoryItemId}:${crypto.randomUUID()}`,
      p_metadata: {},
      p_created_by: user.id,
    });
    message = `깜짝 용돈 $${cashReward}을 발견했어요!`;
  } else if (outcome === "photo") {
    // restore_old_phone_fixed는 headline+휴대폰 전용이라 여기 풀에서는 제외한다.
    const { data: restoredPool } = await service
      .from("item_catalog")
      .select("id, name, rarity")
      .eq("subcategory", "restored")
      .neq("sku", "restore_old_phone_fixed")
      .eq("active", true);
    const pick = (restoredPool ?? [])[Math.floor(Math.random() * (restoredPool?.length ?? 1))];
    if (pick) {
      await service.from("inventory_items").insert({ household_id: householdId, catalog_item_id: pick.id, quantity: 1 });
      itemReward = { name: pick.name, rarity: pick.rarity };
      message = `${pick.name}을(를) 찾았어요.`;
    }
  } else if (outcome === "headline") {
    if (isPhone) {
      const { data: fixedPhone } = await service
        .from("item_catalog")
        .select("id, name, rarity")
        .eq("sku", "restore_old_phone_fixed")
        .maybeSingle();
      if (fixedPhone) {
        await service.from("inventory_items").insert({ household_id: householdId, catalog_item_id: fixedPhone.id, quantity: 1 });
        itemReward = { name: fixedPhone.name, rarity: fixedPhone.rarity };
        message = `복원 성공! ${fixedPhone.name}을(를) 책상에 놓을 수 있어요.`;
      }
    } else {
      const { data: legendCatalog } = await service.from("item_catalog").select("id, name, rarity").eq("subcategory", "legend").eq("active", true);
      const pick = (legendCatalog ?? [])[Math.floor(Math.random() * (legendCatalog?.length ?? 1))];
      if (pick) {
        await service.from("inventory_items").insert({ household_id: householdId, catalog_item_id: pick.id, quantity: 1 });
        itemReward = { name: pick.name, rarity: pick.rarity };
        message = `대박! ${pick.name}을(를) 발견했어요!`;
      }
    }
  }

  const finalBalance = await getWalletBalance(service, householdId);
  return NextResponse.json({ ok: true, outcome, message, cashReward, itemReward, balance: finalBalance });
}
