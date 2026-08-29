"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";

export default function JoinCodePage() {
  const [joinCode, setJoinCode] = useState<string | null>(null);
  const [status, setStatus] = useState<"loading" | "done" | "error">("loading");

  useEffect(() => {
    fetch("/api/household/join-code")
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => {
        setJoinCode(data.joinCode);
        setStatus("done");
      })
      .catch(() => setStatus("error"));
  }, []);

  return (
    <div className="flex flex-col gap-4 px-4 pt-5">
      <h1 className="text-lg font-extrabold text-[var(--color-navy)]">파트너 연결 코드</h1>
      <p className="text-[13px] text-[var(--color-navy-soft)]">
        상대가 아직 가입 전이거나, 상대 캐릭터를 대신 만들어뒀다면 이 코드를 상대에게 알려주세요.
        상대가 카카오 로그인 후 뜨는 화면에서 이 코드를 입력하면 같은 선실로 연결돼요.
      </p>

      {status === "loading" && <p className="text-[13px] text-[var(--color-navy-soft)]">불러오는 중...</p>}
      {status === "error" && <p className="text-[13px] font-bold text-[var(--color-danger)]">코드를 불러오지 못했어요.</p>}

      {status === "done" && joinCode && (
        <Card tone="cream" className="flex flex-col items-center text-center">
          <p className="text-xl font-extrabold tracking-widest text-[var(--color-tab-active)]">{joinCode}</p>
        </Card>
      )}
    </div>
  );
}
