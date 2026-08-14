-- 해기사와 연인들의 항해일지 — RLS 정책
-- 기획서 5.6장 기준: Community Read / Household Write / Character Write / Wallet(서버 전용)

-- =========================================================
-- 헬퍼 함수 (security definer로 재귀적 RLS 조회를 피한다)
-- =========================================================
create or replace function public.is_approved()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select coalesce((select approved from public.profiles where id = auth.uid()), false);
$$;

create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select coalesce((select role = 'admin' from public.profiles where id = auth.uid()), false);
$$;

create or replace function public.is_household_member(target_household uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.household_users
    where household_id = target_household and user_id = auth.uid()
  );
$$;

create or replace function public.is_character_manager(target_character uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.character_managers
    where character_id = target_character and user_id = auth.uid()
  );
$$;

create or replace function public.household_of_character(target_character uuid)
returns uuid
language sql
security definer
stable
set search_path = public
as $$
  select household_id from public.characters where id = target_character;
$$;

-- =========================================================
-- profiles
-- =========================================================
alter table public.profiles enable row level security;

create policy profiles_select on public.profiles
  for select using (auth.uid() = id or public.is_approved() or public.is_admin());

create policy profiles_update_self on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- =========================================================
-- households / household_users
-- =========================================================
alter table public.households enable row level security;
alter table public.household_users enable row level security;

create policy households_select on public.households
  for select using (public.is_approved());

create policy households_update on public.households
  for update using (public.is_household_member(id)) with check (public.is_household_member(id));

create policy household_users_select on public.household_users
  for select using (public.is_approved());

-- =========================================================
-- invite_codes — 발급자/관리자만 조회, 검증은 서버 라우트가 service role로 수행
-- =========================================================
alter table public.invite_codes enable row level security;

create policy invite_codes_select_own on public.invite_codes
  for select using (created_by = auth.uid() or public.is_admin());

-- =========================================================
-- characters / character_managers
-- =========================================================
alter table public.characters enable row level security;
alter table public.character_managers enable row level security;

create policy characters_select on public.characters
  for select using (public.is_approved());

create policy characters_update on public.characters
  for update using (public.is_household_member(household_id))
  with check (public.is_household_member(household_id));

create policy character_managers_select on public.character_managers
  for select using (public.is_approved());

-- =========================================================
-- voyages / voyage_change_logs
-- =========================================================
alter table public.voyages enable row level security;
alter table public.voyage_change_logs enable row level security;

create policy voyages_select on public.voyages
  for select using (public.is_approved());

create policy voyages_update on public.voyages
  for update
  using (public.is_household_member(public.household_of_character(haenam_character_id)))
  with check (public.is_household_member(public.household_of_character(haenam_character_id)));

create policy voyage_change_logs_select on public.voyage_change_logs
  for select using (public.is_approved());

-- =========================================================
-- wallets / wallet_transactions — 읽기만 허용, 쓰기는 service role 전용 (정책 없음 = 차단)
-- =========================================================
alter table public.wallets enable row level security;
alter table public.wallet_transactions enable row level security;

create policy wallets_select on public.wallets
  for select using (public.is_household_member(household_id) or public.is_admin());

create policy wallet_transactions_select on public.wallet_transactions
  for select using (public.is_household_member(household_id) or public.is_admin());

-- =========================================================
-- fx_rates — 전체 공개 읽기, 쓰기는 서버(cron)만
-- =========================================================
alter table public.fx_rates enable row level security;

create policy fx_rates_select on public.fx_rates for select using (true);

-- =========================================================
-- item_catalog — 전체 공개 읽기, 쓰기는 관리자만
-- =========================================================
alter table public.item_catalog enable row level security;

create policy item_catalog_select on public.item_catalog for select using (active or public.is_admin());
create policy item_catalog_admin_write on public.item_catalog
  for all using (public.is_admin()) with check (public.is_admin());

-- =========================================================
-- inventory_items / character_equipment — 읽기만, 쓰기는 서버(재화 검증) 전용
-- =========================================================
alter table public.inventory_items enable row level security;
alter table public.character_equipment enable row level security;

create policy inventory_items_select on public.inventory_items
  for select using (public.is_household_member(household_id) or public.is_admin());

create policy character_equipment_select on public.character_equipment
  for select using (public.is_approved());

create policy character_equipment_update on public.character_equipment
  for update using (public.is_character_manager(character_id))
  with check (public.is_character_manager(character_id));

create policy character_equipment_insert on public.character_equipment
  for insert with check (public.is_character_manager(character_id));

-- =========================================================
-- spaces / stores / space_items / space_visits / guestbook
-- =========================================================
alter table public.spaces enable row level security;
alter table public.stores enable row level security;
alter table public.space_items enable row level security;
alter table public.space_visits enable row level security;
alter table public.guestbook_entries enable row level security;

create policy spaces_select on public.spaces for select using (public.is_approved());

create policy spaces_update_owner on public.spaces
  for update
  using (
    (household_id is not null and public.is_household_member(household_id))
    or owner_user_id = auth.uid()
    or public.is_admin()
  )
  with check (
    (household_id is not null and public.is_household_member(household_id))
    or owner_user_id = auth.uid()
    or public.is_admin()
  );

create policy stores_select on public.stores for select using (public.is_approved());

create policy stores_update_owner on public.stores
  for update using (owner_user_id = auth.uid() or public.is_admin())
  with check (owner_user_id = auth.uid() or public.is_admin());

create policy space_items_select on public.space_items for select using (public.is_approved());

create policy space_items_write_own_cabin on public.space_items
  for all
  using (
    exists (
      select 1 from public.spaces s
      where s.id = space_items.space_id
        and s.type = 'cabin'
        and public.is_household_member(s.household_id)
    )
    or public.is_admin()
  )
  with check (
    exists (
      select 1 from public.spaces s
      where s.id = space_items.space_id
        and s.type = 'cabin'
        and public.is_household_member(s.household_id)
    )
    or public.is_admin()
  );

create policy space_visits_select on public.space_visits
  for select using (user_id = auth.uid() or public.is_admin());

create policy space_visits_insert on public.space_visits
  for insert with check (user_id = auth.uid());

create policy guestbook_select on public.guestbook_entries for select using (public.is_approved());

create policy guestbook_insert on public.guestbook_entries
  for insert with check (author_user_id = auth.uid() and public.is_approved());

-- =========================================================
-- attendance / mission_catalog / mission_progress — 읽기만, 지급은 서버 전용
-- =========================================================
alter table public.attendance enable row level security;
alter table public.mission_catalog enable row level security;
alter table public.mission_progress enable row level security;

create policy attendance_select on public.attendance
  for select using (user_id = auth.uid() or public.is_admin());

create policy mission_catalog_select on public.mission_catalog for select using (true);

create policy mission_progress_select on public.mission_progress
  for select using (user_id = auth.uid() or public.is_admin());

-- =========================================================
-- fishing_sessions / fishing_loot — 읽기만, 시작/판정은 서버 전용
-- =========================================================
alter table public.fishing_sessions enable row level security;
alter table public.fishing_loot enable row level security;

create policy fishing_sessions_select on public.fishing_sessions
  for select using (public.is_household_member(household_id) or public.is_admin());

create policy fishing_loot_select on public.fishing_loot
  for select using (
    exists (
      select 1 from public.fishing_sessions fs
      where fs.id = fishing_loot.session_id and public.is_household_member(fs.household_id)
    )
    or public.is_admin()
  );

-- =========================================================
-- store_products / store_work_logs / restaurant_orders
-- =========================================================
alter table public.store_products enable row level security;
alter table public.store_work_logs enable row level security;
alter table public.restaurant_orders enable row level security;

create policy store_products_select on public.store_products for select using (true);

create policy store_products_owner_write on public.store_products
  for all
  using (
    exists (select 1 from public.stores st where st.id = store_products.store_id and st.owner_user_id = auth.uid())
    or public.is_admin()
  )
  with check (
    exists (select 1 from public.stores st where st.id = store_products.store_id and st.owner_user_id = auth.uid())
    or public.is_admin()
  );

create policy store_work_logs_select on public.store_work_logs
  for select using (user_id = auth.uid() or public.is_admin());

create policy restaurant_orders_select on public.restaurant_orders
  for select using (public.is_household_member(household_id) or public.is_admin());

-- =========================================================
-- chat_messages / posts / store_applications
-- =========================================================
alter table public.chat_messages enable row level security;
alter table public.posts enable row level security;
alter table public.store_applications enable row level security;

create policy chat_messages_select on public.chat_messages
  for select using (public.is_approved() and deleted_at is null);

create policy chat_messages_insert on public.chat_messages
  for insert with check (user_id = auth.uid() and public.is_approved());

create policy chat_messages_admin_delete on public.chat_messages
  for update using (public.is_admin()) with check (public.is_admin());

create policy posts_select on public.posts
  for select using (
    (type = 'notice' and public.is_approved())
    or (type = 'event' and public.is_approved())
    or (type = 'suggestion' and (author_user_id = auth.uid() or public.is_admin()))
  );

create policy posts_insert_suggestion on public.posts
  for insert with check (type = 'suggestion' and author_user_id = auth.uid());

create policy posts_admin_write on public.posts
  for all using (public.is_admin()) with check (public.is_admin());

create policy store_applications_select on public.store_applications
  for select using (applicant_user_id = auth.uid() or public.is_admin());

create policy store_applications_insert on public.store_applications
  for insert with check (applicant_user_id = auth.uid());

-- =========================================================
-- couple_events / hall_of_fame / notifications
-- =========================================================
alter table public.couple_events enable row level security;
alter table public.hall_of_fame enable row level security;
alter table public.notifications enable row level security;

create policy couple_events_select on public.couple_events
  for select using (public.is_household_member(household_id) or public.is_admin());

create policy hall_of_fame_select on public.hall_of_fame for select using (public.is_approved());

create policy notifications_select on public.notifications
  for select using (user_id = auth.uid());

create policy notifications_update_own on public.notifications
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());

-- =========================================================
-- kakao_webhook_receipts — 서버 전용, 클라이언트 정책 없음(전체 차단)
-- =========================================================
alter table public.kakao_webhook_receipts enable row level security;
