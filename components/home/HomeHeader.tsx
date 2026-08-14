import Link from "next/link";
import { APP_SHORT_NAME } from "@/lib/domain/constants";
import { GameIcon } from "@/components/icons/GameIcon";

export function HomeHeader({ balance }: { balance: number }) {
  return (
    <header className="flex items-center justify-between px-4 pb-2 pt-5">
      <div>
        <p className="text-[11px] font-bold text-[var(--color-navy-soft)]">{APP_SHORT_NAME}</p>
        <p className="text-[17px] font-extrabold text-[var(--color-navy)]">해연결호</p>
      </div>

      <div className="flex items-center gap-2">
        <Link
          href="/wallet"
          className="flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 shadow-[0_4px_14px_rgba(36,54,90,0.08)]"
        >
          <GameIcon name="coin" size={22} />
          <span className="text-[14px] font-extrabold text-[var(--color-navy)]">${balance.toFixed(2)}</span>
        </Link>
        <Link href="/notifications" className="rounded-full bg-white p-1.5 shadow-[0_4px_14px_rgba(36,54,90,0.08)]">
          <GameIcon name="bell" size={26} withBadge={false} />
        </Link>
      </div>
    </header>
  );
}
