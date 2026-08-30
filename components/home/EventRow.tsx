import Image from "next/image";
import Link from "next/link";
import { EMPTY_STATE_COPY } from "@/lib/domain/constants";

// 목표 시안처럼 흐릿한 안내 문구 pill이 아니라, 크림색 바탕에 굵은 테두리와 그림자를 준
// "게시판/팻말"형 가로 배너로 — 저장소에 전용 이벤트 배너 PNG는 없다(design-assets 전수
// 검색 결과 캘린더/이벤트 전용 그림 자산 없음). 대신 아이콘은 CSS/SVG 대체가 아니라 저장소의
// 실제 그림 public/images/icons/book.png를 쓴다 — 디자이너 원본 참고 시트
// (public/images/misc/icon-sheet-source.png)가 이 파일을 "선실 방명록·공지" 용도로
// 명시해뒀고, 이벤트/공지 배너라는 용도가 그와 정확히 일치해 임의로 고른 대체가 아니다.
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
          <Image
            src="/images/icons/book.png"
            alt=""
            aria-hidden
            width={178}
            height={96}
            unoptimized
            className="w-6"
            style={{ height: "auto" }}
          />
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
