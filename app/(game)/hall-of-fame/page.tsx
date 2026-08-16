import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { trySupabase } from "@/lib/supabase/safeQuery";
import { Card } from "@/components/ui/Card";
import { GameIcon } from "@/components/icons/GameIcon";

export default async function HallOfFamePage() {
  const records = await trySupabase(async () => {
    const supabase = await createClient();
    const { data } = await supabase
      .from("hall_of_fame")
      .select("id, category, title, description, occurred_at")
      .order("occurred_at", { ascending: false });
    return data ?? [];
  }, [] as { id: string; category: string; title: string; description: string | null; occurred_at: string }[]);

  return (
    <div className="flex flex-col gap-3 px-4 pt-5">
      <h1 className="text-lg font-extrabold text-[var(--color-navy)]">명예의 전당</h1>

      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[26px] border-2 border-white shadow-[0_6px_20px_rgba(36,54,90,0.10)]">
        <Image src="/images/backgrounds/hall-of-fame.jpg" alt="" fill unoptimized style={{ objectFit: "cover" }} />
      </div>

      {!records?.length ? (
        <Card tone="cream" className="flex flex-col items-center gap-2 py-10 text-center">
          <GameIcon name="trophy" size={54} />
          <p className="text-[14px] text-[var(--color-navy-soft)]">아직 등재된 기록이 없어요. 첫 번째 혼인신고의 주인공이 되어보세요!</p>
        </Card>
      ) : (
        records.map((r) => (
          <Card key={r.id} className="flex items-center gap-3 !p-4">
            <GameIcon name="trophy" size={40} />
            <div>
              <p className="text-[11px] font-bold text-[var(--color-gold-deep)]">{new Date(r.occurred_at).toLocaleDateString("ko-KR")}</p>
              <p className="text-[14px] font-extrabold text-[var(--color-navy)]">{r.title}</p>
              <p className="text-[12px] text-[var(--color-navy-soft)]">{r.description}</p>
            </div>
          </Card>
        ))
      )}
    </div>
  );
}
