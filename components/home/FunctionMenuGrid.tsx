"use client";

import Link from "next/link";
import { HOME_MENU } from "@/lib/domain/constants";
import { GameIcon } from "@/components/icons/GameIcon";
import { playSfx } from "@/lib/audio/audioManager";

export function FunctionMenuGrid() {
  return (
    <div className="grid grid-cols-3 gap-y-3">
      {HOME_MENU.map((item) => (
        <Link key={item.key} href={item.href} onClick={() => playSfx("ui-click")} className="flex flex-col items-center gap-1">
          <GameIcon name={item.icon as never} size={44} />
          <span className="whitespace-nowrap text-center text-[12px] font-bold leading-tight text-[var(--color-navy)]">
            {item.label}
          </span>
        </Link>
      ))}
    </div>
  );
}
