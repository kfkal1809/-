"use client";

import { useState } from "react";
import { HomeHeader } from "@/components/home/HomeHeader";
import { VoyageInfoCard } from "@/components/home/VoyageInfoCard";
import { EventRow } from "@/components/home/EventRow";
import { FunctionMenuGrid } from "@/components/home/FunctionMenuGrid";
import type { HomeData } from "@/lib/game/homeData";

export function HomeScreen({ data }: { data: HomeData }) {
  const [balance, setBalance] = useState(data.walletBalance);

  return (
    <div className="flex flex-col gap-4">
      <HomeHeader balance={balance} />

      <div className="flex flex-col gap-4 px-4">
        <VoyageInfoCard
          voyage={data.voyage}
          initialAttended={data.attendedToday}
          isDemo={data.isDemo}
          onBalanceChange={setBalance}
        />

        <EventRow title={data.activeEventTitle} eventId={data.activeEventId} />

        <div className="mt-1 rounded-[26px] border-2 border-white bg-white/60 p-4">
          <FunctionMenuGrid />
        </div>
      </div>
    </div>
  );
}
