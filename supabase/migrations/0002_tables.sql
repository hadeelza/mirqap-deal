create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  role public.user_role not null,
  full_name varchar(150) not null,
  email varchar(255) not null unique,
  phone varchar(30),
  avatar_url text,
  account_status public.account_status not null default 'pending',
  is_verified boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.entrepreneur_profiles (
  user_id uuid primary key references public.users(id) on delete cascade,
  entrepreneur_type public.entrepreneur_type,
  bio text,
  city varchar(100),
  country varchar(100),
  organization_name varchar(150),
  website_url text,
  linkedin_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.investor_profiles (
  user_id uuid primary key references public.users(id) on delete cascade,
  investor_type public.investor_type,
  organization_name varchar(150),
  bio text,
  website_url text,
  linkedin_url text,
  profile_visibility public.profile_visibility not null default 'private',
  is_discoverable boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.investor_preferences (
  investor_id uuid primary key references public.users(id) on delete cascade,
  min_ticket_sar numeric(14,2),
  max_ticket_sar numeric(14,2),
  updated_at timestamptz not null default now(),
  constraint investor_preferences_ticket_check
    check (
      (min_ticket_sar is null or min_ticket_sar >= 0) and
      (max_ticket_sar is null or max_ticket_sar >= 0) and
      (
        min_ticket_sar is null or
        max_ticket_sar is null or
        min_ticket_sar <= max_ticket_sar
      )
    )
);

create table public.project_categories (
  id uuid primary key default gen_random_uuid(),
  name_en varchar(100) not null unique,
  name_ar varchar(100) not null unique,
  is_active boolean not null default true
);

create table public.technologies (
  id uuid primary key default gen_random_uuid(),
  name_en varchar(100) not null unique,
  name_ar varchar(100) not null unique,
  is_active boolean not null default true
);

create table public.investor_preference_categories (
  investor_id uuid not null references public.users(id) on delete cascade,
  category_id uuid not null references public.project_categories(id) on delete cascade,
  primary key (investor_id, category_id)
);

create table public.investor_preference_stages (
  investor_id uuid not null references public.users(id) on delete cascade,
  startup_stage public.startup_stage not null,
  primary key (investor_id, startup_stage)
);

create table public.investor_preference_risk_levels (
  investor_id uuid not null references public.users(id) on delete cascade,
  risk_level public.risk_level not null,
  primary key (investor_id, risk_level)
);

create table public.investor_preference_technologies (
  investor_id uuid not null references public.users(id) on delete cascade,
  technology_id uuid not null references public.technologies(id) on delete cascade,
  primary key (investor_id, technology_id)
);

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  entrepreneur_id uuid not null references public.users(id) on delete cascade,
  title varchar(200),
  company_name varchar(200),
  short_pitch text,
  category_id uuid references public.project_categories(id) on delete set null,
  startup_stage public.startup_stage,
  readiness_level public.readiness_level,
  customer_focus public.customer_focus,
  team_size integer,
  founder_motivation public.founder_motivation,
  market_size_m numeric(14,2),
  competitors_count integer,
  monthly_revenue_sar numeric(14,2),
  capital_seeking_sar numeric(14,2),
  post_money_valuation_sar numeric(14,2),
  funding_stage public.funding_stage,
  problem_description text,
  solution_description text,
  differentiation text,
  traction text,
  risks text,
  exit_strategy text,
  approval_status public.approval_status not null default 'draft',
  publication_status public.publication_status not null default 'private',
  investment_status public.investment_status not null default 'open',
  submitted_at timestamptz,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint projects_team_size_check check (team_size is null or team_size >= 0),
  constraint projects_competitors_count_check check (competitors_count is null or competitors_count >= 0),
  constraint projects_market_size_check check (market_size_m is null or market_size_m >= 0),
  constraint projects_monthly_revenue_check check (monthly_revenue_sar is null or monthly_revenue_sar >= 0),
  constraint projects_capital_seeking_check check (capital_seeking_sar is null or capital_seeking_sar >= 0),
  constraint projects_valuation_check check (post_money_valuation_sar is null or post_money_valuation_sar >= 0)
);

create table public.project_technologies (
  project_id uuid not null references public.projects(id) on delete cascade,
  technology_id uuid not null references public.technologies(id) on delete cascade,
  primary key (project_id, technology_id)
);

create table public.project_files (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  uploaded_by uuid not null references public.users(id) on delete cascade,
  file_type public.project_file_type not null,
  bucket_name varchar(100) not null,
  storage_path text not null,
  file_name varchar(255) not null,
  mime_type varchar(100),
  file_size bigint,
  created_at timestamptz not null default now(),
  constraint project_files_file_size_check check (file_size is null or file_size >= 0)
);

create table public.ai_questionnaires (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  generated_by varchar(100) not null,
  model_version varchar(50),
  status public.questionnaire_status not null default 'generated',
  created_at timestamptz not null default now()
);

create table public.ai_questionnaire_items (
  id uuid primary key default gen_random_uuid(),
  questionnaire_id uuid not null references public.ai_questionnaires(id) on delete cascade,
  question_order integer not null,
  question_text text not null,
  answer_text text,
  answered_at timestamptz,
  constraint ai_questionnaire_items_order_check check (question_order > 0),
  constraint ai_questionnaire_items_unique_order unique (questionnaire_id, question_order)
);

create table public.project_ai_evaluations (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  questionnaire_id uuid references public.ai_questionnaires(id) on delete set null,
  model_name varchar(100) not null,
  model_version varchar(50),
  risk_level public.risk_level not null,
  risk_score numeric(6,4) not null,
  class_probabilities jsonb,
  top_contributing_factors jsonb,
  ai_summary text,
  explanation_payload jsonb,
  created_at timestamptz not null default now(),
  constraint project_ai_evaluations_score_check check (risk_score >= 0 and risk_score <= 1)
);

create table public.ai_simulations (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  evaluation_id uuid references public.project_ai_evaluations(id) on delete set null,
  initiated_by uuid not null references public.users(id) on delete cascade,
  original_input jsonb not null,
  modified_input jsonb not null,
  original_risk_level public.risk_level not null,
  original_risk_score numeric(6,4) not null,
  new_risk_level public.risk_level not null,
  new_risk_score numeric(6,4) not null,
  delta_score numeric(6,4),
  comparison_summary text,
  created_at timestamptz not null default now(),
  constraint ai_simulations_original_score_check check (original_risk_score >= 0 and original_risk_score <= 1),
  constraint ai_simulations_new_score_check check (new_risk_score >= 0 and new_risk_score <= 1)
);

create table public.investment_offers (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  investor_id uuid not null references public.users(id) on delete cascade,
  entrepreneur_id uuid not null references public.users(id) on delete cascade,
  offer_amount_sar numeric(14,2) not null,
  equity_percentage numeric(5,2) not null,
  expected_returns text,
  special_conditions text,
  message text,
  status public.offer_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  responded_at timestamptz,
  constraint investment_offers_amount_check check (offer_amount_sar >= 0),
  constraint investment_offers_equity_check check (equity_percentage >= 0 and equity_percentage <= 100)
);

create table public.deals (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  offer_id uuid not null unique references public.investment_offers(id) on delete cascade,
  investor_id uuid not null references public.users(id) on delete cascade,
  entrepreneur_id uuid not null references public.users(id) on delete cascade,
  status public.deal_status not null default 'open',
  contact_shared_at timestamptz,
  closed_at timestamptz,
  close_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.investor_project_interests (
  id uuid primary key default gen_random_uuid(),
  investor_id uuid not null references public.users(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint investor_project_interests_unique unique (investor_id, project_id)
);

create table public.chats (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  offer_id uuid references public.investment_offers(id) on delete set null,
  deal_id uuid references public.deals(id) on delete set null,
  entrepreneur_id uuid not null references public.users(id) on delete cascade,
  investor_id uuid not null references public.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint chats_unique_thread unique (project_id, entrepreneur_id, investor_id)
);

create table public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  chat_id uuid not null references public.chats(id) on delete cascade,
  sender_id uuid not null references public.users(id) on delete cascade,
  body text,
  attachment_url text,
  read_at timestamptz,
  created_at timestamptz not null default now(),
  constraint chat_messages_content_check check (
    coalesce(nullif(trim(body), ''), '') <> '' or attachment_url is not null
  )
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_id uuid not null references public.users(id) on delete cascade,
  type public.notification_type not null,
  title varchar(200) not null,
  body text,
  ref_type varchar(100),
  ref_id uuid,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.project_actions (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  actor_id uuid references public.users(id) on delete set null,
  action_type public.action_type not null,
  note text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);