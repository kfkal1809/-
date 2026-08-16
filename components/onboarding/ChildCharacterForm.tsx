"use client";

import { useMemo, useState } from "react";
import { CharacterSprite } from "@/components/character/CharacterSprite";
import { childPreset } from "@/lib/domain/characterPresets";
import type { CharacterAppearance } from "@/lib/domain/characterPresets";
import type { ChildStage } from "@/lib/domain/types";
import { Button } from "@/components/ui/Button";
import { SKIN_SWATCHES, HAIR_SWATCHES, CHILD_HAIR_STYLES, CHILD_OUTFIT_SWATCHES } from "./swatches";

const STAGES: { value: string; label: string }[] = [
  { value: "infant", label: "영아" },
  { value: "toddler", label: "유아" },
  { value: "kindergarten", label: "유치원생" },
  { value: "elementary", label: "초등학생" },
  { value: "middle", label: "중학생" },
  { value: "high", label: "고등학생" },
  { value: "university", label: "대학생" },
];

export interface ChildPayload {
  nickname: string;
  gender: "male" | "female" | "unset";
  stage: string;
  appearance: CharacterAppearance;
}

export function ChildCharacterForm({ onSubmit }: { onSubmit: (payload: ChildPayload) => Promise<void> | void }) {
  const [nickname, setNickname] = useState("");
  const [gender, setGender] = useState<"male" | "female" | "unset">("unset");
  const [stage, setStage] = useState<ChildStage>("toddler");
  const [skinTone, setSkinTone] = useState(SKIN_SWATCHES[0]);
  const [hairColor, setHairColor] = useState(HAIR_SWATCHES[2]);
  const [hairStyle, setHairStyle] = useState<(typeof CHILD_HAIR_STYLES)[number]>("twin");
  const [outfitColor, setOutfitColor] = useState(CHILD_OUTFIT_SWATCHES[0]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const appearance = useMemo(
    () => childPreset({ skinTone, hairColor, hairStyle, outfitColor }),
    [skinTone, hairColor, hairStyle, outfitColor]
  );

  async function handleSubmit() {
    if (!nickname.trim()) {
      setError("별명을 입력해주세요.");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await onSubmit({ nickname: nickname.trim(), gender, stage, appearance });
      setNickname("");
    } catch {
      setError("저장에 실패했어요. 다시 시도해주세요.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-center">
        <div className="rounded-[24px] bg-white p-2.5 shadow-[0_6px_20px_rgba(36,54,90,0.10)]">
          <CharacterSprite appearance={appearance} kind="child" childGender={gender} childStage={stage} size={130} />
        </div>
      </div>

      <input
        value={nickname}
        onChange={(e) => setNickname(e.target.value)}
        placeholder="새싹 별명"
        maxLength={12}
        className="w-full rounded-2xl border-2 border-[var(--color-navy)]/10 bg-white px-4 py-2.5 text-center text-[15px] font-bold text-[var(--color-navy)] outline-none focus:border-[var(--color-tab-active)]"
      />

      <div className="flex gap-2">
        {(["male", "female", "unset"] as const).map((g) => (
          <button
            key={g}
            type="button"
            onClick={() => setGender(g)}
            className={`flex-1 rounded-xl border-2 py-2 text-[13px] font-bold ${
              gender === g ? "border-[var(--color-tab-active)] bg-[var(--color-sky-deep)]" : "border-transparent bg-white"
            }`}
          >
            {g === "male" ? "남" : g === "female" ? "여" : "설정 안 함"}
          </button>
        ))}
      </div>

      <select
        value={stage}
        onChange={(e) => setStage(e.target.value as ChildStage)}
        className="w-full rounded-2xl border-2 border-[var(--color-navy)]/10 bg-white px-4 py-2.5 text-center text-[14px] font-bold text-[var(--color-navy)]"
      >
        {STAGES.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>

      <div className="flex gap-2">
        {SKIN_SWATCHES.map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => setSkinTone(v)}
            className={`h-7 w-7 rounded-full border-2 ${skinTone === v ? "border-[var(--color-navy)]" : "border-white"}`}
            style={{ backgroundColor: v }}
          />
        ))}
        <span className="mx-1 w-px bg-[var(--color-navy)]/10" />
        {HAIR_SWATCHES.map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => setHairColor(v)}
            className={`h-7 w-7 rounded-full border-2 ${hairColor === v ? "border-[var(--color-navy)]" : "border-white"}`}
            style={{ backgroundColor: v }}
          />
        ))}
      </div>

      <div className="flex gap-2">
        {CHILD_HAIR_STYLES.map((style) => (
          <button
            key={style}
            type="button"
            onClick={() => setHairStyle(style)}
            className={`flex-1 rounded-xl border-2 py-1.5 text-[12px] font-bold ${
              hairStyle === style ? "border-[var(--color-tab-active)] bg-[var(--color-sky-deep)]" : "border-transparent bg-white"
            }`}
          >
            {style}
          </button>
        ))}
      </div>

      <div className="flex gap-2">
        {CHILD_OUTFIT_SWATCHES.map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => setOutfitColor(v)}
            className={`h-7 w-7 rounded-full border-2 ${outfitColor === v ? "border-[var(--color-navy)]" : "border-white"}`}
            style={{ backgroundColor: v }}
          />
        ))}
      </div>

      {error && <p className="text-center text-[13px] font-bold text-[var(--color-danger)]">{error}</p>}

      <Button tone="mint" full onClick={handleSubmit} disabled={submitting}>
        {submitting ? "저장 중..." : "+ 새싹 추가"}
      </Button>
    </div>
  );
}
