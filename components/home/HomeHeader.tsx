import Link from "next/link";
import Image from "next/image";
import { APP_NAME, CURRENCY_NAME } from "@/lib/domain/constants";
import { GameIcon } from "@/components/icons/GameIcon";

export function HomeHeader({ balance }: { balance: number }) {
  return (
    <header className="relative overflow-hidden rounded-b-[28px] bg-gradient-to-b from-[#bfe6ff] via-[#e3f4ff] to-transparent px-4 pb-6 pt-4">
      <Image
        src="/images/home/seagull-fly-1.png"
        alt=""
        aria-hidden
        width={804}
        height={511}
        unoptimized
        className="pointer-events-none absolute left-[10%] top-[8%] w-9 opacity-90"
        style={{ height: "auto" }}
      />
      <Image
        src="/images/home/seagull-fly-2.png"
        alt=""
        aria-hidden
        width={860}
        height={469}
        unoptimized
        className="pointer-events-none absolute right-[36%] top-[2%] w-7 opacity-80"
        style={{ height: "auto" }}
      />
      <Image
        src="/images/home/cloud-2.png"
        alt=""
        aria-hidden
        width={381}
        height={241}
        unoptimized
        className="pointer-events-none absolute right-[4%] top-0 w-16"
        style={{ height: "auto" }}
      />
      <Image
        src="/images/home/cloud-1.png"
        alt=""
        aria-hidden
        width={559}
        height={310}
        unoptimized
        className="pointer-events-none absolute left-[2%] top-[26%] w-14 opacity-90"
        style={{ height: "auto" }}
      />
      <Image
        src="/images/home/deco-sparkle-small.png"
        alt=""
        aria-hidden
        width={370}
        height={326}
        unoptimized
        className="pointer-events-none absolute left-[46%] top-[6%] w-4"
        style={{ height: "auto" }}
      />
      <Image
        src="/images/home/deco-dot-blue.png"
        alt=""
        aria-hidden
        width={244}
        height={238}
        unoptimized
        className="pointer-events-none absolute left-[8%] top-[42%] w-2.5"
        style={{ height: "auto" }}
      />
      <Image
        src="/images/home/deco-dot-blue.png"
        alt=""
        aria-hidden
        width={244}
        height={238}
        unoptimized
        className="pointer-events-none absolute left-[52%] top-[16%] w-2"
        style={{ height: "auto" }}
      />

      <Image
        src="/images/home/lighthouse.png"
        alt=""
        aria-hidden
        width={1021}
        height={1368}
        unoptimized
        className="pointer-events-none absolute -bottom-2 -left-2 w-[70px]"
        style={{ height: "auto" }}
      />
      <Image
        src="/images/home/ship.png"
        alt=""
        aria-hidden
        width={1404}
        height={1047}
        unoptimized
        className="pointer-events-none absolute -bottom-1 -right-1 w-[100px]"
        style={{ height: "auto" }}
      />

      <div className="relative flex flex-col items-center pt-1">
        <div className="absolute right-0 top-0 z-10 flex flex-col items-end gap-1.5">
          <Link
            href="/wallet"
            className="flex flex-col items-center gap-0.5 rounded-2xl border border-dashed border-[var(--color-gold)] bg-[var(--color-cream)] px-3 py-1.5 shadow-[0_4px_14px_rgba(36,54,90,0.08)]"
          >
            <span className="text-[10px] font-bold text-[var(--color-navy-soft)]">{CURRENCY_NAME}</span>
            <span className="flex items-center gap-1">
              <GameIcon name="coin" size={18} />
              <span className="text-[14px] font-extrabold text-[var(--color-navy)]">${balance.toFixed(2)}</span>
            </span>
          </Link>
          <Link href="/notifications" className="rounded-full bg-white p-1.5 shadow-[0_4px_14px_rgba(36,54,90,0.08)]">
            <GameIcon name="bell" size={20} withBadge={false} />
          </Link>
        </div>

        <Image
          src="/images/misc/logo-wordmark.png"
          alt={APP_NAME}
          width={732}
          height={346}
          unoptimized
          priority
          className="w-[190px]"
          style={{ height: "auto" }}
        />
      </div>
    </header>
  );
}
