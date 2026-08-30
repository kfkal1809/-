"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChildCharacterForm, type ChildPayload } from "@/components/onboarding/ChildCharacterForm";
import { playSfx } from "@/lib/audio/audioManager";

// 온보딩 때 새싹을 안 만들었거나 나중에 더 만들고 싶을 때를 위한 진입점 — 기존
// /onboarding/children과 완전히 같은 폼(ChildCharacterForm)과 API(/api/onboarding/children)를
// 재사용한다(온보딩 전용 로직이 아니라 그냥 "household에 새싹 추가"라 그대로 재사용 가능).
// 예전엔 선실 캐릭터 열 안에 "+" 아바타 슬롯으로 끼워 넣었는데 눈에 잘 안 띈다는 지적을 받아,
// 상단 "방꾸미기" 버튼 옆에 같은 크기의 pill 버튼으로 옮겼다(CabinRoom.tsx 참고).
export function AddChildButton({ canAdd }: { canAdd: boolean }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!canAdd) return null;

  async function handleAdd(payload: ChildPayload) {
    setError(null);
    const res = await fetch("/api/onboarding/children", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error === "child_limit_reached" ? "새싹은 최대 3명까지 만들 수 있어요." : "저장에 실패했어요. 다시 시도해주세요.");
      throw new Error("failed");
    }
    playSfx("equip");
    setOpen(false);
    router.refresh();
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="min-w-0 flex-1 whitespace-nowrap rounded-full bg-[var(--color-mint-deep)] px-4 py-2 text-[13px] font-bold text-white"
      >
        새싹 만들기
      </button>

      {open && (
        // 100vh는 모바일 브라우저 주소창이 접혔다 펼쳐지는 만큼 실제 보이는 높이와 어긋나서,
        // 주소창이 떠 있을 때 모달 아래쪽(완료 버튼 등)이 화면 밖으로 밀려 잘리는 문제가 있었다
        // — 100dvh(동적 뷰포트 높이, 주소창 상태를 실시간 반영)로 교체. 모달 자체를
        // flex-col로 나눠 제목/닫기는 shrink-0로 항상 위에 고정하고, 본문만 overflow-y-auto로
        // 스크롤되게 해서 내용이 아무리 길어도 화면을 넘는 부분만 스크롤로 접근 가능하다.
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="flex max-h-[90dvh] w-full max-w-[300px] flex-col overflow-hidden rounded-[20px] bg-white shadow-[0_10px_40px_rgba(0,0,0,0.3)]">
            <div className="flex shrink-0 items-center justify-between px-3 pb-2 pt-3">
              <p className="text-[14px] font-extrabold text-[var(--color-navy)]">새싹 추가하기</p>
              <button onClick={() => setOpen(false)} className="text-[12px] font-bold text-[var(--color-navy-soft)]">
                닫기
              </button>
            </div>
            <div className="overflow-y-auto px-3 pb-[max(12px,env(safe-area-inset-bottom))]">
              <ChildCharacterForm onSubmit={handleAdd} compact />
              {error && <p className="mt-2 text-center text-[13px] font-bold text-[var(--color-danger)]">{error}</p>}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
