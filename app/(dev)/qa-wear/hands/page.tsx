"use client";

import { CharacterSprite } from "@/components/character/CharacterSprite";
import { haenyeoPreset, haenamDeckPreset } from "@/lib/domain/characterPresets";
import { HAND_SIZE, NECK_SIZE } from "@/lib/domain/characterFullBody";

const SIZE = 150;
const HANDS = Object.keys(HAND_SIZE);
const NECKS = Object.keys(NECK_SIZE);

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

// 프로덕션 빌드에는 노출하지 않는다 — qa-wear/hats/page.tsx와 동일한 패턴.
export default function QaHands() {
  if (process.env.NODE_ENV === "production") return null;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, padding: 20, background: "white" }}>
      <div>
        <h2 style={{ fontFamily: "monospace" }}>haenyeo + all hand accessories</h2>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {HANDS.map((k) => (
            <Cell key={k} label={k}>
              <CharacterSprite appearance={haenyeoPreset({ handAssetKey: k })} kind="haenyeo" size={SIZE} />
            </Cell>
          ))}
        </div>
      </div>
      <div>
        <h2 style={{ fontFamily: "monospace" }}>haenam + all hand accessories</h2>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {HANDS.map((k) => (
            <Cell key={k} label={k}>
              <CharacterSprite appearance={haenamDeckPreset({ handAssetKey: k })} kind="haenam" size={SIZE} />
            </Cell>
          ))}
        </div>
      </div>
      <div>
        <h2 style={{ fontFamily: "monospace" }}>haenam + neck accessories</h2>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {NECKS.map((k) => (
            <Cell key={k} label={k}>
              <CharacterSprite appearance={haenamDeckPreset({ neckAssetKey: k })} kind="haenam" size={SIZE} />
            </Cell>
          ))}
        </div>
      </div>
    </div>
  );
}
