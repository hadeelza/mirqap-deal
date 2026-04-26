create extension if not exists pgcrypto;

create type public.user_role as enum (
  'entrepreneur',
  'investor',
  'admin'
);

create type public.account_status as enum (
  'pending',
  'active',
  'suspended'
);

create type public.entrepreneur_type as enum (
  'individual',
  'team',
  'company',
  'institution'
);

create type public.investor_type as enum (
  'angel',
  'individual',
  'institution',
  'incubator',
  'accelerator'
);

create type public.profile_visibility as enum (
  'public',
  'private'
);

create type public.startup_stage as enum (
  'idea',
  'mvp_seed'
);

create type public.risk_level as enum (
  'low',
  'medium',
  'high'
);

create type public.readiness_level as enum (
  'concept',
  'prototype',
  'mvp',
  'early_market'
);

create type public.customer_focus as enum (
  'b2b',
  'b2c',
  'b2g',
  'marketplace',
  'other'
);

create type public.founder_motivation as enum (
  'low',
  'medium',
  'high'
);

create type public.funding_stage as enum (
  'bootstrapped',
  'friends_family',
  'pre_seed',
  'seed'
);

create type public.approval_status as enum (
  'draft',
  'submitted',
  'under_review',
  'approved',
  'rejected',
  'changes_requested'
);

create type public.publication_status as enum (
  'private',
  'published',
  'hidden',
  'archived'
);

create type public.investment_status as enum (
  'open',
  'in_negotiation',
  'funded',
  'closed'
);

create type public.project_file_type as enum (
  'pitch_deck',
  'business_plan',
  'financials',
  'prototype',
  'legal',
  'other'
);

create type public.questionnaire_status as enum (
  'generated',
  'answered',
  'locked'
);

create type public.offer_status as enum (
  'pending',
  'accepted',
  'rejected',
  'negotiating',
  'withdrawn'
);

create type public.deal_status as enum (
  'open',
  'in_progress',
  'contact_shared',
  'closed',
  'cancelled'
);

create type public.notification_type as enum (
  'project_review',
  'offer_received',
  'offer_response',
  'deal_created',
  'message_received',
  'ai_ready',
  'system'
);

create type public.action_type as enum (
  'submitted',
  'approved',
  'rejected',
  'changes_requested',
  'viewed',
  'saved',
  'marked_interested',
  'offer_sent',
  'offer_accepted',
  'offer_rejected'
);