// 디자이너가 제공한 일러스트 아이콘 세트 (public/images/icons/*.png, 원본:
// public/images/misc/icon-sheet-source.png 에서 배경 제거 후 잘라낸 것).
// 기존 SVG 벡터 아이콘을 대체한다 — 컴포넌트 시그니처는 그대로 유지해 호출부 변경이 없도록 한다.

import Image from "next/image";

export type IconName =
  | "home"
  | "cabin"
  | "deck"
  | "bag"
  | "menu"
  | "clipboard"
  | "fishing"
  | "chef"
  | "flower"
  | "gopchang"
  | "company"
  | "trophy"
  | "anchor"
  | "bell"
  | "coin"
  | "plus"
  | "ring"
  | "book"
  | "hanger"
  | "mailbox";

const BADGE_COLORS: Record<IconName, string> = {
  home: "#cdeaff",
  cabin: "#e2f8f3",
  deck: "#cdeaff",
  bag: "#fff2cf",
  menu: "#e6ecf7",
  clipboard: "#ffe1ea",
  fishing: "#cdeaff",
  chef: "#ffe1ea",
  flower: "#e2f8f3",
  gopchang: "#ffe3d1",
  company: "#e6ecf7",
  trophy: "#fff2cf",
  anchor: "#cdeaff",
  bell: "#fff2cf",
  coin: "#fff2cf",
  plus: "#ff9a8b",
  ring: "#ffe1ea",
  book: "#e2f8f3",
  hanger: "#e6ecf7",
  mailbox: "#cdeaff",
};

export function GameIcon({
  name,
  size = 44,
  className,
  withBadge = false,
}: {
  name: IconName;
  size?: number;
  className?: string;
  withBadge?: boolean;
}) {
  const img = (
    <Image
      src={`/images/icons/${name}.png`}
      alt=""
      width={size}
      height={size}
      unoptimized
      style={{ width: size, height: size, objectFit: "contain" }}
      aria-hidden
    />
  );

  if (!withBadge) return img;

  return (
    <span
      className={className}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: size * 1.3,
        height: size * 1.3,
        borderRadius: "9999px",
        background: BADGE_COLORS[name],
      }}
    >
      {img}
    </span>
  );
}
