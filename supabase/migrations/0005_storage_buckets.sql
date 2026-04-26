insert into storage.buckets (id, name, public)
values
  ('avatars', 'avatars', true),
  ('project-files', 'project-files', false),
  ('chat-attachments', 'chat-attachments', false)
on conflict (id) do nothing;