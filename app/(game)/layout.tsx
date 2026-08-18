import { BottomNav } from "@/components/nav/BottomNav";
import { GlobalBackButton } from "@/components/nav/GlobalBackButton";
import { AppFrame } from "@/components/ui/AppFrame";
import { ShipEventOverlay } from "@/components/ships/ShipEventOverlay";

export default function GameLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppFrame>
      <GlobalBackButton />
      <div className="scrollbar-none flex-1 overflow-y-auto pb-6">{children}</div>
      <BottomNav />
      <ShipEventOverlay />
    </AppFrame>
  );
}
