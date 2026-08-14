import Image from "next/image";
import Link from "next/link";
import { CharacterSprite } from "@/components/character/CharacterSprite";
import { haenyeoPreset, haenamDeckPreset, haenamEnginePreset } from "@/lib/domain/characterPresets";
import { SHIP_NAME } from "@/lib/domain/constants";

export default function OpeningPage() {
  return (
    <div className="relative flex min-h-dvh w-full flex-col overflow-hidden bg-gradient-to-b from-[#bfe6ff] via-[#eaf6ff] to-[#fffaf0]">
      {/* 갈매기 */}
      <svg className="absolute left-[12%] top-[8%] opacity-80" width="34" height="18" viewBox="0 0 34 18">
        <path d="M2 12 Q9 2 17 10 Q25 2 32 12" stroke="#24365a" strokeWidth="2.4" fill="none" strokeLinecap="round" />
      </svg>
      <svg className="absolute right-[18%] top-[14%] opacity-70" width="24" height="13" viewBox="0 0 34 18">
        <path d="M2 12 Q9 2 17 10 Q25 2 32 12" stroke="#24365a" strokeWidth="2.4" fill="none" strokeLinecap="round" />
      </svg>

      {/* 구름 */}
      <div className="absolute left-[6%] top-[6%] h-10 w-20 rounded-full bg-white/80 blur-[1px]" />
      <div className="absolute right-[8%] top-[10%] h-8 w-16 rounded-full bg-white/70 blur-[1px]" />

      <main className="relative z-10 mx-auto flex w-full max-w-[460px] flex-1 flex-col items-center justify-center px-6 pb-10 text-center">
        <p className="text-sm font-bold tracking-wide text-[var(--color-navy-soft)]">{SHIP_NAME}에 오신 것을 환영합니다</p>
        <Image
          src="/images/misc/logo-wordmark.png"
          alt="해기사와 연인들의 항해일지"
          width={732}
          height={346}
          unoptimized
          priority
          className="mt-3 w-full max-w-[300px]"
          style={{ height: "auto" }}
        />

        <div className="mt-8 flex items-end justify-center gap-1">
          <div className="animate-floaty" style={{ animationDelay: "0s" }}>
            <CharacterSprite appearance={haenyeoPreset()} size={92} />
          </div>
          <div className="animate-floaty" style={{ animationDelay: "0.4s" }}>
            <CharacterSprite appearance={haenamDeckPreset()} size={100} />
          </div>
          <div className="animate-floaty" style={{ animationDelay: "0.2s" }}>
            <CharacterSprite appearance={haenamEnginePreset()} size={96} />
          </div>
          <div className="animate-floaty" style={{ animationDelay: "0.6s" }}>
            <CharacterSprite appearance={haenyeoPreset({ hairStyle: "pony", hairColor: "#463527", outfitColor: "#9cc9ef" })} size={90} />
          </div>
        </div>

        <div className="mt-10 w-full">
          <Link
            href="/join"
            className="inline-flex w-full items-center justify-center rounded-full bg-[var(--color-coral)] px-6 py-4 text-base font-extrabold text-white shadow-[0_8px_20px_rgba(255,122,107,0.35)] transition active:scale-[0.97]"
          >
            해연결호 승선하기
          </Link>
        </div>
      </main>

      {/* 갑판 난간 + 바다 */}
      <div className="relative z-10 mt-8">
        <svg viewBox="0 0 460 40" className="w-full" preserveAspectRatio="none">
          <rect x="0" y="18" width="460" height="4" fill="#24365a" opacity="0.5" />
          {Array.from({ length: 12 }).map((_, i) => (
            <rect key={i} x={20 + i * 38} y="6" width="4" height="18" fill="#24365a" opacity="0.5" />
          ))}
        </svg>
        <div className="relative h-44 w-full bg-[#4fb6e6]">
          <svg className="absolute inset-0 h-full w-full" viewBox="0 0 460 176" preserveAspectRatio="none">
            <path d="M0 20 Q115 0 230 20 T460 20 V176 H0 Z" fill="#63c3ee" />
            <path d="M0 46 Q115 26 230 46 T460 46 V176 H0 Z" fill="#4fb6e6" />
          </svg>
          <div className="absolute bottom-4 left-8 h-10 w-10 animate-bob rounded-full border-4 border-white/90">
            <div className="absolute inset-1 rounded-full border-2 border-[#ff9a8b]" />
          </div>
        </div>
      </div>
    </div>
  );
}
