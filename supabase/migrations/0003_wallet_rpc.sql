-- 해기사와 연인들의 항해일지 — 선용금 원장 RPC
-- 기획서 1.16/5.6: 모든 선용금 변동은 idempotency_key로 중복 방지되며,
-- service_role(서버 라우트/Edge Function)만 호출 가능하다. 클라이언트는 절대 직접 호출 불가.

create or replace function public.apply_wallet_transaction(
  p_household_id uuid,
  p_amount numeric,
  p_type text,
  p_idempotency_key text,
  p_metadata jsonb default '{}'::jsonb,
  p_created_by uuid default null
) returns table (applied boolean, balance numeric)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_inserted uuid;
  v_balance numeric;
begin
  insert into public.wallet_transactions (household_id, amount, type, idempotency_key, metadata_json, created_by)
  values (p_household_id, p_amount, p_type, p_idempotency_key, p_metadata, p_created_by)
  on conflict (idempotency_key) do nothing
  returning id into v_inserted;

  if v_inserted is not null then
    insert into public.wallets (household_id, cached_balance)
    values (p_household_id, p_amount)
    on conflict (household_id)
    do update set cached_balance = public.wallets.cached_balance + excluded.cached_balance, updated_at = now();
  end if;

  select cached_balance into v_balance from public.wallets where household_id = p_household_id;

  return query select (v_inserted is not null), coalesce(v_balance, 0);
end;
$$;

revoke all on function public.apply_wallet_transaction(uuid, numeric, text, text, jsonb, uuid) from public;
grant execute on function public.apply_wallet_transaction(uuid, numeric, text, text, jsonb, uuid) to service_role;
