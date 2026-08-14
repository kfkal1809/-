import Link from "next/link";
import { EMPTY_STATE_COPY } from "@/lib/domain/constants";

export function EventRow({ title, eventId }: { title: string | null; eventId: string | null }) {
  if (!title || !eventId) {
    return (
      <div className="flex items-center gap-2 rounded-full bg-white/70 px-4 py-2.5 text-[12px] text-[var(--color-navy-soft)]">
        {EMPTY_STATE_COPY.event}
      </div>
    );
  }

  return (
    <Link
      href={`/shipping/events/${eventId}`}
      className="flex items-center justify-between rounded-full bg-white px-4 py-2.5 shadow-[0_4px_14px_rgba(36,54,90,0.08)]"
    >
      <span className="flex items-center gap-2 text-[12px]">
        <span className="rounded-full bg-[var(--color-gold)] px-2 py-0.5 text-[10px] font-extrabold text-white">
          진행 중 이벤트
        </span>
        <span className="font-bold text-[var(--color-navy)]">{title}</span>
      </span>
      <span className="text-[var(--color-navy-soft)]">›</span>
    </Link>
  );
}
