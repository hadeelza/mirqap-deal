create policy avatars_insert
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);

create policy avatars_update
on storage.objects
for update
to authenticated
using (
  bucket_id = 'avatars'
  and (
    (storage.foldername(name))[1] = (select auth.uid()::text)
    or (select public.is_admin())
  )
)
with check (
  bucket_id = 'avatars'
  and (
    (storage.foldername(name))[1] = (select auth.uid()::text)
    or (select public.is_admin())
  )
);

create policy avatars_delete
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'avatars'
  and (
    (storage.foldername(name))[1] = (select auth.uid()::text)
    or (select public.is_admin())
  )
);

create policy project_files_insert_storage
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'project-files'
  and exists (
    select 1
    from public.projects p
    where p.id::text = (storage.foldername(name))[1]
      and (
        p.entrepreneur_id = (select auth.uid())
        or (select public.is_admin())
      )
  )
);

create policy project_files_select_storage
on storage.objects
for select
to authenticated
using (
  bucket_id = 'project-files'
  and exists (
    select 1
    from public.project_files pf
    join public.projects p on p.id = pf.project_id
    where pf.bucket_name = 'project-files'
      and pf.storage_path = name
      and (
        p.entrepreneur_id = (select auth.uid())
        or (select public.is_admin())
      )
  )
);

create policy project_files_update_storage
on storage.objects
for update
to authenticated
using (
  bucket_id = 'project-files'
  and exists (
    select 1
    from public.project_files pf
    join public.projects p on p.id = pf.project_id
    where pf.bucket_name = 'project-files'
      and pf.storage_path = name
      and (
        pf.uploaded_by = (select auth.uid())
        or p.entrepreneur_id = (select auth.uid())
        or (select public.is_admin())
      )
  )
)
with check (
  bucket_id = 'project-files'
  and exists (
    select 1
    from public.project_files pf
    join public.projects p on p.id = pf.project_id
    where pf.bucket_name = 'project-files'
      and pf.storage_path = name
      and (
        pf.uploaded_by = (select auth.uid())
        or p.entrepreneur_id = (select auth.uid())
        or (select public.is_admin())
      )
  )
);

create policy project_files_delete_storage
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'project-files'
  and exists (
    select 1
    from public.project_files pf
    join public.projects p on p.id = pf.project_id
    where pf.bucket_name = 'project-files'
      and pf.storage_path = name
      and (
        pf.uploaded_by = (select auth.uid())
        or p.entrepreneur_id = (select auth.uid())
        or (select public.is_admin())
      )
  )
);

create policy chat_attachments_insert
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'chat-attachments'
  and (storage.foldername(name))[2] = (select auth.uid()::text)
  and exists (
    select 1
    from public.chats c
    where c.id::text = (storage.foldername(name))[1]
      and (
        c.investor_id = (select auth.uid())
        or c.entrepreneur_id = (select auth.uid())
        or (select public.is_admin())
      )
  )
);

create policy chat_attachments_select
on storage.objects
for select
to authenticated
using (
  bucket_id = 'chat-attachments'
  and exists (
    select 1
    from public.chats c
    where c.id::text = (storage.foldername(name))[1]
      and (
        c.investor_id = (select auth.uid())
        or c.entrepreneur_id = (select auth.uid())
        or (select public.is_admin())
      )
  )
);

create policy chat_attachments_update
on storage.objects
for update
to authenticated
using (
  bucket_id = 'chat-attachments'
  and exists (
    select 1
    from public.chats c
    where c.id::text = (storage.foldername(name))[1]
      and (
        c.investor_id = (select auth.uid())
        or c.entrepreneur_id = (select auth.uid())
        or (select public.is_admin())
      )
  )
)
with check (
  bucket_id = 'chat-attachments'
  and exists (
    select 1
    from public.chats c
    where c.id::text = (storage.foldername(name))[1]
      and (
        c.investor_id = (select auth.uid())
        or c.entrepreneur_id = (select auth.uid())
        or (select public.is_admin())
      )
  )
);

create policy chat_attachments_delete
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'chat-attachments'
  and exists (
    select 1
    from public.chats c
    where c.id::text = (storage.foldername(name))[1]
      and (
        c.investor_id = (select auth.uid())
        or c.entrepreneur_id = (select auth.uid())
        or (select public.is_admin())
      )
  )
);