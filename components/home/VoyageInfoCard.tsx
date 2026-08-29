"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { CharacterSprite } from "@/components/character/CharacterSprite";
import { playSfx } from "@/lib/audio/audioManager";
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
        playSfx("attendance");
        setTimeout(() => playSfx("coin"), 180);
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
      // 서버가 실제로 오늘자 신규 출석을 확정한 경우에만(중복 출석 제외) 효과음 재생
      if (!data.already) {
        playSfx("attendance");
        setTimeout(() => playSfx("coin"), 180);
      }
    } catch {
      setToast("출항에 실패했어요.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative pt-4">
      {/* 리본 배너 — 가운데 알약 모양 본체 양옆에 접힌 리본 꼬리를 삼각형으로 덧붙여서
          단순 pill이 아니라 "리본을 매단 팻말"처럼 보이게 한다(새 이미지 에셋 없이 CSS만으로). */}
      <div className="absolute left-1/2 top-0 z-10 flex w-max -translate-x-1/2 items-center">
        <span
          aria-hidden
          className="-mr-1 h-0 w-0 border-y-[15px] border-r-[10px] border-y-transparent border-r-[#1f57c9]"
        />
        <div className="flex items-center gap-2 whitespace-nowrap rounded-full bg-[var(--color-tab-active)] px-6 py-2 shadow-[0_4px_12px_rgba(36,54,90,0.22)]">
          <svg width="17" height="14" viewBox="0 0 26 20" aria-hidden className="shrink-0 text-white">
            <path
              d="M13 2 L13 16 M13 16 l-3 -3 M13 16 l3 -3 M4 6 q4 -3 5 0 M22 6 q-4 -3 -5 0"
              stroke="currentColor"
              strokeWidth="1.6"
              fill="none"
              strokeLinecap="round"
            />
          </svg>
          <span className="text-[14px] font-extrabold tracking-wide text-white">나의 항해 정보</span>
          <svg width="17" height="14" viewBox="0 0 26 20" aria-hidden className="shrink-0 text-white">
            <path
              d="M13 2 L13 16 M13 16 l-3 -3 M13 16 l3 -3 M4 6 q4 -3 5 0 M22 6 q-4 -3 -5 0"
              stroke="currentColor"
              strokeWidth="1.6"
              fill="none"
              strokeLinecap="round"
            />
          </svg>
        </div>
        <span
          aria-hidden
          className="-ml-1 h-0 w-0 border-y-[15px] border-l-[10px] border-y-transparent border-l-[#1f57c9]"
        />
      </div>

      <div className="relative overflow-hidden rounded-[28px] border-2 border-white bg-gradient-to-b from-[#bfe6ff] to-[#eaf6ff] pb-5 pt-8 shadow-[0_6px_20px_rgba(36,54,90,0.10)]">
        {!attended && (
          <Image
            src="/images/home/deco-sparkle-big.png"
            alt=""
            aria-hidden
            width={440}
            height={490}
            unoptimized
            className="pointer-events-none absolute right-[86px] top-1 z-10 w-6 animate-pulse"
            style={{ height: "auto" }}
          />
        )}
        <button
          onClick={handleBoard}
          disabled={attended || loading}
          className="absolute right-3 top-4 z-10 flex h-[72px] w-[72px] flex-col items-center justify-center rounded-full border-2 border-dashed border-[var(--color-tab-active)] bg-white/90 text-center shadow-[0_4px_12px_rgba(36,54,90,0.14)] disabled:opacity-70"
        >
          {attended ? (
            <span className="text-[12px] font-extrabold leading-tight text-[var(--color-navy)]">
              출항
              <br />
              완료
            </span>
          ) : (
            <span className="text-[12px] font-extrabold leading-tight text-[var(--color-tab-active)]">
              출항하기
              <br />
              +$1
            </span>
          )}
        </button>

        <Link href="/voyage" className="relative block px-3">
          <Image
            src="/images/home/railing.png"
            alt=""
            aria-hidden
            width={2172}
            height={664}
            unoptimized
            className="pointer-events-none absolute inset-x-4 bottom-7 h-7 w-[calc(100%-2rem)] opacity-95"
            style={{ objectFit: "fill" }}
          />
          <Image
            src="/images/home/lifebuoy.png"
            alt=""
            aria-hidden
            width={1036}
            height={1170}
            unoptimized
            className="pointer-events-none absolute bottom-4 left-3 w-[58px]"
            style={{ height: "auto" }}
          />
          <Image
            src="/images/home/seagull-post.png"
            alt=""
            aria-hidden
            width={997}
            height={1395}
            unoptimized
            className="pointer-events-none absolute bottom-4 right-4 w-[48px]"
            style={{ height: "auto" }}
          />

          <div className="relative z-10 mx-auto mt-1 flex items-end justify-center gap-3">
            <div className="flex flex-col items-center">
              <CharacterSprite appearance={voyage.haenyeoAppearance} kind="haenyeo" size={132} />
              <p className="mt-1.5 whitespace-nowrap rounded-full bg-white/90 px-3 py-1 text-[13px] font-bold text-[var(--color-navy)]">
                해녀 {voyage.haenyeoName}
              </p>
            </div>
            <Image
              src="/images/home/deco-heart.png"
              alt=""
              aria-hidden
              width={623}
              height={490}
              unoptimized
              className="pointer-events-none mb-9 w-5"
              style={{ height: "auto" }}
            />
            <div className="flex flex-col items-center">
              <CharacterSprite appearance={voyage.haenamAppearance} kind="haenam" size={132} />
              <p className="mt-1.5 whitespace-nowrap rounded-full bg-white/90 px-3 py-1 text-[13px] font-bold text-[var(--color-navy)]">
                해남 {voyage.haenamName}
              </p>
            </div>
          </div>
        </Link>

        <div className="relative mx-4 mt-5 flex items-stretch justify-between gap-2 rounded-2xl bg-white/85 p-4">
          <div className="flex-1 text-center">
            <p className="text-[12px] font-bold text-[var(--color-navy-soft)]">승선</p>
            <p className="text-[19px] font-extrabold text-[var(--color-coral)]">
              {voyage.boardedDays !== null ? `D+${voyage.boardedDays}` : "정보 없음"}
            </p>
          </div>
          <div className="w-px bg-[var(--color-navy)]/10" />
          <div className="flex-1 text-center">
            <p className="text-[12px] font-bold text-[var(--color-navy-soft)]">하선</p>
            <p className="text-[19px] font-extrabold text-[var(--color-tab-active)]">
              {voyage.signoffDays !== null ? `D-${voyage.signoffDays}` : "정보 없음"}
            </p>
          </div>
        </div>

        {toast && <p className="relative mt-2 px-4 text-center text-[12px] text-[var(--color-navy-soft)]">{toast}</p>}
      </div>
    </div>
  );
}
