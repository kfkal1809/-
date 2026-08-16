import { getMailboxItems } from "@/lib/game/mailboxData";
import { MailboxScreen } from "@/components/mailbox/MailboxScreen";

export default async function MailboxPage() {
  const items = await getMailboxItems();
  return <MailboxScreen items={items} />;
}
