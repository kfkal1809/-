import { createClient } from "@/lib/supabase/server";

export interface AdminHouseholdOption {
  householdId: string;
  memberNames: string[];
}

export interface AdminCatalogOption {
  id: string;
  sku: string | null;
  name: string;
}

export interface AdminMailboxData {
  isAdmin: boolean;
  households: AdminHouseholdOption[];
  items: AdminCatalogOption[];
}

// 관리자 우편함 발송 화면용 데이터. households/household_users_select RLS는 is_approved() 승인
// 사용자면 누구나 읽을 수 있게 열려 있어서(가구 목록 자체는 민감정보가 아님) 쿠키 기반 클라이언트로
// 충분하지만, role='admin' 검증은 여기서 직접 해서 화면 자체를 admin이 아니면 비워 보여준다
// (실제 발송 권한 검증은 /api/mailbox/send에서 서비스 롤로 한 번 더 한다).
export async function getAdminMailboxData(): Promise<AdminMailboxData> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { isAdmin: false, households: [], items: [] };

    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
    if (profile?.role !== "admin") return { isAdmin: false, households: [], items: [] };

    const { data: memberships } = await supabase
      .from("household_users")
      .select("household_id, profiles(nickname)")
      .order("household_id");

    const byHousehold = new Map<string, string[]>();
    for (const row of memberships ?? []) {
      const memberProfile = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
      const name = (memberProfile as { nickname?: string } | null)?.nickname ?? "이름없음";
      const list = byHousehold.get(row.household_id) ?? [];
      list.push(name);
      byHousehold.set(row.household_id, list);
    }
    const households = Array.from(byHousehold.entries()).map(([householdId, memberNames]) => ({ householdId, memberNames }));

    const { data: catalogRows } = await supabase.from("item_catalog").select("id, sku, name").eq("active", true).order("name");

    return {
      isAdmin: true,
      households,
      items: (catalogRows ?? []).map((r) => ({ id: r.id, sku: r.sku, name: r.name })),
    };
  } catch {
    return { isAdmin: false, households: [], items: [] };
  }
}
