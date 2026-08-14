import { BottomNav } from "@/components/nav/BottomNav";
import { AppFrame } from "@/components/ui/AppFrame";
import { ShipEventOverlay } from "@/components/ships/ShipEventOverlay";

export default function GameLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppFrame>
      <div className="scrollbar-none flex-1 overflow-y-auto pb-6">{children}</div>
      <BottomNav />
      <ShipEventOverlay />
    </AppFrame>
  );
}
