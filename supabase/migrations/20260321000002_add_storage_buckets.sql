-- ============================================
-- Storage buckets
-- ============================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  (
    'evidence',
    'evidence',
    false,
    10485760,  -- 10 MB
    array['image/jpeg','image/png','image/webp','application/pdf']
  ),
  (
    'verifications',
    'verifications',
    false,
    10485760,  -- 10 MB
    array['image/jpeg','image/png','image/webp','application/pdf']
  )
on conflict (id) do nothing;

-- evidence: authenticated users can upload and read their own files
create policy "evidence_insert"
  on storage.objects for insert
  with check (
    bucket_id = 'evidence'
    and auth.role() = 'authenticated'
  );

create policy "evidence_select"
  on storage.objects for select
  using (
    bucket_id = 'evidence'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "evidence_delete"
  on storage.objects for delete
  using (
    bucket_id = 'evidence'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- verifications: authenticated users can upload; only they can read their own docs
create policy "verifications_insert"
  on storage.objects for insert
  with check (
    bucket_id = 'verifications'
    and auth.role() = 'authenticated'
  );

create policy "verifications_select"
  on storage.objects for select
  using (
    bucket_id = 'verifications'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "verifications_delete"
  on storage.objects for delete
  using (
    bucket_id = 'verifications'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
