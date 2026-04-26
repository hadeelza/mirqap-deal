create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_role public.user_role;
  v_full_name text;
begin
  begin
    v_role := coalesce((new.raw_user_meta_data ->> 'role')::public.user_role, 'entrepreneur'::public.user_role);
  exception
    when others then
      v_role := 'entrepreneur'::public.user_role;
  end;

  v_full_name := coalesce(
    nullif(new.raw_user_meta_data ->> 'full_name', ''),
    split_part(coalesce(new.email, ''), '@', 1),
    'New User'
  );

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
    v_role,
    v_full_name,
    new.email,
    new.phone,
    new.raw_user_meta_data ->> 'avatar_url',
    'pending',
    false,
    coalesce(new.created_at, now()),
    now()
  )
  on conflict (id) do nothing;

  if v_role = 'entrepreneur' then
    insert into public.entrepreneur_profiles (user_id)
    values (new.id)
    on conflict (user_id) do nothing;
  elsif v_role = 'investor' then
    insert into public.investor_profiles (user_id)
    values (new.id)
    on conflict (user_id) do nothing;

    insert into public.investor_preferences (investor_id)
    values (new.id)
    on conflict (investor_id) do nothing;
  end if;

  return new;
end;
$$;

create or replace function public.sync_auth_user_to_public_user()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  update public.users
  set
    email = new.email,
    phone = new.phone,
    updated_at = now()
  where id = new.id;

  return new;
end;
$$;

create or replace function public.guard_users_sensitive_columns()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    if new.id is distinct from old.id then
      raise exception 'Changing user id is not allowed';
    end if;

    if new.role is distinct from old.role then
      raise exception 'Changing role is not allowed';
    end if;

    if new.account_status is distinct from old.account_status then
      raise exception 'Changing account status is not allowed';
    end if;

    if new.is_verified is distinct from old.is_verified then
      raise exception 'Changing verification flag is not allowed';
    end if;

    if new.email is distinct from old.email then
      raise exception 'Changing email here is not allowed';
    end if;
  end if;

  return new;
end;
$$;

create or replace function public.set_project_timestamps()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'INSERT' then
    if new.approval_status = 'submitted' and new.submitted_at is null then
      new.submitted_at = now();
    end if;

    if new.publication_status = 'published' and new.published_at is null then
      new.published_at = now();
    end if;
  else
    if old.approval_status is distinct from new.approval_status
       and new.approval_status = 'submitted'
       and new.submitted_at is null then
      new.submitted_at = now();
    end if;

    if old.publication_status is distinct from new.publication_status
       and new.publication_status = 'published'
       and new.published_at is null then
      new.published_at = now();
    end if;

    if old.status is distinct from old.status then
      null;
    end if;
  end if;

  return new;
end;
$$;

create or replace function public.log_project_changes()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    if new.approval_status = 'submitted' then
      insert into public.project_actions (project_id, actor_id, action_type, note, metadata)
      values (
        new.id,
        new.entrepreneur_id,
        'submitted',
        'Project submitted',
        jsonb_build_object('approval_status', new.approval_status)
      );
    end if;

    return new;
  end if;

  if old.approval_status is distinct from new.approval_status then
    if new.approval_status = 'submitted' then
      insert into public.project_actions (project_id, actor_id, action_type, note, metadata)
      values (
        new.id,
        coalesce(auth.uid(), new.entrepreneur_id),
        'submitted',
        'Project submitted',
        jsonb_build_object('from', old.approval_status, 'to', new.approval_status)
      );
    elsif new.approval_status = 'approved' then
      insert into public.project_actions (project_id, actor_id, action_type, note, metadata)
      values (
        new.id,
        auth.uid(),
        'approved',
        'Project approved',
        jsonb_build_object('from', old.approval_status, 'to', new.approval_status)
      );

      insert into public.notifications (recipient_id, type, title, body, ref_type, ref_id)
      values (
        new.entrepreneur_id,
        'project_review',
        'تمت الموافقة على المشروع',
        'تمت مراجعة مشروعك واعتماده.',
        'project',
        new.id
      );
    elsif new.approval_status = 'rejected' then
      insert into public.project_actions (project_id, actor_id, action_type, note, metadata)
      values (
        new.id,
        auth.uid(),
        'rejected',
        'Project rejected',
        jsonb_build_object('from', old.approval_status, 'to', new.approval_status)
      );

      insert into public.notifications (recipient_id, type, title, body, ref_type, ref_id)
      values (
        new.entrepreneur_id,
        'project_review',
        'تم رفض المشروع',
        'تمت مراجعة مشروعك وحالته الحالية مرفوض.',
        'project',
        new.id
      );
    elsif new.approval_status = 'changes_requested' then
      insert into public.project_actions (project_id, actor_id, action_type, note, metadata)
      values (
        new.id,
        auth.uid(),
        'changes_requested',
        'Changes requested',
        jsonb_build_object('from', old.approval_status, 'to', new.approval_status)
      );

      insert into public.notifications (recipient_id, type, title, body, ref_type, ref_id)
      values (
        new.entrepreneur_id,
        'project_review',
        'تم طلب تعديلات على المشروع',
        'يرجى مراجعة المشروع وإجراء التعديلات المطلوبة.',
        'project',
        new.id
      );
    end if;
  end if;

  return new;
end;
$$;

create or replace function public.notify_ai_evaluation_ready()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_entrepreneur_id uuid;
begin
  select p.entrepreneur_id
  into v_entrepreneur_id
  from public.projects p
  where p.id = new.project_id;

  if v_entrepreneur_id is not null then
    insert into public.notifications (recipient_id, type, title, body, ref_type, ref_id)
    values (
      v_entrepreneur_id,
      'ai_ready',
      'تحليل الذكاء الاصطناعي جاهز',
      'تم إنشاء تحليل المشروع ويمكنك الآن مراجعة النتيجة.',
      'project_ai_evaluation',
      new.id
    );
  end if;

  return new;
end;
$$;

create or replace function public.handle_interest_created()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.project_actions (project_id, actor_id, action_type, note, metadata)
  values (
    new.project_id,
    new.investor_id,
    'marked_interested',
    'Investor marked project as interested',
    jsonb_build_object('interest_id', new.id)
  );

  return new;
end;
$$;

create or replace function public.handle_offer_changes()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    insert into public.project_actions (project_id, actor_id, action_type, note, metadata)
    values (
      new.project_id,
      new.investor_id,
      'offer_sent',
      'Investment offer sent',
      jsonb_build_object(
        'offer_id', new.id,
        'status', new.status,
        'amount', new.offer_amount_sar,
        'equity_percentage', new.equity_percentage
      )
    );

    insert into public.notifications (recipient_id, type, title, body, ref_type, ref_id)
    values (
      new.entrepreneur_id,
      'offer_received',
      'تم استلام عرض استثماري جديد',
      'لديك عرض استثماري جديد على أحد مشاريعك.',
      'investment_offer',
      new.id
    );

    return new;
  end if;

  if old.status is distinct from new.status then
    if new.status in ('accepted', 'rejected', 'negotiating') then
      insert into public.notifications (recipient_id, type, title, body, ref_type, ref_id)
      values (
        new.investor_id,
        'offer_response',
        'تم تحديث حالة العرض',
        case
          when new.status = 'accepted' then 'تم قبول العرض الاستثماري.'
          when new.status = 'rejected' then 'تم رفض العرض الاستثماري.'
          else 'تم تحديث العرض إلى حالة تفاوض.'
        end,
        'investment_offer',
        new.id
      );
    end if;

    if new.status = 'accepted' then
      insert into public.project_actions (project_id, actor_id, action_type, note, metadata)
      values (
        new.project_id,
        new.entrepreneur_id,
        'offer_accepted',
        'Offer accepted',
        jsonb_build_object('offer_id', new.id)
      );
    elsif new.status = 'rejected' then
      insert into public.project_actions (project_id, actor_id, action_type, note, metadata)
      values (
        new.project_id,
        new.entrepreneur_id,
        'offer_rejected',
        'Offer rejected',
        jsonb_build_object('offer_id', new.id)
      );
    end if;

    if new.status in ('accepted', 'rejected', 'negotiating') and new.responded_at is null then
      new.responded_at = now();
    end if;
  end if;

  return new;
end;
$$;

create or replace function public.handle_deal_created()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.notifications (recipient_id, type, title, body, ref_type, ref_id)
  values
    (
      new.entrepreneur_id,
      'deal_created',
      'تم إنشاء صفقة جديدة',
      'تم إنشاء صفقة مرتبطة بأحد عروض الاستثمار.',
      'deal',
      new.id
    ),
    (
      new.investor_id,
      'deal_created',
      'تم إنشاء صفقة جديدة',
      'تم إنشاء صفقة مرتبطة بأحد عروض الاستثمار.',
      'deal',
      new.id
    );

  return new;
end;
$$;

create or replace function public.handle_chat_message_created()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_recipient_id uuid;
begin
  select
    case
      when c.investor_id = new.sender_id then c.entrepreneur_id
      else c.investor_id
    end
  into v_recipient_id
  from public.chats c
  where c.id = new.chat_id;

  if v_recipient_id is not null then
    insert into public.notifications (recipient_id, type, title, body, ref_type, ref_id)
    values (
      v_recipient_id,
      'message_received',
      'رسالة جديدة',
      'لديك رسالة جديدة داخل المحادثة.',
      'chat_message',
      new.id
    );
  end if;

  return new;
end;
$$;

create or replace function public.guard_chat_message_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    if new.chat_id is distinct from old.chat_id then
      raise exception 'Changing chat_id is not allowed';
    end if;

    if new.sender_id is distinct from old.sender_id then
      raise exception 'Changing sender_id is not allowed';
    end if;

    if coalesce(new.body, '') is distinct from coalesce(old.body, '') then
      raise exception 'Editing message body is not allowed';
    end if;

    if coalesce(new.attachment_url, '') is distinct from coalesce(old.attachment_url, '') then
      raise exception 'Editing attachment_url is not allowed';
    end if;

    if new.created_at is distinct from old.created_at then
      raise exception 'Changing created_at is not allowed';
    end if;

    if old.read_at is not null and new.read_at is distinct from old.read_at then
      raise exception 'read_at is already set';
    end if;

    if auth.uid() = old.sender_id then
      raise exception 'Sender cannot mark own message as read';
    end if;
  end if;

  return new;
end;
$$;

create or replace function public.guard_notification_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    if new.recipient_id is distinct from old.recipient_id then
      raise exception 'Changing recipient_id is not allowed';
    end if;

    if new.type is distinct from old.type then
      raise exception 'Changing type is not allowed';
    end if;

    if new.title is distinct from old.title then
      raise exception 'Changing title is not allowed';
    end if;

    if coalesce(new.body, '') is distinct from coalesce(old.body, '') then
      raise exception 'Changing body is not allowed';
    end if;

    if coalesce(new.ref_type, '') is distinct from coalesce(old.ref_type, '') then
      raise exception 'Changing ref_type is not allowed';
    end if;

    if new.ref_id is distinct from old.ref_id then
      raise exception 'Changing ref_id is not allowed';
    end if;

    if new.created_at is distinct from old.created_at then
      raise exception 'Changing created_at is not allowed';
    end if;
  end if;

  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

create trigger on_auth_user_updated
after update on auth.users
for each row execute procedure public.sync_auth_user_to_public_user();

create trigger a_guard_users_sensitive_columns
before update on public.users
for each row execute procedure public.guard_users_sensitive_columns();

create trigger z_set_updated_at_users
before update on public.users
for each row execute procedure public.set_updated_at();

create trigger z_set_updated_at_entrepreneur_profiles
before update on public.entrepreneur_profiles
for each row execute procedure public.set_updated_at();

create trigger z_set_updated_at_investor_profiles
before update on public.investor_profiles
for each row execute procedure public.set_updated_at();

create trigger z_set_updated_at_investor_preferences
before update on public.investor_preferences
for each row execute procedure public.set_updated_at();

create trigger a_set_project_timestamps
before insert or update on public.projects
for each row execute procedure public.set_project_timestamps();

create trigger z_set_updated_at_projects
before update on public.projects
for each row execute procedure public.set_updated_at();

create trigger after_project_change_log
after insert or update on public.projects
for each row execute procedure public.log_project_changes();

create trigger z_set_updated_at_investment_offers
before update on public.investment_offers
for each row execute procedure public.set_updated_at();

create trigger after_offer_change_log
after insert or update on public.investment_offers
for each row execute procedure public.handle_offer_changes();

create trigger z_set_updated_at_deals
before update on public.deals
for each row execute procedure public.set_updated_at();

create trigger after_deal_created
after insert on public.deals
for each row execute procedure public.handle_deal_created();

create trigger after_interest_created
after insert on public.investor_project_interests
for each row execute procedure public.handle_interest_created();

create trigger after_ai_evaluation_created
after insert on public.project_ai_evaluations
for each row execute procedure public.notify_ai_evaluation_ready();

create trigger after_chat_message_created
after insert on public.chat_messages
for each row execute procedure public.handle_chat_message_created();

create trigger a_guard_chat_message_update
before update on public.chat_messages
for each row execute procedure public.guard_chat_message_update();

create trigger a_guard_notification_update
before update on public.notifications
for each row execute procedure public.guard_notification_update();