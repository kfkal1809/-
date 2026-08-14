import Link from "next/link";
import { HOME_MENU } from "@/lib/domain/constants";
import { GameIcon } from "@/components/icons/GameIcon";

export function FunctionMenuGrid() {
  return (
    <div className="scrollbar-none -mx-1 flex gap-3 overflow-x-auto px-1">
      {HOME_MENU.map((item) => (
        <Link key={item.key} href={item.href} className="flex shrink-0 flex-col items-center gap-1.5">
          <GameIcon name={item.icon as never} size={42} />
          <span className="whitespace-nowrap text-center text-[10.5px] font-bold leading-tight text-[var(--color-navy)]">
            {item.label}
          </span>
        </Link>
      ))}
    </div>
  );
}
