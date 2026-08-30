import Image from "next/image";
import Link from "next/link";
import { EMPTY_STATE_COPY } from "@/lib/domain/constants";

// 크림색 바탕에 굵은 테두리와 그림자를 준 "게시판/팻말"형 가로 배너. 아이콘은 GitHub에 새로
// 올라온 home-ui/calendar-star.png(달력+별 그림, 이전에 쓰던 icons/book.png보다 "이벤트"
// 용도에 훨씬 정확히 맞는 실제 그림)로 교체. 이벤트가 없을 때도 흰 막대만 보여주지 않도록
// 같은 카드 톤 + 같은 아이콘으로 기본 안내 배너를 만든다.
export function EventRow({ title, eventId }: { title: string | null; eventId: string | null }) {
  const icon = (
    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white shadow-[0_2px_8px_rgba(36,54,90,0.12)]">
      <Image
        src="/images/home-ui/calendar-star.png"
        alt=""
        aria-hidden
        width={1254}
        height={1254}
        unoptimized
        className="w-7"
        style={{ height: "auto" }}
      />
    </span>
  );

  if (!title || !eventId) {
    return (
      <div className="flex items-center gap-2.5 rounded-2xl border-2 border-white bg-gradient-to-b from-white to-[#f3f7fc] px-3.5 py-3 shadow-[0_4px_14px_rgba(36,54,90,0.08)]">
        {icon}
        <span className="min-w-0 text-[13px] font-bold text-[var(--color-navy-soft)]">{EMPTY_STATE_COPY.event}</span>
      </div>
    );
  }

  return (
    <Link
      href={`/shipping/events/${eventId}`}
      className="flex items-center justify-between gap-2 rounded-2xl border-2 border-white bg-gradient-to-b from-[var(--color-cream)] to-[#fff3dc] px-3.5 py-3 shadow-[0_5px_16px_rgba(36,54,90,0.14)]"
    >
      <span className="flex min-w-0 items-center gap-2.5">
        {icon}
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
