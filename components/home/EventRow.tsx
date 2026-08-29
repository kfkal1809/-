import Link from "next/link";
import { EMPTY_STATE_COPY } from "@/lib/domain/constants";

// 목표 시안처럼 흐릿한 안내 문구 pill이 아니라, 크림색 바탕에 굵은 테두리와 그림자를 준
// "게시판/팻말"형 가로 배너로 — 저장소에 전용 이벤트 배너 PNG는 없어(design-assets 전수
// 검색 결과 캘린더/이벤트 그림 자산 없음) 캘린더+별 아이콘은 기존 인라인 SVG를 확대해 재사용한다.
export function EventRow({ title, eventId }: { title: string | null; eventId: string | null }) {
  if (!title || !eventId) {
    return (
      <div className="flex items-center gap-2 rounded-2xl border-2 border-white bg-white/70 px-4 py-3 text-[13px] text-[var(--color-navy-soft)] shadow-[0_4px_14px_rgba(36,54,90,0.06)]">
        {EMPTY_STATE_COPY.event}
      </div>
    );
  }

  return (
    <Link
      href={`/shipping/events/${eventId}`}
      className="flex items-center justify-between gap-2 rounded-2xl border-2 border-white bg-gradient-to-b from-[var(--color-cream)] to-[#fff3dc] px-3.5 py-3 shadow-[0_5px_16px_rgba(36,54,90,0.14)]"
    >
      <span className="flex min-w-0 items-center gap-2.5">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white shadow-[0_2px_8px_rgba(36,54,90,0.12)]">
          <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden className="shrink-0 text-[var(--color-tab-active)]">
            <rect x="3" y="5" width="18" height="16" rx="3" fill="none" stroke="currentColor" strokeWidth="1.7" />
            <path d="M3 9h18 M8 3v4 M16 3v4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
            <path
              d="M12 12.5l1.1 2.2 2.4.35-1.75 1.7.4 2.35L12 18l-2.15 1.1.4-2.35-1.75-1.7 2.4-.35z"
              fill="var(--color-gold)"
            />
          </svg>
        </span>
        <span className="flex min-w-0 flex-col gap-0.5">
          <span className="w-max rounded-full bg-[var(--color-gold)] px-2 py-0.5 text-[11px] font-extrabold text-white">
            진행 중 이벤트
          </span>
          <span className="truncate text-[14px] font-extrabold text-[var(--color-navy)]">{title}</span>
        </span>
      </span>
      <span className="shrink-0 text-[18px] font-bold text-[var(--color-navy-soft)]">›</span>
    </Link>
  );
}
