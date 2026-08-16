"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/ui/Card";
import { GameIcon } from "@/components/icons/GameIcon";
import type { AdminHouseholdOption, AdminCatalogOption } from "@/lib/game/adminData";

export function AdminMailboxSendScreen({
  households,
  items,
}: {
  households: AdminHouseholdOption[];
  items: AdminCatalogOption[];
}) {
  const [query, setQuery] = useState("");
  const [selectedHousehold, setSelectedHousehold] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [cashReward, setCashReward] = useState("");
  const [catalogItemId, setCatalogItemId] = useState("");
  const [itemQuantity, setItemQuantity] = useState("1");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);

  const filteredHouseholds = useMemo(() => {
    const q = query.trim();
    if (!q) return households;
    return households.filter((h) => h.memberNames.some((n) => n.includes(q)));
  }, [households, query]);

  async function handleSubmit() {
    if (submitting || !selectedHousehold || !title.trim()) return;
    setSubmitting(true);
    setResult(null);
    try {
      const res = await fetch("/api/mailbox/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          householdId: selectedHousehold,
          title: title.trim(),
          message: message.trim() || undefined,
          cashReward: cashReward ? Number(cashReward) : 0,
          catalogItemId: catalogItemId || undefined,
          itemQuantity: catalogItemId ? Number(itemQuantity) || 1 : 1,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "failed");
      setResult({ ok: true, message: "우편을 보냈어요." });
      setTitle("");
      setMessage("");
      setCashReward("");
      setCatalogItemId("");
      setItemQuantity("1");
    } catch {
      setResult({ ok: false, message: "전송에 실패했어요." });
    } finally {
      setSubmitting(false);
    }
  }

  const selected = households.find((h) => h.householdId === selectedHousehold);

  return (
    <div className="flex flex-col gap-4 px-4 pt-5">
      <div className="flex items-center gap-2">
        <GameIcon name="mailbox" size={40} />
        <h1 className="text-lg font-extrabold text-[var(--color-navy)]">우편함 발송 (운영자)</h1>
      </div>

      <Card className="flex flex-col gap-2 !p-4">
        <p className="text-[13px] font-extrabold text-[var(--color-navy)]">받는 가구</p>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="닉네임으로 검색"
          className="rounded-xl border border-[var(--color-line)]/20 bg-white px-3 py-2 text-[13px]"
        />
        <div className="flex max-h-40 flex-col gap-1 overflow-y-auto">
          {filteredHouseholds.length === 0 && <p className="text-[12px] text-[var(--color-navy-soft)]">검색 결과가 없어요.</p>}
          {filteredHouseholds.map((h) => (
            <button
              key={h.householdId}
              onClick={() => setSelectedHousehold(h.householdId)}
              className={`rounded-xl px-3 py-2 text-left text-[13px] font-bold ${
                selectedHousehold === h.householdId ? "bg-[var(--color-coral)] text-white" : "bg-[var(--color-sky)] text-[var(--color-navy)]"
              }`}
            >
              {h.memberNames.join(" & ") || "구성원 없음"}
            </button>
          ))}
        </div>
        {selected && <p className="text-[12px] text-[var(--color-navy-soft)]">선택됨: {selected.memberNames.join(" & ")}</p>}
      </Card>

      <Card className="flex flex-col gap-2 !p-4">
        <p className="text-[13px] font-extrabold text-[var(--color-navy)]">우편 내용</p>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="제목 (예: 오늘의 출석 보상)"
          className="rounded-xl border border-[var(--color-line)]/20 bg-white px-3 py-2 text-[13px]"
        />
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="본문 (선택)"
          rows={2}
          className="rounded-xl border border-[var(--color-line)]/20 bg-white px-3 py-2 text-[13px]"
        />
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-bold text-[var(--color-navy-soft)]">현금 보상 $</span>
          <input
            value={cashReward}
            onChange={(e) => setCashReward(e.target.value)}
            type="number"
            min={0}
            step="0.01"
            placeholder="0"
            className="w-24 rounded-xl border border-[var(--color-line)]/20 bg-white px-3 py-2 text-[13px]"
          />
        </div>
        <div className="flex items-center gap-2">
          <select
            value={catalogItemId}
            onChange={(e) => setCatalogItemId(e.target.value)}
            className="flex-1 rounded-xl border border-[var(--color-line)]/20 bg-white px-3 py-2 text-[13px]"
          >
            <option value="">아이템 없음</option>
            {items.map((i) => (
              <option key={i.id} value={i.id}>
                {i.name}
              </option>
            ))}
          </select>
          {catalogItemId && (
            <input
              value={itemQuantity}
              onChange={(e) => setItemQuantity(e.target.value)}
              type="number"
              min={1}
              className="w-16 rounded-xl border border-[var(--color-line)]/20 bg-white px-3 py-2 text-[13px]"
            />
          )}
        </div>
      </Card>

      <button
        onClick={handleSubmit}
        disabled={submitting || !selectedHousehold || !title.trim()}
        className="rounded-full bg-[var(--color-coral)] px-6 py-3 text-[14px] font-extrabold text-white active:scale-95 disabled:opacity-50"
      >
        {submitting ? "보내는 중..." : "우편 보내기"}
      </button>

      {result && (
        <p className={`text-center text-[13px] font-bold ${result.ok ? "text-[var(--color-mint-deep)]" : "text-[var(--color-danger)]"}`}>
          {result.message}
        </p>
      )}
    </div>
  );
}
