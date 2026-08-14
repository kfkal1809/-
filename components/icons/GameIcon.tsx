// 통통하고 단순한 전용 2D 파스텔 아이콘 세트 (기획서 A-4 / 1장 16번)
// 이모지를 그대로 사용하지 않는다. 배지(원) + 심볼(글리프) 2겹 구조로 통일한다.

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
  | "hanger";

const NAVY = "#24365a";

function Glyph({ name }: { name: IconName }) {
  switch (name) {
    case "home":
      return <path d="M24 12 L38 24 V36 a2 2 0 0 1-2 2H12a2 2 0 0 1-2-2V24Z" fill="#fff" stroke={NAVY} strokeWidth="2.6" strokeLinejoin="round" />;
    case "cabin":
      return (
        <g fill="none" stroke={NAVY} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
          <rect x={12} y={20} width={24} height={14} rx={3} fill="#fff" />
          <path d="M15 20 v-4 h6 v4" />
          <circle cx={30} cy={27} r={2} fill={NAVY} stroke="none" />
        </g>
      );
    case "deck":
      return (
        <g fill="none" stroke={NAVY} strokeWidth="2.6" strokeLinecap="round">
          <path d="M10 30 h28" />
          <path d="M14 30 V16 M34 30 V16" />
          <circle cx={24} cy={16} r={5} fill="#fff" />
        </g>
      );
    case "bag":
      return (
        <g fill="none" stroke={NAVY} strokeWidth="2.6" strokeLinejoin="round">
          <rect x={11} y={19} width={26} height={18} rx={4} fill="#fff" />
          <path d="M18 19 v-3 a6 6 0 0 1 12 0 v3" />
        </g>
      );
    case "menu":
      return (
        <g stroke={NAVY} strokeWidth="3" strokeLinecap="round">
          <path d="M13 18 h22" />
          <path d="M13 24 h22" />
          <path d="M13 30 h22" />
        </g>
      );
    case "clipboard":
      return (
        <g fill="none" stroke={NAVY} strokeWidth="2.6" strokeLinejoin="round">
          <rect x={13} y={14} width={22} height={26} rx={3} fill="#fff" />
          <rect x={19} y={11} width={10} height={6} rx={2} fill="#fff" />
          <path d="M18 23 h12 M18 29 h12 M18 35 h8" strokeLinecap="round" />
        </g>
      );
    case "fishing":
      return (
        <g fill="none" stroke={NAVY} strokeWidth="2.6" strokeLinecap="round">
          <path d="M14 34 L34 12" />
          <path d="M34 12 q4 8 -2 16" />
          <circle cx={16} cy={32} r={2.4} fill={NAVY} stroke="none" />
        </g>
      );
    case "chef":
      return (
        <g fill="#fff" stroke={NAVY} strokeWidth="2.6" strokeLinejoin="round">
          <rect x={15} y={26} width={18} height={9} rx={2} />
          <path d="M15 27 q-4 -12 5 -14 q2 -5 6 -2 q3 -5 8 0 q7 -1 6 10 q4 2 2 8 Z" />
        </g>
      );
    case "flower":
      return (
        <g stroke={NAVY} strokeWidth="2.2" strokeLinejoin="round">
          <circle cx={24} cy={16} r={5} fill="#fff" />
          <circle cx={17} cy={21} r={5} fill="#ffe1ea" />
          <circle cx={31} cy={21} r={5} fill="#ffe1ea" />
          <circle cx={20} cy={27} r={5} fill="#fff2cf" />
          <circle cx={28} cy={27} r={5} fill="#fff2cf" />
          <circle cx={24} cy={23} r={4} fill="#f4c978" stroke="none" />
          <path d="M24 32 v6" strokeLinecap="round" />
        </g>
      );
    case "gopchang":
      return (
        <g fill="none" stroke={NAVY} strokeWidth="2.6" strokeLinejoin="round">
          <circle cx={24} cy={26} r={12} fill="#3b3f45" />
          <path d="M15 26 q9 8 18 0" stroke="#ff9a4d" strokeWidth="3" strokeLinecap="round" fill="none" />
          <path d="M24 14 v4" strokeLinecap="round" />
        </g>
      );
    case "company":
      return (
        <g fill="none" stroke={NAVY} strokeWidth="2.4" strokeLinejoin="round">
          <rect x={14} y={12} width={20} height={26} rx={2} fill="#fff" />
          <path d="M19 18 h2 M27 18 h2 M19 24 h2 M27 24 h2 M19 30 h2 M27 30 h2" strokeLinecap="round" />
          <rect x={21} y={33} width={6} height={5} fill={NAVY} stroke="none" />
        </g>
      );
    case "trophy":
      return (
        <g fill="none" stroke={NAVY} strokeWidth="2.6" strokeLinejoin="round">
          <path d="M17 14 h14 v8 a7 7 0 0 1-14 0 Z" fill="#fff2cf" />
          <path d="M17 16 h-4 a5 5 0 0 0 5 7" />
          <path d="M31 16 h4 a5 5 0 0 1-5 7" />
          <path d="M24 29 v5 M19 38 h10 l-1.5 -4 h-7 Z" fill="#fff2cf" strokeLinecap="round" />
        </g>
      );
    case "anchor":
      return (
        <g fill="none" stroke={NAVY} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
          <circle cx={24} cy={14} r={3} />
          <path d="M24 17 v18" />
          <path d="M15 22 h18" />
          <path d="M16 27 a8 8 0 0 0 16 0" />
        </g>
      );
    case "bell":
      return (
        <g fill="#fff" stroke={NAVY} strokeWidth="2.6" strokeLinejoin="round">
          <path d="M24 13 a8 8 0 0 1 8 8 v4 l3 6 H13 l3 -6 v-4 a8 8 0 0 1 8 -8 Z" />
          <path d="M21 33 a3 3 0 0 0 6 0" strokeLinecap="round" />
        </g>
      );
    case "coin":
      return (
        <g fill="#fff2cf" stroke={NAVY} strokeWidth="2.6">
          <circle cx={24} cy={24} r={11} />
          <text x={24} y={29} textAnchor="middle" fontSize="13" fill={NAVY} stroke="none" fontWeight={700}>
            $
          </text>
        </g>
      );
    case "plus":
      return (
        <g stroke="#fff" strokeWidth="3.4" strokeLinecap="round">
          <path d="M24 16 v16" />
          <path d="M16 24 h16" />
        </g>
      );
    case "ring":
      return (
        <g fill="none" stroke={NAVY} strokeWidth="2.6">
          <circle cx={24} cy={28} r={8} />
          <path d="M20 20 l4 -8 l4 8 Z" fill="#cfe6ff" strokeLinejoin="round" />
        </g>
      );
    case "book":
      return (
        <g fill="#fff" stroke={NAVY} strokeWidth="2.6" strokeLinejoin="round">
          <path d="M24 15 c-3 -2 -8 -2 -10 0 v18 c2 -2 7 -2 10 0 c3 -2 8 -2 10 0 V15 c-2 -2 -7 -2 -10 0 Z" />
          <path d="M24 15 v18" strokeLinecap="round" />
        </g>
      );
    case "hanger":
      return (
        <g fill="none" stroke={NAVY} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
          <circle cx={24} cy={14} r={2.4} />
          <path d="M24 16 v3 M13 30 l11 -8 l11 8 Z" />
          <path d="M15 30 h18" />
        </g>
      );
    default:
      return null;
  }
}

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
};

export function GameIcon({
  name,
  size = 44,
  className,
  withBadge = true,
}: {
  name: IconName;
  size?: number;
  className?: string;
  withBadge?: boolean;
}) {
  return (
    <svg viewBox="0 0 48 48" width={size} height={size} className={className} aria-hidden role="img">
      {withBadge && <circle cx={24} cy={24} r={23} fill={BADGE_COLORS[name]} stroke={NAVY} strokeWidth="1.6" opacity={0.9} />}
      <Glyph name={name} />
    </svg>
  );
}
