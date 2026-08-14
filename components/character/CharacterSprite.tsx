import type { CharacterAppearance, HairStyle, OutfitStyle } from "@/lib/domain/characterPresets";

interface CharacterSpriteProps {
  appearance: CharacterAppearance;
  size?: number;
  className?: string;
  flip?: boolean;
}

const NAVY = "#2a3552";

function HairBack({ style, color, cx, cy, r }: { style: HairStyle; color: string; cx: number; cy: number; r: number }) {
  switch (style) {
    case "wave":
      return (
        <>
          <path
            d={`M ${cx - r + 4} ${cy - 8} C ${cx - r - 14} ${cy + 40}, ${cx - r - 6} ${cy + 78}, ${cx - r + 18} ${cy + 88} C ${cx - r + 30} ${cy + 70}, ${cx - r + 16} ${cy + 30}, ${cx - r + 20} ${cy - 4} Z`}
            fill={color}
            stroke={NAVY}
            strokeWidth="3"
          />
          <path
            d={`M ${cx + r - 4} ${cy - 8} C ${cx + r + 14} ${cy + 40}, ${cx + r + 6} ${cy + 78}, ${cx + r - 18} ${cy + 88} C ${cx + r - 30} ${cy + 70}, ${cx + r - 16} ${cy + 30}, ${cx + r - 20} ${cy - 4} Z`}
            fill={color}
            stroke={NAVY}
            strokeWidth="3"
          />
        </>
      );
    case "pony":
      return (
        <path
          d={`M ${cx + r - 10} ${cy - 20} C ${cx + r + 30} ${cy + 6}, ${cx + r + 22} ${cy + 60}, ${cx + r - 6} ${cy + 78} C ${cx + r + 6} ${cy + 40}, ${cx + r - 2} ${cy + 6}, ${cx + r - 18} ${cy - 12} Z`}
          fill={color}
          stroke={NAVY}
          strokeWidth="3"
        />
      );
    case "twin":
      return (
        <>
          <ellipse cx={cx - r + 6} cy={cy + 14} rx={16} ry={22} fill={color} stroke={NAVY} strokeWidth="3" />
          <ellipse cx={cx + r - 6} cy={cy + 14} rx={16} ry={22} fill={color} stroke={NAVY} strokeWidth="3" />
          <circle cx={cx - r + 6} cy={cy - 4} r={5} fill="#ff9a8b" stroke={NAVY} strokeWidth="2" />
          <circle cx={cx + r - 6} cy={cy - 4} r={5} fill="#ff9a8b" stroke={NAVY} strokeWidth="2" />
        </>
      );
    case "bun":
      return <circle cx={cx} cy={cy - r - 6} r={16} fill={color} stroke={NAVY} strokeWidth="3" />;
    case "bob":
      return (
        <path
          d={`M ${cx - r} ${cy - 6} C ${cx - r - 6} ${cy + 30}, ${cx - r + 2} ${cy + 46}, ${cx - r + 14} ${cy + 50}
              L ${cx + r - 14} ${cy + 50} C ${cx + r - 2} ${cy + 46}, ${cx + r + 6} ${cy + 30}, ${cx + r} ${cy - 6} Z`}
          fill={color}
          stroke={NAVY}
          strokeWidth="3"
        />
      );
    default:
      return null;
  }
}

function HairFront({ style, color, cx, cy, r }: { style: HairStyle; color: string; cx: number; cy: number; r: number }) {
  const bangs = (() => {
    switch (style) {
      case "buzz":
        return `M ${cx - r + 6} ${cy - r + 18} A ${r - 4} ${r - 4} 0 0 1 ${cx + r - 6} ${cy - r + 18} L ${cx + r - 10} ${cy - r + 30} A ${r - 14} ${r - 14} 0 0 0 ${cx - r + 10} ${cy - r + 30} Z`;
      case "sideswept":
        return `M ${cx - r + 4} ${cy - r + 30} C ${cx - r + 20} ${cy - r + 4}, ${cx + r - 30} ${cy - r + 2}, ${cx + r - 6} ${cy - r + 24} C ${cx + r - 20} ${cy - 8}, ${cx - 4} ${cy - 6}, ${cx - r + 4} ${cy - r + 30} Z`;
      default:
        return `M ${cx - r + 2} ${cy - r + 26} C ${cx - r + 10} ${cy - r + 2}, ${cx + r - 10} ${cy - r + 2}, ${cx + r - 2} ${cy - r + 26}
                C ${cx + r - 14} ${cy - r + 12}, ${cx - r + 14} ${cy - r + 12}, ${cx - r + 2} ${cy - r + 26} Z`;
    }
  })();
  return <path d={bangs} fill={color} stroke={NAVY} strokeWidth="3" strokeLinejoin="round" />;
}

function Outfit({
  style,
  color,
  accent,
  cx,
  torsoTop,
  torsoW,
  torsoH,
}: {
  style: OutfitStyle;
  color: string;
  accent: string;
  cx: number;
  torsoTop: number;
  torsoW: number;
  torsoH: number;
}) {
  const left = cx - torsoW / 2;
  const bibTop = torsoTop + torsoH * 0.28;
  switch (style) {
    case "haenyeo_overalls":
    case "child_overalls":
      return (
        <>
          {/* 흰 티 */}
          <rect x={left} y={torsoTop} width={torsoW} height={torsoH} rx={torsoW / 2.4} fill={accent} stroke={NAVY} strokeWidth="3" />
          {/* 청멜빵 바디 */}
          <path
            d={`M ${left + 8} ${bibTop} h ${torsoW - 16} v ${torsoH - (bibTop - torsoTop) - 6} a 10 10 0 0 1 -10 10 h ${-(torsoW - 36)} a 10 10 0 0 1 -10 -10 Z`}
            fill={color}
            stroke={NAVY}
            strokeWidth="3"
          />
          {/* 멜빵끈 */}
          <path d={`M ${cx - torsoW * 0.28} ${torsoTop + 4} L ${cx - torsoW * 0.14} ${bibTop}`} stroke={color} strokeWidth="9" strokeLinecap="round" />
          <path d={`M ${cx + torsoW * 0.28} ${torsoTop + 4} L ${cx + torsoW * 0.14} ${bibTop}`} stroke={color} strokeWidth="9" strokeLinecap="round" />
          <path d={`M ${cx - torsoW * 0.28} ${torsoTop + 4} L ${cx - torsoW * 0.14} ${bibTop}`} stroke={NAVY} strokeWidth="1" strokeLinecap="round" opacity={0.3} />
          {/* 포켓 */}
          <rect x={cx - 9} y={bibTop + 12} width={18} height={14} rx={3} fill={accent} stroke={NAVY} strokeWidth="2" opacity={0.9} />
        </>
      );
    case "haenam_deck_uniform":
      return (
        <>
          <rect x={left} y={torsoTop} width={torsoW} height={torsoH} rx={torsoW / 2.4} fill={color} stroke={NAVY} strokeWidth="3" />
          <path d={`M ${cx - 12} ${torsoTop + 2} L ${cx} ${torsoTop + 22} L ${cx + 12} ${torsoTop + 2}`} fill="none" stroke={accent} strokeWidth="7" strokeLinejoin="round" />
          <rect x={cx - 5} y={torsoTop + 24} width={10} height={torsoH - 30} rx={3} fill={accent} />
          <circle cx={cx} cy={torsoTop + 32} r={2.4} fill={color} />
          <circle cx={cx} cy={torsoTop + 44} r={2.4} fill={color} />
          <rect x={left + 2} y={torsoTop + 4} width={16} height={6} rx={2} fill={accent} opacity={0.85} />
          <rect x={left + torsoW - 18} y={torsoTop + 4} width={16} height={6} rx={2} fill={accent} opacity={0.85} />
        </>
      );
    case "haenam_engine_overalls":
      return (
        <>
          <rect x={left} y={torsoTop} width={torsoW} height={torsoH} rx={torsoW / 2.4} fill={color} stroke={NAVY} strokeWidth="3" />
          <line x1={cx} y1={torsoTop + 6} x2={cx} y2={torsoTop + torsoH - 8} stroke={accent} strokeWidth="3" strokeDasharray="3 3" />
          <rect x={cx + 6} y={torsoTop + 14} width={14} height={11} rx={2} fill={accent} opacity={0.25} stroke={NAVY} strokeWidth="1.5" />
        </>
      );
    case "chef":
      return (
        <>
          <rect x={left} y={torsoTop} width={torsoW} height={torsoH} rx={torsoW / 2.4} fill={color} stroke={NAVY} strokeWidth="3" />
          <path d={`M ${cx - 20} ${torsoTop + 8} h 40 v ${torsoH - 10} h -40 Z`} fill={accent} opacity={0.9} stroke={NAVY} strokeWidth="2.5" />
        </>
      );
    case "cardigan":
      return (
        <>
          <rect x={left} y={torsoTop} width={torsoW} height={torsoH} rx={torsoW / 2.4} fill={accent} stroke={NAVY} strokeWidth="3" />
          <path d={`M ${cx - 6} ${torsoTop} v ${torsoH}`} stroke={color} strokeWidth="3" opacity={0.4} />
          <path
            d={`M ${left - 2} ${torsoTop + 6} q ${torsoW * 0.18} ${torsoH * 0.5} 4 ${torsoH - 4} L ${cx - 4} ${torsoTop + torsoH} L ${cx - 4} ${torsoTop + 6} Z`}
            fill={color}
            stroke={NAVY}
            strokeWidth="2.5"
          />
          <path
            d={`M ${left + torsoW + 2} ${torsoTop + 6} q ${-torsoW * 0.18} ${torsoH * 0.5} -4 ${torsoH - 4} L ${cx + 4} ${torsoTop + torsoH} L ${cx + 4} ${torsoTop + 6} Z`}
            fill={color}
            stroke={NAVY}
            strokeWidth="2.5"
          />
        </>
      );
    case "tank":
      return (
        <>
          <rect x={left + 10} y={torsoTop} width={torsoW - 20} height={torsoH} rx={torsoW / 2.6} fill={color} stroke={NAVY} strokeWidth="3" />
          <path d={`M ${cx - 14} ${torsoTop + 4} L ${cx} ${torsoTop + 16} L ${cx + 14} ${torsoTop + 4}`} fill="none" stroke={accent} strokeWidth="5" strokeLinejoin="round" />
        </>
      );
    default:
      return <rect x={left} y={torsoTop} width={torsoW} height={torsoH} rx={torsoW / 2.4} fill={color} stroke={NAVY} strokeWidth="3" />;
  }
}

function Hat({ style, cx, top, accent, color }: { style: string; cx: number; top: number; accent: string; color: string }) {
  switch (style) {
    case "captain":
      return (
        <g>
          <ellipse cx={cx} cy={top + 16} rx={40} ry={11} fill="#f4f8ff" stroke={NAVY} strokeWidth="3" />
          <path d={`M ${cx - 30} ${top + 12} a 30 22 0 0 1 60 0 Z`} fill="#f4f8ff" stroke={NAVY} strokeWidth="3" />
          <rect x={cx - 30} y={top - 2} width={60} height={9} fill={color} stroke={NAVY} strokeWidth="2" />
          <circle cx={cx} cy={top + 3} r={4.5} fill="#f4c978" stroke={NAVY} strokeWidth="1.5" />
        </g>
      );
    case "chef":
      return (
        <g>
          <rect x={cx - 22} y={top + 6} width={44} height={16} rx={4} fill="#ffffff" stroke={NAVY} strokeWidth="3" />
          <path
            d={`M ${cx - 22} ${top + 8} q -6 -26 10 -30 q 4 -10 14 -6 q 6 -10 16 0 q 14 -2 12 20 q 8 4 4 16 Z`}
            fill="#ffffff"
            stroke={NAVY}
            strokeWidth="3"
          />
        </g>
      );
    case "hardhat":
      return <path d={`M ${cx - 26} ${top + 14} a 26 18 0 0 1 52 0 Z`} fill={accent} stroke={NAVY} strokeWidth="3" />;
    default:
      return null;
  }
}

function Accessory({ style, cx, y }: { style: string; cx: number; y: number }) {
  if (style === "wrench") {
    return (
      <g transform={`translate(${cx + 46} ${y}) rotate(28)`}>
        <rect x={-4} y={-22} width={8} height={40} rx={3} fill="#c9ccd4" stroke={NAVY} strokeWidth="2" />
        <circle cx={0} cy={-22} r={8} fill="none" stroke="#c9ccd4" strokeWidth="5" />
      </g>
    );
  }
  if (style === "tablet") {
    return (
      <g transform={`translate(${cx + 40} ${y + 6}) rotate(-8)`}>
        <rect x={-10} y={-14} width={20} height={26} rx={3} fill="#f4f8ff" stroke={NAVY} strokeWidth="2.5" />
        <rect x={-6} y={-9} width={12} height={16} rx={1} fill="#cfe6ff" />
      </g>
    );
  }
  return null;
}

export function CharacterSprite({ appearance: a, size = 140, className, flip }: CharacterSpriteProps) {
  const cx = 110;
  const headCy = 96;
  const headR = 60 * (0.9 + a.bodyScale * 0.1);
  const torsoTop = headCy + headR - 14;
  const torsoW = 92 * a.bodyScale;
  const torsoH = 76 * a.bodyScale;
  const legY = torsoTop + torsoH - 6;

  return (
    <svg
      viewBox="0 0 220 260"
      width={size}
      height={(size * 260) / 220}
      className={className}
      style={flip ? { transform: "scaleX(-1)" } : undefined}
      role="img"
      aria-hidden
    >
      {/* 뒷머리 */}
      <HairBack style={a.hairStyle} color={a.hairColor} cx={cx} cy={headCy} r={headR} />

      {/* 다리 */}
      <rect x={cx - 30} y={legY} width={22} height={30 * a.bodyScale} rx={11} fill={a.skinTone} stroke={NAVY} strokeWidth="3" />
      <rect x={cx + 8} y={legY} width={22} height={30 * a.bodyScale} rx={11} fill={a.skinTone} stroke={NAVY} strokeWidth="3" />
      <ellipse cx={cx - 19} cy={legY + 30 * a.bodyScale + 2} rx={15} ry={8} fill="#2c3f66" stroke={NAVY} strokeWidth="2.5" />
      <ellipse cx={cx + 19} cy={legY + 30 * a.bodyScale + 2} rx={15} ry={8} fill="#2c3f66" stroke={NAVY} strokeWidth="2.5" />

      {/* 팔 */}
      <ellipse cx={cx - torsoW / 2 - 10} cy={torsoTop + torsoH * 0.45} rx={15} ry={32 * a.bodyScale} fill={a.skinTone} stroke={NAVY} strokeWidth="3" />
      <ellipse cx={cx + torsoW / 2 + 10} cy={torsoTop + torsoH * 0.45} rx={15} ry={32 * a.bodyScale} fill={a.skinTone} stroke={NAVY} strokeWidth="3" />
      {a.toned && (
        <>
          <path d={`M ${cx - torsoW / 2 - 16} ${torsoTop + torsoH * 0.3} q 6 14 0 28`} stroke={NAVY} strokeWidth="1.6" opacity={0.35} fill="none" />
          <path d={`M ${cx + torsoW / 2 + 16} ${torsoTop + torsoH * 0.3} q -6 14 0 28`} stroke={NAVY} strokeWidth="1.6" opacity={0.35} fill="none" />
        </>
      )}

      {/* 몸통 + 의상 */}
      <Outfit style={a.outfit} color={a.outfitColor} accent={a.outfitAccent} cx={cx} torsoTop={torsoTop} torsoW={torsoW} torsoH={torsoH} />

      {/* 소품 (스패너/태블릿) */}
      <Accessory style={a.accessory} cx={cx} y={torsoTop + torsoH * 0.4} />

      {/* 머리 */}
      <circle cx={cx} cy={headCy} r={headR} fill={a.skinTone} stroke={NAVY} strokeWidth="3.5" />

      {/* 볼터치 */}
      <ellipse cx={cx - headR * 0.5} cy={headCy + headR * 0.22} rx={10} ry={6} fill="#ffb3ab" opacity={0.55} />
      <ellipse cx={cx + headR * 0.5} cy={headCy + headR * 0.22} rx={10} ry={6} fill="#ffb3ab" opacity={0.55} />

      {/* 눈 (아주 작고 둥근 점눈) */}
      <circle cx={cx - headR * 0.34} cy={headCy + headR * 0.04} r={4.3 * a.eyeScale} fill={NAVY} />
      <circle cx={cx + headR * 0.34} cy={headCy + headR * 0.04} r={4.3 * a.eyeScale} fill={NAVY} />
      {a.eyeScale > 1.15 && (
        <>
          <circle cx={cx - headR * 0.34 + 1.4} cy={headCy + headR * 0.04 - 1.4} r={1.4} fill="#ffffff" />
          <circle cx={cx + headR * 0.34 + 1.4} cy={headCy + headR * 0.04 - 1.4} r={1.4} fill="#ffffff" />
        </>
      )}
      {a.eyelash && (
        <>
          <path d={`M ${cx - headR * 0.34 - 5} ${headCy + headR * 0.04 - 5} l -5 -4`} stroke={NAVY} strokeWidth="2" strokeLinecap="round" />
          <path d={`M ${cx + headR * 0.34 + 5} ${headCy + headR * 0.04 - 5} l 5 -4`} stroke={NAVY} strokeWidth="2" strokeLinecap="round" />
        </>
      )}

      {/* 입 */}
      <path
        d={`M ${cx - 6} ${headCy + headR * 0.34} q 6 6 12 0`}
        stroke={NAVY}
        strokeWidth="2.4"
        fill="none"
        strokeLinecap="round"
      />

      {/* 앞머리 */}
      <HairFront style={a.hairStyle} color={a.hairColor} cx={cx} cy={headCy} r={headR} />

      {/* 모자 */}
      <Hat style={a.hat} cx={cx} top={headCy - headR} accent={a.outfitAccent} color={a.outfitColor} />
    </svg>
  );
}
