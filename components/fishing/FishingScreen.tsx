"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { RARITY_LABEL } from "@/lib/domain/types";
import { itemIconSrc } from "@/lib/domain/itemIcons";
import type { FishingData } from "@/lib/game/fishingData";

function formatRemaining(ms: number): string {
  if (ms <= 0) return "0:00:00";
  const totalSeconds = Math.floor(ms / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function FishingScreen({ data }: { data: FishingData }) {
  const router = useRouter();
  const [now, setNow] = useState(() => Date.now());
  const [starting, setStarting] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [result, setResult] = useState<{ sku: string | null; name: string; rarity: string; quantity: number }[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const remaining = data.session ? new Date(data.session.endsAt).getTime() - now : 0;
  const done = data.session ? remaining <= 0 : false;

  async function handleStart(durationHours: 4 | 8) {
    setStarting(true);
    setError(null);
    try {
      const res = await fetch("/api/fishing/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ durationHours }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "failed");
      router.refresh();
    } catch {
      setError("낚시를 시작하지 못했어요.");
    } finally {
      setStarting(false);
    }
  }

  async function handleClaim() {
    if (!data.session) return;
    setClaiming(true);
    setError(null);
    try {
      const res = await fetch("/api/fishing/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: data.session.id }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "failed");
      setResult(body.loot);
    } catch {
      setError("결과를 받지 못했어요.");
    } finally {
      setClaiming(false);
    }
  }

  function handleAcknowledge() {
    setResult(null);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-4 px-4 pt-5">
      <h1 className="text-lg font-extrabold text-[var(--color-navy)]">낚시터</h1>

      {result ? (
        <Card tone="cream" className="flex flex-col items-center gap-3 py-6 text-center">
          <p className="text-[15px] font-extrabold text-[var(--color-navy)]">조업 완료!</p>
          <div className="flex flex-wrap justify-center gap-2">
            {result.length === 0 ? (
              <p className="text-[12px] text-[var(--color-navy-soft)]">아무것도 낚이지 않았어요.</p>
            ) : (
              result.map((r, i) => (
                <div key={i} className="flex flex-col items-center gap-1 rounded-2xl bg-white px-3 py-2 shadow-[0_4px_14px_rgba(36,54,90,0.08)]">
                  {itemIconSrc(r.sku) && (
                    <Image src={itemIconSrc(r.sku)!} alt="" width={40} height={40} unoptimized style={{ width: 40, height: 40, objectFit: "contain" }} />
                  )}
                  <p className="text-[12px] font-bold text-[var(--color-navy)]">{r.name}</p>
                  <p className="text-[10px] text-[var(--color-navy-soft)]">
                    {RARITY_LABEL[r.rarity as keyof typeof RARITY_LABEL] ?? r.rarity} · x{r.quantity}
                  </p>
                </div>
              ))
            )}
          </div>
          <Button tone="coral" onClick={handleAcknowledge}>
            가방으로 넣기
          </Button>
        </Card>
      ) : data.session ? (
        <Card tone="cream" className="flex flex-col items-center gap-3 py-8 text-center">
          <p className="text-[13px] font-bold text-[var(--color-navy-soft)]">
            {data.session.durationHours}시간 자동조업 중
          </p>
          <p className="text-3xl font-extrabold text-[var(--color-navy)]">{formatRemaining(remaining)}</p>
          {done ? (
            <Button tone="coral" onClick={handleClaim} disabled={claiming}>
              {claiming ? "확인 중..." : "완료! 결과 받기"}
            </Button>
          ) : (
            <p className="text-[12px] text-[var(--color-navy-soft)]">앱을 꺼도 계속 진행돼요.</p>
          )}
        </Card>
      ) : (
        <Card tone="cream" className="flex flex-col items-center gap-4 py-8 text-center">
          <p className="text-[13px] font-bold text-[var(--color-navy-soft)]">현재 조업 중이 아닙니다.</p>
          <div className="flex w-full gap-2">
            <Button tone="mint" full onClick={() => handleStart(4)} disabled={starting || !data.ready}>
              4시간 조업
            </Button>
            <Button tone="mint" full onClick={() => handleStart(8)} disabled={starting || !data.ready}>
              8시간 조업
            </Button>
          </div>
          {!data.ready && <p className="text-[11px] text-[var(--color-navy-soft)]">로그인 후 낚시를 시작할 수 있어요.</p>}
        </Card>
      )}

      {error && <p className="text-center text-[12px] font-bold text-[var(--color-danger)]">{error}</p>}
    </div>
  );
}
