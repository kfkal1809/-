import type { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  tone?: "coral" | "mint" | "navy" | "outline";
  full?: boolean;
}

const TONES: Record<string, string> = {
  coral: "bg-[var(--color-coral)] text-white hover:bg-[var(--color-coral-deep)]",
  mint: "bg-[var(--color-mint)] text-[var(--color-navy)] hover:bg-[var(--color-mint-deep)]",
  navy: "bg-[var(--color-navy)] text-white hover:opacity-90",
  outline: "bg-white text-[var(--color-navy)] border-2 border-[var(--color-navy)]/15 hover:border-[var(--color-navy)]/30",
};

export function Button({ tone = "coral", full, className = "", children, ...rest }: ButtonProps) {
  return (
    <button
      className={`rounded-full px-5 py-3 text-[16px] font-bold shadow-[0_4px_14px_rgba(36,54,90,0.15)] transition active:scale-[0.97] disabled:opacity-40 disabled:active:scale-100 ${
        TONES[tone]
      } ${full ? "w-full" : ""} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
