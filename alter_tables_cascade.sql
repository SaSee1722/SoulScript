-- Alter diary_entries table to add cascade delete
ALTER TABLE diary_entries
DROP CONSTRAINT diary_entries_user_id_fkey,
ADD CONSTRAINT diary_entries_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES auth.users(id)
ON DELETE CASCADE;

-- Alter user_settings table to add cascade delete
ALTER TABLE user_settings
DROP CONSTRAINT user_settings_user_id_fkey,
ADD CONSTRAINT user_settings_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES auth.users(id)
ON DELETE CASCADE;
