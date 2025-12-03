-- Add avatar_url to user_settings
alter table user_settings 
add column if not exists avatar_url text;

-- Ensure RLS is still correct (existing policies cover update/insert for owner)
