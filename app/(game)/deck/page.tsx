import { getDeckSelf, getRecentChatMessages } from "@/lib/game/deckData";
import { DeckScreen } from "@/components/deck/DeckScreen";

export default async function DeckPage() {
  const [self, initialMessages] = await Promise.all([getDeckSelf(), getRecentChatMessages()]);
  return <DeckScreen self={self} initialMessages={initialMessages} />;
}
