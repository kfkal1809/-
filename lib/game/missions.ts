import type { SupabaseClient } from "@supabase/supabase-js";
import { kstDateString, kstWeekString } from "@/lib/game/kst";
import {
  DAILY_MISSIONS,
  DAILY_CLEAR_BONUS,
  WEEKLY_MISSIONS,
  WEEKLY_CLEAR_BONUS,
  type DailyMissionDef,
  type WeeklyMissionDef,
} from "@/lib/domain/constants";

const WEEKLY_KEYS = new Set(WEEKLY_MISSIONS.map((m) => m.key));
const TARGET_BY_KEY = new Map<string, number>([
  ...DAILY_MISSIONS.map((m) => [m.key, m.target] as const),
  ...WEEKLY_MISSIONS.map((m) => [m.key, m.target] as const),
]);
const REWARD_BY_KEY = new Map<string, number>([
  ...DAILY_MISSIONS.map((m) => [m.key, m.reward] as const),
  ...WEEKLY_MISSIONS.map((m) => [m.key, m.reward] as const),
]);

// daily_clear/weekly_clear는 개별 미션이 아니라 "같은 주기 미션을 모두 완료" 메타 보너스라서
// TARGET_BY_KEY/REWARD_BY_KEY에는 없고, getMissionSnapshot에서 파생 계산한다.
export const DAILY_CLEAR_KEY = "daily_clear";
export const WEEKLY_CLEAR_KEY = "weekly_clear";

export function periodKeyForMission(missionKey: string, now: Date = new Date()): string {
  return WEEKLY_KEYS.has(missionKey) ? kstWeekString(now) : kstDateString(now);
}

// 단순 카운터형 미션(출석/방문/방명록/낚시 등) 진행도를 amount만큼 증가시킨다.
// target을 넘지 않게 clamp하고, target 도달 시 completed=true. 이미 완료된 미션은 건드리지 않는다
// (반복 호출로 progress가 계속 쌓이거나 completed가 재평가되는 것을 막기 위함).
export async function incrementMission(
  service: SupabaseClient,
  userId: string,
  missionKey: string,
  amount = 1,
  now: Date = new Date()
): Promise<void> {
  const target = TARGET_BY_KEY.get(missionKey);
  if (!target) return;
  const periodKey = periodKeyForMission(missionKey, now);

  const { data: existing } = await service
    .from("mission_progress")
    .select("progress, completed")
    .eq("user_id", userId)
    .eq("mission_key", missionKey)
    .eq("period_key", periodKey)
    .maybeSingle();

  if (existing?.completed) return;

  const nextProgress = Math.min((existing?.progress ?? 0) + amount, target);
  await service.from("mission_progress").upsert(
    {
      user_id: userId,
      mission_key: missionKey,
      period_key: periodKey,
      progress: nextProgress,
      completed: nextProgress >= target,
    },
    { onConflict: "user_id,mission_key,period_key" }
  );
}

// distinct-set 미션(cabin_visit5: 서로 다른 선실 5곳 방문, deck_visit4: 서로 다른 4일 갑판 방문) —
// metadata.seen 배열에 방문 식별자(distinctKey)를 중복 없이 누적하고, 배열 길이를 progress로 쓴다.
export async function incrementDistinctMission(
  service: SupabaseClient,
  userId: string,
  missionKey: string,
  distinctKey: string,
  now: Date = new Date()
): Promise<void> {
  const target = TARGET_BY_KEY.get(missionKey);
  if (!target) return;
  const periodKey = periodKeyForMission(missionKey, now);

  const { data: existing } = await service
    .from("mission_progress")
    .select("metadata, completed")
    .eq("user_id", userId)
    .eq("mission_key", missionKey)
    .eq("period_key", periodKey)
    .maybeSingle();

  if (existing?.completed) return;

  const existingSeen = (existing?.metadata as { seen?: unknown } | null)?.seen;
  const seen = new Set<string>(Array.isArray(existingSeen) ? (existingSeen as string[]) : []);
  if (seen.has(distinctKey)) return;
  seen.add(distinctKey);

  const nextProgress = Math.min(seen.size, target);
  await service.from("mission_progress").upsert(
    {
      user_id: userId,
      mission_key: missionKey,
      period_key: periodKey,
      progress: nextProgress,
      completed: nextProgress >= target,
      metadata: { seen: Array.from(seen) },
    },
    { onConflict: "user_id,mission_key,period_key" }
  );
}

export interface MissionSnapshotItem {
  key: string;
  title: string;
  description: string;
  target: number;
  reward: number;
  progress: number;
  completed: boolean;
  rewarded: boolean;
  periodKey: string;
}

export interface MissionSnapshot {
  daily: MissionSnapshotItem[];
  dailyClear: MissionSnapshotItem;
  weekly: MissionSnapshotItem[];
  weeklyClear: MissionSnapshotItem;
}

interface ProgressRow {
  mission_key: string;
  period_key: string;
  progress: number;
  completed: boolean;
  rewarded: boolean;
}

function toItem(
  def: DailyMissionDef | WeeklyMissionDef,
  periodKey: string,
  row: ProgressRow | undefined
): MissionSnapshotItem {
  return {
    key: def.key,
    title: def.title,
    description: def.description,
    target: def.target,
    reward: def.reward,
    progress: row?.progress ?? 0,
    completed: row?.completed ?? false,
    rewarded: row?.rewarded ?? false,
    periodKey,
  };
}

// /duties 화면 표시 및 claim 라우트의 검증에 공용으로 쓰는 스냅샷.
// daily_clear/weekly_clear는 저장된 progress row가 아니라 "그 주기 미션을 전부 completed"인지로
// 파생 계산한다(실제 mission_progress row는 claim 시점에 최초 생성됨).
export async function getMissionSnapshot(
  service: SupabaseClient,
  userId: string,
  now: Date = new Date()
): Promise<MissionSnapshot> {
  const dateKey = kstDateString(now);
  const weekKey = kstWeekString(now);

  const { data: rows } = await service
    .from("mission_progress")
    .select("mission_key, period_key, progress, completed, rewarded")
    .eq("user_id", userId)
    .in("period_key", [dateKey, weekKey]);

  const byKey = new Map<string, ProgressRow>((rows ?? []).map((r) => [`${r.mission_key}:${r.period_key}`, r]));

  const daily = DAILY_MISSIONS.map((m) => toItem(m, dateKey, byKey.get(`${m.key}:${dateKey}`)));
  const weekly = WEEKLY_MISSIONS.map((m) => toItem(m, weekKey, byKey.get(`${m.key}:${weekKey}`)));

  const dailyAllDone = daily.every((d) => d.completed);
  const dailyClearRow = byKey.get(`${DAILY_CLEAR_KEY}:${dateKey}`);
  const dailyClear: MissionSnapshotItem = {
    key: DAILY_CLEAR_KEY,
    title: "데일리 미션 올클리어",
    description: `데일리 미션 ${DAILY_MISSIONS.length}개 모두 완료`,
    target: DAILY_MISSIONS.length,
    reward: DAILY_CLEAR_BONUS,
    progress: daily.filter((d) => d.completed).length,
    completed: dailyAllDone,
    rewarded: dailyClearRow?.rewarded ?? false,
    periodKey: dateKey,
  };

  const weeklyAllDone = weekly.every((w) => w.completed);
  const weeklyClearRow = byKey.get(`${WEEKLY_CLEAR_KEY}:${weekKey}`);
  const weeklyClear: MissionSnapshotItem = {
    key: WEEKLY_CLEAR_KEY,
    title: "위클리 미션 올클리어",
    description: `위클리 미션 ${WEEKLY_MISSIONS.length}개 모두 완료`,
    target: WEEKLY_MISSIONS.length,
    reward: WEEKLY_CLEAR_BONUS,
    progress: weekly.filter((w) => w.completed).length,
    completed: weeklyAllDone,
    rewarded: weeklyClearRow?.rewarded ?? false,
    periodKey: weekKey,
  };

  return { daily, dailyClear, weekly, weeklyClear };
}

export function findMissionReward(missionKey: string): number | null {
  if (missionKey === DAILY_CLEAR_KEY) return DAILY_CLEAR_BONUS;
  if (missionKey === WEEKLY_CLEAR_KEY) return WEEKLY_CLEAR_BONUS;
  return REWARD_BY_KEY.get(missionKey) ?? null;
}
