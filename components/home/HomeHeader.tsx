import Link from "next/link";
import Image from "next/image";
import { APP_NAME, CURRENCY_NAME } from "@/lib/domain/constants";
import { GameIcon } from "@/components/icons/GameIcon";

// 목표 시안(design-assets/게임 UI 및 메뉴 화면.png = public/images/misc/home-mockup.png)처럼
// 등대/배/구름/갈매기가 하나의 하늘+바다 장면 위에 얹혀 있고, 그 아래 "나의 항해 정보" 카드의
// 바다로 자연스럽게 이어지도록 헤더 전체를 그라디언트 하늘바다 배경 하나로 통일한다.
// 로고는 기존(190px) 대비 2배 이상(390px) 확대 — 헤더 폭에 맞춰 좌우로는 92%까지만 늘어나게
// 해서 좁은 화면에서도 잘리지 않는다.
export function HomeHeader({ balance }: { balance: number }) {
  return (
    <header className="relative overflow-hidden bg-gradient-to-b from-[#8fd2f7] via-[#bfe6ff] to-[#eaf6ff] px-4 pb-6 pt-4">
      <Image
        src="/images/home/cloud-1.png"
        alt=""
        aria-hidden
        width={559}
        height={310}
        unoptimized
        className="pointer-events-none absolute left-[3%] top-[4%] w-20 opacity-95"
        style={{ height: "auto" }}
      />
      <Image
        src="/images/home/cloud-2.png"
        alt=""
        aria-hidden
        width={381}
        height={241}
        unoptimized
        className="pointer-events-none absolute right-[8%] top-0 w-16 opacity-90"
        style={{ height: "auto" }}
      />
      <Image
        src="/images/home/cloud-3.png"
        alt=""
        aria-hidden
        width={381}
        height={241}
        unoptimized
        className="pointer-events-none absolute right-[30%] top-[10%] w-12 opacity-80"
        style={{ height: "auto" }}
      />
      <Image
        src="/images/home/seagull-fly-1.png"
        alt=""
        aria-hidden
        width={804}
        height={511}
        unoptimized
        className="pointer-events-none absolute left-[24%] top-[2%] w-9 opacity-90"
        style={{ height: "auto" }}
      />
      <Image
        src="/images/home/seagull-fly-2.png"
        alt=""
        aria-hidden
        width={860}
        height={469}
        unoptimized
        className="pointer-events-none absolute left-[52%] top-[3%] w-8 opacity-85"
        style={{ height: "auto" }}
      />
      <Image
        src="/images/home/deco-dot-blue.png"
        alt=""
        aria-hidden
        width={244}
        height={238}
        unoptimized
        className="pointer-events-none absolute left-[10%] top-[38%] w-2.5"
        style={{ height: "auto" }}
      />

      {/* 로고: 좌우로 헤더 패딩을 넘어 거의 화면 끝까지 번지게(-mx-4) 해서 2배 이상 확대해도
          390px 폭 화면에서 잘리지 않는다. */}
      <div className="relative z-10 -mx-4 flex justify-center pt-2">
        <Image
          src="/images/misc/logo-wordmark.png"
          alt={APP_NAME}
          width={732}
          height={346}
          unoptimized
          priority
          className="w-[92%] max-w-[400px]"
          style={{ height: "auto" }}
        />
      </div>

      {/* 선용금 정보판 — 시안처럼 우측 상단에 그림형 카드로. coin.png/plus.png 실제 아이콘 사용.
          알림벨은 같은 flex column에 넣어 절대좌표 추측 없이 자연스럽게 아래에 쌓이게 한다. */}
      <div className="absolute right-4 top-4 z-20 flex flex-col items-end gap-2">
        <Link
          href="/wallet"
          className="relative flex flex-col items-center gap-1 rounded-[18px] border-2 border-dashed border-[var(--color-gold)] bg-[var(--color-cream)] px-3.5 py-2 shadow-[0_6px_16px_rgba(36,54,90,0.16)]"
        >
          <span className="text-[11px] font-bold text-[var(--color-navy-soft)]">{CURRENCY_NAME}</span>
          <span className="flex items-center gap-1">
            <GameIcon name="coin" size={20} />
            <span className="text-[15px] font-extrabold text-[var(--color-navy)]">${balance.toFixed(2)}</span>
          </span>
          <span className="absolute -bottom-2.5 -right-2.5 flex h-6 w-6 items-center justify-center rounded-full bg-[var(--color-tab-active)] shadow-[0_2px_6px_rgba(36,54,90,0.3)]">
            <GameIcon name="plus" size={13} />
          </span>
        </Link>
        <Link href="/notifications" className="rounded-full bg-white p-2 shadow-[0_4px_14px_rgba(36,54,90,0.16)]">
          <GameIcon name="bell" size={22} withBadge={false} />
        </Link>
      </div>

      <Image
        src="/images/home/wave-divider.png"
        alt=""
        aria-hidden
        width={2048}
        height={282}
        unoptimized
        className="pointer-events-none absolute -bottom-3 left-0 w-full opacity-90"
      />
    </header>
  );
}
