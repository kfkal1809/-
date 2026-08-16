import { getDeckSelf, getRecentChatMessages } from "@/lib/game/deckData";
import { DeckScreen } from "@/components/deck/DeckScreen";
import { MissionPing } from "@/components/duties/MissionPing";

export default async function DeckPage() {
  const [self, initialMessages] = await Promise.all([getDeckSelf(), getRecentChatMessages()]);
  return (
    <>
      <MissionPing space="deck" />
      <DeckScreen self={self} initialMessages={initialMessages} />
    </>
  );
}
