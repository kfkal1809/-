import Link from "next/link";
import { HOME_MENU } from "@/lib/domain/constants";
import { GameIcon } from "@/components/icons/GameIcon";

export function FunctionMenuGrid() {
  return (
    <div className="grid grid-cols-3 gap-x-1 gap-y-4">
      {HOME_MENU.map((item) => (
        <Link key={item.key} href={item.href} className="flex flex-col items-center gap-1.5">
          <GameIcon name={item.icon as never} size={48} />
          <span className="text-center text-[11px] font-bold leading-tight text-[var(--color-navy)]">
            {item.label}
          </span>
        </Link>
      ))}
    </div>
  );
}
