"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AppFrame } from "@/components/ui/AppFrame";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

function VoyageEditForm() {
  const router = useRouter();
  const params = useSearchParams();
  const characterId = params.get("characterId") ?? "";

  const [boardedAt, setBoardedAt] = useState("");
  const [expectedSignoffAt, setExpectedSignoffAt] = useState("");
  const [vacationStartAt, setVacationStartAt] = useState("");
  const [nextBoardingAt, setNextBoardingAt] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      await fetch("/api/voyage/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ characterId, boardedAt, expectedSignoffAt, vacationStartAt, nextBoardingAt }),
      });
      router.push("/voyage");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AppFrame className="px-5 py-8">
      <Card tone="cream">
        <h1 className="text-center text-lg font-extrabold text-[var(--color-navy)]">항해 일정 수정</h1>

        <div className="mt-5 flex flex-col gap-3">
          <DateField label="승선일" value={boardedAt} onChange={setBoardedAt} />
          <DateField label="하선 예정일" value={expectedSignoffAt} onChange={setExpectedSignoffAt} />
          <DateField label="휴가 시작일" value={vacationStartAt} onChange={setVacationStartAt} />
          <DateField label="다음 승선 예정일" value={nextBoardingAt} onChange={setNextBoardingAt} />
        </div>

        <Button tone="coral" full className="mt-6" onClick={handleSave} disabled={saving || !characterId}>
          {saving ? "저장 중..." : "저장"}
        </Button>
      </Card>
    </AppFrame>
  );
}

function DateField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[12px] font-bold text-[var(--color-navy-soft)]">{label}</span>
      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-2xl border-2 border-[var(--color-navy)]/10 bg-white px-4 py-2.5 text-[14px] font-bold text-[var(--color-navy)] outline-none focus:border-[var(--color-tab-active)]"
      />
    </label>
  );
}

export default function VoyageEditPage() {
  return (
    <Suspense fallback={null}>
      <VoyageEditForm />
    </Suspense>
  );
}
