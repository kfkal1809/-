import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { getMyHouseholdId } from "@/lib/game/household";
import { getWalletBalance } from "@/lib/game/wallet";
import { getDecorativeCatalog, weightedPickReward } from "@/lib/game/randomReward";
import { kstDateString } from "@/lib/game/kst";
import { WORK_REWARD_MIN, WORK_REWARD_MAX } from "@/lib/domain/constants";

// 기획서 1.38 / 1.40 / 3.17: 하루 1회 유료 보상 인정. store_work_logs unique(store_id,user_id,work_date)로
// DB 레벨에서도 중복 알바를 막는다.
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { storeSlug, taskLabel } = (await request.json()) as { storeSlug: string; taskLabel: string };
  if (!storeSlug) return NextResponse.json({ error: "invalid_payload" }, { status: 400 });

  const service = createServiceClient();
  const householdId = await getMyHouseholdId(service, user.id);
  if (!householdId) return NextResponse.json({ error: "no_household" }, { status: 400 });

  const { data: store } = await service.from("stores").select("id").eq("slug", storeSlug).maybeSingle();
  if (!store) return NextResponse.json({ error: "store_not_found" }, { status: 404 });

  const workDate = kstDateString();
  const reward = WORK_REWARD_MIN + Math.floor(Math.random() * (WORK_REWARD_MAX - WORK_REWARD_MIN + 1));

  let propReward: { name: string; rarity: string } | null = null;
  if (Math.random() < 0.15) {
    const catalog = await getDecorativeCatalog(service);
    const pick = weightedPickReward(catalog, Math.random);
    if (pick) {
      await service.from("inventory_items").insert({ household_id: householdId, catalog_item_id: pick.id, quantity: 1 });
      propReward = { name: pick.name, rarity: pick.rarity };
    }
  }

  const { error: logError } = await service.from("store_work_logs").insert({
    store_id: store.id,
    user_id: user.id,
    task_key: taskLabel ?? "알바",
    reward,
    reward_item_id: null,
    work_date: workDate,
  });

  if (logError) {
    if (logError.code === "23505") return NextResponse.json({ error: "already_worked_today" }, { status: 409 });
    return NextResponse.json({ error: logError.message }, { status: 500 });
  }

  await service.rpc("apply_wallet_transaction", {
    p_household_id: householdId,
    p_amount: reward,
    p_type: "store_work",
    p_idempotency_key: `work:${store.id}:${user.id}:${workDate}`,
    p_metadata: { task: taskLabel },
    p_created_by: user.id,
  });

  const balance = await getWalletBalance(service, householdId);
  return NextResponse.json({ ok: true, reward, propReward, balance });
}
