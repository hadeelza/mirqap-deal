create or replace function public.current_user_role()
returns public.user_role
language sql
stable
security definer
set search_path = public
as $$
  select u.role
  from public.users u
  where u.id = auth.uid()
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.users u
    where u.id = auth.uid()
      and u.role = 'admin'
  )
$$;

create or replace function public.is_investor()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.users u
    where u.id = auth.uid()
      and u.role = 'investor'
  )
$$;

create or replace function public.is_entrepreneur()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.users u
    where u.id = auth.uid()
      and u.role = 'entrepreneur'
  )
$$;

alter table public.users enable row level security;
alter table public.entrepreneur_profiles enable row level security;
alter table public.investor_profiles enable row level security;
alter table public.investor_preferences enable row level security;
alter table public.investor_preference_categories enable row level security;
alter table public.investor_preference_stages enable row level security;
alter table public.investor_preference_risk_levels enable row level security;
alter table public.investor_preference_technologies enable row level security;
alter table public.project_categories enable row level security;
alter table public.technologies enable row level security;
alter table public.projects enable row level security;
alter table public.project_technologies enable row level security;
alter table public.project_files enable row level security;
alter table public.ai_questionnaires enable row level security;
alter table public.ai_questionnaire_items enable row level security;
alter table public.project_ai_evaluations enable row level security;
alter table public.ai_simulations enable row level security;
alter table public.investment_offers enable row level security;
alter table public.deals enable row level security;
alter table public.investor_project_interests enable row level security;
alter table public.chats enable row level security;
alter table public.chat_messages enable row level security;
alter table public.notifications enable row level security;
alter table public.project_actions enable row level security;

create policy users_select_self_or_admin
on public.users
for select
to authenticated
using (
  (select auth.uid()) = id
  or (select public.is_admin())
);

create policy users_update_self_or_admin
on public.users
for update
to authenticated
using (
  (select auth.uid()) = id
  or (select public.is_admin())
)
with check (
  (select auth.uid()) = id
  or (select public.is_admin())
);

create policy entrepreneur_profiles_select
on public.entrepreneur_profiles
for select
to authenticated
using (
  (select auth.uid()) = user_id
  or (select public.is_admin())
  or exists (
    select 1
    from public.projects p
    where p.entrepreneur_id = entrepreneur_profiles.user_id
      and p.approval_status = 'approved'
      and p.publication_status = 'published'
  )
);

create policy entrepreneur_profiles_insert
on public.entrepreneur_profiles
for insert
to authenticated
with check (
  (select auth.uid()) = user_id
  or (select public.is_admin())
);

create policy entrepreneur_profiles_update
on public.entrepreneur_profiles
for update
to authenticated
using (
  (select auth.uid()) = user_id
  or (select public.is_admin())
)
with check (
  (select auth.uid()) = user_id
  or (select public.is_admin())
);

create policy entrepreneur_profiles_delete
on public.entrepreneur_profiles
for delete
to authenticated
using (
  (select auth.uid()) = user_id
  or (select public.is_admin())
);

create policy investor_profiles_select
on public.investor_profiles
for select
to authenticated
using (
  (select auth.uid()) = user_id
  or (select public.is_admin())
  or (
    profile_visibility = 'public'
    and is_discoverable = true
  )
);

create policy investor_profiles_insert
on public.investor_profiles
for insert
to authenticated
with check (
  (select auth.uid()) = user_id
  or (select public.is_admin())
);

create policy investor_profiles_update
on public.investor_profiles
for update
to authenticated
using (
  (select auth.uid()) = user_id
  or (select public.is_admin())
)
with check (
  (select auth.uid()) = user_id
  or (select public.is_admin())
);

create policy investor_profiles_delete
on public.investor_profiles
for delete
to authenticated
using (
  (select auth.uid()) = user_id
  or (select public.is_admin())
);

create policy investor_preferences_select
on public.investor_preferences
for select
to authenticated
using (
  (select auth.uid()) = investor_id
  or (select public.is_admin())
);

create policy investor_preferences_insert
on public.investor_preferences
for insert
to authenticated
with check (
  (select auth.uid()) = investor_id
  or (select public.is_admin())
);

create policy investor_preferences_update
on public.investor_preferences
for update
to authenticated
using (
  (select auth.uid()) = investor_id
  or (select public.is_admin())
)
with check (
  (select auth.uid()) = investor_id
  or (select public.is_admin())
);

create policy investor_preferences_delete
on public.investor_preferences
for delete
to authenticated
using (
  (select auth.uid()) = investor_id
  or (select public.is_admin())
);

create policy investor_preference_categories_all
on public.investor_preference_categories
for all
to authenticated
using (
  (select auth.uid()) = investor_id
  or (select public.is_admin())
)
with check (
  (select auth.uid()) = investor_id
  or (select public.is_admin())
);

create policy investor_preference_stages_all
on public.investor_preference_stages
for all
to authenticated
using (
  (select auth.uid()) = investor_id
  or (select public.is_admin())
)
with check (
  (select auth.uid()) = investor_id
  or (select public.is_admin())
);

create policy investor_preference_risk_levels_all
on public.investor_preference_risk_levels
for all
to authenticated
using (
  (select auth.uid()) = investor_id
  or (select public.is_admin())
)
with check (
  (select auth.uid()) = investor_id
  or (select public.is_admin())
);

create policy investor_preference_technologies_all
on public.investor_preference_technologies
for all
to authenticated
using (
  (select auth.uid()) = investor_id
  or (select public.is_admin())
)
with check (
  (select auth.uid()) = investor_id
  or (select public.is_admin())
);

create policy project_categories_select
on public.project_categories
for select
to authenticated
using (true);

create policy project_categories_admin_write
on public.project_categories
for all
to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));

create policy technologies_select
on public.technologies
for select
to authenticated
using (true);

create policy technologies_admin_write
on public.technologies
for all
to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));

create policy projects_select
on public.projects
for select
to authenticated
using (
  (select public.is_admin())
  or entrepreneur_id = (select auth.uid())
  or (
    approval_status = 'approved'
    and publication_status = 'published'
  )
);

create policy projects_insert
on public.projects
for insert
to authenticated
with check (
  entrepreneur_id = (select auth.uid())
  and (select public.is_entrepreneur())
  and approval_status in ('draft', 'submitted')
  and publication_status = 'private'
);

create policy projects_update
on public.projects
for update
to authenticated
using (
  (select public.is_admin())
  or entrepreneur_id = (select auth.uid())
)
with check (
  (select public.is_admin())
  or (
    entrepreneur_id = (select auth.uid())
    and approval_status in ('draft', 'submitted', 'changes_requested')
    and publication_status = 'private'
  )
);

create policy projects_delete
on public.projects
for delete
to authenticated
using (
  (select public.is_admin())
  or (
    entrepreneur_id = (select auth.uid())
    and approval_status in ('draft', 'changes_requested', 'rejected')
  )
);

create policy project_technologies_select
on public.project_technologies
for select
to authenticated
using (
  exists (
    select 1
    from public.projects p
    where p.id = project_technologies.project_id
      and (
        p.entrepreneur_id = (select auth.uid())
        or (select public.is_admin())
        or (
          p.approval_status = 'approved'
          and p.publication_status = 'published'
        )
      )
  )
);

create policy project_technologies_write
on public.project_technologies
for all
to authenticated
using (
  exists (
    select 1
    from public.projects p
    where p.id = project_technologies.project_id
      and (
        p.entrepreneur_id = (select auth.uid())
        or (select public.is_admin())
      )
  )
)
with check (
  exists (
    select 1
    from public.projects p
    where p.id = project_technologies.project_id
      and (
        p.entrepreneur_id = (select auth.uid())
        or (select public.is_admin())
      )
  )
);

create policy project_files_select
on public.project_files
for select
to authenticated
using (
  exists (
    select 1
    from public.projects p
    where p.id = project_files.project_id
      and (
        p.entrepreneur_id = (select auth.uid())
        or (select public.is_admin())
      )
  )
);

create policy project_files_insert
on public.project_files
for insert
to authenticated
with check (
  (
    uploaded_by = (select auth.uid())
    and exists (
      select 1
      from public.projects p
      where p.id = project_files.project_id
        and p.entrepreneur_id = (select auth.uid())
    )
  )
  or (select public.is_admin())
);

create policy project_files_update
on public.project_files
for update
to authenticated
using (
  uploaded_by = (select auth.uid())
  or exists (
    select 1
    from public.projects p
    where p.id = project_files.project_id
      and p.entrepreneur_id = (select auth.uid())
  )
  or (select public.is_admin())
)
with check (
  uploaded_by = (select auth.uid())
  or exists (
    select 1
    from public.projects p
    where p.id = project_files.project_id
      and p.entrepreneur_id = (select auth.uid())
  )
  or (select public.is_admin())
);

create policy project_files_delete
on public.project_files
for delete
to authenticated
using (
  uploaded_by = (select auth.uid())
  or exists (
    select 1
    from public.projects p
    where p.id = project_files.project_id
      and p.entrepreneur_id = (select auth.uid())
  )
  or (select public.is_admin())
);

create policy ai_questionnaires_select
on public.ai_questionnaires
for select
to authenticated
using (
  exists (
    select 1
    from public.projects p
    where p.id = ai_questionnaires.project_id
      and (
        p.entrepreneur_id = (select auth.uid())
        or (select public.is_admin())
      )
  )
);

create policy ai_questionnaires_insert
on public.ai_questionnaires
for insert
to authenticated
with check (
  exists (
    select 1
    from public.projects p
    where p.id = ai_questionnaires.project_id
      and (
        p.entrepreneur_id = (select auth.uid())
        or (select public.is_admin())
      )
  )
);

create policy ai_questionnaires_update
on public.ai_questionnaires
for update
to authenticated
using (
  exists (
    select 1
    from public.projects p
    where p.id = ai_questionnaires.project_id
      and (
        p.entrepreneur_id = (select auth.uid())
        or (select public.is_admin())
      )
  )
)
with check (
  exists (
    select 1
    from public.projects p
    where p.id = ai_questionnaires.project_id
      and (
        p.entrepreneur_id = (select auth.uid())
        or (select public.is_admin())
      )
  )
);

create policy ai_questionnaire_items_select
on public.ai_questionnaire_items
for select
to authenticated
using (
  exists (
    select 1
    from public.ai_questionnaires q
    join public.projects p on p.id = q.project_id
    where q.id = ai_questionnaire_items.questionnaire_id
      and (
        p.entrepreneur_id = (select auth.uid())
        or (select public.is_admin())
      )
  )
);

create policy ai_questionnaire_items_insert
on public.ai_questionnaire_items
for insert
to authenticated
with check (
  exists (
    select 1
    from public.ai_questionnaires q
    join public.projects p on p.id = q.project_id
    where q.id = ai_questionnaire_items.questionnaire_id
      and (
        p.entrepreneur_id = (select auth.uid())
        or (select public.is_admin())
      )
  )
);

create policy ai_questionnaire_items_update
on public.ai_questionnaire_items
for update
to authenticated
using (
  exists (
    select 1
    from public.ai_questionnaires q
    join public.projects p on p.id = q.project_id
    where q.id = ai_questionnaire_items.questionnaire_id
      and (
        p.entrepreneur_id = (select auth.uid())
        or (select public.is_admin())
      )
  )
)
with check (
  exists (
    select 1
    from public.ai_questionnaires q
    join public.projects p on p.id = q.project_id
    where q.id = ai_questionnaire_items.questionnaire_id
      and (
        p.entrepreneur_id = (select auth.uid())
        or (select public.is_admin())
      )
  )
);

create policy project_ai_evaluations_select
on public.project_ai_evaluations
for select
to authenticated
using (
  exists (
    select 1
    from public.projects p
    where p.id = project_ai_evaluations.project_id
      and (
        p.entrepreneur_id = (select auth.uid())
        or (select public.is_admin())
        or (
          p.approval_status = 'approved'
          and p.publication_status = 'published'
        )
      )
  )
);

create policy project_ai_evaluations_insert
on public.project_ai_evaluations
for insert
to authenticated
with check (
  exists (
    select 1
    from public.projects p
    where p.id = project_ai_evaluations.project_id
      and (
        p.entrepreneur_id = (select auth.uid())
        or (select public.is_admin())
      )
  )
);

create policy ai_simulations_select
on public.ai_simulations
for select
to authenticated
using (
  initiated_by = (select auth.uid())
  or (select public.is_admin())
  or exists (
    select 1
    from public.projects p
    where p.id = ai_simulations.project_id
      and p.entrepreneur_id = (select auth.uid())
  )
);

create policy ai_simulations_insert
on public.ai_simulations
for insert
to authenticated
with check (
  initiated_by = (select auth.uid())
  and (
    exists (
      select 1
      from public.projects p
      where p.id = ai_simulations.project_id
        and p.entrepreneur_id = (select auth.uid())
    )
    or (select public.is_admin())
  )
);

create policy investment_offers_select
on public.investment_offers
for select
to authenticated
using (
  investor_id = (select auth.uid())
  or entrepreneur_id = (select auth.uid())
  or (select public.is_admin())
);

create policy investment_offers_insert
on public.investment_offers
for insert
to authenticated
with check (
  investor_id = (select auth.uid())
  and (select public.is_investor())
  and exists (
    select 1
    from public.projects p
    where p.id = investment_offers.project_id
      and p.entrepreneur_id = investment_offers.entrepreneur_id
      and p.approval_status = 'approved'
      and p.publication_status = 'published'
      and p.investment_status = 'open'
  )
);

create policy investment_offers_update
on public.investment_offers
for update
to authenticated
using (
  investor_id = (select auth.uid())
  or entrepreneur_id = (select auth.uid())
  or (select public.is_admin())
)
with check (
  (select public.is_admin())
  or (
    investor_id = (select auth.uid())
    and status in ('pending', 'negotiating', 'withdrawn')
  )
  or (
    entrepreneur_id = (select auth.uid())
    and status in ('accepted', 'rejected', 'negotiating')
  )
);

create policy investment_offers_delete
on public.investment_offers
for delete
to authenticated
using (
  (select public.is_admin())
  or (
    investor_id = (select auth.uid())
    and status in ('pending', 'withdrawn')
  )
);

create policy deals_select
on public.deals
for select
to authenticated
using (
  investor_id = (select auth.uid())
  or entrepreneur_id = (select auth.uid())
  or (select public.is_admin())
);

create policy deals_insert
on public.deals
for insert
to authenticated
with check (
  (
    investor_id = (select auth.uid())
    or entrepreneur_id = (select auth.uid())
    or (select public.is_admin())
  )
  and exists (
    select 1
    from public.investment_offers o
    where o.id = deals.offer_id
      and o.project_id = deals.project_id
      and o.investor_id = deals.investor_id
      and o.entrepreneur_id = deals.entrepreneur_id
      and o.status = 'accepted'
  )
);

create policy deals_update
on public.deals
for update
to authenticated
using (
  investor_id = (select auth.uid())
  or entrepreneur_id = (select auth.uid())
  or (select public.is_admin())
)
with check (
  investor_id = (select auth.uid())
  or entrepreneur_id = (select auth.uid())
  or (select public.is_admin())
);

create policy investor_project_interests_select
on public.investor_project_interests
for select
to authenticated
using (
  investor_id = (select auth.uid())
  or (select public.is_admin())
  or exists (
    select 1
    from public.projects p
    where p.id = investor_project_interests.project_id
      and p.entrepreneur_id = (select auth.uid())
  )
);

create policy investor_project_interests_insert
on public.investor_project_interests
for insert
to authenticated
with check (
  investor_id = (select auth.uid())
  and (select public.is_investor())
);

create policy investor_project_interests_delete
on public.investor_project_interests
for delete
to authenticated
using (
  investor_id = (select auth.uid())
  or (select public.is_admin())
);

create policy chats_select
on public.chats
for select
to authenticated
using (
  investor_id = (select auth.uid())
  or entrepreneur_id = (select auth.uid())
  or (select public.is_admin())
);

create policy chats_insert
on public.chats
for insert
to authenticated
with check (
  investor_id = (select auth.uid())
  or entrepreneur_id = (select auth.uid())
  or (select public.is_admin())
);

create policy chats_update
on public.chats
for update
to authenticated
using (
  investor_id = (select auth.uid())
  or entrepreneur_id = (select auth.uid())
  or (select public.is_admin())
)
with check (
  investor_id = (select auth.uid())
  or entrepreneur_id = (select auth.uid())
  or (select public.is_admin())
);

create policy chat_messages_select
on public.chat_messages
for select
to authenticated
using (
  exists (
    select 1
    from public.chats c
    where c.id = chat_messages.chat_id
      and (
        c.investor_id = (select auth.uid())
        or c.entrepreneur_id = (select auth.uid())
        or (select public.is_admin())
      )
  )
);

create policy chat_messages_insert
on public.chat_messages
for insert
to authenticated
with check (
  sender_id = (select auth.uid())
  and exists (
    select 1
    from public.chats c
    where c.id = chat_messages.chat_id
      and (
        c.investor_id = (select auth.uid())
        or c.entrepreneur_id = (select auth.uid())
        or (select public.is_admin())
      )
  )
);

create policy chat_messages_update
on public.chat_messages
for update
to authenticated
using (
  exists (
    select 1
    from public.chats c
    where c.id = chat_messages.chat_id
      and (
        c.investor_id = (select auth.uid())
        or c.entrepreneur_id = (select auth.uid())
        or (select public.is_admin())
      )
  )
)
with check (
  exists (
    select 1
    from public.chats c
    where c.id = chat_messages.chat_id
      and (
        c.investor_id = (select auth.uid())
        or c.entrepreneur_id = (select auth.uid())
        or (select public.is_admin())
      )
  )
);

create policy notifications_select
on public.notifications
for select
to authenticated
using (
  recipient_id = (select auth.uid())
  or (select public.is_admin())
);

create policy notifications_update
on public.notifications
for update
to authenticated
using (
  recipient_id = (select auth.uid())
  or (select public.is_admin())
)
with check (
  recipient_id = (select auth.uid())
  or (select public.is_admin())
);

create policy project_actions_select
on public.project_actions
for select
to authenticated
using (
  (select public.is_admin())
  or exists (
    select 1
    from public.projects p
    where p.id = project_actions.project_id
      and (
        p.entrepreneur_id = (select auth.uid())
        or (
          p.approval_status = 'approved'
          and p.publication_status = 'published'
        )
      )
  )
);