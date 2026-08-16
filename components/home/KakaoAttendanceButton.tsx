"use client";

import { useState } from "react";

declare global {
  interface Window {
    Kakao?: {
      isInitialized: () => boolean;
      init: (key: string) => void;
      Share: {
        sendDefault: (settings: Record<string, unknown>) => void;
      };
    };
  }
}

const SDK_SRC = "https://t1.kakaocdn.net/kakao_js_sdk/2.7.2/kakao.min.js";

function loadKakaoSdk(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.Kakao) return resolve();
    const existing = document.querySelector(`script[src="${SDK_SRC}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve());
      return;
    }
    const script = document.createElement("script");
    script.src = SDK_SRC;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("kakao_sdk_load_failed"));
    document.head.appendChild(script);
  });
}

// 기획서 1.18 / 3.8: 앱 출석과 별도로 하루 1회, 카카오톡 해연결방에 출항 카드를 공유하면
// 카카오 서버가 우리 웹훅을 호출해 인증을 완료시킨다(이 버튼은 공유 창을 여는 역할만 함 —
// 실제 지급은 서버-서버 웹훅에서 비동기로 처리됨).
export function KakaoAttendanceButton({ alreadyDone }: { alreadyDone: boolean }) {
  const [status, setStatus] = useState<"idle" | "loading" | "shared" | "error">("idle");

  async function handleShare() {
    setStatus("loading");
    try {
      const nonceRes = await fetch("/api/attendance/kakao/nonce");
      if (!nonceRes.ok) throw new Error("nonce_failed");
      const { userId, date, nonce } = await nonceRes.json();

      const jsKey = process.env.NEXT_PUBLIC_KAKAO_JS_KEY;
      if (!jsKey) throw new Error("kakao_not_configured");

      await loadKakaoSdk();
      if (!window.Kakao) throw new Error("kakao_sdk_unavailable");
      if (!window.Kakao.isInitialized()) window.Kakao.init(jsKey);

      const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
      window.Kakao.Share.sendDefault({
        objectType: "feed",
        content: {
          title: "해연결호 출항 인증",
          description: "오늘도 무사히 출항했어요!",
          imageUrl: `${appUrl}/icon.png`,
          link: { webUrl: appUrl, mobileWebUrl: appUrl },
        },
        serverCallbackArgs: JSON.stringify({ userId, date, nonce }),
      });
      setStatus("shared");
    } catch {
      setStatus("error");
    }
  }

  if (alreadyDone) {
    return (
      <div className="flex flex-col items-center gap-1">
        <span className="rounded-full bg-[#fee500]/40 px-4 py-2 text-[13px] font-extrabold text-[var(--color-navy-soft)]">
          오늘 카카오 출항 인증 완료
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-1">
      <button
        onClick={handleShare}
        disabled={status === "loading"}
        className="rounded-full bg-[#fee500] px-4 py-2 text-[13px] font-extrabold text-[#3c1e1e] disabled:opacity-60"
      >
        {status === "loading" ? "여는 중..." : "카카오톡 출항 인증"}
      </button>
      {status === "shared" && (
        <p className="text-[11px] text-[var(--color-navy-soft)]">공유가 완료되면 선용금이 자동 지급돼요.</p>
      )}
      {status === "error" && <p className="text-[11px] text-[var(--color-danger)]">지금은 이용할 수 없어요.</p>}
    </div>
  );
}
