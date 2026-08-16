import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/game/admin";

// 운영자 전용: 특정 가구(household)에 우편함으로 보상(현금/아이템)이나 공지를 보낸다.
// 현금/아이템 없이 title만 있는 "공지"도 허용한다(우편함 화면의 '운영 알림' 카드처럼
// 보상 없이 확인만 하는 우편이 있을 수 있음).
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const service = createServiceClient();
  if (!(await isAdmin(service, user.id))) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const body = (await request.json()) as {
    householdId?: string;
    title?: string;
    message?: string;
    cashReward?: number;
    catalogItemId?: string;
    itemQuantity?: number;
  };

  const householdId = body.householdId;
  const title = body.title?.trim();
  const cashReward = Number(body.cashReward ?? 0);
  const itemQuantity = Math.max(1, Math.floor(Number(body.itemQuantity ?? 1)));

  if (!householdId || !title) {
    return NextResponse.json({ error: "invalid_payload" }, { status: 400 });
  }
  if (!Number.isFinite(cashReward) || cashReward < 0) {
    return NextResponse.json({ error: "invalid_cash_reward" }, { status: 400 });
  }

  const { data: household } = await service.from("households").select("id").eq("id", householdId).maybeSingle();
  if (!household) return NextResponse.json({ error: "household_not_found" }, { status: 404 });

  let catalogItemId: string | null = null;
  if (body.catalogItemId) {
    const { data: catalog } = await service
      .from("item_catalog")
      .select("id")
      .eq("id", body.catalogItemId)
      .eq("active", true)
      .maybeSingle();
    if (!catalog) return NextResponse.json({ error: "item_not_found" }, { status: 404 });
    catalogItemId = catalog.id;
  }

  const { data: mailboxItem, error } = await service
    .from("mailbox_items")
    .insert({
      household_id: householdId,
      title,
      body: body.message?.trim() || null,
      cash_reward: cashReward,
      catalog_item_id: catalogItemId,
      item_quantity: catalogItemId ? itemQuantity : 1,
      created_by: user.id,
    })
    .select("id")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true, mailboxItemId: mailboxItem.id });
}
