"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { GameIcon } from "@/components/icons/GameIcon";
import { playSfx } from "@/lib/audio/audioManager";
import { relativeTimeKorean } from "@/lib/game/relativeTime";
import type { MailboxItemRow } from "@/lib/game/mailboxData";

type Tab = "all" | "unclaimed" | "claimed";

export function MailboxScreen({ items }: { items: MailboxItemRow[] }) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("all");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [claimingAll, setClaimingAll] = useState(false);

  const unclaimedCount = items.filter((i) => !i.claimedAt).length;

  const shown = useMemo(() => {
    if (tab === "unclaimed") return items.filter((i) => !i.claimedAt);
    if (tab === "claimed") return items.filter((i) => i.claimedAt);
    return items;
  }, [items, tab]);

  async function claimOne(id: string) {
    if (busyId || claimingAll) return;
    setBusyId(id);
    try {
      const res = await fetch("/api/mailbox/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mailboxItemId: id }),
      });
      if (!res.ok) throw new Error();
      playSfx("coin");
      router.refresh();
    } catch {
      // 조용히 실패 처리 — 새로고침해서 최신 상태를 다시 보여준다.
      router.refresh();
    } finally {
      setBusyId(null);
    }
  }

  async function claimAll() {
    if (busyId || claimingAll || unclaimedCount === 0) return;
    setClaimingAll(true);
    try {
      const res = await fetch("/api/mailbox/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ all: true }),
      });
      if (!res.ok) throw new Error();
      playSfx("coin");
      router.refresh();
    } catch {
      router.refresh();
    } finally {
      setClaimingAll(false);
    }
  }

  return (
    <div className="flex flex-col gap-4 px-4 pt-5">
      <div className="flex items-center gap-2">
        <GameIcon name="mailbox" size={40} />
        <h1 className="text-lg font-extrabold text-[var(--color-navy)]">우편함</h1>
      </div>

      <div className="flex gap-2">
        <TabButton label="전체" active={tab === "all"} onClick={() => setTab("all")} />
        <TabButton label="읽지않음" active={tab === "unclaimed"} onClick={() => setTab("unclaimed")} badge={unclaimedCount} />
        <TabButton label="보관" active={tab === "claimed"} onClick={() => setTab("claimed")} />
      </div>

      {shown.length === 0 ? (
        <p className="py-10 text-center text-[13px] text-[var(--color-navy-soft)]">우편이 없어요.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {shown.map((item) => (
            <MailboxRow key={item.id} item={item} busy={busyId === item.id} onClaim={() => claimOne(item.id)} />
          ))}
        </div>
      )}

      {unclaimedCount > 0 && (
        <button
          onClick={claimAll}
          disabled={claimingAll}
          className="mt-1 rounded-full bg-[var(--color-coral)] px-6 py-3 text-[14px] font-extrabold text-white active:scale-95 disabled:opacity-60"
        >
          {claimingAll ? "받는 중..." : "모두 받기"}
        </button>
      )}
    </div>
  );
}

function TabButton({ label, active, onClick, badge }: { label: string; active: boolean; onClick: () => void; badge?: number }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1 rounded-full px-4 py-1.5 text-[13px] font-bold ${
        active ? "bg-[var(--color-coral)] text-white" : "bg-white text-[var(--color-navy-soft)]"
      }`}
    >
      {label}
      {!!badge && (
        <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--color-danger)] px-1 text-[10px] font-extrabold text-white">
          {badge}
        </span>
      )}
    </button>
  );
}

function MailboxRow({ item, busy, onClaim }: { item: MailboxItemRow; busy: boolean; onClaim: () => void }) {
  const hasReward = item.cashReward > 0 || !!item.itemName;
  return (
    <Card tone={item.claimedAt ? "surface" : "cream"} className="flex items-center gap-3 !p-3">
      <GameIcon name="mailbox" size={34} />
      <div className="flex-1">
        <div className="flex items-center gap-1.5">
          <p className="text-[14px] font-bold text-[var(--color-navy)]">{item.title}</p>
          {!item.claimedAt && (
            <span className="rounded-full bg-[var(--color-coral)] px-1.5 py-0.5 text-[9px] font-extrabold text-white">NEW</span>
          )}
        </div>
        {item.body && <p className="text-[12px] text-[var(--color-navy-soft)]">{item.body}</p>}
        <div className="mt-0.5 flex items-center gap-2 text-[11px] text-[var(--color-navy-soft)]">
          <span>{relativeTimeKorean(item.createdAt)}</span>
          {item.cashReward > 0 && <span className="font-bold text-[var(--color-coral)]">+${item.cashReward}</span>}
          {item.itemName && (
            <span className="font-bold text-[var(--color-navy)]">
              {item.itemName} x{item.itemQuantity}
            </span>
          )}
        </div>
      </div>
      {item.claimedAt ? (
        <p className="text-[12px] font-extrabold text-[var(--color-mint-deep)]">수령완료</p>
      ) : (
        <button
          onClick={onClaim}
          disabled={busy}
          className={`rounded-full px-4 py-1.5 text-[13px] font-extrabold text-white active:scale-95 disabled:opacity-60 ${
            hasReward ? "bg-[var(--color-coral)]" : "bg-[var(--color-tab-active)]"
          }`}
        >
          {busy ? "..." : hasReward ? "받기" : "확인"}
        </button>
      )}
    </Card>
  );
}
