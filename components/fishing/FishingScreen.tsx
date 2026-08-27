"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { RARITY_LABEL } from "@/lib/domain/types";
import { itemIconSrc } from "@/lib/domain/itemIcons";
import { playSfx } from "@/lib/audio/audioManager";
import type { FishingData } from "@/lib/game/fishingData";
import type { DeckSelf } from "@/lib/game/deckData";
import { FishingCatchGame } from "@/components/fishing/FishingCatchGame";
import { CharacterSprite } from "@/components/character/CharacterSprite";

interface CatchToast {
  key: number;
  name: string;
  rarity: string;
}

interface PendingGame {
  index: number;
  name: string;
}

function formatRemaining(ms: number): string {
  if (ms <= 0) return "0:00:00";
  const totalSeconds = Math.floor(ms / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function FishingScreen({ data, self }: { data: FishingData; self: DeckSelf }) {
  const router = useRouter();
  const [now, setNow] = useState(() => Date.now());
  const [starting, setStarting] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [result, setResult] = useState<{ sku: string | null; name: string; rarity: string; quantity: number }[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [toasts, setToasts] = useState<CatchToast[]>([]);
  const [activeGame, setActiveGame] = useState<PendingGame | null>(null);
  const activeGameRef = useRef<PendingGame | null>(null);
  const shownRef = useRef<Set<number> | null>(null);
  const gameQueueRef = useRef<PendingGame[]>([]);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  // 세션이 새로 시작되거나 끝나면 "이미 지나간 항목" 기준을 다시 잡는다 — 화면에 들어온
  // 시점 이전에 이미 잡힌 항목은 알림을 띄우지 않고, 그 이후로 새로 도달하는 항목만 알린다.
  useEffect(() => {
    if (!data.session) {
      shownRef.current = null;
      gameQueueRef.current = [];
      activeGameRef.current = null;
      // 세션 종료로 화면에 남아있던 토스트/미니게임을 정리하는 것이라 캐스케이딩 렌더 우려가 없다.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setToasts([]);
      setActiveGame(null);
      return;
    }
    const nowMs = Date.now();
    const startedMs = new Date(data.session.startedAt).getTime();
    const already = new Set<number>();
    for (const c of data.session.scheduledLoot) {
      if (startedMs + c.offsetMinutes * 60000 <= nowMs) already.add(c.index);
    }
    shownRef.current = already;
    gameQueueRef.current = [];
    activeGameRef.current = null;
    setToasts([]);
    setActiveGame(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.session?.id]);

  // 1초마다 도는 타이머(now)를 기준으로 새로 도달한 항목이 있으면 알림 토스트를 띄우고
  // 실시간 탭 미니게임 대기열에 넣는다 — 여러 개가 동시에 도달해도 미니게임은 한 번에
  // 하나씩만 순서대로 보여준다.
  useEffect(() => {
    if (!data.session || !shownRef.current) return;
    const session = data.session;
    const startedMs = new Date(session.startedAt).getTime();
    let addedAny = false;
    for (const c of session.scheduledLoot) {
      if (shownRef.current.has(c.index)) continue;
      if (startedMs + c.offsetMinutes * 60000 > now) continue;
      shownRef.current.add(c.index);
      addedAny = true;
      const toastKey = c.index;
      // 1초 타이머(now)라는 외부 시계에 동기화하는 것이라 폴링성 setState이며, 매 렌더가 아니라
      // 새로 도달한 항목이 있을 때만 실행된다.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setToasts((prev) => [...prev, { key: toastKey, name: c.name, rarity: c.rarity }]);
      setTimeout(() => setToasts((prev) => prev.filter((t) => t.key !== toastKey)), 4000);
      gameQueueRef.current.push({ index: c.index, name: c.name });
    }
    if (addedAny) {
      playSfx("notification");
      if (!activeGameRef.current) {
        const next = gameQueueRef.current.shift() ?? null;
        activeGameRef.current = next;
        setActiveGame(next);
      }
    }
  }, [now, data.session]);

  function handleGameResult(success: boolean) {
    const game = activeGameRef.current;
    const next = gameQueueRef.current.shift() ?? null;
    activeGameRef.current = next;
    setActiveGame(next);
    if (!success || !game || !data.session) return;
    const sessionId = data.session.id;
    fetch("/api/fishing/tap", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, index: game.index }),
    })
      .then(() => playSfx("item-get"))
      .catch(() => {
        // 보너스 기록 실패는 조업 진행 자체에 영향을 주지 않으므로 조용히 무시한다.
      });
  }

  const remaining = data.session ? new Date(data.session.endsAt).getTime() - now : 0;
  const done = data.session ? remaining <= 0 : false;
  const caughtSoFar = data.session
    ? data.session.scheduledLoot.filter((c) => new Date(data.session!.startedAt).getTime() + c.offsetMinutes * 60000 <= now).length
    : 0;

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
      playSfx("fishing-start");
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
      playSfx("fishing-result");
      if ((body.loot as { rarity: string }[]).some((r) => r.rarity === "legendary")) {
        setTimeout(() => playSfx("fishing-legendary"), 250);
      }
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

      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[26px] border-2 border-white shadow-[0_6px_20px_rgba(36,54,90,0.10)]">
        <Image src="/images/backgrounds/fishing.jpg" alt="" fill unoptimized style={{ objectFit: "cover" }} />
        {self.ready && (
          <div className="animate-bob absolute bottom-[8%] left-[36%] -translate-x-1/2">
            <CharacterSprite
              appearance={{ ...self.appearance, handAssetKey: "hand_fishing_rod" }}
              kind={self.kind}
              childGender={self.childGender}
              childStage={self.childStage}
              size={150}
            />
          </div>
        )}
      </div>

      {result ? (
        <Card tone="cream" className="flex flex-col items-center gap-3 py-6 text-center">
          <p className="text-[16px] font-extrabold text-[var(--color-navy)]">조업 완료!</p>
          <div className="flex flex-wrap justify-center gap-2">
            {result.length === 0 ? (
              <p className="text-[13px] text-[var(--color-navy-soft)]">아무것도 낚이지 않았어요.</p>
            ) : (
              result.map((r, i) => (
                <div key={i} className="flex flex-col items-center gap-1 rounded-2xl bg-white px-3 py-2 shadow-[0_4px_14px_rgba(36,54,90,0.08)]">
                  {itemIconSrc(r.sku) && (
                    <Image src={itemIconSrc(r.sku)!} alt="" width={40} height={40} unoptimized style={{ width: 40, height: 40, objectFit: "contain" }} />
                  )}
                  <p className="text-[13px] font-bold text-[var(--color-navy)]">{r.name}</p>
                  <p className="text-[11px] text-[var(--color-navy-soft)]">
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
          <p className="text-[14px] font-bold text-[var(--color-navy-soft)]">
            {data.session.durationHours}시간 자동조업 중
          </p>
          <p className="text-3xl font-extrabold text-[var(--color-navy)]">{formatRemaining(remaining)}</p>
          {caughtSoFar > 0 && <p className="text-[12px] font-bold text-[var(--color-mint-deep)]">지금까지 {caughtSoFar}마리 낚았어요</p>}
          {done ? (
            <Button tone="coral" onClick={handleClaim} disabled={claiming}>
              {claiming ? "확인 중..." : "완료! 결과 받기"}
            </Button>
          ) : (
            <p className="text-[13px] text-[var(--color-navy-soft)]">앱을 꺼도 계속 진행돼요.</p>
          )}
        </Card>
      ) : (
        <Card tone="cream" className="flex flex-col items-center gap-4 py-8 text-center">
          <p className="text-[14px] font-bold text-[var(--color-navy-soft)]">현재 조업 중이 아닙니다.</p>
          <div className="flex w-full gap-2">
            <Button tone="mint" full onClick={() => handleStart(4)} disabled={starting || !data.ready}>
              4시간 조업
            </Button>
            <Button tone="mint" full onClick={() => handleStart(8)} disabled={starting || !data.ready}>
              8시간 조업
            </Button>
          </div>
          {!data.ready && <p className="text-[12px] text-[var(--color-navy-soft)]">로그인 후 낚시를 시작할 수 있어요.</p>}
        </Card>
      )}

      {error && <p className="text-center text-[13px] font-bold text-[var(--color-danger)]">{error}</p>}

      <div className="pointer-events-none fixed inset-x-0 top-4 z-40 flex flex-col items-center gap-2 px-4">
        {toasts.map((t) => (
          <div
            key={t.key}
            className="rounded-full bg-[var(--color-navy)] px-4 py-2 text-[12px] font-bold text-white shadow-[0_4px_14px_rgba(36,54,90,0.25)]"
          >
            🎣 {t.name} 낚음! ({RARITY_LABEL[t.rarity as keyof typeof RARITY_LABEL] ?? t.rarity})
          </div>
        ))}
      </div>

      {activeGame && <FishingCatchGame key={activeGame.index} label={activeGame.name} onResult={handleGameResult} />}
    </div>
  );
}
