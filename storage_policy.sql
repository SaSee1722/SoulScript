-- 1. Create the storage bucket 'diary-media'
insert into storage.buckets (id, name, public)
values ('diary-media', 'diary-media', true)
on conflict (id) do nothing;

-- NOTE: We removed 'alter table storage.objects enable row level security;' 
-- because it is enabled by default and causes permission errors if you are not the owner.

-- 2. Drop existing policies to avoid conflicts
drop policy if exists "Authenticated users can upload media" on storage.objects;
drop policy if exists "Users can manage their own media" on storage.objects;
drop policy if exists "Public Read Access" on storage.objects;

-- 3. Create Policy: Allow authenticated users to upload files to their own folder
create policy "Authenticated users can upload media"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'diary-media' 
  and auth.role() = 'authenticated'
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- 4. Create Policy: Users can manage their own files
create policy "Users can manage their own media"
on storage.objects for all
to authenticated
using (
  bucket_id = 'diary-media' 
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- 5. Create Policy: Public Read Access
create policy "Public Read Access"
on storage.objects for select
to public
using ( bucket_id = 'diary-media' );
