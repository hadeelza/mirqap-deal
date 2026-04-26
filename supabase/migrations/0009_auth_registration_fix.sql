begin;

alter table public.users enable row level security;
alter table public.entrepreneur_profiles enable row level security;
alter table public.investor_profiles enable row level security;

drop policy if exists users_select_own on public.users;
create policy users_select_own
on public.users
for select
to authenticated
using (id = auth.uid());

drop policy if exists users_insert_own on public.users;
create policy users_insert_own
on public.users
for insert
to authenticated
with check (id = auth.uid());

drop policy if exists users_update_own on public.users;
create policy users_update_own
on public.users
for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

drop policy if exists entrepreneur_profiles_select_own on public.entrepreneur_profiles;
create policy entrepreneur_profiles_select_own
on public.entrepreneur_profiles
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists entrepreneur_profiles_insert_own on public.entrepreneur_profiles;
create policy entrepreneur_profiles_insert_own
on public.entrepreneur_profiles
for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists entrepreneur_profiles_update_own on public.entrepreneur_profiles;
create policy entrepreneur_profiles_update_own
on public.entrepreneur_profiles
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists investor_profiles_select_own on public.investor_profiles;
create policy investor_profiles_select_own
on public.investor_profiles
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists investor_profiles_insert_own on public.investor_profiles;
create policy investor_profiles_insert_own
on public.investor_profiles
for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists investor_profiles_update_own on public.investor_profiles;
create policy investor_profiles_update_own
on public.investor_profiles
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  new_role public.user_role;
begin
  new_role :=
    case
      when new.raw_user_meta_data ->> 'role' = 'investor' then 'investor'::public.user_role
      when new.raw_user_meta_data ->> 'role' = 'admin' then 'admin'::public.user_role
      else 'entrepreneur'::public.user_role
    end;

  insert into public.users (
    id,
    role,
    full_name,
    email,
    phone,
    avatar_url,
    account_status,
    is_verified,
    created_at,
    updated_at
  )
  values (
    new.id,
    new_role,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    new.email,
    coalesce(new.raw_user_meta_data ->> 'phone', ''),
    null,
    'pending'::public.account_status,
    (new.email_confirmed_at is not null),
    now(),
    now()
  )
  on conflict (id) do update
  set
    role = excluded.role,
    full_name = excluded.full_name,
    email = excluded.email,
    phone = excluded.phone,
    updated_at = now();

  if new_role = 'entrepreneur'::public.user_role then
    insert into public.entrepreneur_profiles (
      user_id,
      entrepreneur_type,
      bio,
      city,
      country,
      organization_name,
      website_url,
      linkedin_url,
      created_at,
      updated_at
    )
    values (
      new.id,
      'individual'::public.entrepreneur_type,
      null,
      null,
      null,
      null,
      null,
      null,
      now(),
      now()
    )
    on conflict (user_id) do nothing;
  elsif new_role = 'investor'::public.user_role then
    insert into public.investor_profiles (
      user_id,
      investor_type,
      organization_name,
      bio,
      website_url,
      linkedin_url,
      profile_visibility,
      is_discoverable,
      created_at,
      updated_at
    )
    values (
      new.id,
      'individual'::public.investor_type,
      null,
      null,
      null,
      null,
      'private'::public.profile_visibility,
      true,
      now(),
      now()
    )
    on conflict (user_id) do nothing;
  end if;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_auth_user();

commit;