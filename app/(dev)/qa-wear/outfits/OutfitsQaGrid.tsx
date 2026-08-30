"use client";

import { CharacterSprite } from "@/components/character/CharacterSprite";
import { haenyeoPreset, haenamDeckPreset, haenamEnginePreset, childPreset } from "@/lib/domain/characterPresets";
import type { ChildGender, ChildStage, CharacterKind } from "@/lib/domain/types";

const SIZE = 150;

function Cell({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
      <div style={{ position: "relative", width: SIZE, height: SIZE + 20, background: "#eaf6ff", display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
        {children}
      </div>
      <p style={{ fontSize: 9, fontFamily: "monospace", width: SIZE, textAlign: "center", wordBreak: "break-all" }}>{label}</p>
    </div>
  );
}

// dress_full 파일명에서 kind/childGender/childStage를 역파싱한다.
// 예: child_toddler_male_dress_s3_02 → child / male / toddler
//     haenyeo_dress_02 → haenyeo
function parseDressKey(key: string): { kind: CharacterKind; childGender?: ChildGender; childStage?: ChildStage } {
  const m = key.match(/^child_(toddler|kindergarten|elementary)_(male|female)_dress_/);
  if (m) return { kind: "child", childStage: m[1] as ChildStage, childGender: m[2] as ChildGender };
  return { kind: "haenyeo" };
}

export function OutfitsQaGrid({ outfitFull, dressFull }: { outfitFull: string[]; dressFull: string[] }) {
  const haenyeoOutfits = outfitFull.filter((k) => k.startsWith("haenyeo_outfit_"));
  const deckOutfits = outfitFull.filter((k) => k.startsWith("haenam_deck_outfit_"));
  const engineOutfits = outfitFull.filter((k) => k.startsWith("haenam_engine_outfit_"));
  const childOutfits = outfitFull.filter((k) => k.startsWith("child_outfit_"));
  const haenyeoDresses = dressFull.filter((k) => k.startsWith("haenyeo_dress_"));
  const childDresses = dressFull.filter((k) => k.startsWith("child_"));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, padding: 20, background: "white" }}>
      <h1 style={{ fontFamily: "monospace" }}>
        옷가게 &quot;의상&quot; 전수 검수 — outfit_full {outfitFull.length}개 + dress_full {dressFull.length}개
      </h1>

      <Section title={`haenyeo_outfit (${haenyeoOutfits.length})`}>
        {haenyeoOutfits.map((k) => (
          <Cell key={k} label={k}>
            <CharacterSprite appearance={haenyeoPreset({ outfitAssetKey: k, fullPortraitKey: null })} kind="haenyeo" size={SIZE} />
          </Cell>
        ))}
      </Section>

      <Section title={`haenam_deck_outfit (${deckOutfits.length})`}>
        {deckOutfits.map((k) => (
          <Cell key={k} label={k}>
            <CharacterSprite appearance={haenamDeckPreset({ outfitAssetKey: k, fullPortraitKey: null })} kind="haenam" size={SIZE} />
          </Cell>
        ))}
      </Section>

      <Section title={`haenam_engine_outfit (${engineOutfits.length})`}>
        {engineOutfits.map((k) => (
          <Cell key={k} label={k}>
            <CharacterSprite appearance={haenamEnginePreset({ outfitAssetKey: k, fullPortraitKey: null })} kind="haenam" size={SIZE} />
          </Cell>
        ))}
      </Section>

      <Section title={`child_outfit (${childOutfits.length}, 대표로 toddler/male 헤어에 얹어봄)`}>
        {childOutfits.map((k) => (
          <Cell key={k} label={k}>
            <CharacterSprite
              appearance={childPreset({ outfitAssetKey: k, fullPortraitKey: null })}
              kind="child"
              childGender="male"
              childStage="toddler"
              size={SIZE}
            />
          </Cell>
        ))}
      </Section>

      <Section title={`haenyeo_dress (${haenyeoDresses.length})`}>
        {haenyeoDresses.map((k) => (
          <Cell key={k} label={k}>
            <CharacterSprite appearance={haenyeoPreset({ fullPortraitKey: k, outfitAssetKey: null })} kind="haenyeo" size={SIZE} />
          </Cell>
        ))}
      </Section>

      <Section title={`child dress variants (${childDresses.length}, 파일명에서 체형 역파싱)`}>
        {childDresses.map((k) => {
          const { kind, childGender, childStage } = parseDressKey(k);
          return (
            <Cell key={k} label={k}>
              <CharacterSprite
                appearance={childPreset({ fullPortraitKey: k, outfitAssetKey: null })}
                kind={kind}
                childGender={childGender}
                childStage={childStage}
                size={SIZE}
              />
            </Cell>
          );
        })}
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 style={{ fontFamily: "monospace", fontSize: 14 }}>{title}</h2>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>{children}</div>
    </div>
  );
}
