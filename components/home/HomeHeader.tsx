import Link from "next/link";
import Image from "next/image";
import { APP_NAME, CURRENCY_NAME } from "@/lib/domain/constants";
import { GameIcon } from "@/components/icons/GameIcon";

export function HomeHeader({ balance }: { balance: number }) {
  return (
    <header className="relative overflow-hidden rounded-b-[28px] bg-gradient-to-b from-[#bfe6ff] via-[#e3f4ff] to-transparent px-4 pb-6 pt-4">
      <svg className="absolute left-[8%] top-[10%] opacity-70" width="26" height="14" viewBox="0 0 34 18" aria-hidden>
        <path d="M2 12 Q9 2 17 10 Q25 2 32 12" stroke="#24365a" strokeWidth="2.4" fill="none" strokeLinecap="round" />
      </svg>
      <svg className="absolute right-[38%] top-[4%] opacity-60" width="20" height="11" viewBox="0 0 34 18" aria-hidden>
        <path d="M2 12 Q9 2 17 10 Q25 2 32 12" stroke="#24365a" strokeWidth="2.4" fill="none" strokeLinecap="round" />
      </svg>
      <div className="absolute right-[6%] top-[2%] h-8 w-14 rounded-full bg-white/70 blur-[1px]" aria-hidden />

      <Image
        src="/images/home/lighthouse.png"
        alt=""
        aria-hidden
        width={168}
        height={248}
        unoptimized
        className="pointer-events-none absolute -bottom-2 -left-2 w-[76px]"
        style={{ height: "auto" }}
      />
      <Image
        src="/images/home/ship.png"
        alt=""
        aria-hidden
        width={236}
        height={145}
        unoptimized
        className="pointer-events-none absolute -bottom-1 -right-1 w-[92px]"
        style={{ height: "auto" }}
      />

      <div className="relative flex items-start justify-between gap-2">
        <Image
          src="/images/misc/logo-wordmark.png"
          alt={APP_NAME}
          width={732}
          height={346}
          unoptimized
          priority
          className="-ml-1 mt-1 w-[132px]"
          style={{ height: "auto" }}
        />

        <div className="flex flex-col items-end gap-1.5">
          <Link
            href="/wallet"
            className="flex flex-col items-center gap-0.5 rounded-2xl border border-dashed border-[var(--color-gold)] bg-[var(--color-cream)] px-3 py-1.5 shadow-[0_4px_14px_rgba(36,54,90,0.08)]"
          >
            <span className="text-[9px] font-bold text-[var(--color-navy-soft)]">{CURRENCY_NAME}</span>
            <span className="flex items-center gap-1">
              <GameIcon name="coin" size={18} />
              <span className="text-[13px] font-extrabold text-[var(--color-navy)]">${balance.toFixed(2)}</span>
            </span>
          </Link>
          <Link href="/notifications" className="rounded-full bg-white p-1.5 shadow-[0_4px_14px_rgba(36,54,90,0.08)]">
            <GameIcon name="bell" size={20} withBadge={false} />
          </Link>
        </div>
      </div>
    </header>
  );
}
