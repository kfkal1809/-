"use client";

import { useState } from "react";
import { CharacterSprite } from "@/components/character/CharacterSprite";
import { Button } from "@/components/ui/Button";
import type { CharacterAppearance, HairStyle } from "@/lib/domain/characterPresets";
import type { CharacterKind } from "@/lib/domain/types";
import {
  SKIN_SWATCHES,
  HAIR_SWATCHES,
  HAENYEO_HAIR_STYLES,
  HAENAM_HAIR_STYLES,
  HAENYEO_OUTFIT_SWATCHES,
  HAENAM_DECK_OUTFIT_SWATCHES,
  HAENAM_ENGINE_OUTFIT_SWATCHES,
  HAENYEO_OUTFIT_ASSET_BY_SWATCH,
  HAENAM_DECK_OUTFIT_ASSET_BY_SWATCH,
  HAENAM_ENGINE_OUTFIT_ASSET_BY_SWATCH,
} from "@/components/onboarding/swatches";

const HAIR_STYLE_LABEL: Record<string, string> = {
  wave: "웨이브",
  pony: "포니테일",
  bob: "단발",
  twin: "트윈테일",
  bun: "올림머리",
  short_neat: "단정",
  buzz: "짧은머리",
  sideswept: "사이드",
};

export function BaseAppearanceEditor({
  characterId,
  kind,
  department,
  initialAppearance,
  onSaved,
  onClose,
}: {
  characterId: string;
  kind: CharacterKind;
  department: "deck" | "engine" | null;
  initialAppearance: CharacterAppearance;
  onSaved: (appearance: CharacterAppearance) => void;
  onClose: () => void;
}) {
  const [skinTone, setSkinTone] = useState(initialAppearance.skinTone);
  const [hairColor, setHairColor] = useState(initialAppearance.hairColor);
  const [hairStyle, setHairStyle] = useState<HairStyle>(initialAppearance.hairStyle);
  const [outfitColor, setOutfitColor] = useState(initialAppearance.outfitColor);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hairStyles = kind === "haenyeo" ? HAENYEO_HAIR_STYLES : HAENAM_HAIR_STYLES;
  const outfitSwatches =
    kind === "haenyeo" ? HAENYEO_OUTFIT_SWATCHES : department === "engine" ? HAENAM_ENGINE_OUTFIT_SWATCHES : HAENAM_DECK_OUTFIT_SWATCHES;
  const outfitAssetBySwatch =
    kind === "haenyeo"
      ? HAENYEO_OUTFIT_ASSET_BY_SWATCH
      : department === "engine"
        ? HAENAM_ENGINE_OUTFIT_ASSET_BY_SWATCH
        : HAENAM_DECK_OUTFIT_ASSET_BY_SWATCH;

  const previewAppearance: CharacterAppearance = {
    ...initialAppearance,
    skinTone,
    hairColor,
    hairStyle,
    outfitColor,
    outfitAssetKey: outfitAssetBySwatch[outfitColor] ?? initialAppearance.outfitAssetKey,
  };

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/character/base-appearance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          characterId,
          skinTone,
          hairColor,
          hairStyle,
          outfitColor,
          outfitAssetKey: outfitAssetBySwatch[outfitColor] ?? initialAppearance.outfitAssetKey,
        }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error ?? "failed");
      onSaved(result.appearance);
    } catch {
      setError("저장에 실패했어요. 다시 시도해주세요.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-4 rounded-[24px] bg-white p-4 shadow-[0_6px_20px_rgba(36,54,90,0.10)]">
      <div className="flex justify-center">
        <CharacterSprite appearance={previewAppearance} kind={kind} size={140} />
      </div>

      <SwatchRow label="피부톤" values={SKIN_SWATCHES} selected={skinTone} onSelect={setSkinTone} />
      <SwatchRow label="헤어 컬러" values={HAIR_SWATCHES} selected={hairColor} onSelect={setHairColor} />
      <div>
        <p className="mb-1.5 text-[12px] font-bold text-[var(--color-navy-soft)]">헤어 스타일</p>
        <div className="flex gap-2">
          {hairStyles.map((style) => (
            <button
              key={style}
              type="button"
              onClick={() => setHairStyle(style)}
              className={`flex-1 rounded-xl border-2 py-2 text-[12px] font-bold ${
                hairStyle === style ? "border-[var(--color-tab-active)] bg-[var(--color-sky-deep)]" : "border-transparent bg-white"
              }`}
            >
              {HAIR_STYLE_LABEL[style]}
            </button>
          ))}
        </div>
      </div>
      <SwatchRow label="의상 컬러" values={outfitSwatches} selected={outfitColor} onSelect={setOutfitColor} />

      {error && <p className="text-center text-[13px] font-bold text-[var(--color-danger)]">{error}</p>}

      <div className="flex gap-2">
        <Button tone="outline" full onClick={onClose} disabled={saving}>
          취소
        </Button>
        <Button tone="coral" full onClick={handleSave} disabled={saving}>
          {saving ? "저장 중..." : "저장"}
        </Button>
      </div>
    </div>
  );
}

function SwatchRow({
  label,
  values,
  selected,
  onSelect,
}: {
  label: string;
  values: string[];
  selected: string;
  onSelect: (v: string) => void;
}) {
  return (
    <div>
      <p className="mb-1.5 text-[12px] font-bold text-[var(--color-navy-soft)]">{label}</p>
      <div className="flex gap-2">
        {values.map((v) => (
          <button
            key={v}
            type="button"
            aria-label={v}
            onClick={() => onSelect(v)}
            className={`h-8 w-8 rounded-full border-2 ${selected === v ? "border-[var(--color-navy)] scale-110" : "border-white"}`}
            style={{ backgroundColor: v }}
          />
        ))}
      </div>
    </div>
  );
}
