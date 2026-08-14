"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function SignOutButton() {
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  }

  return (
    <button
      onClick={handleSignOut}
      className="mt-3 rounded-2xl bg-white px-4 py-3 text-left text-[13px] font-bold text-[var(--color-danger)] shadow-[0_4px_14px_rgba(36,54,90,0.06)]"
    >
      하선하기 (로그아웃)
    </button>
  );
}
