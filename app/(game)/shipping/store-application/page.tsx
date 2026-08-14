"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function StoreApplicationPage() {
  const [storeName, setStoreName] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [intro, setIntro] = useState("");
  const [desiredTheme, setDesiredTheme] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (!storeName.trim()) {
      setError("가게명을 입력해주세요.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("로그인이 필요해요.");

      const { error: insertError } = await supabase.from("store_applications").insert({
        applicant_user_id: user.id,
        store_name: storeName.trim(),
        business_type: businessType.trim(),
        intro: intro.trim(),
        desired_theme: desiredTheme.trim(),
      });
      if (insertError) throw insertError;
      setDone(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "신청에 실패했어요.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-4 px-4 pt-5">
      <h1 className="text-lg font-extrabold text-[var(--color-navy)]">가게 입점 신청</h1>

      {done ? (
        <Card tone="cream" className="py-8 text-center text-[13px] font-bold text-[var(--color-navy)]">
          신청이 접수됐어요. 관리자 승인 후 가게가 열려요!
        </Card>
      ) : (
        <Card className="flex flex-col gap-3">
          <Field label="가게명" value={storeName} onChange={setStoreName} placeholder="예) 마미네 플라워" />
          <Field label="업종" value={businessType} onChange={setBusinessType} placeholder="예) 꽃집" />
          <Field label="한줄소개" value={intro} onChange={setIntro} placeholder="가게를 소개해주세요" />
          <Field label="희망 공간 컨셉" value={desiredTheme} onChange={setDesiredTheme} placeholder="예) 화이트톤 미니멀" />
          {error && <p className="text-[12px] font-bold text-[var(--color-danger)]">{error}</p>}
          <Button tone="coral" full onClick={handleSubmit} disabled={submitting}>
            {submitting ? "제출 중..." : "입점 신청하기"}
          </Button>
        </Card>
      )}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[11px] font-bold text-[var(--color-navy-soft)]">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="rounded-xl border-2 border-[var(--color-navy)]/10 px-3 py-2 text-[13px] outline-none focus:border-[var(--color-tab-active)]"
      />
    </label>
  );
}
