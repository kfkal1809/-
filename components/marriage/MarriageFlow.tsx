"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { MARRIAGE_DOCUMENT_PRICE } from "@/lib/domain/constants";
import type { MarriageData } from "@/lib/game/marriageData";

export function MarriageFlow({ data }: { data: MarriageData }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleBuyDocument() {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/marriage/buy-document", { method: "POST" });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "failed");
      router.refresh();
    } catch (e) {
      const err = e instanceof Error ? e.message : "";
      setMessage(
        err === "insufficient_funds"
          ? "선용금이 부족해요."
          : err === "no_ring"
            ? "먼저 커플링을 맞춰주세요."
            : "혼인신고서 구매에 실패했어요."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleSign() {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/marriage/sign", { method: "POST" });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "failed");
      if (body.married) setMessage("혼인신고가 완료됐어요! 축하해요!");
      router.refresh();
    } catch {
      setMessage("서명에 실패했어요.");
    } finally {
      setLoading(false);
    }
  }

  if (!data.ready) {
    return (
      <Card tone="cream" className="py-6 text-center text-[13px] text-[var(--color-navy-soft)]">
        로그인 후 이용할 수 있어요.
      </Card>
    );
  }

  if (data.marriageStatus === "married") {
    return (
      <Card tone="cream" className="flex flex-col items-center gap-2 py-6 text-center">
        <p className="text-[14px] font-extrabold text-[var(--color-navy)]">정식 부부가 되었어요!</p>
        {data.marriedAt && (
          <p className="text-[11px] text-[var(--color-navy-soft)]">
            {new Date(data.marriedAt).toLocaleDateString("ko-KR")} 혼인신고 완료
          </p>
        )}
        <Link href="/hall-of-fame" className="mt-1 rounded-full bg-[var(--color-gold)] px-4 py-2 text-[12px] font-bold text-white">
          명예의 전당에서 보기
        </Link>
      </Card>
    );
  }

  if (data.marriageStatus === "pending_signature") {
    return (
      <Card tone="cream" className="flex flex-col items-center gap-3 py-5 text-center">
        <p className="text-[13px] font-bold text-[var(--color-navy)]">서로의 서명을 기다리고 있어요</p>
        <div className="flex flex-wrap justify-center gap-2">
          {data.members.map((m) => (
            <span
              key={m.userId}
              className={`rounded-full px-3 py-1.5 text-[11px] font-bold ${
                m.signed ? "bg-[var(--color-mint)] text-[var(--color-navy)]" : "bg-white text-[var(--color-navy-soft)]"
              }`}
            >
              {m.nickname} {m.signed ? "서명완료" : "대기중"}
            </span>
          ))}
        </div>
        {data.mySigned ? (
          <p className="text-[12px] text-[var(--color-navy-soft)]">서명 완료! 상대방을 기다리고 있어요.</p>
        ) : (
          <Button tone="coral" onClick={handleSign} disabled={loading}>
            {loading ? "서명 중..." : "나도 서명하기"}
          </Button>
        )}
        {message && <p className="text-[11px] font-bold text-[var(--color-danger)]">{message}</p>}
      </Card>
    );
  }

  // marriageStatus === "none"
  return (
    <Card tone="cream" className="flex flex-col items-center gap-3 py-5 text-center">
      {data.hasRing ? (
        <>
          <p className="text-[13px] font-bold text-[var(--color-navy)]">
            {data.ringName}을(를) 맞췄으니 이제 혼인신고서를 준비할 수 있어요!
          </p>
          <Button tone="coral" onClick={handleBuyDocument} disabled={loading}>
            {loading ? "구매 중..." : `혼인신고서 구매 $${MARRIAGE_DOCUMENT_PRICE}`}
          </Button>
        </>
      ) : (
        <>
          <p className="text-[13px] text-[var(--color-navy-soft)]">커플링을 먼저 맞춰야 혼인신고서를 구매할 수 있어요.</p>
          <Link href="/jewelry" className="rounded-full bg-[var(--color-sky-new)] px-4 py-2 text-[12px] font-bold text-white">
            귀금속점 가기
          </Link>
        </>
      )}
      {message && <p className="text-[11px] font-bold text-[var(--color-danger)]">{message}</p>}
    </Card>
  );
}
