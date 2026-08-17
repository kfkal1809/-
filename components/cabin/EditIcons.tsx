// 편집 컨트롤용 얇은 선 아이콘 — emoji/이모지나 별도 PNG 크롭 없이, 게임의 파스텔 톤에
// 맞춰 stroke 기반으로 직접 그린다. 전부 currentColor를 써서 버튼 색에 맞춰 색이 바뀐다.
import type { ReactNode } from "react";

function Base({ children }: { children: ReactNode }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      {children}
    </svg>
  );
}

export function RotateLeftIcon() {
  return (
    <Base>
      <path d="M3 12a9 9 0 1 1 3 6.7" />
      <path d="M3 6v6h6" />
    </Base>
  );
}

export function RotateRightIcon() {
  return (
    <Base>
      <path d="M21 12a9 9 0 1 0-3 6.7" />
      <path d="M21 6v6h-6" />
    </Base>
  );
}

export function FacingIcon() {
  return (
    <Base>
      <path d="M3 20 L12 4 L21 20 Z" />
      <path d="M12 4 L12 14" />
    </Base>
  );
}

export function FlipIcon() {
  return (
    <Base>
      <path d="M12 3v18" strokeDasharray="2 3" />
      <path d="M17 7l3 5-3 5" />
      <path d="M7 7l-3 5 3 5" />
    </Base>
  );
}

export function ShrinkIcon() {
  return (
    <Base>
      <path d="M15 9l6-6" />
      <path d="M9 15l-6 6" />
      <path d="M15 9V4h5" />
      <path d="M9 15v5H4" />
    </Base>
  );
}

export function GrowIcon() {
  return (
    <Base>
      <path d="M9 4H4v5" />
      <path d="M15 20h5v-5" />
      <path d="M4 4l6 6" />
      <path d="M20 20l-6-6" />
    </Base>
  );
}

export function LayerForwardIcon() {
  return (
    <Base>
      <rect x="7" y="7" width="12" height="12" rx="2" />
      <path d="M4 14V6a2 2 0 0 1 2-2h8" strokeDasharray="2 3" />
    </Base>
  );
}

export function LayerBackIcon() {
  return (
    <Base>
      <rect x="5" y="5" width="12" height="12" rx="2" strokeDasharray="2 3" />
      <path d="M9 9h8a2 2 0 0 1 2 2v8" />
      <rect x="9" y="9" width="10" height="10" rx="2" />
    </Base>
  );
}

export function PickupIcon() {
  return (
    <Base>
      <path d="M4 8h16l-1.5 11a2 2 0 0 1-2 2h-9a2 2 0 0 1-2-2L4 8z" />
      <path d="M9 8V6a3 3 0 0 1 6 0v2" />
    </Base>
  );
}
