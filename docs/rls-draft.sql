-- 陪你玩 v0.2 Postgres / Supabase RLS 草案
--
-- 重要：目前可部署 MVP 使用 Cloudflare D1；D1 不提供 PostgreSQL RLS。
-- 本檔是未來全球版若採 Supabase/Postgres 時的列級權限契約，不會被 D1 migration 套用。
-- 所有公開表單寫入、訂單狀態、退款、審核與處罰仍應經伺服器端 service role 驗證。

begin;

create schema if not exists app_private;

create or replace function app_private.current_user_id()
returns text
language sql
stable
as $$
  select auth.uid()::text
$$;

create or replace function app_private.current_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role
  from public.users
  where id = auth.uid()::text
    and status = 'active'
  limit 1
$$;

create or replace function app_private.is_owner()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(app_private.current_role() = 'owner', false)
$$;

alter table public.regions enable row level security;
alter table public.region_policies enable row level security;
alter table public.games enable row level security;
alter table public.game_servers enable row level security;
alter table public.service_categories enable row level security;
alter table public.users enable row level security;
alter table public.provider_applications enable row level security;
alter table public.provider_profiles enable row level security;
alter table public.provider_media enable row level security;
alter table public.provider_game_skills enable row level security;
alter table public.provider_services enable row level security;
alter table public.availability_slots enable row level security;
alter table public.pricing_suggestions enable row level security;
alter table public.commission_rules enable row level security;
alter table public.orders enable row level security;
alter table public.reviews enable row level security;
alter table public.favorites enable row level security;
alter table public.concierge_requests enable row level security;
alter table public.support_cases enable row level security;
alter table public.reports enable row level security;
alter table public.disputes enable row level security;
alter table public.dispute_evidence enable row level security;
alter table public.moderation_actions enable row level security;
alter table public.audit_logs enable row level security;
alter table public.owner_presence enable row level security;
alter table public.staff_roles enable row level security;
alter table public.permissions enable row level security;
alter table public.staff_role_permissions enable row level security;

-- 公開基礎資料：只讀取已啟用資料。
create policy regions_public_read
on public.regions for select
using (enabled = true);

create policy games_public_read
on public.games for select
using (enabled = true);

create policy game_servers_public_read
on public.game_servers for select
using (enabled = true);

create policy service_categories_public_read
on public.service_categories for select
using (enabled = true);

create policy pricing_suggestions_public_read
on public.pricing_suggestions for select
using (
  effective_from <= now()
  and (effective_to is null or effective_to > now())
);

-- Owner 可管理基礎資料；公開端沒有直接寫入 policy。
create policy regions_owner_all
on public.regions for all
using (app_private.is_owner())
with check (app_private.is_owner());

create policy region_policies_owner_all
on public.region_policies for all
using (app_private.is_owner())
with check (app_private.is_owner());

create policy games_owner_all
on public.games for all
using (app_private.is_owner())
with check (app_private.is_owner());

create policy game_servers_owner_all
on public.game_servers for all
using (app_private.is_owner())
with check (app_private.is_owner());

create policy service_categories_owner_all
on public.service_categories for all
using (app_private.is_owner())
with check (app_private.is_owner());

create policy pricing_suggestions_owner_all
on public.pricing_suggestions for all
using (app_private.is_owner())
with check (app_private.is_owner());

create policy commission_rules_owner_all
on public.commission_rules for all
using (app_private.is_owner())
with check (app_private.is_owner());

-- 使用者：本人可讀取與更新非角色欄位；角色／狀態更新必須走伺服器函式。
create policy users_self_read
on public.users for select
using (id = app_private.current_user_id() or app_private.is_owner());

create policy users_owner_all
on public.users for all
using (app_private.is_owner())
with check (app_private.is_owner());

-- 陪玩師申請：公開表單只呼叫安全的伺服器 endpoint；不允許 anon 直接寫表。
create policy provider_applications_owner_read
on public.provider_applications for select
using (app_private.is_owner());

create policy provider_applications_owner_update
on public.provider_applications for update
using (app_private.is_owner())
with check (app_private.is_owner());

-- 陪玩師公開資料。
create policy provider_profiles_public_read
on public.provider_profiles for select
using (status = 'active');

create policy provider_profiles_provider_update
on public.provider_profiles for update
using (user_id = app_private.current_user_id())
with check (user_id = app_private.current_user_id());

create policy provider_profiles_owner_all
on public.provider_profiles for all
using (app_private.is_owner())
with check (app_private.is_owner());

create policy provider_media_public_read_verified
on public.provider_media for select
using (
  verification_status = 'verified'
  and media_type in ('profile_photo', 'voice_sample')
);

create policy provider_media_owner_all
on public.provider_media for all
using (app_private.is_owner())
with check (app_private.is_owner());

create policy provider_game_skills_public_read
on public.provider_game_skills for select
using (true);

create policy provider_game_skills_owner_all
on public.provider_game_skills for all
using (app_private.is_owner())
with check (app_private.is_owner());

create policy provider_services_public_read
on public.provider_services for select
using (enabled = true);

create policy provider_services_provider_update
on public.provider_services for update
using (
  exists (
    select 1 from public.provider_profiles p
    where p.id = provider_services.provider_id
      and p.user_id = app_private.current_user_id()
  )
)
with check (
  exists (
    select 1 from public.provider_profiles p
    where p.id = provider_services.provider_id
      and p.user_id = app_private.current_user_id()
  )
);

create policy provider_services_owner_all
on public.provider_services for all
using (app_private.is_owner())
with check (app_private.is_owner());

create policy availability_public_read_open
on public.availability_slots for select
using (status = 'open' and starts_at > now());

create policy availability_provider_all
on public.availability_slots for all
using (
  exists (
    select 1 from public.provider_profiles p
    where p.id = availability_slots.provider_id
      and p.user_id = app_private.current_user_id()
  )
)
with check (
  exists (
    select 1 from public.provider_profiles p
    where p.id = availability_slots.provider_id
      and p.user_id = app_private.current_user_id()
  )
);

create policy availability_owner_all
on public.availability_slots for all
using (app_private.is_owner())
with check (app_private.is_owner());

-- 訂單：玩家與陪玩師只看到與自己有關的訂單；建立、計價快照與狀態轉移均走伺服器。
create policy orders_party_read
on public.orders for select
using (
  player_id = app_private.current_user_id()
  or exists (
    select 1 from public.provider_profiles p
    where p.id = orders.provider_id
      and p.user_id = app_private.current_user_id()
  )
  or app_private.is_owner()
);

create policy orders_owner_update
on public.orders for update
using (app_private.is_owner())
with check (app_private.is_owner());

-- 評價：只公開已完成訂單；建立評價必須走伺服器檢查「已付款且 completed」。
create policy reviews_public_read_completed
on public.reviews for select
using (
  exists (
    select 1 from public.orders o
    where o.id = reviews.order_id
      and o.status = 'completed'
  )
);

create policy reviews_owner_all
on public.reviews for all
using (app_private.is_owner())
with check (app_private.is_owner());

-- 收藏只屬於玩家本人。
create policy favorites_self_all
on public.favorites for all
using (player_id = app_private.current_user_id())
with check (player_id = app_private.current_user_id());

-- 人工派單與客服表單由伺服器寫入，前端只讀自己的案件。
create policy concierge_party_read
on public.concierge_requests for select
using (player_id = app_private.current_user_id() or app_private.is_owner());

create policy concierge_owner_update
on public.concierge_requests for update
using (app_private.is_owner())
with check (app_private.is_owner());

create policy support_cases_party_read
on public.support_cases for select
using (opened_by_user_id = app_private.current_user_id() or app_private.is_owner());

create policy support_cases_owner_update
on public.support_cases for update
using (app_private.is_owner())
with check (app_private.is_owner());

create policy reports_party_read
on public.reports for select
using (reporter_user_id = app_private.current_user_id() or app_private.is_owner());

create policy reports_owner_update
on public.reports for update
using (app_private.is_owner())
with check (app_private.is_owner());

create policy disputes_party_read
on public.disputes for select
using (
  opened_by_user_id = app_private.current_user_id()
  or exists (
    select 1 from public.orders o
    join public.provider_profiles p on p.id = o.provider_id
    where o.id = disputes.order_id
      and p.user_id = app_private.current_user_id()
  )
  or app_private.is_owner()
);

create policy disputes_owner_update
on public.disputes for update
using (app_private.is_owner())
with check (app_private.is_owner());

create policy dispute_evidence_party_read
on public.dispute_evidence for select
using (
  submitted_by_user_id = app_private.current_user_id()
  or exists (
    select 1 from public.disputes d
    where d.id = dispute_evidence.dispute_id
      and d.opened_by_user_id = app_private.current_user_id()
  )
  or app_private.is_owner()
);

-- 處罰與稽核只有 Owner 可讀寫；公開端不得直接建立。
create policy moderation_actions_owner_all
on public.moderation_actions for all
using (app_private.is_owner())
with check (app_private.is_owner());

create policy audit_logs_owner_read
on public.audit_logs for select
using (app_private.is_owner());

-- Owner 在線狀態可公開讀取，但只能由 Owner 更新。
create policy owner_presence_public_read
on public.owner_presence for select
using (true);

create policy owner_presence_owner_all
on public.owner_presence for all
using (app_private.is_owner())
with check (app_private.is_owner());

-- 未來員工權限擴充：第一版只允許 Owner 管理。
create policy staff_roles_owner_all
on public.staff_roles for all
using (app_private.is_owner())
with check (app_private.is_owner());

create policy permissions_owner_all
on public.permissions for all
using (app_private.is_owner())
with check (app_private.is_owner());

create policy staff_role_permissions_owner_all
on public.staff_role_permissions for all
using (app_private.is_owner())
with check (app_private.is_owner());

commit;

-- 上線前必做：
-- 1. 以實際 Supabase schema 重新產生並測試，不可直接複製到正式環境。
-- 2. 用獨立測試帳號覆蓋 player / provider / owner / anon 的 select、insert、update、delete。
-- 3. 所有金額快照、訂單狀態、退款、處罰與 audit log 只由伺服器端交易函式寫入。
-- 4. 驗證 security definer 函式固定 search_path，且 app_private 不授權給一般 client 執行任意函式。
