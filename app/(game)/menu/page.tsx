import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { trySupabase } from "@/lib/supabase/safeQuery";
import { GameIcon } from "@/components/icons/GameIcon";
import { SignOutButton } from "@/components/menu/SignOutButton";

export default async function MenuPage() {
  const myCharacterId = await trySupabase(async () => {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;
    const { data } = await supabase.from("character_managers").select("character_id").eq("user_id", user.id).limit(1).maybeSingle();
    return data?.character_id ?? null;
  }, null as string | null);

  const items = [
    { href: myCharacterId ? `/boarding-pass/${myCharacterId}` : "/voyage", label: "나의 승선확인증", icon: "book" as const },
    { href: "/voyage", label: "항해일지", icon: "anchor" as const },
    { href: "/wallet", label: "지갑", icon: "coin" as const },
    { href: "/jewelry", label: "귀금속점", icon: "ring" as const },
    { href: "/marriage", label: "혼인신고", icon: "trophy" as const },
    { href: "/notifications", label: "알림", icon: "bell" as const },
  ];

  return (
    <div className="flex flex-col gap-2 px-4 pt-5">
      <h1 className="mb-1 text-lg font-extrabold text-[var(--color-navy)]">메뉴</h1>
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-[0_4px_14px_rgba(36,54,90,0.06)]"
        >
          <GameIcon name={item.icon} size={34} />
          <span className="text-[14px] font-bold text-[var(--color-navy)]">{item.label}</span>
        </Link>
      ))}

      <SignOutButton />
    </div>
  );
}
