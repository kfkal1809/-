export function Card({
  children,
  className = "",
  tone = "surface",
}: {
  children: React.ReactNode;
  className?: string;
  tone?: "surface" | "cream" | "aqua";
}) {
  const bg =
    tone === "cream" ? "bg-[var(--color-cream)]" : tone === "aqua" ? "bg-[var(--color-aqua)]" : "bg-[var(--color-surface)]";
  return (
    <div
      className={`rounded-[26px] border-2 border-white ${bg} p-4 shadow-[0_6px_20px_rgba(36,54,90,0.10)] ${className}`}
    >
      {children}
    </div>
  );
}
