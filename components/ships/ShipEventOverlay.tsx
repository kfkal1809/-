"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ShipSprite } from "@/components/ships/ShipSprite";
import { SHIP_TYPES } from "@/lib/domain/shipEvents";

interface ShipEventPayload {
  id: string;
  shipTypeKey: string;
  shipTypeName: string;
  themeLabel: string;
  hullColor: string;
  deckColor: string;
  accentColor: string;
  spawnedAt: string;
  expiresAt: string;
  status: string;
  rewardCash: number;
  rewardItem: { name: string; rarity: string; quantity: number } | null;
}

type Phase = "idle" | "crossing" | "banner" | "crate" | "sheet" | "claimed";

const POLL_MS = 45000;
const SEEN_KEY = "haeyeongyeol_ship_event_seen_id";

// NODE_ENV는 서버/클라이언트 번들 양쪽에서 빌드 시점에 동일한 문자열로 치환되므로,
// 상태(state)로 두지 않고 순수 값으로만 써야 하이드레이션 불일치가 생기지 않는다.
const SHOW_DEBUG_TRIGGER = process.env.NODE_ENV !== "production";

export function ShipEventOverlay() {
  const [event, setEvent] = useState<ShipEventPayload | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [claiming, setClaiming] = useState(false);
  const seenIdRef = useRef<string | null>(
    typeof window !== "undefined" ? window.localStorage.getItem(SEEN_KEY) : null
  );

  const applyEvent = useCallback((next: ShipEventPayload | null) => {
    if (!next) {
      setEvent(null);
      setPhase((p) => (p === "sheet" ? p : "idle"));
      return;
    }
    setEvent(next);
    if (next.status !== "active") {
      setPhase("idle");
      return;
    }
    if (seenIdRef.current === next.id) {
      setPhase((p) => (p === "sheet" || p === "claimed" ? p : "crate"));
      return;
    }
    seenIdRef.current = next.id;
    if (typeof window !== "undefined") window.localStorage.setItem(SEEN_KEY, next.id);
    setPhase("crossing");
  }, []);

  useEffect(() => {
    const poll = () => {
      fetch("/api/ship-events/status")
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => data && applyEvent(data.active ?? null))
        .catch(() => {
          // 조용히 무시 — 다음 폴링에서 재시도
        });
    };
    const interval = setInterval(poll, POLL_MS);
    poll();
    return () => clearInterval(interval);
  }, [applyEvent]);

  async function handleClaim() {
    if (!event || claiming) return;
    setClaiming(true);
    try {
      const res = await fetch("/api/ship-events/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId: event.id }),
      });
      if (res.ok) {
        setPhase("claimed");
        setTimeout(() => {
          setPhase("idle");
          setEvent(null);
        }, 1600);
      }
    } catch {
      // no-op
    } finally {
      setClaiming(false);
    }
  }

  async function handleDebugSpawn() {
    try {
      const res = await fetch("/api/ship-events/debug-spawn", { method: "POST" });
      if (!res.ok) return;
      const data = await res.json();
      applyEvent(data.active ?? null);
    } catch {
      // no-op
    }
  }

  const ship = event ? SHIP_TYPES.find((s) => s.key === event.shipTypeKey) : null;

  return (
    <>
      {phase === "crossing" && event && ship && (
        <div className="pointer-events-none absolute inset-x-0 top-14 z-40 h-16 overflow-hidden">
          <div
            className="animate-ship-cross absolute top-0"
            style={{ left: "-140px" }}
            onAnimationEnd={() => setPhase("banner")}
          >
            <ShipSprite ship={ship} width={110} />
          </div>
        </div>
      )}

      {phase === "banner" && event && ship && (
        <div className="pointer-events-none absolute inset-x-0 top-4 z-40 flex justify-center px-6">
          <div
            className="animate-banner-drop flex items-center gap-2.5 rounded-full border-2 border-white bg-white px-4 py-2 shadow-[0_8px_20px_rgba(36,54,90,0.18)]"
            onAnimationEnd={() => setPhase("crate")}
          >
            <ShipSprite ship={ship} width={34} />
            <div>
              <p className="text-[12px] font-extrabold text-[var(--color-navy)]">{event.shipTypeName}</p>
              <p className="text-[10px] text-[var(--color-navy-soft)]">{event.themeLabel}</p>
            </div>
          </div>
        </div>
      )}

      {(phase === "crate" || phase === "claimed") && event && ship && (
        <button
          onClick={() => setPhase("sheet")}
          className="animate-bob absolute bottom-24 right-4 z-40 flex flex-col items-center gap-0.5 rounded-2xl border-2 border-white bg-white/95 px-2.5 py-2 shadow-[0_8px_20px_rgba(36,54,90,0.2)]"
        >
          <CrateIcon color={ship.accentColor} />
          <span className="text-[9px] font-extrabold leading-tight text-[var(--color-navy)]">{event.shipTypeName}</span>
        </button>
      )}

      {phase === "sheet" && event && ship && (
        <div className="absolute inset-0 z-50 flex items-end justify-center bg-black/30 px-4 pb-10">
          <div className="w-full max-w-[360px] rounded-[26px] border-2 border-white bg-[var(--color-cream)] p-5 text-center shadow-[0_-8px_28px_rgba(36,54,90,0.22)]">
            <div className="flex justify-center">
              <ShipSprite ship={ship} width={100} />
            </div>
            <p className="mt-2 text-[15px] font-extrabold text-[var(--color-navy)]">{event.shipTypeName}이 선물을 두고 갔어요</p>
            <p className="mt-1 text-[12px] text-[var(--color-navy-soft)]">{event.themeLabel}</p>

            <div className="mt-4 flex items-center justify-center gap-3 rounded-2xl bg-white/80 py-3">
              <div className="text-center">
                <p className="text-[10px] font-bold text-[var(--color-navy-soft)]">선용금</p>
                <p className="text-[16px] font-extrabold text-[var(--color-coral)]">+${event.rewardCash.toFixed(2)}</p>
              </div>
              {event.rewardItem && (
                <>
                  <div className="h-8 w-px bg-[var(--color-navy)]/10" />
                  <div className="text-center">
                    <p className="text-[10px] font-bold text-[var(--color-navy-soft)]">보너스 아이템</p>
                    <p className="text-[13px] font-extrabold text-[var(--color-navy)]">{event.rewardItem.name}</p>
                  </div>
                </>
              )}
            </div>

            <div className="mt-4 flex gap-2">
              <button
                onClick={() => setPhase("crate")}
                className="flex-1 rounded-full bg-white px-4 py-3 text-[13px] font-bold text-[var(--color-navy-soft)]"
              >
                나중에
              </button>
              <button
                onClick={handleClaim}
                disabled={claiming}
                className="flex-1 rounded-full bg-[var(--color-coral)] px-4 py-3 text-[13px] font-extrabold text-white disabled:opacity-60"
              >
                {claiming ? "받는 중..." : "선물 받기"}
              </button>
            </div>
          </div>
        </div>
      )}

      {phase === "claimed" && (
        <div className="pointer-events-none absolute inset-x-0 top-1/3 z-50 flex justify-center px-6">
          <div className="animate-sparkle rounded-full border-2 border-white bg-white px-5 py-3 text-center shadow-[0_8px_20px_rgba(36,54,90,0.2)]">
            <p className="text-[13px] font-extrabold text-[var(--color-navy)]">선물을 받았어요!</p>
          </div>
        </div>
      )}

      {SHOW_DEBUG_TRIGGER && (
        <button
          onClick={handleDebugSpawn}
          className="absolute bottom-24 left-4 z-40 rounded-full border border-dashed border-[var(--color-navy)]/30 bg-white/80 px-2.5 py-1 text-[9px] font-bold text-[var(--color-navy-soft)]"
        >
          DEV: 선박 스폰
        </button>
      )}
    </>
  );
}

function CrateIcon({ color }: { color: string }) {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" aria-hidden>
      <rect x="3" y="9" width="18" height="11" rx="1.5" fill={color} />
      <rect x="3" y="9" width="18" height="3.5" fill="#fff" opacity="0.3" />
      <path d="M3 9l9-5 9 5" fill="none" stroke={color} strokeWidth="1.6" strokeLinejoin="round" />
      <rect x="10.5" y="12.5" width="3" height="6.5" fill="#fff" opacity="0.55" />
    </svg>
  );
}
