"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppFrame } from "@/components/ui/AppFrame";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function BirthdayEditPage() {
  const router = useRouter();
  const [haenyeoBirthday, setHaenyeoBirthday] = useState("");
  const [haenamBirthday, setHaenamBirthday] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      await fetch("/api/household/birthday", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ haenyeoBirthday, haenamBirthday }),
      });
      router.push("/voyage");
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <AppFrame className="px-5 py-8">
      <Card tone="cream">
        <h1 className="text-center text-lg font-extrabold text-[var(--color-navy)]">생일 수정</h1>

        <div className="mt-5 flex flex-col gap-3">
          <DateField label="해녀 생일" value={haenyeoBirthday} onChange={setHaenyeoBirthday} />
          <DateField label="해남 생일" value={haenamBirthday} onChange={setHaenamBirthday} />
        </div>

        <Button tone="coral" full className="mt-6" onClick={handleSave} disabled={saving}>
          {saving ? "저장 중..." : "저장"}
        </Button>
      </Card>
    </AppFrame>
  );
}

function DateField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[13px] font-bold text-[var(--color-navy-soft)]">{label}</span>
      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-2xl border-2 border-[var(--color-navy)]/10 bg-white px-4 py-2.5 text-[15px] font-bold text-[var(--color-navy)] outline-none focus:border-[var(--color-tab-active)]"
      />
    </label>
  );
}
