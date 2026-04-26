create index idx_users_role on public.users(role);
create index idx_users_account_status on public.users(account_status);
create index idx_users_created_at on public.users(created_at desc);

create index idx_projects_entrepreneur_id on public.projects(entrepreneur_id);
create index idx_projects_category_id on public.projects(category_id);
create index idx_projects_startup_stage on public.projects(startup_stage);
create index idx_projects_approval_status on public.projects(approval_status);
create index idx_projects_publication_status on public.projects(publication_status);
create index idx_projects_investment_status on public.projects(investment_status);
create index idx_projects_created_at on public.projects(created_at desc);
create index idx_projects_published_at on public.projects(published_at desc);

create index idx_project_technologies_technology_id on public.project_technologies(technology_id);

create index idx_project_files_project_id on public.project_files(project_id);
create index idx_project_files_uploaded_by on public.project_files(uploaded_by);
create index idx_project_files_bucket_name on public.project_files(bucket_name);

create index idx_ai_questionnaires_project_id on public.ai_questionnaires(project_id);
create index idx_ai_questionnaires_status on public.ai_questionnaires(status);

create index idx_project_ai_evaluations_project_id on public.project_ai_evaluations(project_id);
create index idx_project_ai_evaluations_questionnaire_id on public.project_ai_evaluations(questionnaire_id);
create index idx_project_ai_evaluations_risk_level on public.project_ai_evaluations(risk_level);
create index idx_project_ai_evaluations_created_at on public.project_ai_evaluations(created_at desc);

create index idx_ai_simulations_project_id on public.ai_simulations(project_id);
create index idx_ai_simulations_evaluation_id on public.ai_simulations(evaluation_id);
create index idx_ai_simulations_initiated_by on public.ai_simulations(initiated_by);
create index idx_ai_simulations_created_at on public.ai_simulations(created_at desc);

create index idx_investor_preference_categories_investor_id on public.investor_preference_categories(investor_id);
create index idx_investor_preference_categories_category_id on public.investor_preference_categories(category_id);

create index idx_investor_preference_technologies_investor_id on public.investor_preference_technologies(investor_id);
create index idx_investor_preference_technologies_technology_id on public.investor_preference_technologies(technology_id);

create index idx_investment_offers_project_id on public.investment_offers(project_id);
create index idx_investment_offers_investor_id on public.investment_offers(investor_id);
create index idx_investment_offers_entrepreneur_id on public.investment_offers(entrepreneur_id);
create index idx_investment_offers_status on public.investment_offers(status);
create index idx_investment_offers_created_at on public.investment_offers(created_at desc);

create index idx_deals_project_id on public.deals(project_id);
create index idx_deals_investor_id on public.deals(investor_id);
create index idx_deals_entrepreneur_id on public.deals(entrepreneur_id);
create index idx_deals_status on public.deals(status);

create index idx_investor_project_interests_investor_id on public.investor_project_interests(investor_id);
create index idx_investor_project_interests_project_id on public.investor_project_interests(project_id);
create index idx_investor_project_interests_created_at on public.investor_project_interests(created_at desc);

create index idx_chats_project_id on public.chats(project_id);
create index idx_chats_offer_id on public.chats(offer_id);
create index idx_chats_deal_id on public.chats(deal_id);
create index idx_chats_entrepreneur_id on public.chats(entrepreneur_id);
create index idx_chats_investor_id on public.chats(investor_id);

create index idx_chat_messages_chat_id on public.chat_messages(chat_id);
create index idx_chat_messages_sender_id on public.chat_messages(sender_id);
create index idx_chat_messages_created_at on public.chat_messages(created_at desc);
create index idx_chat_messages_read_at on public.chat_messages(read_at);

create index idx_notifications_recipient_id on public.notifications(recipient_id);
create index idx_notifications_type on public.notifications(type);
create index idx_notifications_is_read on public.notifications(is_read);
create index idx_notifications_created_at on public.notifications(created_at desc);

create index idx_project_actions_project_id on public.project_actions(project_id);
create index idx_project_actions_actor_id on public.project_actions(actor_id);
create index idx_project_actions_action_type on public.project_actions(action_type);
create index idx_project_actions_created_at on public.project_actions(created_at desc);