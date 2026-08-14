import { createClient } from "@/lib/supabase/server";
import { trySupabase } from "@/lib/supabase/safeQuery";
import { Card } from "@/components/ui/Card";

interface EventDetail {
  title: string;
  body: string | null;
  start_at: string | null;
  end_at: string | null;
  image_asset: string | null;
}

export default async function EventDetailPage({ params }: PageProps<"/shipping/events/[eventId]">) {
  const { eventId } = await params;
  const event = await trySupabase(async () => {
    const supabase = await createClient();
    const { data } = await supabase
      .from("posts")
      .select("title, body, start_at, end_at, image_asset")
      .eq("id", eventId)
      .eq("type", "event")
      .maybeSingle();
    return data;
  }, null as EventDetail | null);

  if (!event) {
    return (
      <div className="px-4 pt-5">
        <Card tone="cream" className="py-8 text-center text-[13px] text-[var(--color-navy-soft)]">
          이벤트를 찾을 수 없어요.
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 px-4 pt-5">
      <h1 className="text-lg font-extrabold text-[var(--color-navy)]">{event.title}</h1>
      {(event.start_at || event.end_at) && (
        <p className="text-[12px] text-[var(--color-navy-soft)]">
          {event.start_at ? new Date(event.start_at).toLocaleDateString("ko-KR") : ""} ~{" "}
          {event.end_at ? new Date(event.end_at).toLocaleDateString("ko-KR") : "종료일 미정"}
        </p>
      )}
      <Card className="whitespace-pre-wrap !p-4 text-[13px] leading-relaxed text-[var(--color-navy)]">{event.body}</Card>
    </div>
  );
}
