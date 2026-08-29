"use client";

import Link from "next/link";
import { HOME_MENU } from "@/lib/domain/constants";
import { GameIcon } from "@/components/icons/GameIcon";
import { playSfx } from "@/lib/audio/audioManager";

// 목표 시안은 9개 장소를 한 줄로 촘촘하게 배치하는데, 좁은 모바일 폭에서 그대로 한 줄로
// 넣으면 아이콘이 너무 작아진다 — 5개+4개 두 줄로 나눠 grid-cols-3(카드 3개씩 듬성듬성)보다
// 훨씬 촘촘한 밀도를 유지하면서도 아이콘 크기는 충분히 크게 유지한다.
export function FunctionMenuGrid() {
  const firstRow = HOME_MENU.slice(0, 5);
  const secondRow = HOME_MENU.slice(5);

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-5 gap-x-1">
        {firstRow.map((item) => (
          <MenuItem key={item.key} item={item} />
        ))}
      </div>
      <div className="grid grid-cols-5 gap-x-1">
        {secondRow.map((item) => (
          <MenuItem key={item.key} item={item} />
        ))}
      </div>
    </div>
  );
}

function MenuItem({ item }: { item: (typeof HOME_MENU)[number] }) {
  return (
    <Link href={item.href} onClick={() => playSfx("ui-click")} className="flex flex-col items-center gap-1">
      <GameIcon name={item.icon as never} size={38} />
      <span className="whitespace-nowrap text-center text-[11px] font-bold leading-tight text-[var(--color-navy)]">
        {item.label}
      </span>
    </Link>
  );
}
