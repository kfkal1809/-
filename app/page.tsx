import Image from "next/image";
import Link from "next/link";

// 오프닝 화면 — 사용자가 준 실제 일러스트(design-assets/오프닝화면.png →
// public/images/misc/opening-screen.png, 원본 그대로 복사만 함)를 그대로 배경으로 쓴다.
// CSS/SVG로 하늘·구름·갈매기·캐릭터를 다시 그리던 예전 버전을 대체 — 일러스트 속 네 캐릭터·
// 등대·배·갈매기 위치는 원본 그대로이고 여기서 새로 만들거나 옮기지 않는다.
export default function OpeningPage() {
  return (
    <div className="relative mx-auto flex h-dvh w-full max-w-[460px] flex-col overflow-hidden bg-[var(--color-sky)]">
      <Image
        src="/images/misc/opening-screen.png"
        alt=""
        aria-hidden
        fill
        unoptimized
        priority
        style={{ objectFit: "cover", objectPosition: "center" }}
      />

      {/* 상단 로고 — 하늘 여백 중앙. logo-glow.png는 "해기사와 연인들의"(1줄) + "항해일지"(크게)
          정확히 이 문구로 이미 만들어져 있던 기존 자산(투명 배경, 네이비/코랄 톤)이라 그대로 쓴다. */}
      <div className="relative z-10 flex justify-center pt-[max(30px,env(safe-area-inset-top))]">
        <Image
          src="/images/home-ui/logo-glow.png"
          alt="해기사와 연인들의 항해일지"
          width={1536}
          height={1024}
          unoptimized
          priority
          className="w-[74%] max-w-[320px]"
          style={{ height: "auto" }}
        />
      </div>

      {/* 하단 승선하기 버튼 — 기존 /auth 진입 흐름 그대로 연결(로그인·초대코드·온보딩 로직 불변) */}
      <div className="relative z-10 mt-auto flex justify-center px-6 pb-[max(30px,env(safe-area-inset-bottom))]">
        <Link
          href="/auth"
          className="inline-flex items-center gap-2 rounded-full border-2 border-[var(--color-navy)] bg-[#fffaf0] px-9 py-4 text-lg font-extrabold text-[var(--color-navy)] shadow-[0_8px_20px_rgba(36,54,90,0.28)] transition active:scale-[0.97]"
        >
          <Image src="/images/home-ui/anchor.png" alt="" aria-hidden width={44} height={44} unoptimized className="h-6 w-6" />
          승선하기
        </Link>
      </div>
    </div>
  );
}
