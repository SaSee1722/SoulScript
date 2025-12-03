-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create diary_entries table
create table diary_entries (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) not null,
  date date not null,
  text text,
  mood text,
  audio_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, date)
);

-- Create diary_media table
create table diary_media (
  id uuid default uuid_generate_v4() primary key,
  entry_id uuid references diary_entries(id) on delete cascade not null,
  url text not null,
  type text check (type in ('image', 'audio')) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table diary_entries enable row level security;
alter table diary_media enable row level security;

-- RLS Policies for diary_entries
create policy "Users can view their own entries" on diary_entries
  for select using (auth.uid() = user_id);

create policy "Users can insert their own entries" on diary_entries
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own entries" on diary_entries
  for update using (auth.uid() = user_id);

create policy "Users can delete their own entries" on diary_entries
  for delete using (auth.uid() = user_id);

-- RLS Policies for diary_media
create policy "Users can view their own media" on diary_media
  for select using (
    exists (
      select 1 from diary_entries
      where diary_entries.id = diary_media.entry_id
      and diary_entries.user_id = auth.uid()
    )
  );

create policy "Users can insert their own media" on diary_media
  for insert with check (
    exists (
      select 1 from diary_entries
      where diary_entries.id = diary_media.entry_id
      and diary_entries.user_id = auth.uid()
    )
  );

create policy "Users can delete their own media" on diary_media
  for delete using (
    exists (
      select 1 from diary_entries
      where diary_entries.id = diary_media.entry_id
      and diary_entries.user_id = auth.uid()
    )
  );

-- Storage Buckets (You need to create these in Supabase Dashboard)
-- bucket: 'diary-media'
