import { createClient } from "@/lib/supabase/server";
import { trySupabase } from "@/lib/supabase/safeQuery";
import { Card } from "@/components/ui/Card";
import { SuggestionForm } from "@/components/shipping/SuggestionForm";

interface SuggestionRow {
  id: string;
  title: string;
  body: string | null;
  status: string | null;
  admin_reply: string | null;
  created_at: string;
}

export default async function SuggestionsPage() {
  const mine = await trySupabase(async () => {
    const supabase = await createClient();
    const { data } = await supabase
      .from("posts")
      .select("id, title, body, status, admin_reply, created_at")
      .eq("type", "suggestion")
      .order("created_at", { ascending: false });
    return data ?? [];
  }, [] as SuggestionRow[]);

  return (
    <div className="flex flex-col gap-4 px-4 pt-5">
      <h1 className="text-lg font-extrabold text-[var(--color-navy)]">건의사항</h1>
      <p className="rounded-2xl bg-white px-4 py-2.5 text-[12px] font-bold text-[var(--color-navy)] shadow-[0_4px_14px_rgba(36,54,90,0.08)]">
        의견을 남겨주세요. 최고의 서비스로 모시겠습니다. — 선주 아랍
      </p>

      <SuggestionForm />

      <div className="flex flex-col gap-2">
        {mine?.map((s) => (
          <Card key={s.id} className="!p-4">
            <div className="flex items-center justify-between">
              <p className="text-[13px] font-extrabold text-[var(--color-navy)]">{s.title}</p>
              <span className="rounded-full bg-[var(--color-sky)] px-2 py-0.5 text-[10px] font-bold text-[var(--color-navy-soft)]">
                {s.status ?? "접수"}
              </span>
            </div>
            <p className="mt-1 text-[12px] text-[var(--color-navy-soft)]">{s.body}</p>
            {s.admin_reply && (
              <p className="mt-2 rounded-xl bg-[var(--color-sky)] px-3 py-2 text-[12px] text-[var(--color-navy)]">
                답변: {s.admin_reply}
              </p>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
