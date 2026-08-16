"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { CharacterSprite } from "@/components/character/CharacterSprite";
import type { HomeVoyageCard } from "@/lib/game/homeData";

export function VoyageInfoCard({
  voyage,
  initialAttended,
  isDemo,
  onBalanceChange,
}: {
  voyage: HomeVoyageCard;
  initialAttended: boolean;
  isDemo: boolean;
  onBalanceChange?: (balance: number) => void;
}) {
  const [attended, setAttended] = useState(initialAttended);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  async function handleBoard() {
    if (attended || loading) return;
    setLoading(true);
    setToast(null);

    if (isDemo) {
      setTimeout(() => {
        setAttended(true);
        setToast("선용금 지급 완료 +$1");
        setLoading(false);
      }, 400);
      return;
    }

    try {
      const res = await fetch("/api/attendance/app", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "출항 실패");
      setAttended(true);
      onBalanceChange?.(data.balance);
      setToast(data.already ? "이미 오늘 출항했어요." : "선용금 지급 완료 +$1");
    } catch {
      setToast("출항에 실패했어요.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative pt-4">
      <div className="absolute left-1/2 top-0 z-10 flex -translate-x-1/2 items-center gap-2 rounded-full bg-[var(--color-tab-active)] px-5 py-1.5 shadow-[0_4px_12px_rgba(36,54,90,0.22)]">
        <svg width="15" height="12" viewBox="0 0 26 20" aria-hidden className="text-white">
          <path
            d="M13 2 L13 16 M13 16 l-3 -3 M13 16 l3 -3 M4 6 q4 -3 5 0 M22 6 q-4 -3 -5 0"
            stroke="currentColor"
            strokeWidth="1.6"
            fill="none"
            strokeLinecap="round"
          />
        </svg>
        <span className="text-[12px] font-extrabold tracking-wide text-white">나의 항해 정보</span>
        <svg width="15" height="12" viewBox="0 0 26 20" aria-hidden className="text-white">
          <path
            d="M13 2 L13 16 M13 16 l-3 -3 M13 16 l3 -3 M4 6 q4 -3 5 0 M22 6 q-4 -3 -5 0"
            stroke="currentColor"
            strokeWidth="1.6"
            fill="none"
            strokeLinecap="round"
          />
        </svg>
      </div>

      <div className="relative overflow-hidden rounded-[26px] border-2 border-white bg-gradient-to-b from-[#bfe6ff] to-[#eaf6ff] pb-4 pt-7 shadow-[0_6px_20px_rgba(36,54,90,0.10)]">
        <button
          onClick={handleBoard}
          disabled={attended || loading}
          className="absolute right-3 top-4 z-10 flex h-16 w-16 flex-col items-center justify-center rounded-full border-2 border-dashed border-[var(--color-tab-active)] bg-white/90 text-center shadow-[0_4px_12px_rgba(36,54,90,0.14)] disabled:opacity-70"
        >
          {attended ? (
            <span className="text-[10px] font-extrabold leading-tight text-[var(--color-navy)]">
              출항
              <br />
              완료
            </span>
          ) : (
            <span className="text-[10px] font-extrabold leading-tight text-[var(--color-tab-active)]">
              출항하기
              <br />
              +$1
            </span>
          )}
        </button>

        <Link href="/voyage" className="relative block px-3">
          <Image
            src="/images/home/lifebuoy.png"
            alt=""
            aria-hidden
            width={175}
            height={135}
            unoptimized
            className="pointer-events-none absolute bottom-3 left-3 w-[50px] opacity-90"
            style={{ height: "auto" }}
          />
          <Image
            src="/images/home/seagull-post.png"
            alt=""
            aria-hidden
            width={170}
            height={225}
            unoptimized
            className="pointer-events-none absolute bottom-3 right-4 w-[44px] opacity-90"
            style={{ height: "auto" }}
          />
          <div
            className="pointer-events-none absolute inset-x-8 bottom-6 h-6 rounded-sm border-y border-white/70 bg-white/30"
            aria-hidden
          />

          <div className="relative z-10 mx-auto mt-1 flex items-end justify-center gap-2">
            <div className="flex flex-col items-center">
              <CharacterSprite appearance={voyage.haenyeoAppearance} kind="haenyeo" size={92} />
              <p className="mt-1 whitespace-nowrap rounded-full bg-white/90 px-2.5 py-0.5 text-[11px] font-bold text-[var(--color-navy)]">
                해녀 {voyage.haenyeoName}
              </p>
            </div>
            <div className="mb-7 text-[var(--color-coral)]" aria-hidden>
              <svg width="16" height="16" viewBox="0 0 24 24">
                <path
                  d="M12 20.3c-.3 0-.6-.1-.8-.3C7.6 17 3 12.9 3 8.8 3 6.1 5.1 4 7.7 4c1.7 0 3.2.9 4.1 2.3C12.7 4.9 14.2 4 15.9 4 18.5 4 20.6 6.1 20.6 8.8c0 4.1-4.6 8.2-8.2 11.2-.2.2-.5.3-.8.3z"
                  fill="currentColor"
                  opacity={0.85}
                />
              </svg>
            </div>
            <div className="flex flex-col items-center">
              <CharacterSprite appearance={voyage.haenamAppearance} kind="haenam" size={92} />
              <p className="mt-1 whitespace-nowrap rounded-full bg-white/90 px-2.5 py-0.5 text-[11px] font-bold text-[var(--color-navy)]">
                해남 {voyage.haenamName}
              </p>
            </div>
          </div>
        </Link>

        <div className="relative mx-4 mt-4 flex items-stretch justify-between gap-2 rounded-2xl bg-white/85 p-3">
          <div className="flex-1 text-center">
            <p className="text-[10px] font-bold text-[var(--color-navy-soft)]">승선</p>
            <p className="text-[15px] font-extrabold text-[var(--color-coral)]">
              {voyage.boardedDays !== null ? `D+${voyage.boardedDays}` : "정보 없음"}
            </p>
          </div>
          <div className="w-px bg-[var(--color-navy)]/10" />
          <div className="flex-1 text-center">
            <p className="text-[10px] font-bold text-[var(--color-navy-soft)]">하선</p>
            <p className="text-[15px] font-extrabold text-[var(--color-tab-active)]">
              {voyage.signoffDays !== null ? `D-${voyage.signoffDays}` : "정보 없음"}
            </p>
          </div>
        </div>

        {toast && <p className="relative mt-2 px-4 text-center text-[11px] text-[var(--color-navy-soft)]">{toast}</p>}
      </div>
    </div>
  );
}
