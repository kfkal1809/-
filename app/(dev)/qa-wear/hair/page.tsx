"use client";

import { CharacterSprite } from "@/components/character/CharacterSprite";
import { haenyeoPreset } from "@/lib/domain/characterPresets";

const SIZE = 220;
// haenyeo_01~20 전부 — HAIR_STYLE_INDEX.haenyeo에 매핑된 5종(wave=03/pony=09/bob=06/twin=11/
// bun=10)뿐 아니라 등록된 20종 전체를 hairAssetKeyOverride로 강제 지정해 검수한다.
const HAENYEO_HAIR_KEYS = Array.from({ length: 20 }, (_, i) => `haenyeo_${String(i + 1).padStart(2, "0")}`);

function Cell({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
      <div style={{ position: "relative", width: SIZE, height: SIZE, background: "#eaf6ff", display: "flex", alignItems: "flex-end", justifyContent: "center", overflow: "hidden" }}>
        {children}
        {/* 얼굴 중심선 — CharacterSprite 렌더 박스 폭의 정확히 50%가 항상 얼굴 중심(headLeft +
            headRenderW/2 == innerWidth/2, characterFullBody.ts 기하 계산 참고)이라 좌우 대칭
            검수에 정확히 쓸 수 있다. */}
        <div style={{ position: "absolute", left: "50%", top: 0, bottom: 0, width: 1, background: "rgba(255,0,0,0.45)" }} />
      </div>
      <p style={{ fontSize: 10, fontFamily: "monospace", width: SIZE, textAlign: "center" }}>{label}</p>
    </div>
  );
}

// 프로덕션 빌드에는 노출하지 않는다 — 다른 qa-wear 페이지와 같은 관례.
export default function QaHaenyeoHair() {
  if (process.env.NODE_ENV === "production") return null;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, padding: 20, background: "white" }}>
      <h1 style={{ fontFamily: "monospace" }}>해녀 헤어 20종 전수 검수 — 빨간 세로선 = 얼굴 중심선</h1>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
        {HAENYEO_HAIR_KEYS.map((key) => (
          <Cell key={key} label={key}>
            <CharacterSprite appearance={haenyeoPreset()} kind="haenyeo" size={SIZE} hairAssetKeyOverride={key} />
          </Cell>
        ))}
      </div>
    </div>
  );
}
