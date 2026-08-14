"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { AppFrame } from "@/components/ui/AppFrame";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { SHIP_NAME } from "@/lib/domain/constants";

export default function JoinPage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!code.trim()) {
      setError("초대코드를 입력해주세요.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/invites/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (!res.ok || !data.valid) {
        setError(data.error ?? "유효하지 않은 초대코드예요.");
        setLoading(false);
        return;
      }
      router.push("/auth");
    } catch {
      setError("연결에 실패했어요. 잠시 후 다시 시도해주세요.");
      setLoading(false);
    }
  }

  return (
    <AppFrame className="items-center justify-center px-6">
      <Card tone="cream" className="w-full">
        <p className="text-center text-sm font-bold text-[var(--color-navy-soft)]">{SHIP_NAME} 승선 신청</p>
        <h1 className="mt-1 text-center text-xl font-extrabold text-[var(--color-navy)]">초대코드를 입력해주세요</h1>
        <p className="mt-2 text-center text-[12px] text-[var(--color-navy-soft)]">
          해연결 단톡방 구성원이거나, 구성원의 연인 초대코드를 받은 분만 승선할 수 있어요.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3">
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="예) HAEYEON-2026"
            autoCapitalize="characters"
            className="w-full rounded-2xl border-2 border-[var(--color-navy)]/10 bg-white px-4 py-3 text-center text-[15px] font-bold tracking-widest text-[var(--color-navy)] outline-none focus:border-[var(--color-tab-active)]"
          />
          {error && <p className="text-center text-[12px] font-bold text-[var(--color-danger)]">{error}</p>}
          <Button type="submit" tone="coral" full disabled={loading}>
            {loading ? "확인 중..." : "다음"}
          </Button>
        </form>
      </Card>
    </AppFrame>
  );
}
