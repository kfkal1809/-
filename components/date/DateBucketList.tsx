"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { playSfx } from "@/lib/audio/audioManager";
import type { DateBucketListItem } from "@/lib/game/dateBucketListData";

export function DateBucketList({ items }: { items: DateBucketListItem[] }) {
  const router = useRouter();
  const [text, setText] = useState("");
  const [adding, setAdding] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function handleAdd() {
    if (!text.trim() || adding) return;
    setAdding(true);
    try {
      const res = await fetch("/api/date/bucket-list/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: text.trim() }),
      });
      if (res.ok) {
        setText("");
        router.refresh();
      }
    } finally {
      setAdding(false);
    }
  }

  async function handleToggle(itemId: string) {
    if (busyId) return;
    setBusyId(itemId);
    try {
      const res = await fetch("/api/date/bucket-list/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.completed) playSfx("item-get");
        router.refresh();
      }
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(itemId: string) {
    if (busyId) return;
    setBusyId(itemId);
    try {
      const res = await fetch("/api/date/bucket-list/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId }),
      });
      if (res.ok) router.refresh();
    } finally {
      setBusyId(null);
    }
  }

  const todo = items.filter((i) => !i.completed);
  const done = items.filter((i) => i.completed);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={100}
          placeholder="같이 해보고 싶은 걸 적어보세요"
          className="flex-1 rounded-2xl border-2 border-[var(--color-navy)]/10 bg-white px-4 py-2.5 text-[14px] outline-none focus:border-[var(--color-tab-active)]"
          onKeyDown={(e) => {
            if (e.key === "Enter") handleAdd();
          }}
        />
        <Button tone="mint" onClick={handleAdd} disabled={adding || !text.trim()} className="!px-4 !py-2 text-[13px]">
          추가
        </Button>
      </div>

      {items.length === 0 ? (
        <Card tone="cream" className="py-8 text-center text-[14px] text-[var(--color-navy-soft)]">
          아직 등록된 목표가 없어요.
        </Card>
      ) : (
        <div className="flex flex-col gap-2">
          {todo.map((item) => (
            <BucketRow key={item.id} item={item} busy={busyId === item.id} onToggle={() => handleToggle(item.id)} onDelete={() => handleDelete(item.id)} />
          ))}
          {done.length > 0 && (
            <>
              <p className="mt-2 text-[12px] font-bold text-[var(--color-navy-soft)]">완료 {done.length}개</p>
              {done.map((item) => (
                <BucketRow key={item.id} item={item} busy={busyId === item.id} onToggle={() => handleToggle(item.id)} onDelete={() => handleDelete(item.id)} />
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}

function BucketRow({
  item,
  busy,
  onToggle,
  onDelete,
}: {
  item: DateBucketListItem;
  busy: boolean;
  onToggle: () => void;
  onDelete: () => void;
}) {
  return (
    <Card tone={item.completed ? "surface" : "cream"} className="flex items-center gap-3 !p-3">
      <button
        onClick={onToggle}
        disabled={busy}
        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 text-[13px] font-extrabold ${
          item.completed ? "border-[var(--color-mint-deep)] bg-[var(--color-mint-deep)] text-white" : "border-[var(--color-navy)]/20 text-transparent"
        }`}
      >
        ✓
      </button>
      <p className={`flex-1 text-[14px] ${item.completed ? "text-[var(--color-navy-soft)] line-through" : "font-bold text-[var(--color-navy)]"}`}>
        {item.text}
      </p>
      <button onClick={onDelete} disabled={busy} className="px-1 text-[13px] font-bold text-[var(--color-navy-soft)]">
        ✕
      </button>
    </Card>
  );
}
