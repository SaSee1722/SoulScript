-- Create user_settings table for PIN
create table user_settings (
  user_id uuid references auth.users(id) primary key,
  pin_code text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table user_settings enable row level security;

-- Policies
create policy "Users can view their own settings"
on user_settings for select
to authenticated
using (auth.uid() = user_id);

create policy "Users can insert their own settings"
on user_settings for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Users can update their own settings"
on user_settings for update
to authenticated
using (auth.uid() = user_id);
