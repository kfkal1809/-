import { GameIcon } from "@/components/icons/GameIcon";

export default function DeckPage() {
  return (
    <div className="flex flex-col gap-4 px-4 pt-5">
      <h1 className="text-lg font-extrabold text-[var(--color-navy)]">갑판 광장</h1>

      <div className="relative h-56 overflow-hidden rounded-[28px] border-2 border-white bg-gradient-to-b from-[#8fd6f7] to-[#5fb8e8] shadow-[0_6px_20px_rgba(36,54,90,0.10)]">
        <svg className="absolute inset-x-0 bottom-0 h-16 w-full" viewBox="0 0 400 60" preserveAspectRatio="none">
          <path d="M0 20 Q100 0 200 20 T400 20 V60 H0 Z" fill="#4fb6e6" />
        </svg>
        <div className="absolute left-6 top-6 h-8 w-8 rounded-full border-4 border-white/80" />
        <p className="absolute bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-white/85 px-4 py-1.5 text-[12px] font-bold text-[var(--color-navy)]">
          지금 갑판에는 아무도 없어요
        </p>
      </div>

      <div className="rounded-[24px] border-2 border-white bg-white p-4">
        <div className="flex items-center gap-2">
          <GameIcon name="deck" size={26} />
          <p className="text-[13px] font-extrabold text-[var(--color-navy)]">실시간 전체채팅</p>
        </div>
        <p className="mt-2 text-[12px] text-[var(--color-navy-soft)]">
          해연결 승인 사용자끼리 실시간으로 대화하는 기능은 다음 업데이트에서 열려요. 그때까지는 갑판 배경을 구경해주세요!
        </p>
        <div className="mt-3 flex items-center gap-2 rounded-full bg-[var(--color-sky)] px-4 py-2.5 opacity-60">
          <input disabled placeholder="메시지를 입력해보세요" className="flex-1 bg-transparent text-[12px] outline-none" />
          <span className="text-[11px] font-bold text-[var(--color-navy-soft)]">준비 중</span>
        </div>
      </div>
    </div>
  );
}
