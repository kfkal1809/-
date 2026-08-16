"use client";

import { useMemo, useState } from "react";
import { CharacterSprite } from "@/components/character/CharacterSprite";
import { haenyeoPreset, haenamDeckPreset, haenamEnginePreset } from "@/lib/domain/characterPresets";
import type { CharacterAppearance, HairStyle } from "@/lib/domain/characterPresets";
import { Button } from "@/components/ui/Button";
import {
  SKIN_SWATCHES,
  HAIR_SWATCHES,
  HAENYEO_HAIR_STYLES,
  HAENAM_HAIR_STYLES,
  HAENYEO_OUTFIT_SWATCHES,
  HAENAM_DECK_OUTFIT_SWATCHES,
  HAENAM_ENGINE_OUTFIT_SWATCHES,
} from "./swatches";

type Kind = "haenyeo" | "haenam";
type Department = "deck" | "engine";

export interface AdultCharacterPayload {
  kind: Kind;
  department?: Department;
  nickname: string;
  appearance: CharacterAppearance;
}

export function AdultCharacterForm({
  title,
  subtitle,
  submitLabel,
  allowKindChoice = true,
  fixedKind,
  onSubmit,
  secondary,
}: {
  title: string;
  subtitle?: string;
  submitLabel: string;
  allowKindChoice?: boolean;
  fixedKind?: Kind;
  onSubmit: (payload: AdultCharacterPayload) => Promise<void> | void;
  secondary?: React.ReactNode;
}) {
  const [kind, setKind] = useState<Kind>(fixedKind ?? "haenyeo");
  const [department, setDepartment] = useState<Department>("deck");
  const [nickname, setNickname] = useState("");
  const [skinTone, setSkinTone] = useState(SKIN_SWATCHES[0]);
  const [hairColor, setHairColor] = useState(HAIR_SWATCHES[1]);
  const [hairStyle, setHairStyle] = useState<HairStyle>("wave");
  const [outfitColor, setOutfitColor] = useState(HAENYEO_OUTFIT_SWATCHES[0]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hairStyles = kind === "haenyeo" ? HAENYEO_HAIR_STYLES : HAENAM_HAIR_STYLES;
  const outfitSwatches =
    kind === "haenyeo" ? HAENYEO_OUTFIT_SWATCHES : department === "engine" ? HAENAM_ENGINE_OUTFIT_SWATCHES : HAENAM_DECK_OUTFIT_SWATCHES;

  const appearance: CharacterAppearance = useMemo(() => {
    const base =
      kind === "haenyeo" ? haenyeoPreset() : department === "engine" ? haenamEnginePreset() : haenamDeckPreset();
    return {
      ...base,
      skinTone,
      hairColor,
      hairStyle,
      outfitColor,
    };
  }, [kind, department, skinTone, hairColor, hairStyle, outfitColor]);

  async function handleSubmit() {
    if (!nickname.trim()) {
      setError("별명을 입력해주세요.");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await onSubmit({ kind, department: kind === "haenam" ? department : undefined, nickname: nickname.trim(), appearance });
    } catch {
      setError("저장에 실패했어요. 다시 시도해주세요.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="text-center">
        <h1 className="text-lg font-extrabold text-[var(--color-navy)]">{title}</h1>
        {subtitle && <p className="mt-1 text-[12px] text-[var(--color-navy-soft)]">{subtitle}</p>}
      </div>

      <div className="flex justify-center">
        <div className="rounded-[28px] bg-white p-3 shadow-[0_6px_20px_rgba(36,54,90,0.10)]">
          <CharacterSprite appearance={appearance} kind={kind} size={160} />
        </div>
      </div>

      {allowKindChoice && (
        <div className="flex gap-2">
          {(["haenyeo", "haenam"] as Kind[]).map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setKind(k)}
              className={`flex-1 rounded-2xl border-2 py-2.5 text-[13px] font-bold ${
                kind === k ? "border-[var(--color-tab-active)] bg-[var(--color-sky-deep)]" : "border-transparent bg-white"
              }`}
            >
              {k === "haenyeo" ? "해녀" : "해남"}
            </button>
          ))}
        </div>
      )}

      {kind === "haenam" && (
        <div className="flex gap-2">
          {(["deck", "engine"] as Department[]).map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => {
                setDepartment(d);
                setOutfitColor(d === "engine" ? HAENAM_ENGINE_OUTFIT_SWATCHES[0] : HAENAM_DECK_OUTFIT_SWATCHES[0]);
              }}
              className={`flex-1 rounded-2xl border-2 py-2.5 text-[13px] font-bold ${
                department === d ? "border-[var(--color-tab-active)] bg-[var(--color-sky-deep)]" : "border-transparent bg-white"
              }`}
            >
              {d === "deck" ? "항해사" : "기관사"}
            </button>
          ))}
        </div>
      )}

      <input
        value={nickname}
        onChange={(e) => setNickname(e.target.value)}
        placeholder="별명을 입력해주세요"
        maxLength={12}
        className="w-full rounded-2xl border-2 border-[var(--color-navy)]/10 bg-white px-4 py-3 text-center text-[15px] font-bold text-[var(--color-navy)] outline-none focus:border-[var(--color-tab-active)]"
      />

      <SwatchRow label="피부톤" values={SKIN_SWATCHES} selected={skinTone} onSelect={setSkinTone} />
      <SwatchRow label="헤어 컬러" values={HAIR_SWATCHES} selected={hairColor} onSelect={setHairColor} />
      <div>
        <p className="mb-1.5 text-[11px] font-bold text-[var(--color-navy-soft)]">헤어 스타일</p>
        <div className="flex gap-2">
          {hairStyles.map((style) => (
            <button
              key={style}
              type="button"
              onClick={() => setHairStyle(style)}
              className={`flex-1 rounded-xl border-2 py-2 text-[11px] font-bold ${
                hairStyle === style ? "border-[var(--color-tab-active)] bg-[var(--color-sky-deep)]" : "border-transparent bg-white"
              }`}
            >
              {HAIR_STYLE_LABEL[style]}
            </button>
          ))}
        </div>
      </div>
      <SwatchRow label="의상 컬러" values={outfitSwatches} selected={outfitColor} onSelect={setOutfitColor} />

      {error && <p className="text-center text-[12px] font-bold text-[var(--color-danger)]">{error}</p>}

      <Button tone="coral" full onClick={handleSubmit} disabled={submitting}>
        {submitting ? "저장 중..." : submitLabel}
      </Button>
      {secondary}
    </div>
  );
}

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
      <p className="mb-1.5 text-[11px] font-bold text-[var(--color-navy-soft)]">{label}</p>
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
