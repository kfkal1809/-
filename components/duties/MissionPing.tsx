"use client";

import { useEffect, useRef } from "react";

// Next.js Link prefetch는 서버 컴포넌트 렌더만 미리 수행하고 클라이언트 컴포넌트는 마운트하지
// 않으므로, 이 컴포넌트가 실제로 마운트(useEffect 실행)됐다는 것 자체가 진짜 방문이 일어났다는
// 신호가 된다 — 그래서 서버 컴포넌트 렌더 본문이 아니라 여기서만 미션 진행도를 올린다.
export function MissionPing({
  space,
  cabinHouseholdId,
}: {
  space: "bonppuri" | "liri" | "deck" | "cabin";
  cabinHouseholdId?: string;
}) {
  const firedRef = useRef(false);

  useEffect(() => {
    if (firedRef.current) return;
    firedRef.current = true;
    fetch("/api/duties/ping", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ space, cabinHouseholdId }),
    }).catch(() => {});
  }, [space, cabinHouseholdId]);

  return null;
}
