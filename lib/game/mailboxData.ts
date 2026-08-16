import { createClient } from "@/lib/supabase/server";

export interface MailboxItemRow {
  id: string;
  title: string;
  body: string | null;
  cashReward: number;
  itemName: string | null;
  itemQuantity: number;
  createdAt: string;
  claimedAt: string | null;
}

export async function getMailboxItems(): Promise<MailboxItemRow[]> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return [];

    const { data: membership } = await supabase.from("household_users").select("household_id").eq("user_id", user.id).maybeSingle();
    if (!membership) return [];

    // mailbox_items_select RLS(is_household_member)가 허용하므로 쿠키 기반 클라이언트로 충분하다.
    const { data } = await supabase
      .from("mailbox_items")
      .select("id, title, body, cash_reward, item_quantity, created_at, claimed_at, item_catalog(name)")
      .eq("household_id", membership.household_id)
      .order("created_at", { ascending: false });

    return (data ?? []).map((row) => {
      const catalog = Array.isArray(row.item_catalog) ? row.item_catalog[0] : row.item_catalog;
      return {
        id: row.id,
        title: row.title,
        body: row.body,
        cashReward: Number(row.cash_reward),
        itemName: (catalog as { name?: string } | null)?.name ?? null,
        itemQuantity: row.item_quantity,
        createdAt: row.created_at,
        claimedAt: row.claimed_at,
      };
    });
  } catch {
    return [];
  }
}
