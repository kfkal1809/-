// 신규 아이템 NEW 배지 — 반드시 스카이블루 (기획서 A-4 / 1.28)
export function NewBadge({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full bg-[var(--color-sky-new)] px-2 py-0.5 text-[10px] font-extrabold text-white shadow-sm ${className}`}
    >
      NEW
    </span>
  );
}
