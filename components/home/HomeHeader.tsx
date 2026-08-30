import Link from "next/link";
import Image from "next/image";
import { CURRENCY_NAME } from "@/lib/domain/constants";
import { GameIcon } from "@/components/icons/GameIcon";

// GitHub에 새로 올라온 "홈화면 UI (1~24).png" 세트(design-assets/, public/images/home-ui/에
// 영문 파일명으로 정리)를 이번 라운드의 기준 에셋으로 쓴다. 로고는 기존
// misc/logo-wordmark.png(좌측에 등대가 박혀 있던 버전) 대신 새로 받은 logo-glow.png로
// 교체 — 등대가 안 그려져 있어서 헤더에 별도 등대(home-ui/lighthouse.png)를 같이 놓아도
// 중복되지 않는다. 하늘바다 배경은 지난 라운드에 만든 sky-sea-texture.png(낚시터 배경에서
// 크롭)를 그대로 쓴다 — 이번 24장 세트에는 하늘/바다 통짜 배경이 없어서다.
export function HomeHeader({ balance }: { balance: number }) {
  return (
    <header
      className="relative overflow-hidden px-4 pb-8 pt-5"
      style={{ backgroundImage: "url(/images/home/sky-sea-texture.png)", backgroundSize: "100% 100%", backgroundRepeat: "no-repeat" }}
    >
      <Image
        src="/images/home/cloud-1.png"
        alt=""
        aria-hidden
        width={559}
        height={310}
        unoptimized
        className="pointer-events-none absolute left-[2%] top-[3%] w-16 opacity-95"
        style={{ height: "auto" }}
      />
      <Image
        src="/images/home-ui/cloud.png"
        alt=""
        aria-hidden
        width={1254}
        height={1254}
        unoptimized
        className="pointer-events-none absolute right-[4%] top-0 w-16 opacity-90"
        style={{ height: "auto" }}
      />
      <Image
        src="/images/home/cloud-3.png"
        alt=""
        aria-hidden
        width={381}
        height={241}
        unoptimized
        className="pointer-events-none absolute right-[32%] top-[7%] w-10 opacity-80"
        style={{ height: "auto" }}
      />
      <Image
        src="/images/home-ui/seagull-flying.png"
        alt=""
        aria-hidden
        width={1254}
        height={1254}
        unoptimized
        className="pointer-events-none absolute left-[26%] top-[1%] w-10 opacity-90"
        style={{ height: "auto" }}
      />
      <Image
        src="/images/home/seagull-fly-2.png"
        alt=""
        aria-hidden
        width={860}
        height={469}
        unoptimized
        className="pointer-events-none absolute left-[54%] top-[4%] w-8 opacity-85"
        style={{ height: "auto" }}
      />

      {/* 로고: 좌우로 헤더 패딩을 넘어 거의 화면 끝까지 번지게(-mx-4) 해서 크게 확대해도
          390px 폭 화면에서 잘리지 않는다. logo-glow.png는 은은한 후광이 이미 알파로
          페이드아웃되게 그려져 있어(가장자리 alpha=0 확인됨) 배경과 자연스럽게 섞인다. */}
      <div className="relative z-10 -mx-4 flex justify-center pt-1">
        <Image
          src="/images/home-ui/logo-glow.png"
          alt="해기사와 연인들의 항해일지"
          width={1536}
          height={1024}
          unoptimized
          priority
          className="w-[86%] max-w-[380px]"
          style={{ height: "auto" }}
        />
      </div>

      {/* 등대·배 — logo-glow.png에는 등대가 없어서(기존 logo-wordmark.png와 달리) 중복 없이
          하나의 하늘바다 장면 하단 모서리에 배치할 수 있다. */}
      <Image
        src="/images/home-ui/lighthouse.png"
        alt=""
        aria-hidden
        width={1254}
        height={1254}
        unoptimized
        className="pointer-events-none absolute bottom-1 left-[4%] w-14"
        style={{ height: "auto" }}
      />
      <Image
        src="/images/home-ui/ship.png"
        alt=""
        aria-hidden
        width={1254}
        height={1254}
        unoptimized
        className="pointer-events-none absolute bottom-2 right-[6%] w-20"
        style={{ height: "auto" }}
      />

      {/* 선용금 정보판 — 우측 상단 그림형 카드. "+" 배지는 새 home-ui/plus-button.png로 교체. */}
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
          <span className="absolute -bottom-2.5 -right-2.5 h-6 w-6">
            <Image src="/images/home-ui/plus-button.png" alt="" aria-hidden width={1254} height={1254} unoptimized className="h-full w-full" />
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
