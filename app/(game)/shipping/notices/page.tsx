import { createClient } from "@/lib/supabase/server";
import { trySupabase } from "@/lib/supabase/safeQuery";
import { Card } from "@/components/ui/Card";
import { EMPTY_STATE_COPY } from "@/lib/domain/constants";

interface NoticeRow {
  id: string;
  title: string;
  body: string | null;
  pinned: boolean;
  created_at: string;
}

export default async function NoticesPage() {
  const notices = await trySupabase(async () => {
    const supabase = await createClient();
    const { data } = await supabase
      .from("posts")
      .select("id, title, body, pinned, created_at")
      .eq("type", "notice")
      .order("pinned", { ascending: false })
      .order("created_at", { ascending: false });
    return data ?? [];
  }, [] as NoticeRow[]);

  return (
    <div className="flex flex-col gap-3 px-4 pt-5">
      <h1 className="text-lg font-extrabold text-[var(--color-navy)]">공지사항</h1>

      {!notices?.length ? (
        <Card tone="cream" className="py-8 text-center text-[14px] text-[var(--color-navy-soft)]">
          {EMPTY_STATE_COPY.notice}
        </Card>
      ) : (
        notices.map((n) => (
          <Card key={n.id} className="!p-4">
            <div className="flex items-center gap-2">
              {n.pinned && <span className="rounded-full bg-[var(--color-gold)] px-2 py-0.5 text-[11px] font-extrabold text-white">고정</span>}
              <p className="text-[15px] font-extrabold text-[var(--color-navy)]">{n.title}</p>
            </div>
            <p className="mt-1.5 text-[13px] text-[var(--color-navy-soft)]">{n.body}</p>
            <p className="mt-2 text-[11px] text-[var(--color-navy-soft)]">{new Date(n.created_at).toLocaleDateString("ko-KR")}</p>
          </Card>
        ))
      )}
    </div>
  );
}
