"use client";

import Image from "next/image";
import Link from "next/link";
import { HOME_MENU } from "@/lib/domain/constants";
import { GameIcon } from "@/components/icons/GameIcon";
import { playSfx } from "@/lib/audio/audioManager";

// 9개 장소 중 6개는 GitHub에 새로 올라온 home-ui/*.png 실제 그림으로 교체(갑판 광장·
// 선내업무·가방·낚시터·선내식당·해녀해운·명예의 전당 — 7개). 본뿌리·리리양곱창은 이번
// 24장 세트에 대응하는 그림이 없어(전수 확인 완료) 기존 GameIcon(icons/flower.png,
// icons/gopchang.png — 이것도 실제 그림, placeholder 아님)을 그대로 쓴다. 이 매핑은 홈
// 화면 전용이라 다른 화면에서 쓰는 GameIcon("deck" 등)의 실제 파일은 건드리지 않는다.
const HOME_UI_ICON: Partial<Record<string, string>> = {
  deck: "/images/home-ui/ship-wheel.png",
  duties: "/images/home-ui/clipboard-checklist.png",
  inventory: "/images/home-ui/backpack-bear.png",
  fishing: "/images/home-ui/fishing-rod-bucket.png",
  mess: "/images/home-ui/chef-hat.png",
  shipping: "/images/home-ui/shipping-building.png",
  hof: "/images/home-ui/trophy.png",
};

// 목표 시안은 9개 장소를 한 줄로 촘촘하게 배치하는데, 좁은 모바일 폭에서 그대로 한 줄로
// 넣으면 아이콘이 너무 작아진다 — 5개+4개 두 줄로 나눠 grid-cols-3(카드 3개씩 듬성듬성)보다
// 훨씬 촘촘한 밀도를 유지하면서도 아이콘 크기는 충분히 크게 유지한다.
export function FunctionMenuGrid() {
  const firstRow = HOME_MENU.slice(0, 5);
  const secondRow = HOME_MENU.slice(5);

  return (
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-5 gap-x-0.5">
        {firstRow.map((item) => (
          <MenuItem key={item.key} item={item} />
        ))}
      </div>
      <div className="grid grid-cols-5 gap-x-0.5">
        {secondRow.map((item) => (
          <MenuItem key={item.key} item={item} />
        ))}
      </div>
    </div>
  );
}

function MenuItem({ item }: { item: (typeof HOME_MENU)[number] }) {
  const homeUiSrc = HOME_UI_ICON[item.key];
  return (
    <Link
      href={item.href}
      onClick={() => playSfx("ui-click")}
      className="flex flex-col items-center gap-0.5 transition-transform active:scale-90"
    >
      {homeUiSrc ? (
        <Image src={homeUiSrc} alt="" aria-hidden width={1254} height={1254} unoptimized className="w-[50px]" style={{ height: "auto" }} />
      ) : (
        <GameIcon name={item.icon as never} size={50} />
      )}
      <span className="whitespace-nowrap text-center text-[10.5px] font-bold leading-tight text-[var(--color-navy)]">
        {item.label}
      </span>
    </Link>
  );
}
