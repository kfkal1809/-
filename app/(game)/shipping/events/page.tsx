import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { trySupabase } from "@/lib/supabase/safeQuery";
import { Card } from "@/components/ui/Card";
import { EMPTY_STATE_COPY } from "@/lib/domain/constants";

interface EventRow {
  id: string;
  title: string;
  body: string | null;
  start_at: string | null;
  end_at: string | null;
  status: string | null;
}

export default async function EventsListPage() {
  const events = await trySupabase(async () => {
    const supabase = await createClient();
    const { data } = await supabase
      .from("posts")
      .select("id, title, body, start_at, end_at, status")
      .eq("type", "event")
      .order("start_at", { ascending: false });
    return data ?? [];
  }, [] as EventRow[]);

  return (
    <div className="flex flex-col gap-3 px-4 pt-5">
      <h1 className="text-lg font-extrabold text-[var(--color-navy)]">이벤트</h1>

      {!events?.length ? (
        <Card tone="cream" className="py-8 text-center text-[14px] text-[var(--color-navy-soft)]">
          {EMPTY_STATE_COPY.event}
        </Card>
      ) : (
        events.map((e) => (
          <Link key={e.id} href={`/shipping/events/${e.id}`}>
            <Card className="!p-4">
              <p className="text-[14px] font-extrabold text-[var(--color-navy)]">{e.title}</p>
              <p className="mt-1 line-clamp-2 text-[13px] text-[var(--color-navy-soft)]">{e.body}</p>
            </Card>
          </Link>
        ))
      )}
    </div>
  );
}
