import type { ShipTypeConfig } from "@/lib/domain/shipEvents";

// 선종 7종을 위한 단일 제네릭 선박 스프라이트. 선종별 if문을 흩어놓지 않고,
// hullShape(boxy/tanker/carrier) 한 값으로만 갑판 디테일을 분기한다.
export function ShipSprite({ ship, width = 120, flip = false }: { ship: ShipTypeConfig; width?: number; flip?: boolean }) {
  const height = width * (56 / 132);

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 132 56"
      style={{ transform: flip ? "scaleX(-1)" : undefined }}
      role="img"
      aria-label={ship.name}
    >
      {/* 선체 */}
      <path d="M8 40 L14 48 L118 48 L128 38 L122 34 L12 34 Z" fill={ship.hullColor} />
      <rect x="8" y="44" width="120" height="5" rx="2" fill={ship.accentColor} opacity="0.55" />

      {/* 조타실 */}
      <rect x="14" y="18" width="20" height="16" rx="2" fill={ship.accentColor} />
      <rect x="17" y="21" width="5" height="5" rx="1" fill="#fff" opacity="0.85" />
      <rect x="25" y="21" width="5" height="5" rx="1" fill="#fff" opacity="0.85" />
      <rect x="21" y="10" width="4" height="9" fill={ship.accentColor} />

      {/* 갑판 디테일: hullShape 한 값으로만 분기 */}
      {ship.hullShape === "boxy" && (
        <g>
          <rect x="42" y="24" width="14" height="10" fill={ship.deckColor} />
          <rect x="58" y="20" width="14" height="14" fill={ship.deckColor} opacity="0.85" />
          <rect x="74" y="26" width="14" height="8" fill={ship.deckColor} />
          <rect x="90" y="22" width="14" height="12" fill={ship.deckColor} opacity="0.85" />
          <rect x="42" y="24" width="14" height="3" fill="#fff" opacity="0.25" />
          <rect x="58" y="20" width="14" height="3" fill="#fff" opacity="0.25" />
        </g>
      )}
      {ship.hullShape === "tanker" && (
        <g>
          <ellipse cx="52" cy="27" rx="9" ry="7" fill={ship.deckColor} />
          <ellipse cx="72" cy="27" rx="9" ry="7" fill={ship.deckColor} />
          <ellipse cx="92" cy="27" rx="9" ry="7" fill={ship.deckColor} />
          <ellipse cx="52" cy="24" rx="5" ry="2" fill="#fff" opacity="0.35" />
          <ellipse cx="72" cy="24" rx="5" ry="2" fill="#fff" opacity="0.35" />
          <ellipse cx="92" cy="24" rx="5" ry="2" fill="#fff" opacity="0.35" />
        </g>
      )}
      {ship.hullShape === "carrier" && (
        <g>
          <rect x="40" y="14" width="66" height="20" rx="2" fill={ship.deckColor} />
          <rect x="40" y="20" width="66" height="1.4" fill={ship.accentColor} opacity="0.35" />
          <rect x="40" y="26" width="66" height="1.4" fill={ship.accentColor} opacity="0.35" />
        </g>
      )}

      {/* 뱃머리 삼각기 */}
      <path d="M118 38 L128 38 L118 30 Z" fill={ship.accentColor} opacity="0.5" />
    </svg>
  );
}
