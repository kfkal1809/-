"use client";

import Image from "next/image";

// design-assets/ui&오프닝 배경.png를 크롭한 장식 프레임(모서리만 장식, 가운데는 투명) —
// public/images/ui/reward_popup_frame.png. 가운데 빈 공간에 보상 내용을 얹어서 쓴다.
const FRAME_SRC = "/images/ui/reward_popup_frame.png";
const FRAME_ASPECT = 480 / 853; // reward_popup_frame.png 실측 가로:세로 비율

export function RewardPopup({
  title,
  amountLabel,
  description,
  onClose,
}: {
  title: string;
  amountLabel: string;
  description?: string;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-6"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-[300px]"
        style={{ aspectRatio: FRAME_ASPECT }}
        onClick={(e) => e.stopPropagation()}
      >
        <Image src={FRAME_SRC} alt="" fill unoptimized className="pointer-events-none object-contain" />
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-[16%] pb-[6%] text-center">
          <p className="text-[11px] font-extrabold tracking-wide text-[var(--color-coral-deep)]">{title}</p>
          <p className="text-[26px] font-extrabold text-[var(--color-navy)]">{amountLabel}</p>
          {description && <p className="text-[12px] font-bold text-[var(--color-navy-soft)]">{description}</p>}
          <button
            onClick={onClose}
            className="mt-1 rounded-full bg-[var(--color-navy)] px-5 py-1.5 text-[12px] font-extrabold text-white"
          >
            받기
          </button>
        </div>
      </div>
    </div>
  );
}
