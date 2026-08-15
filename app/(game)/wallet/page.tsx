import { createClient, createServiceClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/Card";
import { GameIcon } from "@/components/icons/GameIcon";
import { CURRENCY_DISCLAIMER } from "@/lib/domain/constants";
import { grantDailyInterest } from "@/lib/game/interest";
import { getTodayFxRate } from "@/lib/game/fxRate";

const TYPE_LABEL: Record<string, string> = {
  welcome_grant: "신규 승선자 보급 선용금",
  app_attendance: "앱 출항 보상",
  kakao_attendance: "카카오 출항 인증",
  daily_mission: "데일리 미션",
  weekly_mission: "주간 미션",
  fishing_sale: "낚시 판매",
  store_work: "가게 알바",
  restaurant_purchase: "선내식당 이용",
  store_purchase: "상점 구매",
  ring_purchase: "커플링 구매",
  marriage_document: "혼인신고서",
  restore_cost: "분실물 복원 비용",
  restore_reward: "분실물 복원 보상",
  interest: "선내 외화이자",
  duplicate_refund: "중복 아이템 환급",
  admin_adjustment: "운영자 조정",
};

export default async function WalletPage() {
  let balance = 0;
  let transactions: { id: string; amount: number; type: string; created_at: string }[] = [];
  let newInterest: number | null = null;
  let fxRate: number | null = null;

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { data: membership } = await supabase.from("household_users").select("household_id").eq("user_id", user.id).maybeSingle();
      if (membership) {
        const service = createServiceClient();
        newInterest = await grantDailyInterest(service, membership.household_id, user.id);
        fxRate = await getTodayFxRate(service);

        const [{ data: wallet }, { data: txs }] = await Promise.all([
          supabase.from("wallets").select("cached_balance").eq("household_id", membership.household_id).maybeSingle(),
          supabase
            .from("wallet_transactions")
            .select("id, amount, type, created_at")
            .eq("household_id", membership.household_id)
            .order("created_at", { ascending: false })
            .limit(30),
        ]);
        balance = wallet?.cached_balance ?? 0;
        transactions = txs ?? [];
      }
    }
  } catch {
    // Supabase 미연결 상태에서도 화면은 빈 상태로 렌더링한다.
  }

  return (
    <div className="flex flex-col gap-4 px-4 pt-5">
      <h1 className="text-lg font-extrabold text-[var(--color-navy)]">지갑</h1>

      <Card tone="cream" className="flex items-center justify-between !p-5">
        <div>
          <p className="text-[11px] font-bold text-[var(--color-navy-soft)]">공동 선용금</p>
          <p className="text-2xl font-extrabold text-[var(--color-navy)]">${balance.toFixed(2)}</p>
        </div>
        <GameIcon name="coin" size={54} />
      </Card>
      {newInterest !== null && (
        <p className="text-center text-[12px] font-bold text-[var(--color-mint-deep)]">
          오늘의 선내 외화이자 +${newInterest.toFixed(2)} 적립됐어요!
        </p>
      )}

      {fxRate !== null && (
        <div className="flex items-center justify-between rounded-2xl bg-white/70 px-4 py-2.5">
          <p className="text-[11px] font-bold text-[var(--color-navy-soft)]">오늘의 선상 환율</p>
          <p className="text-[12px] font-extrabold text-[var(--color-navy)]">
            $1 = ₩{fxRate.toLocaleString("ko-KR")}
            <span className="ml-2 font-normal text-[var(--color-navy-soft)]">
              (내 선용금 ≈ ₩{Math.round(balance * fxRate).toLocaleString("ko-KR")})
            </span>
          </p>
        </div>
      )}

      <p className="text-center text-[11px] text-[var(--color-navy-soft)]">{CURRENCY_DISCLAIMER}</p>

      <div className="flex flex-col gap-2">
        {transactions.map((t) => (
          <Card key={t.id} className="flex items-center justify-between !p-3">
            <div>
              <p className="text-[12px] font-bold text-[var(--color-navy)]">{TYPE_LABEL[t.type] ?? t.type}</p>
              <p className="text-[10px] text-[var(--color-navy-soft)]">{new Date(t.created_at).toLocaleString("ko-KR")}</p>
            </div>
            <p className={`text-[14px] font-extrabold ${t.amount >= 0 ? "text-[var(--color-mint-deep)]" : "text-[var(--color-danger)]"}`}>
              {t.amount >= 0 ? "+" : ""}
              {t.amount}
            </p>
          </Card>
        ))}
      </div>
    </div>
  );
}
