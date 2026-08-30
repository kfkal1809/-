"use client";

import { CharacterSprite } from "@/components/character/CharacterSprite";
import { haenyeoPreset, haenamDeckPreset } from "@/lib/domain/characterPresets";
import { HAT_SIZE } from "@/lib/domain/characterFullBody";

const SIZE = 150;
const HATS = Object.keys(HAT_SIZE);

function Cell({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
      <div style={{ position: "relative", width: SIZE, height: SIZE, background: "#eaf6ff", display: "flex", justifyContent: "center" }}>
        {children}
      </div>
      <p style={{ fontSize: 10, fontFamily: "monospace", width: SIZE, textAlign: "center" }}>{label}</p>
    </div>
  );
}

// 프로덕션 빌드에는 노출하지 않는다 — NODE_ENV는 빌드 시점에 인라인되므로 프로덕션에서는
// 이 분기 자체가 정적으로 제거된다(components/ships/ShipEventOverlay.tsx의 SHOW_DEBUG_TRIGGER와
// 같은 패턴).
export default function QaHats() {
  if (process.env.NODE_ENV === "production") return null;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, padding: 20, background: "white" }}>
      <div>
        <h2 style={{ fontFamily: "monospace" }}>haenyeo + all hats</h2>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {HATS.map((hat) => (
            <Cell key={hat} label={hat}>
              <CharacterSprite appearance={haenyeoPreset({ hatAssetKey: hat })} kind="haenyeo" size={SIZE} />
            </Cell>
          ))}
        </div>
      </div>
      <div>
        <h2 style={{ fontFamily: "monospace" }}>haenam + all hats</h2>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {HATS.map((hat) => (
            <Cell key={hat} label={hat}>
              <CharacterSprite appearance={haenamDeckPreset({ hatAssetKey: hat })} kind="haenam" size={SIZE} />
            </Cell>
          ))}
        </div>
      </div>
    </div>
  );
}
