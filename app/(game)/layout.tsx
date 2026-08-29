import { BottomNav } from "@/components/nav/BottomNav";
import { GlobalBackButton } from "@/components/nav/GlobalBackButton";
import { AppFrame } from "@/components/ui/AppFrame";
import { ShipEventOverlay } from "@/components/ships/ShipEventOverlay";

export default function GameLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppFrame>
      <GlobalBackButton />
      {/* 예전엔 이 컨테이너가 flex-1이라 짧은 화면(홈 등)에서도 뷰포트 높이만큼 억지로
          늘어나서, 콘텐츠와 하단 네비게이션 사이에 의도치 않은 빈 여백이 생겼다. 이제는
          콘텐츠 높이만큼만 자연스럽게 차지하고, 네비게이션은 아래에서 fixed로 화면 하단에
          별도 고정한다(BottomNav의 pb-28은 그 네비게이션에 콘텐츠가 가리지 않도록 확보한
          여백). */}
      <div className="scrollbar-none overflow-y-auto pb-28">{children}</div>
      <BottomNav />
      <ShipEventOverlay />
    </AppFrame>
  );
}
