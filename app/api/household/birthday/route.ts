import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { getMyHouseholdId } from "@/lib/game/household";

// 해녀/해남 생일 저장. voyage/update, household/anniversary와 동일하게 household 연결된
// 사람 누구나 서로의 생일을 수정할 수 있다. 빈 문자열은 null로 저장해서 값을 지울 수 있다.
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { haenyeoBirthday, haenamBirthday } = (await request.json()) as {
    haenyeoBirthday?: string | null;
    haenamBirthday?: string | null;
  };

  const service = createServiceClient();
  const householdId = await getMyHouseholdId(service, user.id);
  if (!householdId) return NextResponse.json({ error: "no_household" }, { status: 400 });

  await Promise.all([
    service
      .from("characters")
      .update({ birthday: haenyeoBirthday || null })
      .eq("household_id", householdId)
      .eq("kind", "haenyeo"),
    service
      .from("characters")
      .update({ birthday: haenamBirthday || null })
      .eq("household_id", householdId)
      .eq("kind", "haenam"),
  ]);

  return NextResponse.json({ ok: true });
}
