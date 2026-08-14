import { createClient } from "@/lib/supabase/server";
import { getCabinData } from "@/lib/game/cabinData";
import { GuestbookForm } from "@/components/cabin/GuestbookForm";
import { Card } from "@/components/ui/Card";
import { EMPTY_STATE_COPY } from "@/lib/domain/constants";

export default async function GuestbookPage({ params }: PageProps<"/cabin/[householdId]/guestbook">) {
  const { householdId } = await params;
  const cabin = await getCabinData(householdId);

  let entries: { id: string; authorNickname: string; body: string; createdAt: string }[] = [];
  if (cabin.spaceId) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("guestbook_entries")
      .select("id, body, created_at, profiles(nickname)")
      .eq("cabin_space_id", cabin.spaceId)
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    entries = (data ?? []).map((g) => {
      const profile = Array.isArray(g.profiles) ? g.profiles[0] : g.profiles;
      return { id: g.id, authorNickname: profile?.nickname ?? "익명", body: g.body, createdAt: g.created_at };
    });
  }

  return (
    <div className="flex flex-col gap-4 px-4 pt-5">
      <h1 className="text-lg font-extrabold text-[var(--color-navy)]">{cabin.cabinName} 방명록</h1>

      {cabin.spaceId && <GuestbookForm cabinSpaceId={cabin.spaceId} />}

      {entries.length === 0 ? (
        <Card tone="cream" className="py-8 text-center text-[13px] text-[var(--color-navy-soft)]">
          {EMPTY_STATE_COPY.guestbook}
        </Card>
      ) : (
        <div className="flex flex-col gap-2">
          {entries.map((e) => (
            <Card key={e.id} className="!p-3">
              <div className="flex items-center justify-between">
                <p className="text-[12px] font-extrabold text-[var(--color-navy)]">{e.authorNickname}</p>
                <p className="text-[10px] text-[var(--color-navy-soft)]">{new Date(e.createdAt).toLocaleDateString("ko-KR")}</p>
              </div>
              <p className="mt-1 text-[13px] text-[var(--color-navy)]">{e.body}</p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
