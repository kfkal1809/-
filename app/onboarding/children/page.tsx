"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppFrame } from "@/components/ui/AppFrame";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ChildCharacterForm, type ChildPayload } from "@/components/onboarding/ChildCharacterForm";
import { CharacterSprite } from "@/components/character/CharacterSprite";
import type { CharacterAppearance } from "@/lib/domain/characterPresets";
import type { ChildGender, ChildStage } from "@/lib/domain/types";

interface ChildRow {
  id: string;
  nickname: string;
  child_gender: ChildGender;
  child_stage: ChildStage;
  appearance_json: CharacterAppearance;
}

export default function OnboardingChildrenPage() {
  const router = useRouter();
  const [children, setChildren] = useState<ChildRow[]>([]);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetch("/api/onboarding/children")
      .then((r) => r.json())
      .then((data) => setChildren(data.children ?? []))
      .catch(() => {});
  }, []);

  async function handleAdd(payload: ChildPayload) {
    const res = await fetch("/api/onboarding/children", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "failed");
    setChildren((prev) => [
      ...prev,
      {
        id: data.characterId,
        nickname: payload.nickname,
        child_gender: payload.gender,
        child_stage: payload.stage as ChildStage,
        appearance_json: payload.appearance,
      },
    ]);
    setShowForm(false);
  }

  return (
    <AppFrame className="px-5 py-8">
      <p className="mb-4 text-center text-[11px] font-bold text-[var(--color-tab-active)]">STEP 4 / 4</p>
      <Card tone="cream">
        <h1 className="text-center text-lg font-extrabold text-[var(--color-navy)]">새싹을 만들어볼까요?</h1>
        <p className="mt-1 text-center text-[12px] text-[var(--color-navy-soft)]">가족당 최대 3명까지 만들 수 있어요 ({children.length}/3)</p>

        {children.length > 0 && (
          <div className="mt-4 flex flex-wrap justify-center gap-3">
            {children.map((c) => (
              <div key={c.id} className="flex flex-col items-center">
                <CharacterSprite appearance={c.appearance_json} kind="child" childGender={c.child_gender} childStage={c.child_stage} size={100} />
                <p className="text-[11px] font-bold text-[var(--color-navy)]">{c.nickname}</p>
              </div>
            ))}
          </div>
        )}

        {showForm && children.length < 3 ? (
          <div className="mt-5">
            <ChildCharacterForm onSubmit={handleAdd} />
          </div>
        ) : (
          children.length < 3 && (
            <Button tone="mint" full className="mt-5" onClick={() => setShowForm(true)}>
              + 새싹 추가
            </Button>
          )
        )}

        <Button tone="coral" full className="mt-3" onClick={() => router.push("/onboarding/complete")}>
          다음
        </Button>
      </Card>
    </AppFrame>
  );
}
