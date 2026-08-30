"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { CharacterSprite } from "@/components/character/CharacterSprite";
import { GameIcon } from "@/components/icons/GameIcon";
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
      // 서버 호출이 없는 데모 모드에서도 인위적인 대기(400ms)를 넣어뒀던 것 — 실제로 기다릴
      // 이유가 없으므로 즉시 반영한다.
      setAttended(true);
      setToast("선용금 지급 완료 +$1");
      setLoading(false);
      playSfx("attendance");
      setTimeout(() => playSfx("coin"), 180);
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
      {/* 리본 배너 — 새로 받은 home-ui/ribbon-banner.png(양끝에 배의 타 장식이 그려진 실제
          그림 리본)를 배경으로 쓰고, 그 위에 "나의 항해 정보" 텍스트만 얹는다. 이미지 자체엔
          글자가 없어서(디자이너가 텍스트 없는 프레임으로 그려둠) 실제 라벨을 자유롭게 겹칠
          수 있다. */}
      <div className="absolute left-1/2 top-0 z-10 w-[78%] max-w-[300px] -translate-x-1/2">
        <Image
          src="/images/home-ui/ribbon-banner.png"
          alt=""
          aria-hidden
          width={2172}
          height={724}
          unoptimized
          className="pointer-events-none w-full"
          style={{ height: "auto" }}
        />
        <span className="absolute inset-0 flex items-center justify-center pb-1 text-[16px] font-extrabold tracking-wide text-white [text-shadow:0_1px_3px_rgba(15,33,66,0.35)]">
          나의 항해 정보
        </span>
      </div>

      <div className="relative overflow-hidden rounded-[28px] border-2 border-white bg-gradient-to-b from-[#bfe6ff] to-[#eaf6ff] pb-5 pt-9 shadow-[0_6px_20px_rgba(36,54,90,0.10)]">
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
        {/* 출항하기 버튼 — 미출항 상태는 새 home-ui/departure-button.png(원형 그림판에
            "출항하기 +$1" 글자가 이미 그려져 있음)를 그대로 버튼으로 쓴다. 완료 상태는 그림에
            박힌 문구를 "완료"로 바꿀 수 없어서(글자가 그림 일부라 동적으로 못 바꿈) 기존
            점선 원 + "출항 완료" 텍스트로 계속 표시한다. */}
        {attended ? (
          <button
            onClick={handleBoard}
            disabled
            className="absolute right-2 top-3 z-20 flex h-[68px] w-[68px] flex-col items-center justify-center gap-0.5 rounded-full border-2 border-dashed border-[var(--color-tab-active)] bg-white/90 text-center shadow-[0_4px_12px_rgba(36,54,90,0.14)] disabled:opacity-70"
          >
            <GameIcon name="anchor" size={20} />
            <span className="text-[12px] font-extrabold leading-tight text-[var(--color-navy)]">
              출항
              <br />
              완료
            </span>
          </button>
        ) : (
          <button onClick={handleBoard} disabled={loading} className="absolute right-2 top-3 z-20 h-[68px] w-[68px] disabled:opacity-70">
            <Image
              src="/images/home-ui/departure-button.png"
              alt="출항하기 +$1"
              width={1254}
              height={1254}
              unoptimized
              className="h-full w-full drop-shadow-[0_4px_10px_rgba(36,54,90,0.2)]"
            />
          </button>
        )}

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
            src="/images/home-ui/lifebuoy.png"
            alt=""
            aria-hidden
            width={1254}
            height={1254}
            unoptimized
            className="pointer-events-none absolute bottom-4 left-3 w-[54px]"
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

          <div className="relative z-10 mx-auto mt-1 flex items-end justify-center gap-2">
            <div className="flex flex-col items-center">
              <CharacterSprite appearance={voyage.haenyeoAppearance} kind="haenyeo" size={158} />
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
              className="pointer-events-none mb-11 w-6"
              style={{ height: "auto" }}
            />
            <div className="flex flex-col items-center">
              <CharacterSprite appearance={voyage.haenamAppearance} kind="haenam" size={158} />
              <p className="mt-1.5 whitespace-nowrap rounded-full bg-white/90 px-3 py-1 text-[13px] font-bold text-[var(--color-navy)]">
                해남 {voyage.haenamName}
              </p>
            </div>
          </div>
        </Link>

        {/* 시안은 승선/하선을 흰색 단색 한 판이 아니라 좌(코랄톤)/우(블루톤) 두 판으로
            색을 나눠 붙여둔다 — rounded-2xl에 overflow-hidden을 주고 내부를 반반 나눠
            각자 옅은 배경색을 칠하는 방식으로 재현(이미지 마스크가 아니라 색 배경이라
            "그림을 강제로 자르지 말 것" 제약과는 무관). */}
        <div className="relative mx-4 mt-5 flex items-stretch justify-between gap-0 overflow-hidden rounded-2xl shadow-[0_2px_8px_rgba(36,54,90,0.08)]">
          <div className="flex flex-1 flex-col items-center gap-0.5 bg-[#ffe3e6] py-3 text-center">
            <span className="flex items-center gap-1 text-[12px] font-bold text-[var(--color-navy-soft)]">
              <Image src="/images/home/deco-heart.png" alt="" aria-hidden width={623} height={490} unoptimized className="w-3" style={{ height: "auto" }} />
              승선
            </span>
            <p className="text-[19px] font-extrabold text-[var(--color-coral)]">
              {voyage.boardedDays !== null ? `D+${voyage.boardedDays}` : "정보 없음"}
            </p>
          </div>
          <div className="flex flex-1 flex-col items-center gap-0.5 bg-[#e3f0ff] py-3 text-center">
            <span className="flex items-center gap-1 text-[12px] font-bold text-[var(--color-navy-soft)]">
              <Image src="/images/home-ui/anchor.png" alt="" aria-hidden width={1254} height={1254} unoptimized className="w-3.5" style={{ height: "auto" }} />
              하선
            </span>
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
