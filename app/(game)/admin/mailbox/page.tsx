import { getAdminMailboxData } from "@/lib/game/adminData";
import { AdminMailboxSendScreen } from "@/components/mailbox/AdminMailboxSendScreen";

export default async function AdminMailboxPage() {
  const data = await getAdminMailboxData();

  if (!data.isAdmin) {
    return (
      <div className="flex flex-col gap-4 px-4 pt-5">
        <p className="text-center text-[13px] text-[var(--color-navy-soft)]">운영자만 접근할 수 있어요.</p>
      </div>
    );
  }

  return <AdminMailboxSendScreen households={data.households} items={data.items} />;
}
