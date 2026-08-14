import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/Card";
import { GameIcon } from "@/components/icons/GameIcon";

export default async function NotificationsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: notifications } = user
    ? await supabase.from("notifications").select("id, title, body, read_at, created_at").eq("user_id", user.id).order("created_at", { ascending: false })
    : { data: [] };

  return (
    <div className="flex flex-col gap-3 px-4 pt-5">
      <h1 className="text-lg font-extrabold text-[var(--color-navy)]">알림</h1>

      {!notifications?.length ? (
        <Card tone="cream" className="flex flex-col items-center gap-2 py-10 text-center">
          <GameIcon name="bell" size={48} />
          <p className="text-[13px] text-[var(--color-navy-soft)]">아직 도착한 알림이 없어요.</p>
        </Card>
      ) : (
        notifications.map((n) => (
          <Card key={n.id} className={`!p-3.5 ${n.read_at ? "" : "border-[var(--color-sky-new)]"}`}>
            <p className="text-[13px] font-bold text-[var(--color-navy)]">{n.title}</p>
            {n.body && <p className="mt-0.5 text-[12px] text-[var(--color-navy-soft)]">{n.body}</p>}
            <p className="mt-1 text-[10px] text-[var(--color-navy-soft)]">{new Date(n.created_at).toLocaleString("ko-KR")}</p>
          </Card>
        ))
      )}
    </div>
  );
}
