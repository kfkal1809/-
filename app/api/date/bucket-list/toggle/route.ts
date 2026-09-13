import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { getMyHouseholdId } from "@/lib/game/household";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { itemId } = (await request.json()) as { itemId?: string };
  if (!itemId) return NextResponse.json({ error: "invalid_payload" }, { status: 400 });

  const service = createServiceClient();
  const householdId = await getMyHouseholdId(service, user.id);
  if (!householdId) return NextResponse.json({ error: "no_household" }, { status: 400 });

  const { data: item } = await service
    .from("date_bucket_list_items")
    .select("id, completed")
    .eq("id", itemId)
    .eq("household_id", householdId)
    .maybeSingle();
  if (!item) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const nextCompleted = !item.completed;
  const { error } = await service
    .from("date_bucket_list_items")
    .update({
      completed: nextCompleted,
      completed_by: nextCompleted ? user.id : null,
      completed_at: nextCompleted ? new Date().toISOString() : null,
    })
    .eq("id", itemId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true, completed: nextCompleted });
}
