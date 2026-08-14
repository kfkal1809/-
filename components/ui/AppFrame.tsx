export function AppFrame({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className="min-h-dvh w-full bg-gradient-to-b from-[var(--color-sky)] to-[var(--color-sky-deep)]">
      <div className={`relative mx-auto flex min-h-dvh w-full max-w-[460px] flex-col overflow-hidden bg-[var(--color-sky)] ${className}`}>
        {children}
      </div>
    </div>
  );
}
